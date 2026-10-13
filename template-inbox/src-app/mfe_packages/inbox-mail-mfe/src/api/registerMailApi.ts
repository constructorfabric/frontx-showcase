/**
 * Registration of the mail screen's API service.
 *
 * The service, its seed and its mock state live in this package because no
 * other screen reads mail; the package never imports the inbox's seed.
 * Called from `init.ts` before `createFrontX().build()`, for the same reason
 * as the shared `registerInboxApi`: the `mock()` plugin switches the mock
 * plugins of the services already registered when the app is built.
 */

import { apiRegistry } from '@gears-frontx/react';
import { MailApiService } from './MailApiService';

/** Registers the mail service. Idempotent. */
export function registerMailApi(): void {
  // @cpt-begin:cpt-template-inbox-algo-mail-register-service:p2:inst-register-once
  if (apiRegistry.has(MailApiService)) return;
  apiRegistry.register(MailApiService);
  // @cpt-end:cpt-template-inbox-algo-mail-register-service:p2:inst-register-once
}

export const getMailApi = (): MailApiService => apiRegistry.getService(MailApiService);
