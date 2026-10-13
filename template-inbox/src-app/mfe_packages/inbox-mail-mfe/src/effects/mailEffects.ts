/**
 * The mail screen's effects: the one place its slice is dispatched to, one subscription per event `actions/mailActions.ts` emits. Registered with the slice in `init.ts`; the returned cleanup unsubscribes them all.
 */
import { eventBus, type AppDispatch } from '@gears-frontx/react';
import {
  draftChanged,
  draftSent,
  historyToggled,
  mailboxSelected,
  searchChanged,
  selectionRemembered,
  tabChanged,
} from '../slices/mailSlice';
import '../events/mailEvents';

export function initMailEffects(dispatch: AppDispatch): () => void {
  // @cpt-begin:cpt-template-inbox-algo-mail-keep-state:p2:inst-dispatch-reducer
  const subscriptions = [
    eventBus.on('mfe/inbox-mail/mailbox-selected', ({ mailboxId }) => dispatch(mailboxSelected(mailboxId))),
    eventBus.on('mfe/inbox-mail/selection-remembered', (payload) => dispatch(selectionRemembered(payload))),
    eventBus.on('mfe/inbox-mail/search-changed', ({ search }) => dispatch(searchChanged(search))),
    eventBus.on('mfe/inbox-mail/tab-changed', ({ tab }) => dispatch(tabChanged(tab))),
    eventBus.on('mfe/inbox-mail/history-toggled', ({ mailId }) => dispatch(historyToggled(mailId))),
    eventBus.on('mfe/inbox-mail/draft-changed', (payload) => dispatch(draftChanged(payload))),
    eventBus.on('mfe/inbox-mail/draft-sent', (payload) => dispatch(draftSent(payload))),
  ];
  // @cpt-end:cpt-template-inbox-algo-mail-keep-state:p2:inst-dispatch-reducer
  return () => {
    for (const subscription of subscriptions) subscription.unsubscribe();
  };
}
