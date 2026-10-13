import { useEffect, useMemo, useRef, useState } from 'react';
import { InboxIcon } from 'lucide-react';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@gears-frontx/ui-kit';
import { DetailPane } from '@inbox-shared/blocks/DetailPane';
import { PaneState } from '@inbox-shared/blocks/PaneState';
import { useApiMutation, useApiQuery, useAppSelector } from '@gears-frontx/react';
import { getInboxApi } from '@inbox-shared/api/registry';
import type {
  Contact,
  Conversation,
  ConversationPriority,
  ConversationStatus,
  CreateConversationRequest,
  CreateConversationResponse,
  Message,
  PostMessageRequest,
  PostMessageResponse,
} from '@inbox-shared/api/types';
import type { Translate } from '@inbox-shared/i18n/translate';
import { firstPaintOf, LoadErrorPane, LoadingPane } from '@inbox-shared/ui/QueryStates';
import { useAutoSelect } from '@inbox-shared/ui/useAutoSelect';
import { useScreenLayout } from '@inbox-shared/ui/screenLayout';
import { useSidebarToggle } from '@inbox-shared/ui/useSidebarToggle';
import { uniqueSuffix } from '@inbox-shared/ui/uniqueSuffix';
import { ConversationList } from './ConversationList';
import { ConversationThread } from './ConversationThread';
import { countOpen, selectConversations } from './conversationOrdering';
import { CustomerDetailsPanel } from './CustomerDetailsPanel';
import { useChatNavigation } from './chatNavigation';
import { FolderSidebar } from './FolderSidebar';
import { chatActions } from '../../actions/chatActions';
import { selectChat } from '../../slices/chatSlice';

export type ChatScreenProps = {
  t: Translate;
};

/**
 * The chat screen: channels, the conversation list, the open thread and the
 * customer details panel.
 *
 * What the agent selects, types and changes lives in the chat's FrontX
 * slice (`slices/chatSlice.ts`), outside this component, so leaving the
 * screen and coming back finds it as it was. Each pane reads only the part it
 * shows; in particular the draft is read by the composer alone, so a
 * keystroke re-renders the composer and nothing else. What stays here is per
 * mount: posts in flight, a failed post's error, and the replies this mount
 * has sent until the transcript read again holds them. The contacts screen
 * follows the same split over its own slice.
 */
export function ChatScreen({ t }: ChatScreenProps) {
  // @cpt-flow:cpt-template-inbox-flow-chat-answer-conversation:p1
  // @cpt-flow:cpt-template-inbox-flow-chat-start-conversation:p1
  // @cpt-flow:cpt-template-inbox-flow-chat-organize-and-triage:p1
  // @cpt-state:cpt-template-inbox-state-chat-composer-send:p2
  // @cpt-dod:cpt-template-inbox-dod-chat-conversations:p1
  // @cpt-dod:cpt-template-inbox-dod-chat-start-conversation:p1
  const service = getInboxApi();
  const navigation = useChatNavigation();

  // @cpt-begin:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-read-collections
  const agentQuery = useApiQuery(service.getAgent);
  const channelsQuery = useApiQuery(service.getChannels);
  const conversationsQuery = useApiQuery(service.getConversations);
  const messagesQuery = useApiQuery(service.getMessages);
  const contactsQuery = useApiQuery(service.getContacts);
  // @cpt-end:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-read-collections

  // @cpt-begin:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-read-chat-state
  const channelId = useAppSelector((state) => selectChat(state).channelId);
  // The open conversation is the screen's own state while it is mounted: the
  // automatic first pick is decided during render, where only a component's
  // own state may change. It is written back to the slice with the pick
  // still owed, so a later mount starts from both.
  const storedSelectedId = useAppSelector((state) => selectChat(state).selectedId);
  const storedOwedTo = useAppSelector((state) => selectChat(state).autoSelectOwedTo);
  const [selectedId, setSelectedId] = useState(storedSelectedId);
  const search = useAppSelector((state) => selectChat(state).search);
  const sort = useAppSelector((state) => selectChat(state).sort);
  const composerTab = useAppSelector((state) => selectChat(state).composerTab);
  const detailsVisible = useAppSelector((state) => selectChat(state).detailsVisible);
  const patches = useAppSelector((state) => selectChat(state).patches);
  const extraChannels = useAppSelector((state) => selectChat(state).extraChannels);
  const extraConversations = useAppSelector((state) => selectChat(state).extraConversations);
  // @cpt-end:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-read-chat-state

  // A write's answer settles after the agent may have left the screen: what
  // it means for the slice still lands, what it means for this mount's own
  // panes (the selection, a focus request) only while the screen is up.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Replies this mount has posted. The service keeps them too, and the post
  // invalidates the cached transcript, so the next read holds them; until it
  // answers they are appended here, and a message the transcript already
  // holds is never shown twice.
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  // Conversations with a post in flight, so one thread's send never shows
  // another thread's composer as busy.
  const [sendingIds, setSendingIds] = useState<Record<string, number>>({});
  // The conversations whose latest post failed; their draft is kept.
  const [failedIds, setFailedIds] = useState<Record<string, true>>({});
  // The latest attempt to start a conversation failed.
  const [startChatFailed, setStartChatFailed] = useState(false);

  const channelsSidebar = useSidebarToggle();
  const isSinglePane = useScreenLayout() === 'single';

  // @cpt-begin:cpt-template-inbox-state-chat-composer-send:p2:inst-post-fails
  const setFailed = (conversationId: string, failed: boolean) =>
    setFailedIds((previous) => {
      if (failed === (conversationId in previous)) return previous;
      const next = { ...previous };
      if (failed) next[conversationId] = true;
      else delete next[conversationId];
      return next;
    });
  // @cpt-end:cpt-template-inbox-state-chat-composer-send:p2:inst-post-fails

  // @cpt-begin:cpt-template-inbox-state-chat-composer-send:p2:inst-post-settles
  const finishSending = (conversationId: string) =>
    setSendingIds((previous) => {
      const remaining = (previous[conversationId] ?? 1) - 1;
      const next = { ...previous };
      if (remaining > 0) next[conversationId] = remaining;
      else delete next[conversationId];
      return next;
    });
  // @cpt-end:cpt-template-inbox-state-chat-composer-send:p2:inst-post-settles

  const sendMessage = useApiMutation<PostMessageResponse, Error, PostMessageRequest>({
    endpoint: service.postMessage,
    onSuccess: (response, request, _context, { queryCache }) => {
      // The server keeps the posted message and moves its conversation's
      // snippet and last activity, so the shared cache's transcript and list
      // are stale: every screen that reads them reads them again.
      // @cpt-begin:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-post-accepted
      void queryCache.invalidate(service.getMessages);
      void queryCache.invalidate(service.getConversations);
      // The draft lives in the slice, so it is cleared even when the agent
      // left the screen before the post came back; otherwise the next visit
      // would show the sent text still in the box, ready to be sent twice.
      chatActions.clearDraftIfSent(request.conversationId, request.body);
      setSentMessages((previous) => [...previous, response.message]);
      // @cpt-end:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-post-accepted
      finishSending(request.conversationId);
    },
    // A failed post keeps the draft where it is, so nothing typed is lost,
    // and the composer says the post did not go out.
    onError: (_error, request) => {
      // @cpt-begin:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-post-refused
      finishSending(request.conversationId);
      setFailed(request.conversationId, true);
      // @cpt-end:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-post-refused
    },
  });

  const startConversation = useApiMutation<CreateConversationResponse, Error, CreateConversationRequest>({
    endpoint: service.createConversation,
    onSuccess: (response, _request, _context, { queryCache }) => {
      // The server lists the new conversation and adds it to its contact's
      // own record: both reads are stale for every screen that holds them.
      // @cpt-begin:cpt-template-inbox-flow-chat-start-conversation:p1:inst-start-accepted
      void queryCache.invalidate(service.getConversations);
      void queryCache.invalidate(service.getContacts);
      chatActions.addConversation(response.conversation);
      // @cpt-end:cpt-template-inbox-flow-chat-start-conversation:p1:inst-start-accepted
      // Opened only if the agent is still on the screen, in the channel it
      // was started from (the latest render's): after a switch the list
      // would highlight nothing while the thread and the composer focus
      // jumped to it. It stays in its own channel's list.
      // @cpt-begin:cpt-template-inbox-flow-chat-start-conversation:p1:inst-open-started
      if (!mounted.current || response.conversation.channelId !== channelId) return;
      setSelectedId(response.conversation.id);
      chatActions.requestComposerFocus();
      // @cpt-end:cpt-template-inbox-flow-chat-start-conversation:p1:inst-open-started
    },
    // @cpt-begin:cpt-template-inbox-flow-chat-start-conversation:p1:inst-start-refused
    onError: () => setStartChatFailed(true),
    // @cpt-end:cpt-template-inbox-flow-chat-start-conversation:p1:inst-start-refused
  });

  // The fetched list, the conversations started since it was read, and the
  // replies this mount sent, with the agent's own changes over all of them: a
  // started conversation takes a star, a status or a tag like any other.
  // @cpt-begin:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-merge-conversations
  const conversations: Conversation[] = useMemo(() => {
    const fetched = conversationsQuery.data?.conversations ?? [];
    const fetchedIds = new Set(fetched.map((conversation) => conversation.id));
    const latestSent = new Map<string, Message>();
    for (const message of sentMessages) latestSent.set(message.conversationId, message);
    return [...fetched, ...extraConversations.filter((conversation) => !fetchedIds.has(conversation.id))].map(
      (conversation) => {
        const sent = latestSent.get(conversation.id);
        const activity =
          sent !== undefined && Date.parse(sent.sentAt) > Date.parse(conversation.lastActivityAt)
            ? { snippet: sent.body, lastActivityAt: sent.sentAt }
            : null;
        return { ...conversation, ...activity, ...patches[conversation.id] };
      }
    );
  }, [conversationsQuery.data, extraConversations, sentMessages, patches]);
  // @cpt-end:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-merge-conversations

  // @cpt-begin:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-index-contacts
  const contactsById = useMemo(() => {
    const index = new Map<string, Contact>();
    for (const contact of contactsQuery.data?.contacts ?? []) index.set(contact.id, contact);
    return index;
  }, [contactsQuery.data]);
  // @cpt-end:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-index-contacts

  // @cpt-begin:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-select-visible
  const visibleConversations = useMemo(
    () => selectConversations(conversations, contactsById, channelId, search, sort),
    [conversations, contactsById, channelId, search, sort]
  );
  // @cpt-end:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-select-visible

  // @cpt-begin:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-auto-select
  const autoSelect = useAutoSelect({
    scope: channelId,
    settled: !conversationsQuery.isLoading && !contactsQuery.isLoading,
    firstId: visibleConversations[0]?.id,
    selectedId,
    onSelect: setSelectedId,
    initialOwedTo: storedOwedTo,
  });
  useEffect(
    () => chatActions.rememberSelection(selectedId, autoSelect.owedTo),
    [selectedId, autoSelect.owedTo]
  );
  // @cpt-end:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-auto-select

  // Selected from the whole collection rather than the visible slice: typing a
  // search narrows the list without closing the thread the agent is reading.
  const selected = conversations.find((conversation) => conversation.id === selectedId) ?? null;

  // @cpt-begin:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-thread-messages
  const threadMessages = useMemo(() => {
    if (!selected) return [];
    const fetched = messagesQuery.data?.messages ?? [];
    const fetchedIds = new Set(fetched.map((message) => message.id));
    return [...fetched, ...sentMessages.filter((message) => !fetchedIds.has(message.id))].filter(
      (message) => message.conversationId === selected.id
    );
  }, [messagesQuery.data, sentMessages, selected]);
  // @cpt-end:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-thread-messages

  // @cpt-begin:cpt-template-inbox-flow-chat-organize-and-triage:p1:inst-channel-counts
  const channels = useMemo(() => {
    const rows = [...(channelsQuery.data?.channels ?? []), ...extraChannels];
    return rows.map((channel) => {
      const inChannel = conversations.filter((conversation) => conversation.channelId === channel.id);
      return { ...channel, itemCount: inChannel.length, openCount: countOpen(inChannel) };
    });
  }, [channelsQuery.data, extraChannels, conversations]);
  // @cpt-end:cpt-template-inbox-flow-chat-organize-and-triage:p1:inst-channel-counts

  // @cpt-begin:cpt-template-inbox-flow-chat-organize-and-triage:p1:inst-select-channel
  const selectChannel = (nextChannelId: string) => {
    chatActions.selectChannel(nextChannelId);
    setSelectedId(null);
    autoSelect.arm(nextChannelId);
  };
  // @cpt-end:cpt-template-inbox-flow-chat-organize-and-triage:p1:inst-select-channel

  /**
   * A demo-grade channel, switched into immediately - it lands on the same
   * empty state any channel with no conversations renders, since it is a
   * real `Channel` row from here on, not a stub.
   */
  // @cpt-begin:cpt-template-inbox-flow-chat-organize-and-triage:p1:inst-create-channel
  const createChannel = (name: string) => {
    const channel = { id: `channel-${uniqueSuffix()}`, label: name, icon: 'hash' as const, itemCount: 0, openCount: 0 };
    chatActions.addChannel(channel);
    setSelectedId(null);
    autoSelect.arm(channel.id);
  };
  // @cpt-end:cpt-template-inbox-flow-chat-organize-and-triage:p1:inst-create-channel

  /**
   * A conversation with an existing contact, in the current channel, assigned
   * to the agent. The server creates it (id, timestamps, an empty transcript)
   * and it opens with the reply box focused once the answer arrives; sending
   * into it is the same post as into any other thread.
   */
  // @cpt-begin:cpt-template-inbox-flow-chat-start-conversation:p1:inst-request-start
  const startChat = (contactId: string) => {
    setStartChatFailed(false);
    startConversation.mutate({ channelId, contactId, assignee: agentQuery.data?.agent.name ?? '' });
  };
  // @cpt-end:cpt-template-inbox-flow-chat-start-conversation:p1:inst-request-start

  // @cpt-begin:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-gate-first-paint
  const firstPaint = firstPaintOf([agentQuery, channelsQuery, conversationsQuery, messagesQuery, contactsQuery]);
  if (firstPaint.failed) return <LoadErrorPane onRetry={firstPaint.retry} t={t} />;
  if (firstPaint.loading) return <LoadingPane />;
  // @cpt-end:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-gate-first-paint

  const channelLabel = channels.find((channel) => channel.id === channelId)?.label ?? '';
  const isSpam = selected?.tags.includes('spam') ?? false;
  const showThread = selected !== null;

  // Spam is a tag, not a channel: the conversation stays put in whichever
  // channel it is already in, so marking or unmarking it never moves the
  // selection out from under the agent. The thread header's menu and the
  // details panel both call this.
  // @cpt-begin:cpt-template-inbox-flow-chat-organize-and-triage:p1:inst-toggle-spam
  const toggleSpam = () => {
    if (!selected) return;
    chatActions.patchConversation(selected.id, {
      tags: isSpam ? selected.tags.filter((tag) => tag !== 'spam') : [...selected.tags, 'spam'],
    });
  };
  // @cpt-end:cpt-template-inbox-flow-chat-organize-and-triage:p1:inst-toggle-spam

  // The composer hands over the draft it holds, rather than this component
  // reading it, so typing never re-renders this component.
  const sendDraft = (draft: string) => {
    // @cpt-begin:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-check-sendable
    if (!selected || selected.status === 'closed') return;
    const body = draft.trim();
    if (body === '') return;
    // @cpt-end:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-check-sendable
    // @cpt-begin:cpt-template-inbox-state-chat-composer-send:p2:inst-start-sending
    setFailed(selected.id, false);
    setSendingIds((previous) => ({ ...previous, [selected.id]: (previous[selected.id] ?? 0) + 1 }));
    // @cpt-end:cpt-template-inbox-state-chat-composer-send:p2:inst-start-sending
    // @cpt-begin:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-post-message
    sendMessage.mutate({ conversationId: selected.id, body, kind: composerTab });
    // @cpt-end:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-post-message
  };

  return (
    <>
      <FolderSidebar
        channels={channels}
        selectedChannelId={channelId}
        onSelectChannel={(nextChannelId) => {
          selectChannel(nextChannelId);
          channelsSidebar.dismiss();
        }}
        onCreateChannel={(name) => {
          createChannel(name);
          channelsSidebar.dismiss();
        }}
        column={channelsSidebar}
        t={t}
      />

      <ConversationList
        conversations={visibleConversations}
        contactsById={contactsById}
        channelLabel={channelLabel}
        selectedConversationId={selectedId}
        onSelectConversation={setSelectedId}
        onStartChat={startChat}
        startChatFailed={startChatFailed}
        search={search}
        onSearchChange={chatActions.setSearch}
        sort={sort}
        onSortChange={chatActions.setSort}
        onToggleChannels={channelsSidebar.toggle}
        channelsOpen={!channelsSidebar.collapsed}
        hidden={isSinglePane && showThread}
        t={t}
      />

      <DetailPane hidden={isSinglePane && !showThread} asideOpen={showThread && detailsVisible}>
        {selected ? (
          <>
            {/* @cpt-begin:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-render-thread */}
            <ConversationThread
              conversation={selected}
              contact={contactsById.get(selected.contactId)}
              agent={agentQuery.data?.agent}
              messages={threadMessages}
              detailsVisible={detailsVisible}
              onToggleDetails={chatActions.toggleDetails}
              onToggleStar={() => chatActions.patchConversation(selected.id, { starred: !selected.starred })}
              onToggleSnooze={() =>
                chatActions.patchConversation(selected.id, {
                  snoozed: !selected.snoozed,
                  status: selected.snoozed ? 'open' : 'snoozed',
                })
              }
              onToggleSpam={toggleSpam}
              isSpam={isSpam}
              onCloseConversation={() => {
                // A closed conversation is no longer snoozed: the flag would
                // otherwise keep the alarm pressed and reopen it on a click.
                chatActions.patchConversation(selected.id, { status: 'closed', snoozed: false });
                setSelectedId(null);
              }}
              onBack={isSinglePane ? () => setSelectedId(null) : null}
              onUseSuggestedReply={(reply) => {
                // A suggestion is a draft, not a send: it lands in the reply
                // box for the agent to edit, and the tab switches because a
                // suggestion is never an internal note.
                chatActions.setComposerTab('reply');
                chatActions.appendToDraft(selected.id, reply);
              }}
              composer={{
                conversationId: selected.id,
                tab: composerTab,
                onTabChange: chatActions.setComposerTab,
                onSend: sendDraft,
                sending: (sendingIds[selected.id] ?? 0) > 0,
                failed: selected.id in failedIds,
                disabled: selected.status === 'closed',
                t,
              }}
              t={t}
            />
            {/* @cpt-end:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-render-thread */}
            {/* @cpt-begin:cpt-template-inbox-flow-chat-organize-and-triage:p1:inst-triage-panel */}
            {detailsVisible ? (
              <CustomerDetailsPanel
                conversation={selected}
                contact={contactsById.get(selected.contactId)}
                agent={agentQuery.data?.agent}
                isSpam={isSpam}
                onViewContact={
                  navigation.viewContact === undefined
                    ? undefined
                    : () => navigation.viewContact?.(selected.contactId)
                }
                onAssigneeChange={(assignee: string) => chatActions.patchConversation(selected.id, { assignee })}
                onTeamInboxChange={(teamInbox: string) => chatActions.patchConversation(selected.id, { teamInbox })}
                onPriorityChange={(priority: ConversationPriority) =>
                  chatActions.patchConversation(selected.id, { priority })
                }
                onStatusChange={(status: ConversationStatus) =>
                  chatActions.patchConversation(selected.id, { status, snoozed: status === 'snoozed' })
                }
                onToggleSpam={toggleSpam}
                onAddTag={(tag: string) => chatActions.patchConversation(selected.id, { tags: [...selected.tags, tag] })}
                onRemoveTag={(tag: string) =>
                  chatActions.patchConversation(selected.id, {
                    tags: selected.tags.filter((existing) => existing !== tag),
                  })
                }
                t={t}
              />
            ) : null}
            {/* @cpt-end:cpt-template-inbox-flow-chat-organize-and-triage:p1:inst-triage-panel */}
          </>
        ) : (
          <PaneState>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <InboxIcon />
                </EmptyMedia>
                <EmptyTitle>{t('empty_title')}</EmptyTitle>
                <EmptyDescription>{t('empty_description')}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </PaneState>
        )}
      </DetailPane>
    </>
  );
}
