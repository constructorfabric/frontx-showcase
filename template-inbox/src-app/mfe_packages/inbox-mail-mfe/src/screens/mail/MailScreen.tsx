import { useEffect, useMemo, useRef, useState } from 'react';
import { MailIcon } from 'lucide-react';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@gears-frontx/ui-kit';
import { DetailPane } from '@inbox-shared/blocks/DetailPane';
import { PaneState } from '@inbox-shared/blocks/PaneState';
import { useApiMutation, useApiQuery, useAppSelector } from '@gears-frontx/react';
import type { Translate } from '@inbox-shared/i18n/translate';
import { firstPaintOf, LoadErrorPane, LoadingPane } from '@inbox-shared/ui/QueryStates';
import { useAutoSelect } from '@inbox-shared/ui/useAutoSelect';
import { useScreenLayout } from '@inbox-shared/ui/screenLayout';
import { useSidebarToggle } from '@inbox-shared/ui/useSidebarToggle';
import type { Mail, MailboxId, SendMailRequest, SendMailResponse } from '../../api/mailTypes';
import { getMailApi } from '../../api/registerMailApi';
import { MailboxSidebar, type ComposedMail } from './MailboxSidebar';
import { MailList } from './MailList';
import { MailReadingPane } from './MailReadingPane';
import { selectMails } from './mailSelectors';
import { mailActions } from '../../actions/mailActions';
import { selectMail } from '../../slices/mailSlice';

export type MailScreenProps = {
  t: Translate;
};

/**
 * The mail section's top-level orchestration - the same shape as
 * `ChatScreen`: three panes side by side, what is selected and typed kept in
 * the mail's FrontX slice so it survives leaving the section, and the API's own
 * collections filtered client-side for everything the panes show. Nothing
 * here is fetched per mailbox or per mail; the mock API answers with the
 * whole collection, same as the chat domain, and `mailSelectors.ts` is what
 * narrows it. A reply and a composed mail go out through the service's one
 * write, which files them under Sent; a reply holds only its own mail's Send
 * while it is out.
 */
export function MailScreen({ t }: MailScreenProps) {
  // @cpt-flow:cpt-template-inbox-flow-mail-read-and-reply:p1
  // @cpt-flow:cpt-template-inbox-flow-mail-compose:p1
  // @cpt-dod:cpt-template-inbox-dod-mail-reading:p1
  const service = getMailApi();

  // @cpt-begin:cpt-template-inbox-flow-mail-read-and-reply:p1:inst-read-collections
  const mailboxesQuery = useApiQuery(service.getMailboxes);
  const mailsQuery = useApiQuery(service.getMails);
  const mailMessagesQuery = useApiQuery(service.getMailMessages);
  // @cpt-end:cpt-template-inbox-flow-mail-read-and-reply:p1:inst-read-collections

  // @cpt-begin:cpt-template-inbox-flow-mail-read-and-reply:p1:inst-read-mail-state
  const mailboxId = useAppSelector((state) => selectMail(state).mailboxId);
  // The open mail is the screen's own state while it is mounted, written back
  // to the slice with the pick still owed - the same arrangement as the chat.
  const storedSelectedMailId = useAppSelector((state) => selectMail(state).selectedMailId);
  const storedOwedTo = useAppSelector((state) => selectMail(state).autoSelectOwedTo);
  const [selectedMailId, setSelectedMailId] = useState(storedSelectedMailId);
  const search = useAppSelector((state) => selectMail(state).search);
  const tab = useAppSelector((state) => selectMail(state).tab);
  const historyOpenById = useAppSelector((state) => selectMail(state).historyOpenById);
  const drafts = useAppSelector((state) => selectMail(state).drafts);
  // @cpt-end:cpt-template-inbox-flow-mail-read-and-reply:p1:inst-read-mail-state
  // Mail sent while this screen is mounted, folded over the fetched list the
  // way the chat folds a posted reply over its transcript: the write
  // invalidates the cached list, so the next read returns it from the service.
  const [sentMails, setSentMails] = useState<readonly Mail[]>([]);
  // The mails a reply is out for. One write sends replies and composed mail
  // alike, so its pending state says nothing about the mail on screen: a
  // composed mail or a reply to another mail in flight leaves this one's
  // Send free. The ref is what the handler checks, so a second Send in the
  // same tick as the first is refused before a render could disable it; the
  // state is what the reading pane renders from.
  // @cpt-begin:cpt-template-inbox-flow-mail-read-and-reply:p1:inst-track-replies
  const replyingNow = useRef(new Set<string>());
  const [replying, setReplying] = useState<ReadonlySet<string>>(() => new Set());
  const settleReply = (request: SendMailRequest) => {
    if (request.inReplyTo === null) return;
    replyingNow.current.delete(request.inReplyTo);
    setReplying(new Set(replyingNow.current));
  };
  // @cpt-end:cpt-template-inbox-flow-mail-read-and-reply:p1:inst-track-replies

  // A composed mail's dialog waits for its send: each composed request keeps the callbacks of the promise `composeMail` returned.
  // @cpt-begin:cpt-template-inbox-flow-mail-compose:p1:inst-settle-compose
  const composeWaiters = useRef(new Map<SendMailRequest, { resolve: () => void; reject: (error: Error) => void }>());
  const settleCompose = (request: SendMailRequest, error?: Error) => {
    const waiter = composeWaiters.current.get(request);
    if (waiter === undefined) return;
    composeWaiters.current.delete(request);
    if (error === undefined) waiter.resolve();
    else waiter.reject(error);
  };
  // @cpt-end:cpt-template-inbox-flow-mail-compose:p1:inst-settle-compose

  const sendMail = useApiMutation<SendMailResponse, Error, SendMailRequest>({
    endpoint: service.sendMail,
    onSuccess: (response, request, _context, { queryCache }) => {
      // @cpt-begin:cpt-template-inbox-flow-mail-read-and-reply:p1:inst-send-accepted
      // The service files the mail under Sent: the cached mail list is stale.
      void queryCache.invalidate(service.getMails);
      // The draft lives in the slice, so it is cleared even when the user
      // left the screen before the send came back.
      if (request.inReplyTo !== null) mailActions.clearDraftIfSent(request.inReplyTo, request.body);
      setSentMails((previous) => [...previous, response.mail]);
      settleReply(request);
      // @cpt-end:cpt-template-inbox-flow-mail-read-and-reply:p1:inst-send-accepted
      // @cpt-begin:cpt-template-inbox-flow-mail-compose:p1:inst-compose-accepted
      settleCompose(request);
      // @cpt-end:cpt-template-inbox-flow-mail-compose:p1:inst-compose-accepted
    },
    onError: (error, request) => {
      // @cpt-begin:cpt-template-inbox-flow-mail-read-and-reply:p1:inst-send-refused
      settleReply(request);
      // @cpt-end:cpt-template-inbox-flow-mail-read-and-reply:p1:inst-send-refused
      // @cpt-begin:cpt-template-inbox-flow-mail-compose:p1:inst-compose-refused
      settleCompose(request, error);
      // @cpt-end:cpt-template-inbox-flow-mail-compose:p1:inst-compose-refused
    },
  });

  const mailboxesSidebar = useSidebarToggle();
  const isSinglePane = useScreenLayout() === 'single';

  // @cpt-begin:cpt-template-inbox-flow-mail-read-and-reply:p1:inst-merge-sent
  const mailboxes = mailboxesQuery.data?.mailboxes ?? [];
  const mails = useMemo(() => {
    const fetched = mailsQuery.data?.mails ?? [];
    const fetchedIds = new Set(fetched.map((mail) => mail.id));
    return [...fetched, ...sentMails.filter((mail) => !fetchedIds.has(mail.id))];
  }, [mailsQuery.data, sentMails]);
  const mailMessages = useMemo(
    () => mailMessagesQuery.data?.mailMessages ?? [],
    [mailMessagesQuery.data]
  );
  // @cpt-end:cpt-template-inbox-flow-mail-read-and-reply:p1:inst-merge-sent

  // @cpt-begin:cpt-template-inbox-flow-mail-read-and-reply:p1:inst-auto-select
  const autoSelect = useAutoSelect({
    scope: mailboxId,
    settled: !mailsQuery.isLoading,
    firstId: selectMails(mails, mailboxId, tab, search)[0]?.id,
    selectedId: selectedMailId,
    onSelect: setSelectedMailId,
    initialOwedTo: storedOwedTo,
  });
  useEffect(
    () => mailActions.rememberSelection(selectedMailId, autoSelect.owedTo),
    [selectedMailId, autoSelect.owedTo]
  );
  // @cpt-end:cpt-template-inbox-flow-mail-read-and-reply:p1:inst-auto-select

  // @cpt-begin:cpt-template-inbox-flow-mail-read-and-reply:p1:inst-open-mail-history
  const selected = mails.find((mail) => mail.id === selectedMailId) ?? null;

  const history = useMemo(() => {
    if (!selected) return [];
    return mailMessages.filter((message) => message.mailId === selected.id);
  }, [mailMessages, selected]);
  // @cpt-end:cpt-template-inbox-flow-mail-read-and-reply:p1:inst-open-mail-history

  // @cpt-begin:cpt-template-inbox-flow-mail-read-and-reply:p1:inst-select-mailbox
  const selectMailbox = (nextMailboxId: MailboxId) => {
    mailActions.selectMailbox(nextMailboxId);
    setSelectedMailId(null);
    autoSelect.arm(nextMailboxId);
  };
  // @cpt-end:cpt-template-inbox-flow-mail-read-and-reply:p1:inst-select-mailbox

  // @cpt-begin:cpt-template-inbox-flow-mail-read-and-reply:p1:inst-gate-first-paint
  const firstPaint = firstPaintOf([mailboxesQuery, mailsQuery, mailMessagesQuery]);
  if (firstPaint.failed) return <LoadErrorPane onRetry={firstPaint.retry} t={t} />;
  if (firstPaint.loading) return <LoadingPane />;
  // @cpt-end:cpt-template-inbox-flow-mail-read-and-reply:p1:inst-gate-first-paint

  const mailboxLabel = mailboxes.find((mailbox) => mailbox.id === mailboxId)?.label ?? '';
  const showReading = selected !== null;

  /**
   * A reply goes out addressed to the correspondent and titled after the mail
   * it answers; the service files it under Sent, and the draft is cleared once
   * it did. The draft stays until then, so while a reply to this mail is in
   * flight a second Send (or the shortcut) would file the same reply twice:
   * it waits instead.
   */
  // @cpt-begin:cpt-template-inbox-flow-mail-read-and-reply:p1:inst-send-reply
  const sendReply = () => {
    if (!selected || replyingNow.current.has(selected.id)) return;
    const body = (drafts[selected.id] ?? '').trim();
    if (body === '') return;
    replyingNow.current.add(selected.id);
    setReplying(new Set(replyingNow.current));
    sendMail.mutate({
      correspondentName: selected.correspondentName,
      correspondentEmail: selected.correspondentEmail,
      subject: t('reply_subject', { subject: selected.subject }),
      body,
      inReplyTo: selected.id,
    });
  };
  // @cpt-end:cpt-template-inbox-flow-mail-read-and-reply:p1:inst-send-reply

  /**
   * A composed mail goes out the same way, to the address typed. Mailbox
   * selection is left alone. The returned promise settles with the send, so
   * the compose dialog (`MailboxSidebar`) keeps the draft open until the mail
   * is sent and shows the failure when it is not.
   */
  // @cpt-begin:cpt-template-inbox-flow-mail-compose:p1:inst-compose-request
  const composeMail = ({ to, subject, body }: ComposedMail): Promise<void> =>
    new Promise<void>((resolve, reject) => {
      const request: SendMailRequest = { correspondentName: to, correspondentEmail: to, subject, body, inReplyTo: null };
      composeWaiters.current.set(request, { resolve, reject });
      sendMail.mutate(request);
    });
  // @cpt-end:cpt-template-inbox-flow-mail-compose:p1:inst-compose-request

  return (
    <>
      <MailboxSidebar
        mailboxes={mailboxes}
        mails={mails}
        selectedMailboxId={mailboxId}
        onSelectMailbox={(nextMailboxId) => {
          selectMailbox(nextMailboxId);
          mailboxesSidebar.dismiss();
        }}
        onComposeMail={composeMail}
        column={mailboxesSidebar}
        t={t}
      />

      <MailList
        mails={mails}
        mailboxId={mailboxId}
        mailboxLabel={mailboxLabel}
        tab={tab}
        onTabChange={mailActions.setTab}
        selectedMailId={selectedMailId}
        onSelectMail={setSelectedMailId}
        search={search}
        onSearchChange={mailActions.setSearch}
        hidden={isSinglePane && showReading}
        onToggleMailboxes={mailboxesSidebar.toggle}
        mailboxesOpen={!mailboxesSidebar.collapsed}
        t={t}
      />

      <DetailPane hidden={isSinglePane && !showReading}>
        {selected ? (
          <MailReadingPane
            mail={selected}
            history={history}
            historyOpen={historyOpenById[selected.id] ?? false}
            onToggleHistory={() => mailActions.toggleHistory(selected.id)}
            draft={drafts[selected.id] ?? ''}
            onDraftChange={(draft) => mailActions.setDraft(selected.id, draft)}
            onSend={sendReply}
            sending={replying.has(selected.id)}
            onBack={isSinglePane ? () => setSelectedMailId(null) : null}
            t={t}
          />
        ) : (
          <PaneState>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MailIcon />
                </EmptyMedia>
                <EmptyTitle>{t('no_mail_selected_title')}</EmptyTitle>
                <EmptyDescription>{t('no_mail_selected_description')}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </PaneState>
        )}
      </DetailPane>
    </>
  );
}
