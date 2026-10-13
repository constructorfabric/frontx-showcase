/**
 * What the contacts directory's components call to change its state. Each action emits one event; `effects/contactsEffects.ts` turns it into a slice update.
 */
import { eventBus } from '@gears-frontx/react';
import type { ContactFilter } from '../screens/contacts/contactFilters';
import '../events/contactsEvents';

// @cpt-algo:cpt-template-inbox-algo-contacts-keep-directory-state:p2
// @cpt-begin:cpt-template-inbox-algo-contacts-keep-directory-state:p2:inst-emit-event
export const contactsActions = {
  setFilter: (filter: ContactFilter): void => eventBus.emit('mfe/inbox-contacts/filter-selected', { filter }),
  setSearch: (search: string): void => eventBus.emit('mfe/inbox-contacts/search-changed', { search }),
};
// @cpt-end:cpt-template-inbox-algo-contacts-keep-directory-state:p2:inst-emit-event
