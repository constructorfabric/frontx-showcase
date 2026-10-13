/**
 * Accounts Domain - Mock Data
 * Mock responses for accounts service endpoints
 *
 * Used with MockPlugin for development and testing.
 * Keys are full URL patterns (including baseURL path).
 */

import type { MockMap } from '@gears-frontx/react';
import type { GetCurrentUserResponse, UpdateProfileRequest } from './types';
import { readCurrentAccountsMockUser, replaceCurrentAccountsMockUser } from './mock-user-store';

// @cpt-dod:cpt-template-mfe-demo-dod-demo-app-accounts-api:p1
// @cpt-algo:cpt-template-mfe-demo-algo-demo-app-mock-responses:p1
/**
 * Accounts mock map
 * Keys are full URL patterns (including /api/accounts baseURL)
 */
export const accountsMockMap: MockMap = {
  // @cpt-begin:cpt-template-mfe-demo-algo-demo-app-mock-responses:p1:inst-mock-get
  'GET /api/accounts/user/current': (): GetCurrentUserResponse => ({
    user: readCurrentAccountsMockUser(),
  }),
  // @cpt-end:cpt-template-mfe-demo-algo-demo-app-mock-responses:p1:inst-mock-get

  // @cpt-begin:cpt-template-mfe-demo-algo-demo-app-mock-responses:p1:inst-mock-merge
  'PUT /api/accounts/user/profile': (requestData): GetCurrentUserResponse => {
    // requestData is the PUT body forwarded by RestMockPlugin as context.body.
    // Merge the patched fields onto the base mock user so the response reflects
    // what the server would return after persisting the change.
    const patch = (requestData ?? {}) as Partial<UpdateProfileRequest>;
    const mockUser = readCurrentAccountsMockUser();
    const currentDepartment =
      typeof mockUser.extra?.department === 'string' ? mockUser.extra.department : undefined;

    const updatedUser = {
      ...mockUser,
      firstName: patch.firstName ?? mockUser.firstName,
      lastName: patch.lastName ?? mockUser.lastName,
      updatedAt: new Date().toISOString(),
      extra: {
        ...mockUser.extra,
        department: patch.department ?? currentDepartment,
      },
    };
    // @cpt-end:cpt-template-mfe-demo-algo-demo-app-mock-responses:p1:inst-mock-merge

    // @cpt-begin:cpt-template-mfe-demo-algo-demo-app-mock-responses:p1:inst-mock-store
    replaceCurrentAccountsMockUser(updatedUser);

    return {
      user: updatedUser,
    };
    // @cpt-end:cpt-template-mfe-demo-algo-demo-app-mock-responses:p1:inst-mock-store
  },
};
