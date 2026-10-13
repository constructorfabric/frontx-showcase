/**
 * Inbox domain - the mock map for `InboxApiService`.
 *
 * Keys are the full `METHOD /path` the plugin matches on, base URL included.
 * Every read hands back a whole collection: the shell's `RestMockPlugin` calls
 * a factory with the request body alone, so a per-id route could not tell
 * which id it was asked for. Screens select from the collection they already
 * hold. A write the backend would refuse throws a `MockRequestError` with the
 * status it would answer (`mockFailure.ts`).
 *
 * The conversations and the transcript are the collections a request can
 * change, so both live in the package's mock store (`mockStore.ts`) rather
 * than being served from the seed: a posted reply or note is appended to the
 * transcript and moves its conversation's snippet and last activity, and a
 * created conversation joins the list - each still there after the screen
 * remounts, the way a backend would keep it. Every package that bundles this
 * map has its own store, so a write shows on the screen whose package made it
 * and not on another screen package, which answers from its own copy of the
 * seed. Every factory answers with a copy, so nothing a screen does to a
 * response reaches the store. The contacts live there too: a created
 * conversation joins its contact's own list of conversations, and the
 * dashboard's activity rows point at them by id, read from the dashboard
 * package's own store, so its rows name people that package's directory list
 * holds.
 */

import { BRAND, NO_TEAM_INBOX } from './constants';
import { agent, channels } from './dataset';
import type { JsonValue, MockMap } from '@gears-frontx/react';
import { refuseRequest } from './mockFailure';
import { readInboxMockState } from './mockStore';
import type {
  Conversation,
  CreateConversationRequest,
  CreateConversationResponse,
  GetAgentResponse,
  GetChannelsResponse,
  GetContactsResponse,
  GetConversationsResponse,
  GetMessagesResponse,
  Message,
  PostMessageRequest,
  PostMessageResponse,
} from './types';

// @cpt-begin:cpt-template-inbox-algo-data-check-post:p1:inst-read-post-fields
// @cpt-begin:cpt-template-inbox-algo-data-check-create:p1:inst-read-create-fields
const readString = (body: JsonValue | undefined, field: string): string | null => {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return null;
  const value = body[field];
  return typeof value === 'string' ? value : null;
};
// @cpt-end:cpt-template-inbox-algo-data-check-post:p1:inst-read-post-fields
// @cpt-end:cpt-template-inbox-algo-data-check-create:p1:inst-read-create-fields

/**
 * The request a well-formed post carries; a post a backend would reject is
 * refused: a conversation to post into, a non-blank body and a
 * `kind` of reply or note are all required (400), and the conversation must
 * exist (404) - a post into nothing would leave an orphan in the transcript.
 */
// @cpt-algo:cpt-template-inbox-algo-data-check-post:p1
const readPostedMessage = (body: JsonValue | undefined): PostMessageRequest => {
  // @cpt-begin:cpt-template-inbox-algo-data-check-post:p1:inst-read-post-fields
  const conversationId = readString(body, 'conversationId');
  const text = readString(body, 'body');
  const kind = readString(body, 'kind');
  // @cpt-end:cpt-template-inbox-algo-data-check-post:p1:inst-read-post-fields
  // @cpt-begin:cpt-template-inbox-algo-data-check-post:p1:inst-refuse-incomplete-post
  if (conversationId === null || conversationId === '' || text === null || text.trim() === '') {
    return refuseRequest(400, 'A message needs a conversationId and a non-empty body.');
  }
  // @cpt-end:cpt-template-inbox-algo-data-check-post:p1:inst-refuse-incomplete-post
  // @cpt-begin:cpt-template-inbox-algo-data-check-post:p1:inst-refuse-unknown-kind
  if (kind !== 'reply' && kind !== 'note') {
    return refuseRequest(400, "A message's kind is 'reply' or 'note'.");
  }
  // @cpt-end:cpt-template-inbox-algo-data-check-post:p1:inst-refuse-unknown-kind
  // @cpt-begin:cpt-template-inbox-algo-data-check-post:p1:inst-refuse-unknown-conversation
  if (!readInboxMockState().conversations.some((conversation) => conversation.id === conversationId)) {
    return refuseRequest(404, `No conversation ${conversationId}.`);
  }
  // @cpt-end:cpt-template-inbox-algo-data-check-post:p1:inst-refuse-unknown-conversation
  // @cpt-begin:cpt-template-inbox-algo-data-check-post:p1:inst-return-post
  return { conversationId, body: text, kind };
  // @cpt-end:cpt-template-inbox-algo-data-check-post:p1:inst-return-post
};

/**
 * Stores the posted reply or note and answers with it. A real backend assigns
 * the id and the timestamp exactly here, which is why neither is taken from
 * the request, and moves the conversation's snippet and last activity with
 * it, which keeps the seed's own rule: a thread's newest message sits at its
 * conversation's last activity.
 */
// @cpt-algo:cpt-template-inbox-algo-data-store-post:p1
const acceptPostedMessage = (request: PostMessageRequest): Message => {
  // @cpt-begin:cpt-template-inbox-algo-data-store-post:p1:inst-count-post
  const state = readInboxMockState();
  state.postedMessageCount += 1;
  // @cpt-end:cpt-template-inbox-algo-data-store-post:p1:inst-count-post
  // @cpt-begin:cpt-template-inbox-algo-data-store-post:p1:inst-build-message
  const message: Message = {
    id: `m-sent-${state.postedMessageCount}`,
    conversationId: request.conversationId,
    direction: 'outbound',
    kind: 'text',
    body: request.body,
    links: [],
    imageUrl: null,
    sentAt: new Date().toISOString(),
    // No receipt yet: nothing has been delivered, and a note never gets one.
    seen: null,
    internal: request.kind === 'note',
    attachments: [],
  };
  // @cpt-end:cpt-template-inbox-algo-data-store-post:p1:inst-build-message
  // @cpt-begin:cpt-template-inbox-algo-data-store-post:p1:inst-append-message
  state.messages.push(message);
  // @cpt-end:cpt-template-inbox-algo-data-store-post:p1:inst-append-message
  // @cpt-begin:cpt-template-inbox-algo-data-store-post:p1:inst-move-snippet
  state.conversations = state.conversations.map((conversation) =>
    conversation.id === request.conversationId
      ? { ...conversation, snippet: message.body, lastActivityAt: message.sentAt }
      : conversation
  );
  // @cpt-end:cpt-template-inbox-algo-data-store-post:p1:inst-move-snippet
  // @cpt-begin:cpt-template-inbox-algo-data-store-post:p1:inst-return-message
  return message;
  // @cpt-end:cpt-template-inbox-algo-data-store-post:p1:inst-return-message
};

/**
 * The request a well-formed create carries; one a backend would reject is
 * refused: a channel and a contact are required (400), and the contact
 * must exist (404). The channel is not checked: channels the agent creates
 * are client-side in this template, and a conversation may be started in one.
 */
// @cpt-algo:cpt-template-inbox-algo-data-check-create:p1
const readCreatedConversation = (body: JsonValue | undefined): CreateConversationRequest => {
  // @cpt-begin:cpt-template-inbox-algo-data-check-create:p1:inst-read-create-fields
  const channelId = readString(body, 'channelId');
  const contactId = readString(body, 'contactId');
  // @cpt-end:cpt-template-inbox-algo-data-check-create:p1:inst-read-create-fields
  // @cpt-begin:cpt-template-inbox-algo-data-check-create:p1:inst-refuse-incomplete-create
  if (channelId === null || channelId === '' || contactId === null || contactId === '') {
    return refuseRequest(400, 'A conversation needs a channelId and a contactId.');
  }
  // @cpt-end:cpt-template-inbox-algo-data-check-create:p1:inst-refuse-incomplete-create
  // @cpt-begin:cpt-template-inbox-algo-data-check-create:p1:inst-refuse-unknown-contact
  if (!readInboxMockState().contacts.some((contact) => contact.id === contactId)) {
    return refuseRequest(404, `No contact ${contactId}.`);
  }
  // @cpt-end:cpt-template-inbox-algo-data-check-create:p1:inst-refuse-unknown-contact
  // @cpt-begin:cpt-template-inbox-algo-data-check-create:p1:inst-return-create
  return { channelId, contactId, assignee: readString(body, 'assignee') ?? '' };
  // @cpt-end:cpt-template-inbox-algo-data-check-create:p1:inst-return-create
};

/**
 * Stores a new, empty conversation with the contact and answers with it. The
 * contact's own record gains a ref to it, as a backend's join would, so the
 * contact's page lists the conversation next to the ones the seed gave them.
 */
// @cpt-algo:cpt-template-inbox-algo-data-store-create:p1
const acceptCreatedConversation = (request: CreateConversationRequest): Conversation => {
  // @cpt-begin:cpt-template-inbox-algo-data-store-create:p1:inst-count-create
  const state = readInboxMockState();
  state.createdConversationCount += 1;
  // @cpt-end:cpt-template-inbox-algo-data-store-create:p1:inst-count-create
  // @cpt-begin:cpt-template-inbox-algo-data-store-create:p1:inst-build-conversation
  const conversation: Conversation = {
    id: `c-new-${state.createdConversationCount}`,
    channelId: request.channelId,
    subject: state.contacts.find((contact) => contact.id === request.contactId)?.name ?? '',
    contactId: request.contactId,
    snippet: '',
    lastActivityAt: new Date().toISOString(),
    unreadCount: 0,
    priority: 'none',
    status: 'open',
    assignee: request.assignee,
    teamInbox: NO_TEAM_INBOX,
    channel: 'chat',
    brand: BRAND,
    tags: [],
    sharedFiles: [],
    suggestedReplies: [],
    starred: false,
    snoozed: false,
    pinned: false,
  };
  // @cpt-end:cpt-template-inbox-algo-data-store-create:p1:inst-build-conversation
  // @cpt-begin:cpt-template-inbox-algo-data-store-create:p1:inst-append-conversation
  state.conversations.push(conversation);
  // @cpt-end:cpt-template-inbox-algo-data-store-create:p1:inst-append-conversation
  // @cpt-begin:cpt-template-inbox-algo-data-store-create:p1:inst-link-contact
  state.contacts = state.contacts.map((contact) =>
    contact.id === request.contactId
      ? { ...contact, conversations: [...contact.conversations, { id: conversation.id }] }
      : contact
  );
  // @cpt-end:cpt-template-inbox-algo-data-store-create:p1:inst-link-contact
  // @cpt-begin:cpt-template-inbox-algo-data-store-create:p1:inst-return-conversation
  return conversation;
  // @cpt-end:cpt-template-inbox-algo-data-store-create:p1:inst-return-conversation
};

// @cpt-dod:cpt-template-inbox-dod-data-package-state:p1
// @cpt-flow:cpt-template-inbox-flow-data-read-collections:p1
// @cpt-flow:cpt-template-inbox-flow-data-post-message:p1
// @cpt-flow:cpt-template-inbox-flow-data-start-conversation:p1
export const inboxMockMap: MockMap = {
  // @cpt-begin:cpt-template-inbox-flow-data-read-collections:p1:inst-answer-read
  'GET /api/inbox/me': (): GetAgentResponse => structuredClone({ agent }),
  'GET /api/inbox/channels': (): GetChannelsResponse => structuredClone({ channels }),
  'GET /api/inbox/conversations': (): GetConversationsResponse =>
    structuredClone({ conversations: readInboxMockState().conversations }),
  'GET /api/inbox/messages': (): GetMessagesResponse => structuredClone({ messages: readInboxMockState().messages }),
  'GET /api/inbox/contacts': (): GetContactsResponse => structuredClone({ contacts: readInboxMockState().contacts }),
  // @cpt-end:cpt-template-inbox-flow-data-read-collections:p1:inst-answer-read
  // @cpt-begin:cpt-template-inbox-flow-data-post-message:p1:inst-answer-post
  'POST /api/inbox/messages': (body): PostMessageResponse => ({
    message: structuredClone(acceptPostedMessage(readPostedMessage(body))),
  }),
  // @cpt-end:cpt-template-inbox-flow-data-post-message:p1:inst-answer-post
  // @cpt-begin:cpt-template-inbox-flow-data-start-conversation:p1:inst-answer-create
  'POST /api/inbox/conversations': (body): CreateConversationResponse => ({
    conversation: structuredClone(acceptCreatedConversation(readCreatedConversation(body))),
  }),
  // @cpt-end:cpt-template-inbox-flow-data-start-conversation:p1:inst-answer-create
};
