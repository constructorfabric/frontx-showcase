import { describe, expect, it, vi } from 'vitest';
import type { InboxMockState } from '@inbox-shared/api/mockStore';
import type { MockMap } from '@gears-frontx/react';
import type { GetConversationsResponse, GetMessagesResponse, PostMessageResponse } from '@inbox-shared/api/types';

type Graph = {
  mockMap: MockMap;
  readInboxMockState: () => InboxMockState;
  resetInboxMockState: () => void;
};

/**
 * One module graph of the mock layer, freshly evaluated, the way each screen
 * package gets its own copy of every module it bundles. `vi.resetModules`
 * drops the module cache, so the next dynamic import evaluates the modules
 * again: two calls are two screen packages in one page.
 */
async function loadGraph(): Promise<Graph> {
  vi.resetModules();
  const store = await import('@inbox-shared/api/mockStore');
  const mocks = await import('@inbox-shared/api/mocks');
  return { mockMap: mocks.inboxMockMap, ...store };
}

describe("a package's mock store", () => {
  it('is its own state in every module graph, created from the same seed', async () => {
    const chat = await loadGraph();
    const contacts = await loadGraph();

    const ids = (state: InboxMockState) => ({
      contacts: state.contacts.map((contact) => contact.id),
      conversations: state.conversations.map((conversation) => conversation.id),
      messages: state.messages.map((message) => message.id),
    });
    expect(chat.readInboxMockState()).not.toBe(contacts.readInboxMockState());
    expect(ids(chat.readInboxMockState())).toEqual(ids(contacts.readInboxMockState()));
  });

  it("keeps a reply posted through a graph in that graph's reads, and out of another graph's", async () => {
    const chat = await loadGraph();
    const contacts = await loadGraph();
    const seededMessages = (chat.mockMap['GET /api/inbox/messages'](undefined) as GetMessagesResponse).messages.length;

    const posted = chat.mockMap['POST /api/inbox/messages']({ conversationId: 'c-9', body: 'On it.', kind: 'reply' }) as PostMessageResponse;

    const { messages } = chat.mockMap['GET /api/inbox/messages'](undefined) as GetMessagesResponse;
    expect(messages).toHaveLength(seededMessages + 1);
    expect(messages[messages.length - 1]).toEqual(posted.message);
    const { conversations } = chat.mockMap['GET /api/inbox/conversations'](undefined) as GetConversationsResponse;
    expect(conversations.find((conversation) => conversation.id === 'c-9')?.snippet).toBe('On it.');
    expect((contacts.mockMap['GET /api/inbox/messages'](undefined) as GetMessagesResponse).messages).toHaveLength(seededMessages);
  });

  it('answers with copies, so nothing a screen does to a response reaches the store', async () => {
    const graph = await loadGraph();
    const first = graph.mockMap['GET /api/inbox/conversations'](undefined) as GetConversationsResponse;
    first.conversations[0].subject = 'changed';

    const second = graph.mockMap['GET /api/inbox/conversations'](undefined) as GetConversationsResponse;
    expect(second.conversations[0].subject).not.toBe('changed');
  });

  it('starts over from the seed after a reset', async () => {
    const chat = await loadGraph();
    const seededMessages = (chat.mockMap['GET /api/inbox/messages'](undefined) as GetMessagesResponse).messages.length;
    const seededSnippet = (chat.mockMap['GET /api/inbox/conversations'](undefined) as GetConversationsResponse).conversations.find((conversation) => conversation.id === 'c-9')?.snippet;
    chat.mockMap['POST /api/inbox/messages']({ conversationId: 'c-9', body: 'One', kind: 'reply' });

    chat.resetInboxMockState();
    expect(chat.readInboxMockState().postedMessageCount).toBe(0);
    expect((chat.mockMap['GET /api/inbox/messages'](undefined) as GetMessagesResponse).messages).toHaveLength(seededMessages);
    expect((chat.mockMap['GET /api/inbox/conversations'](undefined) as GetConversationsResponse).conversations.find((conversation) => conversation.id === 'c-9')?.snippet).toBe(seededSnippet);
  });
});
