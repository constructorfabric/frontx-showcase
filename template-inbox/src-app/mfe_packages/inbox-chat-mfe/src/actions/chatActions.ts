/**
 * What the chat screen's components call to change the chat's state. Each action emits one event; `effects/chatEffects.ts` turns it into a slice update.
 */
import { eventBus } from '@gears-frontx/react';
import type { Channel, Conversation } from '@inbox-shared/api/types';
import type { ComposerTab } from '../screens/chat/Composer';
import type { SortOrder } from '../screens/chat/conversationOrdering';
import type { ConversationPatch } from '../slices/chatSlice';
import '../events/chatEvents';

// @cpt-algo:cpt-template-inbox-algo-chat-keep-state:p2
// @cpt-begin:cpt-template-inbox-algo-chat-keep-state:p2:inst-emit-event
export const chatActions = {
  selectChannel: (channelId: string): void => eventBus.emit('mfe/inbox-chat/channel-selected', { channelId }),
  rememberSelection: (selectedId: string | null, autoSelectOwedTo: string | null): void =>
    eventBus.emit('mfe/inbox-chat/selection-remembered', { selectedId, autoSelectOwedTo }),
  setSearch: (search: string): void => eventBus.emit('mfe/inbox-chat/search-changed', { search }),
  setSort: (sort: SortOrder): void => eventBus.emit('mfe/inbox-chat/sort-changed', { sort }),
  setComposerTab: (tab: ComposerTab): void => eventBus.emit('mfe/inbox-chat/composer-tab-changed', { tab }),
  toggleDetails: (): void => eventBus.emit('mfe/inbox-chat/details-toggled'),
  patchConversation: (conversationId: string, patch: ConversationPatch): void =>
    eventBus.emit('mfe/inbox-chat/conversation-patched', { conversationId, patch }),
  setDraft: (conversationId: string, draft: string): void =>
    eventBus.emit('mfe/inbox-chat/draft-changed', { conversationId, draft }),
  appendToDraft: (conversationId: string, text: string): void =>
    eventBus.emit('mfe/inbox-chat/draft-appended', { conversationId, text }),
  clearDraftIfSent: (conversationId: string, body: string): void =>
    eventBus.emit('mfe/inbox-chat/draft-sent', { conversationId, body }),
  addChannel: (channel: Channel): void => eventBus.emit('mfe/inbox-chat/channel-created', { channel }),
  addConversation: (conversation: Conversation): void =>
    eventBus.emit('mfe/inbox-chat/conversation-started', { conversation }),
  requestComposerFocus: (): void => eventBus.emit('mfe/inbox-chat/composer-focus-requested'),
  composerFocused: (): void => eventBus.emit('mfe/inbox-chat/composer-focused'),
};
// @cpt-end:cpt-template-inbox-algo-chat-keep-state:p2:inst-emit-event
