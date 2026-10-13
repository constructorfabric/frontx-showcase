import { vi } from 'vitest';
import { createApiMocks } from '@inbox-shared/test-support/apiMocks';
import { mailboxes, mailMessages, mails } from '../api/mailDataset';

/**
 * The query-layer stand-ins of this package's screen suites
 * (`@inbox-shared/test-support/apiMocks`), which stand in for `useApiQuery` and `useApiMutation` of `@gears-frontx/react`, over the mail service, the one this package registers: its seeded reads and
 * its one write.
 */
export const {
  endpointTags,
  queryResultFor,
  setQueryState,
  refetchCalls,
  mutationResult,
  mutateMocks,
  setMutationPending,
  latestMutation,
  latestVariables,
  succeedMutation,
  failMutation,
  invalidatedTags,
  resetApiMocks,
} = createApiMocks({
  endpoints: {
    getMailboxes: 'mailboxes',
    getMails: 'mails',
    getMailMessages: 'mailMessages',
    sendMail: 'sendMail',
  },
  responses: {
    mailboxes: { mailboxes },
    mails: { mails },
    mailMessages: { mailMessages },
  },
  mutations: ['sendMail'],
  fn: vi.fn,
});
