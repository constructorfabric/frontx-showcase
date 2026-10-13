import { apiRegistry, invalidateQueryCacheForApp } from '@gears-frontx/react';
import { AccountsApiService } from '../api/AccountsApiService';
import { mfeApp } from '../init';

// @cpt-dod:cpt-template-mfe-demo-dod-demo-app-accounts-api:p1
// @cpt-algo:cpt-template-mfe-demo-algo-demo-app-refresh-user:p1
/** Invalidates the shared `getCurrentUser` query so ProfileScreen refetches. */
export function fetchUser(): void {
  // @cpt-begin:cpt-template-mfe-demo-algo-demo-app-refresh-user:p1:inst-invalidate
  void Promise.resolve()
    .then(() => {
      const service = apiRegistry.getService(AccountsApiService);
      return invalidateQueryCacheForApp(mfeApp, service.getCurrentUser);
    })
    // @cpt-end:cpt-template-mfe-demo-algo-demo-app-refresh-user:p1:inst-invalidate
    // @cpt-begin:cpt-template-mfe-demo-algo-demo-app-refresh-user:p1:inst-log-failure
    .catch((error) => {
      console.error('[demo-mfe] fetchUser failed:', error);
    });
    // @cpt-end:cpt-template-mfe-demo-algo-demo-app-refresh-user:p1:inst-log-failure
}
