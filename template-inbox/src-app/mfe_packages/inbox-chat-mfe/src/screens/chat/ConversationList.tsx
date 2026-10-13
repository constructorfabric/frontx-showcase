import { useRef, useState } from 'react';
import { CircleAlertIcon, PanelLeftIcon, SearchIcon, UserRoundPlusIcon } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@gears-frontx/ui-kit';
import { Heading } from '@gears-frontx/kit-candidates';
import type { Contact, Conversation } from '@inbox-shared/api/types';
import {
  ListPane,
  ListPaneBody,
  ListPaneGroup,
  ListPaneNotice,
  ListPaneSearch,
  ListPaneToolbar,
} from '@inbox-shared/blocks/ListPane';
import { ThreadListItem, ThreadListItemPin, ThreadListItemUnread } from '@inbox-shared/blocks/ThreadListItem';
import { shortRelativeTime } from '@inbox-shared/ui/format';
import type { Translate } from '@inbox-shared/i18n/translate';
import { PresenceAvatar } from '@inbox-shared/blocks/PresenceAvatar';
import { ScreenHeading } from '@inbox-shared/ui/ScreenHeading';
import { splitPinned } from '@inbox-shared/ui/splitPinned';
import { countOpen, isSortOrder, SORT_ORDERS, type SortOrder } from './conversationOrdering';
import { usePortalContainer } from '@inbox-shared/lifecycle/screenContext';

const SORT_LABEL_KEY: Record<SortOrder, string> = {
  'last-activity': 'sort_last_activity',
  oldest: 'sort_oldest',
  priority: 'sort_priority',
  unread: 'sort_unread',
};

export type ConversationListProps = {
  conversations: Conversation[];
  contactsById: Map<string, Contact>;
  channelLabel: string;
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onStartChat: (contactId: string) => void;
  /** The latest conversation the agent tried to start was not created. */
  startChatFailed: boolean;
  search: string;
  onSearchChange: (search: string) => void;
  sort: SortOrder;
  onSortChange: (sort: SortOrder) => void;
  onToggleChannels: () => void;
  /** Whether the channel column is open, for the toggle's own state. */
  channelsOpen: boolean;
  hidden: boolean;
  t: Translate;
};

export function ConversationList({
  conversations,
  contactsById,
  channelLabel,
  selectedConversationId,
  onSelectConversation,
  onStartChat,
  startChatFailed,
  search,
  onSearchChange,
  sort,
  onSortChange,
  onToggleChannels,
  channelsOpen,
  hidden,
  t,
}: ConversationListProps) {
  const portalContainer = usePortalContainer();
  const sortItems = SORT_ORDERS.map((order) => ({ value: order, label: t(SORT_LABEL_KEY[order]) }));
  const [newChatOpen, setNewChatOpen] = useState(false);
  const contactFieldRef = useRef<HTMLInputElement>(null);
  // The whole `{ value, label }` item, not just the id: passing a plain
  // string as `ComboboxItem`'s own `value` has no `label` for the kit's
  // Combobox to auto-stringify against, so the input would echo the raw
  // contact id back once picked instead of the contact's name - passing
  // the full item value is what the kit's own "the label will be used
  // automatically" rule (combobox.md) actually requires.
  const [newChatContact, setNewChatContact] = useState<{ value: string; label: string } | null>(
    null
  );
  const contactItems = Array.from(contactsById.values()).map((contact) => ({
    value: contact.id,
    label: contact.name,
  }));

  const submitNewChat = () => {
    if (newChatContact === null) return;
    onStartChat(newChatContact.value);
    setNewChatContact(null);
    setNewChatOpen(false);
  };

  // `conversations` already sorts pinned rows first (conversationOrdering.ts's
  // comparators do this regardless of `sort`), so splitting it in two here is
  // a plain filter, not a re-sort - each half keeps the order it arrived in.
  const { pinned: pinnedConversations, others: otherConversations } = splitPinned(conversations);

  const renderRow = (conversation: Conversation) => {
    const contact = contactsById.get(conversation.contactId);
    const pinned = conversation.pinned ? <ThreadListItemPin label={t('pinned_conversation')} /> : null;
    const unread =
      conversation.unreadCount > 0 ? (
        <ThreadListItemUnread
          count={conversation.unreadCount}
          label={t('unread_messages_count', { count: conversation.unreadCount })}
        />
      ) : null;
    return (
      <ThreadListItem
        key={conversation.id}
        avatar={
          <PresenceAvatar
            name={contact?.name ?? conversation.subject}
            presence={contact?.presence ?? 'offline'}
            size="lg"
            t={t}
          />
        }
        title={conversation.subject}
        time={shortRelativeTime(conversation.lastActivityAt)}
        preview={conversation.snippet}
        previewMarks={
          <>
            {pinned}
            {unread}
          </>
        }
        selected={conversation.id === selectedConversationId}
        onSelect={() => onSelectConversation(conversation.id)}
      />
    );
  };

  return (
    <ListPane
      label={t('conversations')}
      hidden={hidden}
      leading={
        <Button
          variant="ghost"
          size="sm"
          icon={<PanelLeftIcon />}
          aria-label={t('toggle_channels')}
          aria-expanded={channelsOpen}
          onClick={onToggleChannels}
        />
      }
      heading={
        // Hidden while the open thread takes its place on a narrow screen; the thread's subject is the screen's one h1 then.
        <Heading size="heading-2" render={hidden ? <span /> : <ScreenHeading />}>
          {channelLabel}
        </Heading>
      }
      count={conversations.length}
      actions={
        <Dialog
          open={newChatOpen}
          onOpenChange={(open) => {
            setNewChatOpen(open);
            if (!open) setNewChatContact(null);
          }}
        >
          <DialogTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                icon={<UserRoundPlusIcon />}
                aria-label={t('new_chat')}
              />
            }
          />
          {/* The dialog opens on the contact field, the one thing it asks for. */}
          <DialogContent container={portalContainer} initialFocus={contactFieldRef}>
            <DialogHeader>
              <DialogTitle>{t('new_chat')}</DialogTitle>
            </DialogHeader>
            <Field>
              <FieldLabel>{t('new_chat_contact_label')}</FieldLabel>
              <Combobox
                items={contactItems}
                value={newChatContact}
                onValueChange={(value) => setNewChatContact(value)}
              >
                <ComboboxInput
                  ref={contactFieldRef}
                  placeholder={t('new_chat_contact_placeholder')}
                  aria-label={t('new_chat_contact_label')}
                />
                <ComboboxContent container={portalContainer}>
                  <ComboboxEmpty>{t('no_contacts_match')}</ComboboxEmpty>
                  <ComboboxList>
                    {(item: { value: string; label: string }) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                {t('cancel')}
              </DialogClose>
              <Button type="button" disabled={newChatContact === null} onClick={submitNewChat}>
                {t('start_chat')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {startChatFailed ? (
        <ListPaneNotice>
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>{t('start_chat_failed_title')}</AlertTitle>
            <AlertDescription>{t('start_chat_failed_description')}</AlertDescription>
          </Alert>
        </ListPaneNotice>
      ) : null}

      <ListPaneSearch>
        <Input
          type="search"
          value={search}
          onValueChange={onSearchChange}
          placeholder={t('search_conversations')}
          icon={<SearchIcon />}
          aria-label={t('search_conversations')}
        />
      </ListPaneSearch>

      <ListPaneToolbar
        summary={t('open_count', { count: countOpen(conversations) })}
        control={
          <Select
            value={sort}
            onValueChange={(value) => {
              if (isSortOrder(value)) onSortChange(value);
            }}
            items={sortItems}
          >
            <SelectTrigger size="sm" variant="filter" aria-label={t('sort_conversations')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent container={portalContainer}>
              {sortItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <ListPaneBody>
        {pinnedConversations.length > 0 ? (
          <ListPaneGroup label={t('pinned')}>{pinnedConversations.map(renderRow)}</ListPaneGroup>
        ) : null}
        <ListPaneGroup>{otherConversations.map(renderRow)}</ListPaneGroup>
      </ListPaneBody>
    </ListPane>
  );
}
