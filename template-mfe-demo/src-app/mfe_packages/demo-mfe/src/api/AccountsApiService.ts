/**
 * Accounts Domain - API Service
 * Service for accounts domain (users, tenants, authentication, permissions)
 *
 * MFE-local service. The MFE bundles its own copy of @gears-frontx/react and registers
 * services into its own isolated apiRegistry instance.
 */


import {
  BaseApiService,
  RestEndpointProtocol,
  RestProtocol,
} from '@gears-frontx/react';
import { RestMockPlugin } from '@gears-frontx/frontx-template-shell';
import type { GetCurrentUserResponse } from './types';
import { accountsMockMap } from './mocks';

export type UpdateProfileVariables = {
  firstName: string;
  lastName: string;
  department?: string;
};

// @cpt-dod:cpt-template-mfe-demo-dod-demo-app-accounts-api:p1
// @cpt-algo:cpt-template-mfe-demo-algo-demo-app-accounts-api:p1
/**
 * Accounts API Service for the demo MFE.
 * Manages accounts domain endpoints:
 * - User management (current user, profile, preferences)
 */
export class AccountsApiService extends BaseApiService {
  // @cpt-begin:cpt-template-mfe-demo-algo-demo-app-accounts-api:p1:inst-create-protocol
  constructor() {
    const restProtocol = new RestProtocol({
      timeout: 30000,
    });
    const restEndpoints = new RestEndpointProtocol(restProtocol);

    super({ baseURL: '/api/accounts' }, restProtocol, restEndpoints);
    // @cpt-end:cpt-template-mfe-demo-algo-demo-app-accounts-api:p1:inst-create-protocol

    // @cpt-begin:cpt-template-mfe-demo-algo-demo-app-accounts-api:p1:inst-register-mock
    // Register mock plugin (framework controls when it's active based on mock mode toggle)
    this.registerPlugin(
      restProtocol,
      new RestMockPlugin({
        mockMap: accountsMockMap,
        delay: 100,
      })
    );
    // @cpt-end:cpt-template-mfe-demo-algo-demo-app-accounts-api:p1:inst-register-mock
  }

  // @cpt-begin:cpt-template-mfe-demo-algo-demo-app-accounts-api:p1:inst-declare-endpoints
  readonly getCurrentUser = this.protocol(RestEndpointProtocol)
    .query<GetCurrentUserResponse>('/user/current');
  readonly updateProfile = this.protocol(RestEndpointProtocol)
    .mutation<GetCurrentUserResponse, UpdateProfileVariables>('PUT', '/user/profile');
    // @cpt-end:cpt-template-mfe-demo-algo-demo-app-accounts-api:p1:inst-declare-endpoints
}
