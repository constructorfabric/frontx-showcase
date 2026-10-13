import { getStore, type RootState } from '@gears-frontx/react';
import { describe, expect, it } from 'vitest';
import { mailActions } from './actions/mailActions';
import { initialMailState, mailSlice, selectMail } from './slices/mailSlice';
import './init';

const mail = () => selectMail(getStore().getState() as RootState);

describe('the mail flux', () => {
  it('registers its slice in the package store with the initial state', () => {
    expect(mailSlice.name).toBe('inbox/mail');
    expect(mail()).toEqual(initialMailState());
  });

  it('turns every action into the slice update it names', () => {
    mailActions.selectMailbox('sent');
    mailActions.rememberSelection('ml-2', null);
    mailActions.setSearch('plan');
    mailActions.setTab('unread');
    mailActions.toggleHistory('ml-2');
    mailActions.setDraft('ml-2', 'Thanks');

    expect(mail()).toEqual({
      mailboxId: 'sent',
      selectedMailId: 'ml-2',
      autoSelectOwedTo: null,
      search: 'plan',
      tab: 'unread',
      historyOpenById: { 'ml-2': true },
      drafts: { 'ml-2': 'Thanks' },
    });

    mailActions.toggleHistory('ml-2');
    expect(mail().historyOpenById['ml-2']).toBe(false);
  });

  it('clears a sent reply draft only while the box still holds what was sent', () => {
    mailActions.setDraft('ml-1', 'Edited since');
    mailActions.clearDraftIfSent('ml-1', 'Looks good');
    expect(mail().drafts['ml-1']).toBe('Edited since');

    mailActions.clearDraftIfSent('ml-1', 'Edited since');
    expect(mail().drafts['ml-1']).toBe('');
  });
});
