import { getStore, type RootState } from '@gears-frontx/react';
import { describe, expect, it } from 'vitest';
import { conversations } from '@inbox-shared/api/dataset';
import { chatActions } from './actions/chatActions';
import { chatSlice, initialChatState, selectChat } from './slices/chatSlice';
import './init';

const chat = () => selectChat(getStore().getState() as RootState);

describe('the chat flux', () => {
  it('registers its slice in the package store with the initial state', () => {
    expect(chatSlice.name).toBe('inbox/chat');
    expect(chat()).toEqual(initialChatState());
  });

  it('turns every action into the slice update it names', () => {
    chatActions.selectChannel('support');
    chatActions.rememberSelection('c-9', null);
    chatActions.setSearch('dark');
    chatActions.setSort('unread');
    chatActions.setComposerTab('note');
    chatActions.toggleDetails();
    chatActions.patchConversation('c-9', { starred: true });
    chatActions.patchConversation('c-9', { status: 'closed' });
    chatActions.setDraft('c-9', 'Half');
    chatActions.appendToDraft('c-9', 'a reply');
    chatActions.addChannel({ id: 'channel-x', label: 'X', icon: 'hash', itemCount: 0, openCount: 0 });
    chatActions.addConversation({ ...conversations[0], id: 'c-new-1' });
    chatActions.requestComposerFocus();

    expect(chat()).toMatchObject({
      channelId: 'channel-x',
      selectedId: 'c-9',
      autoSelectOwedTo: null,
      search: 'dark',
      sort: 'unread',
      composerTab: 'note',
      detailsVisible: false,
      patches: { 'c-9': { starred: true, status: 'closed' } },
      drafts: { 'c-9': 'Half a reply' },
      composerFocusPending: true,
    });
    expect(chat().extraChannels.map((channel) => channel.id)).toEqual(['channel-x']);
    expect(chat().extraConversations.map((conversation) => conversation.id)).toEqual(['c-new-1']);

    chatActions.composerFocused();
    expect(chat().composerFocusPending).toBe(false);
  });

  it('clears a sent draft only while the box still holds what was sent', () => {
    chatActions.setDraft('c-9', 'Typed after');
    chatActions.clearDraftIfSent('c-9', 'Sent before');
    expect(chat().drafts['c-9']).toBe('Typed after');

    chatActions.clearDraftIfSent('c-9', 'Typed after');
    expect(chat().drafts['c-9']).toBe('');
  });
});
