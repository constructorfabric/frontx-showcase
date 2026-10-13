import { ArchiveIcon, ArrowLeftIcon, ReplyIcon, StarIcon, Trash2Icon } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  MessageScrollerProvider,
} from '@gears-frontx/ui-kit';
import { Heading } from '@gears-frontx/kit-candidates';
import type { Translate } from '@inbox-shared/i18n/translate';
import {
  ThreadPane,
  ThreadPaneHeader,
  ThreadPaneToolbar,
  ThreadPlainText,
  ThreadTranscript,
} from '@inbox-shared/blocks/ThreadPane';
import { dateTime } from '@inbox-shared/ui/format';
import { IdentityAvatar } from '@inbox-shared/ui/IdentityAvatar';
import { ScreenHeading } from '@inbox-shared/ui/ScreenHeading';
import type { Mail, MailMessage } from '../../api/mailTypes';
import { MailComposer } from './MailComposer';

export type MailReadingPaneProps = {
  mail: Mail;
  /** Earlier messages, oldest first; empty when the mail has no history. */
  history: MailMessage[];
  historyOpen: boolean;
  onToggleHistory: () => void;
  draft: string;
  onDraftChange: (draft: string) => void;
  onSend: () => void;
  /** A send is in flight (`MailComposer`). */
  sending: boolean;
  /** Back to the list, where the list and the reading pane take turns; `null` beside it. */
  onBack: (() => void) | null;
  t: Translate;
};

/**
 * The reading pane - the largest divergence from the chat thread it shares
 * the `ThreadPane` block with. No bubbles, no per-sender alignment: a mail
 * renders flat, top to bottom. What goes inside the transcript differs from
 * the chat's: a history toggle, a kit card for each earlier message, and the
 * newest message flat and full width, never wrapped in a card of its own.
 */
export function MailReadingPane({
  mail,
  history,
  historyOpen,
  onToggleHistory,
  draft,
  onDraftChange,
  onSend,
  sending,
  onBack,
  t,
}: MailReadingPaneProps) {
  return (
    <ThreadPane>
      {/*
        Archive, trash, star and reply render disabled: moving a mail between
        mailboxes and starring it are writes this template's mail service does
        not offer, and the reply composer below is always open, so the reply
        button would have nothing to open. The app's convention for a control
        with no action behind it.
      */}
      <ThreadPaneToolbar
        leading={
          onBack ? (
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowLeftIcon />}
              aria-label={t('back_to_mail_list')}
              onClick={onBack}
            />
          ) : null
        }
        start={
          <>
            <Button variant="ghost" size="sm" icon={<ArchiveIcon />} aria-label={t('archive_mail')} disabled />
            <Button variant="ghost" size="sm" icon={<Trash2Icon />} aria-label={t('trash_mail')} disabled />
            <Button
              variant="ghost"
              size="sm"
              icon={<StarIcon />}
              aria-label={mail.starred ? t('unstar_mail') : t('star_mail')}
              disabled
            />
          </>
        }
        end={<Button variant="ghost" size="sm" icon={<ReplyIcon />} aria-label={t('reply_to_mail')} disabled />}
      />

      <ThreadPaneHeader
        leading={<IdentityAvatar name={mail.correspondentName} size="default" />}
        heading={
          // Where the list and the reading pane take turns, the list's heading is hidden with it, so the subject is the screen's h1.
          <Heading size="heading-2" render={onBack ? <ScreenHeading /> : <span />}>
            {mail.subject}
          </Heading>
        }
        subtitle={mail.correspondentName}
        detail={t('reply_to_line', { email: mail.correspondentEmail })}
      />

      {/*
        Keyed by mail id - same reasoning as ConversationThread's
        MessageScrollerProvider: without a key, switching the open mail
        keeps the same provider instance mounted, and the scroller primitive
        reads the swapped content as an in-place edit to the CURRENT transcript
        rather than a fresh one, which can leave a stray
        [data-message-scroller-spacer] gap. The key forces a genuine
        remount per mail.
      */}
      <MessageScrollerProvider key={mail.id}>
        <ThreadTranscript>
          {history.length > 0 ? (
            <Button variant="outline" onClick={onToggleHistory} aria-expanded={historyOpen}>
              {historyOpen ? t('hide_earlier_messages') : t('earlier_messages', { count: history.length })}
            </Button>
          ) : null}

          {historyOpen
            ? history.map((message) => (
                <Card key={message.id} size="sm">
                  <CardContent>
                    <Item size="xs">
                      <ItemMedia>
                        <IdentityAvatar name={message.correspondentName} size="default" />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>{message.correspondentName}</ItemTitle>
                        <ItemDescription>{dateTime(message.sentAt)}</ItemDescription>
                      </ItemContent>
                    </Item>
                    <ThreadPlainText>{message.body}</ThreadPlainText>
                  </CardContent>
                </Card>
              ))
            : null}

          <ThreadPlainText>{mail.body}</ThreadPlainText>
        </ThreadTranscript>
      </MessageScrollerProvider>

      <MailComposer
        correspondentName={mail.correspondentName}
        draft={draft}
        onDraftChange={onDraftChange}
        onSend={onSend}
        sending={sending}
        t={t}
      />
    </ThreadPane>
  );
}
