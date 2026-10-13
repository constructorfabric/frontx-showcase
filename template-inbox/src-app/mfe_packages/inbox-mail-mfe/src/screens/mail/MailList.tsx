import { MailSearchIcon, PanelLeftIcon, SearchIcon } from 'lucide-react';
import { Button, Empty, EmptyHeader, EmptyMedia, EmptyTitle, Input } from '@gears-frontx/ui-kit';
import { Heading, VisuallyHidden } from '@gears-frontx/kit-candidates';
import type { Translate } from '@inbox-shared/i18n/translate';
import { ListPane, ListPaneBody, ListPaneGroup, ListPaneSearch, ListPaneTabs } from '@inbox-shared/blocks/ListPane';
import { ThreadListItem, ThreadListItemPin, ThreadListItemStar } from '@inbox-shared/blocks/ThreadListItem';
import { IdentityAvatar } from '@inbox-shared/ui/IdentityAvatar';
import { shortRelativeTime } from '@inbox-shared/ui/format';
import { ScreenHeading } from '@inbox-shared/ui/ScreenHeading';
import { splitPinned } from '@inbox-shared/ui/splitPinned';
import type { Mail, MailboxId } from '../../api/mailTypes';
import { isMailTab, selectMails, type MailTab } from './mailSelectors';

export type MailListProps = {
  mails: Mail[];
  mailboxId: MailboxId;
  mailboxLabel: string;
  tab: MailTab;
  onTabChange: (tab: MailTab) => void;
  selectedMailId: string | null;
  onSelectMail: (mailId: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
  /** Hidden while the reading pane has the screen to itself. */
  hidden: boolean;
  onToggleMailboxes: () => void;
  /** Whether the mailbox column is open, for the toggle's own state. */
  mailboxesOpen: boolean;
  t: Translate;
};

/**
 * The mail counterpart to `ConversationList`: the same `ListPane` and
 * `ThreadListItem` blocks, with subject and snippet on one preview line
 * rather than a third line. Unread is typography only: a bold, full-strength
 * row versus a regular, muted one, no dot.
 */
export function MailList({
  mails,
  mailboxId,
  mailboxLabel,
  tab,
  onTabChange,
  selectedMailId,
  onSelectMail,
  search,
  onSearchChange,
  hidden,
  onToggleMailboxes,
  mailboxesOpen,
  t,
}: MailListProps) {
  const allMails = selectMails(mails, mailboxId, 'all', search);
  const unreadMails = selectMails(mails, mailboxId, 'unread', search);

  const renderRow = (mail: Mail) => (
    <ThreadListItem
      key={mail.id}
      avatar={<IdentityAvatar name={mail.correspondentName} size="lg" />}
      title={
        <>
          {/* Read or unread shows as weight and colour; this says it in words. */}
          {mail.read ? null : <VisuallyHidden>{t('unread_mail')}</VisuallyHidden>}
          {mail.correspondentName}
        </>
      }
      time={shortRelativeTime(mail.receivedAt)}
      preview={t('mail_preview', { subject: mail.subject, snippet: mail.snippet })}
      titleMarks={
        <>
          {mail.pinned ? <ThreadListItemPin label={t('pinned_mail')} /> : null}
          {mail.starred ? <ThreadListItemStar label={t('starred_mail')} /> : null}
        </>
      }
      selected={mail.id === selectedMailId}
      read={mail.read}
      onSelect={() => onSelectMail(mail.id)}
    />
  );

  // `rows` already sorts pinned mails first (mailSelectors.ts's own
  // comparator does this regardless of tab/search), so splitting it here is
  // a plain filter, not a re-sort.
  const renderRows = (rows: Mail[]) => {
    if (rows.length === 0) {
      return (
        <ListPaneBody>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MailSearchIcon />
              </EmptyMedia>
              <EmptyTitle>{t('no_matching_mail')}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        </ListPaneBody>
      );
    }
    const { pinned: pinnedMails, others: otherMails } = splitPinned(rows);
    return (
      <ListPaneBody>
        {pinnedMails.length > 0 ? (
          <ListPaneGroup label={t('pinned')}>{pinnedMails.map(renderRow)}</ListPaneGroup>
        ) : null}
        <ListPaneGroup>{otherMails.map(renderRow)}</ListPaneGroup>
      </ListPaneBody>
    );
  };

  return (
    <ListPane
      label={mailboxLabel}
      hidden={hidden}
      leading={
        <Button
          variant="ghost"
          size="sm"
          icon={<PanelLeftIcon />}
          aria-label={t('toggle_mailboxes')}
          aria-expanded={mailboxesOpen}
          onClick={onToggleMailboxes}
        />
      }
      heading={
        // Hidden while the open mail takes its place on a narrow screen; the mail's subject is the screen's one h1 then.
        <Heading size="heading-2" render={hidden ? <span /> : <ScreenHeading />}>
          {mailboxLabel}
        </Heading>
      }
      count={allMails.length}
    >
      <ListPaneSearch>
        <Input
          type="search"
          value={search}
          onValueChange={onSearchChange}
          placeholder={t('search_mail')}
          icon={<SearchIcon />}
          aria-label={t('search_mail')}
        />
      </ListPaneSearch>

      <ListPaneTabs
        value={tab}
        onValueChange={(value) => {
          if (isMailTab(value)) onTabChange(value);
        }}
        tabs={[
          { value: 'all', label: t('all_mail'), content: renderRows(allMails) },
          {
            value: 'unread',
            label: t('unread_mail_count', { count: unreadMails.length }),
            content: renderRows(unreadMails),
          },
        ]}
      />
    </ListPane>
  );
}
