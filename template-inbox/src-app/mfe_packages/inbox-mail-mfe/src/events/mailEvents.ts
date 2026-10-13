/**
 * The mail screen's events: what the reader did, emitted by `actions/mailActions.ts` and turned into slice updates by `effects/mailEffects.ts`. Names follow `mfe/<domain>/<event>` in the past tense.
 */
import type { MailboxId } from '../api/mailTypes';
import type { MailTab } from '../screens/mail/mailSelectors';

export {};

declare module '@gears-frontx/react' {
  interface EventPayloadMap {
    'mfe/inbox-mail/mailbox-selected': { mailboxId: MailboxId };
    'mfe/inbox-mail/selection-remembered': { selectedMailId: string | null; autoSelectOwedTo: string | null };
    'mfe/inbox-mail/search-changed': { search: string };
    'mfe/inbox-mail/tab-changed': { tab: MailTab };
    'mfe/inbox-mail/history-toggled': { mailId: string };
    'mfe/inbox-mail/draft-changed': { mailId: string; draft: string };
    'mfe/inbox-mail/draft-sent': { mailId: string; body: string };
  }
}
