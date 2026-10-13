/**
 * Registration of the dashboard's own API service, beside the shared
 * registrars in `@inbox-shared/api/registry`.
 *
 * The service and its seed live in this package because no other screen
 * reads them; the one part of the overview another screen shares, the people
 * the activity rows point at, comes from this package's copy of the inbox
 * mock store (`dashboardMocks.ts`). Called from `init.ts` before `createFrontX().build()`,
 * for the same reason as `registerInboxApi`: the `mock()` plugin switches the
 * mock plugins of the services already registered when the app is built.
 */

import { apiRegistry } from '@gears-frontx/react';
import { DashboardApiService } from './DashboardApiService';

/** Registers the overview service. Idempotent. */
export function registerDashboardApi(): void {
  // @cpt-begin:cpt-template-inbox-algo-dashboard-register-services:p2:inst-register-once
  if (apiRegistry.has(DashboardApiService)) return;
  apiRegistry.register(DashboardApiService);
  // @cpt-end:cpt-template-inbox-algo-dashboard-register-services:p2:inst-register-once
}

export const getDashboardApi = (): DashboardApiService => apiRegistry.getService(DashboardApiService);
