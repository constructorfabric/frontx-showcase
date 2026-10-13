import { SendIcon } from 'lucide-react';
import { Button, Textarea } from '@gears-frontx/ui-kit';
import type { Translate } from '@inbox-shared/i18n/translate';
import { SubmitShortcutHint, useSubmitShortcut } from '@inbox-shared/ui/submitShortcut';
import { ReplyComposer, ReplyComposerBox } from '@inbox-shared/blocks/ReplyComposer';

export type MailComposerProps = {
  correspondentName: string;
  draft: string;
  onDraftChange: (draft: string) => void;
  onSend: () => void;
  /** A send is in flight: Send and the shortcut wait for it, so one reply is never filed twice. */
  sending: boolean;
  t: Translate;
};

/**
 * The mail reading pane's reply box. The same `ReplyComposer` block as the
 * chat `Composer`, stripped to what a mail reply box needs: no reply/note
 * tabs, no attach/emoji/saved-reply row - a mail is a single kind of
 * message, and a real store for those three affordances is out of scope here
 * just as it is in the chat composer.
 *
 * Sending hands the draft to the screen, which sends it through the mail
 * service (filed under Sent) and clears the box once it went out; the open
 * mail's own thread is not appended to.
 */
export function MailComposer({ correspondentName, draft, onDraftChange, onSend, sending, t }: MailComposerProps) {
  const canSend = draft.trim() !== '' && !sending;
  const placeholder = t('reply_to_placeholder', { name: correspondentName });

  const onKeyDown = useSubmitShortcut(onSend, canSend);

  return (
    <ReplyComposer>
      <ReplyComposerBox
        field={
          <Textarea
            rows={3}
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            aria-label={placeholder}
          />
        }
        hint={<SubmitShortcutHint t={t} />}
        send={
          <Button icon={<SendIcon />} disabled={!canSend} loading={sending} onClick={onSend}>
            {t('send')}
          </Button>
        }
      />
    </ReplyComposer>
  );
}
