/**
 * The chat screen's events: what the agent did, emitted by `actions/chatActions.ts` and turned into slice updates by `effects/chatEffects.ts`. Names follow `mfe/<domain>/<event>` in the past tense.
 */
import type { Channel, Conversation } from '@inbox-shared/api/types';
import type { ComposerTab } from '../screens/chat/Composer';
import type { SortOrder } from '../screens/chat/conversationOrdering';
import type { ConversationPatch } from '../slices/chatSlice';

export {};

declare module '@gears-frontx/react' {
  interface EventPayloadMap {
    'mfe/inbox-chat/channel-selected': { channelId: string };
    'mfe/inbox-chat/selection-remembered': { selectedId: string | null; autoSelectOwedTo: string | null };
    'mfe/inbox-chat/search-changed': { search: string };
    'mfe/inbox-chat/sort-changed': { sort: SortOrder };
    'mfe/inbox-chat/composer-tab-changed': { tab: ComposerTab };
    'mfe/inbox-chat/details-toggled': void;
    'mfe/inbox-chat/conversation-patched': { conversationId: string; patch: ConversationPatch };
    'mfe/inbox-chat/draft-changed': { conversationId: string; draft: string };
    'mfe/inbox-chat/draft-appended': { conversationId: string; text: string };
    'mfe/inbox-chat/draft-sent': { conversationId: string; body: string };
    'mfe/inbox-chat/channel-created': { channel: Channel };
    'mfe/inbox-chat/conversation-started': { conversation: Conversation };
    'mfe/inbox-chat/composer-focus-requested': void;
    'mfe/inbox-chat/composer-focused': void;
  }
}
