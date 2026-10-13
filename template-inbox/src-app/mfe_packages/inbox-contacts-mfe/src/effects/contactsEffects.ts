/**
 * The contacts directory's effects: the one place its slice is dispatched to. Registered with the slice in `init.ts`; the returned cleanup unsubscribes them.
 */
import { eventBus, type AppDispatch } from '@gears-frontx/react';
import { filterSelected, searchChanged } from '../slices/contactsSlice';
import '../events/contactsEvents';

export function initContactsEffects(dispatch: AppDispatch): () => void {
  // @cpt-begin:cpt-template-inbox-algo-contacts-keep-directory-state:p2:inst-dispatch-reducer
  const subscriptions = [
    eventBus.on('mfe/inbox-contacts/filter-selected', ({ filter }) => dispatch(filterSelected(filter))),
    eventBus.on('mfe/inbox-contacts/search-changed', ({ search }) => dispatch(searchChanged(search))),
  ];
  // @cpt-end:cpt-template-inbox-algo-contacts-keep-directory-state:p2:inst-dispatch-reducer
  return () => {
    for (const subscription of subscriptions) subscription.unsubscribe();
  };
}
