/**
 * The libs screen's data service, in template-mfe's API service form: a REST protocol with the package's mock plugin, which answers from the generated data the package bundles.
 */
import { BaseApiService, RestEndpointProtocol, RestProtocol } from '@gears-frontx/react';
import { RestMockPlugin } from '@gears-frontx/frontx-template-shell';
import { libsMockMap } from './mocks';
import type { GetLibrariesResponse } from './types';

// @cpt-algo:cpt-template-site-algo-data-services-construct-service:p1
// @cpt-flow:cpt-template-site-flow-data-services-answer-query:p1
// @cpt-dod:cpt-template-site-dod-data-services-services:p1
export class LibsApiService extends BaseApiService {
  constructor() {
    // @cpt-begin:cpt-template-site-algo-data-services-construct-service:p1:inst-create-protocols
    const restProtocol = new RestProtocol({ timeout: 30000 });
    const restEndpoints = new RestEndpointProtocol(restProtocol);
    // @cpt-end:cpt-template-site-algo-data-services-construct-service:p1:inst-create-protocols

    // @cpt-begin:cpt-template-site-algo-data-services-construct-service:p1:inst-set-base-url
    super({ baseURL: '/api/site-libs' }, restProtocol, restEndpoints);
    // @cpt-end:cpt-template-site-algo-data-services-construct-service:p1:inst-set-base-url

    // @cpt-begin:cpt-template-site-algo-data-services-construct-service:p1:inst-register-mock-plugin
    // Declared here, switched on by the `mock()` plugin in init.ts.
    this.registerPlugin(restProtocol, new RestMockPlugin({ mockMap: libsMockMap, delay: 0 }));
    // @cpt-end:cpt-template-site-algo-data-services-construct-service:p1:inst-register-mock-plugin
  }

  // @cpt-begin:cpt-template-site-flow-data-services-answer-query:p1:inst-query-endpoint
  readonly getLibraries = this.protocol(RestEndpointProtocol).query<GetLibrariesResponse>('/libraries');
  // @cpt-end:cpt-template-site-flow-data-services-answer-query:p1:inst-query-endpoint
}
