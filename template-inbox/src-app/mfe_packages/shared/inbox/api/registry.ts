/**
 * Registration of the inbox API services, one registrar per service.
 *
 * Each screen package registers only the services its screen reads, in its
 * `init.ts` and before `createFrontX().build()`: the framework's `mock()`
 * plugin switches the mock plugins of the services already registered when
 * the app is built. A registrar per service, rather than one that registers
 * every service, is what keeps a package from bundling a seed it never reads:
 * mail never imports the inbox dataset, contacts never imports the mail one.
 *
 * `apiRegistry` rather than a bare `new InboxApiService()` because the
 * registry is where every service goes: it instantiates on registration and
 * hands the same instance to every caller, so a screen asks for a service by
 * class and never has to be told where the instance lives. Each MFE load has
 * its own registry, so each package registers for itself.
 *
 * Whether the seed datasets answer is decided by the `mock()` plugin of
 * every package's app (`buildInboxScreenApp` in
 * `../lifecycle/screenApp.ts`), called there with `enabledByDefault: true`
 * because this template ships no backend. A project that has one passes
 * `false` (or drops the option to keep mocks on localhost only); the
 * endpoints, the response types and the screens stay unchanged.
 */

import { apiRegistry } from '@gears-frontx/react';
import { InboxApiService } from './InboxApiService';

/** Registers the conversations, transcript, contacts and agent service. Idempotent. */
// @cpt-dod:cpt-template-inbox-dod-data-inbox-service:p1
// @cpt-flow:cpt-template-inbox-flow-data-read-collections:p1
export function registerInboxApi(): void {
  // @cpt-begin:cpt-template-inbox-flow-data-read-collections:p1:inst-register-service
  if (apiRegistry.has(InboxApiService)) return;
  apiRegistry.register(InboxApiService);
  // @cpt-end:cpt-template-inbox-flow-data-read-collections:p1:inst-register-service
}

// @cpt-begin:cpt-template-inbox-flow-data-read-collections:p1:inst-get-service
export const getInboxApi = (): InboxApiService => apiRegistry.getService(InboxApiService);
// @cpt-end:cpt-template-inbox-flow-data-read-collections:p1:inst-get-service
