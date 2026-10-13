/**
 * What the mail screen's components call to change its state. Each action emits one event; `effects/mailEffects.ts` turns it into a slice update.
 */
import { eventBus } from '@gears-frontx/react';
import type { MailboxId } from '../api/mailTypes';
import type { MailTab } from '../screens/mail/mailSelectors';
import '../events/mailEvents';

// @cpt-algo:cpt-template-inbox-algo-mail-keep-state:p2
// @cpt-begin:cpt-template-inbox-algo-mail-keep-state:p2:inst-emit-event
export const mailActions = {
  selectMailbox: (mailboxId: MailboxId): void => eventBus.emit('mfe/inbox-mail/mailbox-selected', { mailboxId }),
  rememberSelection: (selectedMailId: string | null, autoSelectOwedTo: string | null): void =>
    eventBus.emit('mfe/inbox-mail/selection-remembered', { selectedMailId, autoSelectOwedTo }),
  setSearch: (search: string): void => eventBus.emit('mfe/inbox-mail/search-changed', { search }),
  setTab: (tab: MailTab): void => eventBus.emit('mfe/inbox-mail/tab-changed', { tab }),
  toggleHistory: (mailId: string): void => eventBus.emit('mfe/inbox-mail/history-toggled', { mailId }),
  setDraft: (mailId: string, draft: string): void => eventBus.emit('mfe/inbox-mail/draft-changed', { mailId, draft }),
  clearDraftIfSent: (mailId: string, body: string): void => eventBus.emit('mfe/inbox-mail/draft-sent', { mailId, body }),
};
// @cpt-end:cpt-template-inbox-algo-mail-keep-state:p2:inst-emit-event
