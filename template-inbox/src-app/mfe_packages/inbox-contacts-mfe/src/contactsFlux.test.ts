import { getStore, type RootState } from '@gears-frontx/react';
import { describe, expect, it, vi } from 'vitest';
import { contactsActions } from './actions/contactsActions';
import { initContactsEffects } from './effects/contactsEffects';
import { contactsSlice, contactsStateReset, initialContactsState, selectContactsDirectory } from './slices/contactsSlice';
import './init';

describe('the contacts directory flux', () => {
  it('starts on every contact with no search', () => {
    expect(contactsSlice.name).toBe('inbox/contacts');
    expect(selectContactsDirectory(getStore().getState() as RootState)).toEqual(initialContactsState());
  });

  it('keeps the filter and the search the directory set in the package store, until the slice resets', () => {
    contactsActions.setFilter('leads');
    contactsActions.setSearch('Grace');
    expect(selectContactsDirectory(getStore().getState() as RootState)).toEqual({ filter: 'leads', search: 'Grace' });

    getStore().dispatch(contactsStateReset());
    expect(selectContactsDirectory(getStore().getState() as RootState)).toEqual({ filter: 'all', search: '' });
  });

  it('dispatches from its effects only, and stops once they are cleaned up', () => {
    const dispatch = vi.fn();
    const cleanup = initContactsEffects(dispatch);
    contactsActions.setSearch('Ada');
    expect(dispatch).toHaveBeenCalledWith({ type: 'inbox/contacts/searchChanged', payload: 'Ada' });

    cleanup();
    dispatch.mockClear();
    contactsActions.setSearch('Grace');
    expect(dispatch).not.toHaveBeenCalled();
  });
});
