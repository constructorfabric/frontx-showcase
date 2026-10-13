/**
 * The chat screen's client-side state, a FrontX slice in the package's store.
 *
 * The shell unmounts the screen when another one takes its place, while the package's app and its store live for the page, so "View contact" and Back, or a trip to another section, return to the same channel, the same open conversation, the same drafts and every change the agent made from the thread.
 *
 * Only what is truly client-side lives here. A posted reply or note and a started conversation are the server's (the mock backend keeps them, the shared query cache holds what was read, and a write invalidates it); the fields the details panel changes, a channel the agent creates, and a draft are the client's own, so they are held here and laid over the fetched collections. The contacts screen's slice is the same arrangement.
 *
 * Components read it with `useAppSelector` and change it through `actions/chatActions.ts`; the effects in `effects/chatEffects.ts` are the only code that dispatches these reducers.
 */

import { createSlice, type ReducerPayload, type RootState } from '@gears-frontx/react';
import { CHANNEL_GENERAL } from '@inbox-shared/api/constants';
import type { Channel, Conversation } from '@inbox-shared/api/types';
import type { ComposerTab } from '../screens/chat/Composer';
import type { SortOrder } from '../screens/chat/conversationOrdering';

// @cpt-dod:cpt-template-inbox-dod-chat-keeps-place:p1
export const CHAT_SLICE = 'inbox/chat';

/**
 * The fields a triaging agent changes from the thread. The service writes only messages (a reply or a note) and new conversations, so everything else the details panel offers moves a value a real backend would own; it is applied over the fetched conversation rather than pretending to have been saved.
 */
export type ConversationPatch = Partial<
  Pick<Conversation, 'assignee' | 'priority' | 'snoozed' | 'starred' | 'status' | 'tags' | 'teamInbox'>
>;

export type ChatState = {
  channelId: string;
  /**
   * The open conversation, as the screen last had it. The screen owns the live value (its automatic first pick is decided during render, where only the screen's own state may change) and writes it back here, so a later mount opens the same conversation.
   */
  selectedId: string | null;
  /** The channel still owed an automatic first pick (`useAutoSelect`), or `null`. */
  autoSelectOwedTo: string | null;
  search: string;
  sort: SortOrder;
  composerTab: ComposerTab;
  detailsVisible: boolean;
  patches: Readonly<Record<string, ConversationPatch>>;
  /** Unsent text per conversation id. */
  drafts: Readonly<Record<string, string>>;
  /** Channels the agent created this session, never posted anywhere. */
  extraChannels: readonly Channel[];
  /**
   * Conversations the agent started, as the server answered the create. The server keeps them too, so they show up in the next read of the list; until then they are laid over the one the screen holds, never twice.
   */
  extraConversations: readonly Conversation[];
  /** A just-started conversation wants its reply box focused; the composer consumes it once. */
  composerFocusPending: boolean;
};

export const initialChatState = (): ChatState => ({
  channelId: CHANNEL_GENERAL,
  selectedId: null,
  autoSelectOwedTo: CHANNEL_GENERAL,
  search: '',
  sort: 'last-activity',
  composerTab: 'reply',
  detailsVisible: true,
  patches: {},
  drafts: {},
  extraChannels: [],
  extraConversations: [],
  composerFocusPending: false,
});

const {
  slice,
  channelSelected,
  selectionRemembered,
  searchChanged,
  sortChanged,
  composerTabChanged,
  detailsToggled,
  conversationPatched,
  draftChanged,
  draftAppended,
  draftSent,
  channelAdded,
  conversationAdded,
  composerFocusRequested,
  composerFocusConsumed,
  chatStateReset,
} = createSlice({
  name: CHAT_SLICE,
  initialState: initialChatState(),
  reducers: {
    // @cpt-begin:cpt-template-inbox-algo-chat-keep-state:p2:inst-store-view-state
    channelSelected: (state, action: ReducerPayload<string>) => {
      state.channelId = action.payload;
    },
    selectionRemembered: (state, action: ReducerPayload<{ selectedId: string | null; autoSelectOwedTo: string | null }>) => {
      state.selectedId = action.payload.selectedId;
      state.autoSelectOwedTo = action.payload.autoSelectOwedTo;
    },
    searchChanged: (state, action: ReducerPayload<string>) => {
      state.search = action.payload;
    },
    sortChanged: (state, action: ReducerPayload<SortOrder>) => {
      state.sort = action.payload;
    },
    composerTabChanged: (state, action: ReducerPayload<ComposerTab>) => {
      state.composerTab = action.payload;
    },
    detailsToggled: (state) => {
      state.detailsVisible = !state.detailsVisible;
    },
    // @cpt-end:cpt-template-inbox-algo-chat-keep-state:p2:inst-store-view-state
    // @cpt-begin:cpt-template-inbox-algo-chat-keep-state:p2:inst-store-triage
    conversationPatched: (state, action: ReducerPayload<{ conversationId: string; patch: ConversationPatch }>) => {
      const { conversationId, patch } = action.payload;
      state.patches = { ...state.patches, [conversationId]: { ...state.patches[conversationId], ...patch } };
    },
    // @cpt-end:cpt-template-inbox-algo-chat-keep-state:p2:inst-store-triage
    // @cpt-begin:cpt-template-inbox-algo-chat-keep-state:p2:inst-store-drafts
    draftChanged: (state, action: ReducerPayload<{ conversationId: string; draft: string }>) => {
      const { conversationId, draft } = action.payload;
      if (state.drafts[conversationId] !== draft) state.drafts = { ...state.drafts, [conversationId]: draft };
    },
    /** Appended rather than assigned, so a half-typed reply survives a suggestion click. */
    draftAppended: (state, action: ReducerPayload<{ conversationId: string; text: string }>) => {
      const { conversationId, text } = action.payload;
      const current = state.drafts[conversationId] ?? '';
      state.drafts = { ...state.drafts, [conversationId]: current === '' ? text : `${current} ${text}` };
    },
    /** Clears a sent draft - only if the box still holds what was sent; text typed meanwhile is a new draft. */
    draftSent: (state, action: ReducerPayload<{ conversationId: string; body: string }>) => {
      const { conversationId, body } = action.payload;
      if ((state.drafts[conversationId] ?? '').trim() === body) state.drafts = { ...state.drafts, [conversationId]: '' };
    },
    // @cpt-end:cpt-template-inbox-algo-chat-keep-state:p2:inst-store-drafts
    // @cpt-begin:cpt-template-inbox-algo-chat-keep-state:p2:inst-store-created
    channelAdded: (state, action: ReducerPayload<Channel>) => {
      state.extraChannels = [...state.extraChannels, action.payload];
      state.channelId = action.payload.id;
    },
    conversationAdded: (state, action: ReducerPayload<Conversation>) => {
      state.extraConversations = [...state.extraConversations, action.payload];
    },
    // @cpt-end:cpt-template-inbox-algo-chat-keep-state:p2:inst-store-created
    composerFocusRequested: (state) => {
      state.composerFocusPending = true;
    },
    composerFocusConsumed: (state) => {
      state.composerFocusPending = false;
    },
    /** Back to the initial state. */
    chatStateReset: () => initialChatState(),
  },
});

export const chatSlice = slice;
export {
  channelSelected,
  selectionRemembered,
  searchChanged,
  sortChanged,
  composerTabChanged,
  detailsToggled,
  conversationPatched,
  draftChanged,
  draftAppended,
  draftSent,
  channelAdded,
  conversationAdded,
  composerFocusRequested,
  composerFocusConsumed,
  chatStateReset,
};

/** The chat's state, for `useAppSelector`. */
export const selectChat = (state: RootState): ChatState => state[CHAT_SLICE];

declare module '@gears-frontx/react' {
  interface RootState {
    'inbox/chat': ChatState;
  }
}
