/**
 * The contacts directory's client-side state, a FrontX slice in the package's store, so leaving the section and coming back returns to the same filter and search: the package's app and its store live for the page and outlive an unmount.
 *
 * The table's sort order and page are the kit `DataTable`'s own state, which it does not expose for a caller to hold. They survive a trip to a contact page (the directory stays mounted behind it) but not leaving the section.
 *
 * Components read it with `useAppSelector` and change it through `actions/contactsActions.ts`; the effects in `effects/contactsEffects.ts` are the only code that dispatches these reducers.
 */

import { createSlice, type ReducerPayload, type RootState } from '@gears-frontx/react';
import type { ContactFilter } from '../screens/contacts/contactFilters';

// @cpt-dod:cpt-template-inbox-dod-contacts-keeps-place:p1
export const CONTACTS_SLICE = 'inbox/contacts';

export type ContactsState = {
  filter: ContactFilter;
  search: string;
};

export const initialContactsState = (): ContactsState => ({ filter: 'all', search: '' });

const { slice, filterSelected, searchChanged, contactsStateReset } = createSlice({
  name: CONTACTS_SLICE,
  initialState: initialContactsState(),
  reducers: {
    // @cpt-begin:cpt-template-inbox-algo-contacts-keep-directory-state:p2:inst-store-directory-state
    filterSelected: (state, action: ReducerPayload<ContactFilter>) => {
      state.filter = action.payload;
    },
    searchChanged: (state, action: ReducerPayload<string>) => {
      state.search = action.payload;
    },
    // @cpt-end:cpt-template-inbox-algo-contacts-keep-directory-state:p2:inst-store-directory-state
    /** Back to the initial state. */
    contactsStateReset: () => initialContactsState(),
  },
});

export const contactsSlice = slice;
export { filterSelected, searchChanged, contactsStateReset };

/** The directory's state, for `useAppSelector`. */
export const selectContactsDirectory = (state: RootState): ContactsState => state[CONTACTS_SLICE];

declare module '@gears-frontx/react' {
  interface RootState {
    'inbox/contacts': ContactsState;
  }
}
