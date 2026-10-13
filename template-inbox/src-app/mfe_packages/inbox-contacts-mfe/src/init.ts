/**
 * The contacts screen's app, created once when the lifecycle module loads, with the plugins every inbox screen package uses (`buildInboxScreenApp`, which says why each is there and in that order).
 *
 * Services are registered before `build()`, because `mock()` switches the mock plugins of the services already registered. Every inbox screen reads through the page's one shared query cache, so a read one screen's write invalidates is read again by every screen that shows it.
 */
import { apiRegistry, createFrontX, effects, gtsPlugin, microfrontends, mock, queryCacheShared, registerSlice } from '@gears-frontx/react';
import { buildInboxScreenApp } from '@inbox-shared/lifecycle/screenApp';
import { registerInboxApi } from '@inbox-shared/api/registry';
import { contactsSlice } from './slices/contactsSlice';
import { initContactsEffects } from './effects/contactsEffects';

registerInboxApi();
apiRegistry.initialize();

export const mfeApp = buildInboxScreenApp({ createFrontX, effects, gtsPlugin, microfrontends, mock, queryCacheShared });

// The screen's state, after build() because it needs the app's store: what the screen keeps across mounts, changed only by its effects.
// @cpt-begin:cpt-template-inbox-algo-contacts-keep-directory-state:p2:inst-register-slice
registerSlice(contactsSlice, initContactsEffects);
// @cpt-end:cpt-template-inbox-algo-contacts-keep-directory-state:p2:inst-register-slice
