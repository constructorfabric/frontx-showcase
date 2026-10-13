/**
 * The chat screen's app, created once when the lifecycle module loads, with the plugins every inbox screen package uses (`buildInboxScreenApp`, which says why each is there and in that order).
 *
 * Services are registered before `build()`, because `mock()` switches the mock plugins of the services already registered. The chat reads one: the inbox's conversations, transcript, contacts and agent, the same service the contacts screen reads, each package answering from its own copy of the inbox mock store. Every inbox screen reads through the page's one shared query cache, so a read the chat's write invalidates is read again. The write is in this package's own mock state, and this package's reads find it once they answer; until then the shared cache entry can briefly hold another package's answer, which comes from that package's own mock state.
 */
import { apiRegistry, createFrontX, effects, gtsPlugin, microfrontends, mock, queryCacheShared, registerSlice } from '@gears-frontx/react';
import { buildInboxScreenApp } from '@inbox-shared/lifecycle/screenApp';
import { registerInboxApi } from '@inbox-shared/api/registry';
import { chatSlice } from './slices/chatSlice';
import { initChatEffects } from './effects/chatEffects';

registerInboxApi();
apiRegistry.initialize();

export const mfeApp = buildInboxScreenApp({ createFrontX, effects, gtsPlugin, microfrontends, mock, queryCacheShared });

// The screen's state, after build() because it needs the app's store: what the screen keeps across mounts, changed only by its effects.
// @cpt-begin:cpt-template-inbox-algo-chat-keep-state:p2:inst-register-slice
registerSlice(chatSlice, initChatEffects);
// @cpt-end:cpt-template-inbox-algo-chat-keep-state:p2:inst-register-slice
