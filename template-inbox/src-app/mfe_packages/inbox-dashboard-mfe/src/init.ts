/**
 * The dashboard screen's app, created once when the lifecycle module loads, with the plugins every inbox screen package uses (`buildInboxScreenApp`, which says why each is there and in that order).
 *
 * Services are registered before `build()`, because `mock()` switches the mock plugins of the services already registered. The dashboard reads two: its own overview and the inbox's contacts, whose people the activity table names. Every inbox screen reads through the page's one shared query cache, so a read one screen's write invalidates is read again by every screen that shows it.
 */
import { apiRegistry, createFrontX, effects, gtsPlugin, microfrontends, mock, queryCacheShared } from '@gears-frontx/react';
import { buildInboxScreenApp } from '@inbox-shared/lifecycle/screenApp';
import { registerInboxApi } from '@inbox-shared/api/registry';
import { registerDashboardApi } from './api/registerDashboardApi';

// @cpt-begin:cpt-template-inbox-algo-dashboard-register-services:p2:inst-register-and-build
registerInboxApi();
registerDashboardApi();
apiRegistry.initialize();

export const mfeApp = buildInboxScreenApp({ createFrontX, effects, gtsPlugin, microfrontends, mock, queryCacheShared });
// @cpt-end:cpt-template-inbox-algo-dashboard-register-services:p2:inst-register-and-build
