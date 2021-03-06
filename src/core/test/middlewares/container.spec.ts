import { expect } from 'chai';
import { MiddlewaresContainer } from '../../middlewares/container';
import { MiddlewareConfiguration } from '../../middlewares/interfaces/middleware-configuration.interface';
import { NestMiddleware } from '../../middlewares/interfaces/nest-middleware.interface';
import { Component } from '../../../common/utils/decorators/component.decorator';
import { Controller } from '../../../common/utils/decorators/controller.decorator';
import { RequestMapping } from '../../../common/utils/decorators/request-mapping.decorator';
import { RequestMethod } from '../../../common/enums/request-method.enum';

describe('MiddlewaresContainer', () => {
    @Controller({ path: 'test' })
    class TestRoute {

        @RequestMapping({ path: 'test' })
        public getTest() {}

        @RequestMapping({ path: 'another', method: RequestMethod.DELETE })
        public getAnother() {}
    }

    @Component()
    class TestMiddleware implements NestMiddleware {
        public resolve() {
            return (req, res, next) => {};
        }
    }

    let container: MiddlewaresContainer;

    beforeEach(() => {
        container = new MiddlewaresContainer();
    });

    it('should store expected configurations for given module', () => {
        const config: MiddlewareConfiguration[] = [{
                middlewares: [ TestMiddleware ],
                forRoutes: [
                    TestRoute,
                    { path: 'test' },
                ],
            },
        ];
        container.addConfig(config, 'Module' as any);
        expect([ ...container.getConfigs().get('Module') ]).to.deep.equal(config);
    });

    it('should store expected middlewares for given module', () => {
        const config: MiddlewareConfiguration[] = [{
                middlewares: TestMiddleware,
                forRoutes: [ TestRoute ],
            },
        ];

        const key = 'Test' as any;
        container.addConfig(config, key);
        expect(container.getMiddlewares(key).size).to.eql(config.length);
        expect(container.getMiddlewares(key).get('TestMiddleware')).to.eql({
            instance: null,
            metatype: TestMiddleware,
        });
    });

});