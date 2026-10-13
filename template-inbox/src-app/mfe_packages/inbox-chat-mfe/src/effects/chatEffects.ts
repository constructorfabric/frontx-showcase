/**
 * The chat screen's effects: the one place its slice is dispatched to, one subscription per event `actions/chatActions.ts` emits. Registered with the slice in `init.ts`; the returned cleanup unsubscribes them all.
 */
import { eventBus, type AppDispatch } from '@gears-frontx/react';
import {
  channelAdded,
  channelSelected,
  composerFocusConsumed,
  composerFocusRequested,
  composerTabChanged,
  conversationAdded,
  conversationPatched,
  detailsToggled,
  draftAppended,
  draftChanged,
  draftSent,
  searchChanged,
  selectionRemembered,
  sortChanged,
} from '../slices/chatSlice';
import '../events/chatEvents';

export function initChatEffects(dispatch: AppDispatch): () => void {
  // @cpt-begin:cpt-template-inbox-algo-chat-keep-state:p2:inst-dispatch-reducer
  const subscriptions = [
    eventBus.on('mfe/inbox-chat/channel-selected', ({ channelId }) => dispatch(channelSelected(channelId))),
    eventBus.on('mfe/inbox-chat/selection-remembered', (payload) => dispatch(selectionRemembered(payload))),
    eventBus.on('mfe/inbox-chat/search-changed', ({ search }) => dispatch(searchChanged(search))),
    eventBus.on('mfe/inbox-chat/sort-changed', ({ sort }) => dispatch(sortChanged(sort))),
    eventBus.on('mfe/inbox-chat/composer-tab-changed', ({ tab }) => dispatch(composerTabChanged(tab))),
    eventBus.on('mfe/inbox-chat/details-toggled', () => dispatch(detailsToggled())),
    eventBus.on('mfe/inbox-chat/conversation-patched', (payload) => dispatch(conversationPatched(payload))),
    eventBus.on('mfe/inbox-chat/draft-changed', (payload) => dispatch(draftChanged(payload))),
    eventBus.on('mfe/inbox-chat/draft-appended', (payload) => dispatch(draftAppended(payload))),
    eventBus.on('mfe/inbox-chat/draft-sent', (payload) => dispatch(draftSent(payload))),
    eventBus.on('mfe/inbox-chat/channel-created', ({ channel }) => dispatch(channelAdded(channel))),
    eventBus.on('mfe/inbox-chat/conversation-started', ({ conversation }) => dispatch(conversationAdded(conversation))),
    eventBus.on('mfe/inbox-chat/composer-focus-requested', () => dispatch(composerFocusRequested())),
    eventBus.on('mfe/inbox-chat/composer-focused', () => dispatch(composerFocusConsumed())),
  ];
  // @cpt-end:cpt-template-inbox-algo-chat-keep-state:p2:inst-dispatch-reducer
  return () => {
    for (const subscription of subscriptions) subscription.unsubscribe();
  };
}
