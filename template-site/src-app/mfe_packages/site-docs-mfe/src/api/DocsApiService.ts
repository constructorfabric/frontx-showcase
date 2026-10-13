/**
 * The docs screen's data service, in template-mfe's API service form: a REST protocol with the package's mock plugin, which answers from the generated data the package bundles.
 */
import { BaseApiService, RestEndpointProtocol, RestProtocol } from '@gears-frontx/react';
import { RestMockPlugin } from '@gears-frontx/frontx-template-shell';
import { docsMockMap } from './mocks';
import type { GetVersionsResponse } from './types';

// @cpt-algo:cpt-template-site-algo-data-services-construct-service:p1
// @cpt-flow:cpt-template-site-flow-data-services-answer-query:p1
// @cpt-dod:cpt-template-site-dod-data-services-services:p1
export class DocsApiService extends BaseApiService {
  constructor() {
    // @cpt-begin:cpt-template-site-algo-data-services-construct-service:p1:inst-create-protocols
    const restProtocol = new RestProtocol({ timeout: 30000 });
    const restEndpoints = new RestEndpointProtocol(restProtocol);
    // @cpt-end:cpt-template-site-algo-data-services-construct-service:p1:inst-create-protocols

    // @cpt-begin:cpt-template-site-algo-data-services-construct-service:p1:inst-set-base-url
    super({ baseURL: '/api/site-docs' }, restProtocol, restEndpoints);
    // @cpt-end:cpt-template-site-algo-data-services-construct-service:p1:inst-set-base-url

    // @cpt-begin:cpt-template-site-algo-data-services-construct-service:p1:inst-register-mock-plugin
    // Declared here, switched on by the `mock()` plugin in init.ts.
    this.registerPlugin(restProtocol, new RestMockPlugin({ mockMap: docsMockMap, delay: 0 }));
    // @cpt-end:cpt-template-site-algo-data-services-construct-service:p1:inst-register-mock-plugin
  }

  // @cpt-begin:cpt-template-site-flow-data-services-answer-query:p1:inst-query-endpoint
  readonly getVersions = this.protocol(RestEndpointProtocol).query<GetVersionsResponse>('/versions');
  // @cpt-end:cpt-template-site-flow-data-services-answer-query:p1:inst-query-endpoint
}
