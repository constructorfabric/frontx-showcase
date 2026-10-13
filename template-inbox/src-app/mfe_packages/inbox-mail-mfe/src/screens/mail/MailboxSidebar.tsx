import { useId, useRef, useState, type FormEvent, type ReactElement } from 'react';
import { ArchiveIcon, FileTextIcon, InboxIcon, PenSquareIcon, SendIcon, Trash2Icon } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  Textarea,
} from '@gears-frontx/ui-kit';
import type { Translate } from '@inbox-shared/i18n/translate';
import { usePortalContainer } from '@inbox-shared/lifecycle/screenContext';
import { NavColumn } from '@inbox-shared/blocks/NavColumn';
import type { SidebarToggle } from '@inbox-shared/ui/useSidebarToggle';
import type { Mail, Mailbox, MailboxId } from '../../api/mailTypes';
import { countInMailbox } from './mailSelectors';

const MAILBOX_ICON: Record<MailboxId, ReactElement> = {
  inbox: <InboxIcon />,
  drafts: <FileTextIcon />,
  sent: <SendIcon />,
  archive: <ArchiveIcon />,
  trash: <Trash2Icon />,
};

export type ComposedMail = {
  to: string;
  subject: string;
  body: string;
};

export type MailboxSidebarProps = {
  mailboxes: Mailbox[];
  mails: Mail[];
  selectedMailboxId: MailboxId;
  onSelectMailbox: (mailboxId: MailboxId) => void;
  /** Sends a composed mail; resolves once it is sent, rejects when the send fails. */
  onComposeMail: (mail: ComposedMail) => Promise<void>;
  column: SidebarToggle;
  t: Translate;
};

const EMPTY_DRAFT: ComposedMail = { to: '', subject: '', body: '' };

/**
 * The mailboxes in the `NavColumn` block, as the chat's channels and the
 * contacts filters are, with a Compose button above them. Every count is read
 * off `mails`, never stored on a mailbox row.
 */
export function MailboxSidebar({
  mailboxes,
  mails,
  selectedMailboxId,
  onSelectMailbox,
  onComposeMail,
  column,
  t,
}: MailboxSidebarProps) {
  // @cpt-flow:cpt-template-inbox-flow-mail-compose:p1
  // @cpt-state:cpt-template-inbox-state-mail-compose-dialog:p2
  // @cpt-dod:cpt-template-inbox-dod-mail-compose:p1
  const toFieldId = useId();
  const subjectFieldId = useId();
  const bodyFieldId = useId();
  const toFieldRef = useRef<HTMLInputElement>(null);
  const portalContainer = usePortalContainer();
  const [composeOpen, setComposeOpen] = useState(false);
  const [draft, setDraft] = useState<ComposedMail>(EMPTY_DRAFT);
  const [sending, setSending] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);

  // The exact completeness rule for this demo: a recipient is always
  // required, plus at least one of Subject/Body - an address alone with
  // nothing else to send is not a real draft, but a bare subject line (or
  // a bare body) already is.
  // @cpt-begin:cpt-template-inbox-flow-mail-compose:p1:inst-check-complete
  const canSend = draft.to.trim() !== '' && (draft.subject.trim() !== '' || draft.body.trim() !== '');
  // @cpt-end:cpt-template-inbox-flow-mail-compose:p1:inst-check-complete

  // The dialog and the draft stay until the mail is sent: a failed send keeps both and says so, and Send tries again.
  const submit = async (event: FormEvent) => {
    // @cpt-begin:cpt-template-inbox-flow-mail-compose:p1:inst-guard-submit
    event.preventDefault();
    if (!canSend || sending) return;
    // @cpt-end:cpt-template-inbox-flow-mail-compose:p1:inst-guard-submit
    // @cpt-begin:cpt-template-inbox-state-mail-compose-dialog:p2:inst-start-sending
    setSending(true);
    setSendFailed(false);
    // @cpt-end:cpt-template-inbox-state-mail-compose-dialog:p2:inst-start-sending
    try {
      // @cpt-begin:cpt-template-inbox-flow-mail-compose:p1:inst-await-send
      await onComposeMail(draft);
      // @cpt-end:cpt-template-inbox-flow-mail-compose:p1:inst-await-send
      // @cpt-begin:cpt-template-inbox-state-mail-compose-dialog:p2:inst-sent-closes
      setDraft(EMPTY_DRAFT);
      setComposeOpen(false);
      // @cpt-end:cpt-template-inbox-state-mail-compose-dialog:p2:inst-sent-closes
    } catch {
      // @cpt-begin:cpt-template-inbox-state-mail-compose-dialog:p2:inst-failed-keeps-draft
      setSendFailed(true);
      // @cpt-end:cpt-template-inbox-state-mail-compose-dialog:p2:inst-failed-keeps-draft
    } finally {
      setSending(false);
    }
  };

  return (
    <NavColumn
      state={column}
      label={t('mail')}
      title={t('mail')}
      closeLabel={t('close')}
      items={mailboxes.map((mailbox) => ({
        id: mailbox.id,
        label: mailbox.label,
        icon: MAILBOX_ICON[mailbox.id],
        count: countInMailbox(mails, mailbox.id),
      }))}
      selectedId={selectedMailboxId}
      onSelect={(id) => {
        const match = mailboxes.find((mailbox) => mailbox.id === id);
        if (match) onSelectMailbox(match.id);
      }}
      actions={
        <Dialog
          open={composeOpen}
          onOpenChange={(open) => {
            // @cpt-begin:cpt-template-inbox-state-mail-compose-dialog:p2:inst-open-compose
            setComposeOpen(open);
            // @cpt-end:cpt-template-inbox-state-mail-compose-dialog:p2:inst-open-compose
            // @cpt-begin:cpt-template-inbox-state-mail-compose-dialog:p2:inst-dismiss-compose
            if (!open) {
              setDraft(EMPTY_DRAFT);
              setSendFailed(false);
            }
            // @cpt-end:cpt-template-inbox-state-mail-compose-dialog:p2:inst-dismiss-compose
          }}
        >
          <DialogTrigger
            render={<Button variant="ghost" size="sm" icon={<PenSquareIcon />} aria-label={t('compose')} />}
          />
          {/* Inside the screen's shadow root, opening on the recipient field. */}
          <DialogContent size="lg" container={portalContainer} initialFocus={toFieldRef}>
            <form onSubmit={submit}>
              <DialogHeader>
                <DialogTitle>{t('compose_mail_title')}</DialogTitle>
              </DialogHeader>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={toFieldId}>{t('compose_to_label')}</FieldLabel>
                  <Input
                    ref={toFieldRef}
                    id={toFieldId}
                    type="email"
                    value={draft.to}
                    onValueChange={(to) => setDraft((previous) => ({ ...previous, to }))}
                    placeholder={t('compose_to_placeholder')}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={subjectFieldId}>{t('compose_subject_label')}</FieldLabel>
                  <Input
                    id={subjectFieldId}
                    value={draft.subject}
                    onValueChange={(subject) => setDraft((previous) => ({ ...previous, subject }))}
                    placeholder={t('compose_subject_placeholder')}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={bodyFieldId}>{t('compose_body_label')}</FieldLabel>
                  <Textarea
                    id={bodyFieldId}
                    rows={8}
                    value={draft.body}
                    onChange={(event) =>
                      setDraft((previous) => ({ ...previous, body: event.target.value }))
                    }
                    placeholder={t('compose_body_placeholder')}
                  />
                </Field>
              </FieldGroup>
              {/* @cpt-begin:cpt-template-inbox-flow-mail-compose:p1:inst-show-failure */}
              {sendFailed ? <FieldError>{t('compose_send_failed')}</FieldError> : null}
              {/* @cpt-end:cpt-template-inbox-flow-mail-compose:p1:inst-show-failure */}
              <DialogFooter>
                <DialogClose render={<Button type="button" variant="outline" />}>
                  {t('cancel')}
                </DialogClose>
                <Button type="submit" icon={<SendIcon />} disabled={!canSend || sending}>
                  {t('send')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    />
  );
}
