/**
 * The mail screen's app, created once when the lifecycle module loads, with the plugins every inbox screen package uses (`buildInboxScreenApp`, which says why each is there and in that order).
 *
 * Services are registered before `build()`, because `mock()` switches the mock plugins of the services already registered. The mail screen reads one, its own mail service, answered from the package's mail mock state; it registers no inbox service and bundles no inbox seed. Every inbox screen reads through the page's one shared query cache, so a read one screen's write invalidates is read again by every screen that shows it.
 */
import { apiRegistry, createFrontX, effects, gtsPlugin, microfrontends, mock, queryCacheShared, registerSlice } from '@gears-frontx/react';
import { buildInboxScreenApp } from '@inbox-shared/lifecycle/screenApp';
import { registerMailApi } from './api/registerMailApi';
import { mailSlice } from './slices/mailSlice';
import { initMailEffects } from './effects/mailEffects';

// @cpt-begin:cpt-template-inbox-algo-mail-register-service:p2:inst-build-app
registerMailApi();
apiRegistry.initialize();

export const mfeApp = buildInboxScreenApp({ createFrontX, effects, gtsPlugin, microfrontends, mock, queryCacheShared });
// @cpt-end:cpt-template-inbox-algo-mail-register-service:p2:inst-build-app

// The screen's state, after build() because it needs the app's store: what the screen keeps across mounts, changed only by its effects.
// @cpt-begin:cpt-template-inbox-algo-mail-keep-state:p2:inst-register-slice
registerSlice(mailSlice, initMailEffects);
// @cpt-end:cpt-template-inbox-algo-mail-keep-state:p2:inst-register-slice
