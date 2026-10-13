import { useEffect, useRef } from 'react';
import { CircleAlertIcon, PaperclipIcon, SendIcon, SmileIcon, ZapIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle, Button, Textarea } from '@gears-frontx/ui-kit';
import { ReplyComposer, ReplyComposerBox, ReplyComposerTabs } from '@inbox-shared/blocks/ReplyComposer';
import type { Translate } from '@inbox-shared/i18n/translate';
import { SubmitShortcutHint, useSubmitShortcut } from '@inbox-shared/ui/submitShortcut';
import { useAppSelector } from '@gears-frontx/react';
import { chatActions } from '../../actions/chatActions';
import { selectChat } from '../../slices/chatSlice';

export const COMPOSER_TABS = ['reply', 'note'] as const;

export type ComposerTab = (typeof COMPOSER_TABS)[number];

export const isComposerTab = (value: unknown): value is ComposerTab =>
  typeof value === 'string' && COMPOSER_TABS.some((tab) => tab === value);

export type ComposerProps = {
  /** The conversation the draft belongs to; the draft itself is read from the chat's slice. */
  conversationId: string;
  tab: ComposerTab;
  onTabChange: (tab: ComposerTab) => void;
  /** Sends the draft the box holds, handed over as it stands. */
  onSend: (draft: string) => void;
  /** A post from this composer is in flight. */
  sending: boolean;
  /** The latest post from this composer failed; the draft is still in the box. */
  failed: boolean;
  /** The conversation takes no more replies or notes (it is closed). */
  disabled?: boolean;
  t: Translate;
};

/**
 * The reply and note box. It reads and writes its conversation's draft in
 * the chat's slice itself, so a keystroke re-renders this component and
 * nothing around it, and hands the draft to `onSend` when it is sent.
 */
export function Composer({
  conversationId,
  tab,
  onTabChange,
  onSend,
  sending,
  failed,
  disabled = false,
  t,
}: ComposerProps) {
  // @cpt-begin:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-read-draft
  const draft = useAppSelector((state) => selectChat(state).drafts[conversationId] ?? '');
  // @cpt-end:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-read-draft
  const isNote = tab === 'note';
  const canSend = draft.trim() !== '' && !sending && !disabled;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const focusPending = useAppSelector((state) => selectChat(state).composerFocusPending);

  // A just-started conversation asks for its reply box once (the slice's
  // request, set when the server answered the create), and the request is
  // consumed here: opening any thread later, or coming back to the screen,
  // leaves focus where it is.
  // @cpt-begin:cpt-template-inbox-flow-chat-start-conversation:p1:inst-focus-started
  useEffect(() => {
    if (!focusPending || textareaRef.current === null) return;
    textareaRef.current.focus();
    chatActions.composerFocused();
  }, [focusPending]);
  // @cpt-end:cpt-template-inbox-flow-chat-start-conversation:p1:inst-focus-started

  const send = () => onSend(draft);
  const onKeyDown = useSubmitShortcut(send, canSend);

  // One box for both tabs: only the placeholder, the submit label and the
  // frame swap. The tabs block renders it under each tab, and the kit's
  // TabsContent unmounts an inactive panel, so only one textarea - and one
  // `textareaRef` target - exists at a time.
  const box = (
    <ReplyComposerBox
      note={isNote}
      field={
        <Textarea
          ref={textareaRef}
          rows={3}
          value={draft}
          disabled={disabled}
          onChange={(event) => chatActions.setDraft(conversationId, event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={
            disabled
              ? t('conversation_closed_placeholder')
              : isNote
                ? t('note_placeholder')
                : t('reply_placeholder')
          }
          aria-label={isNote ? t('note') : t('reply')}
        />
      }
      tools={
        /*
          Attach, emoji and saved replies need a store this template does not
          ship - an upload target, a picker, a canned reply library - so they
          render disabled: the toolbar shows where they go without offering
          an action that does nothing. The screens' convention for every
          such control (the thread header's ticket and unassign actions).
        */
        <>
          <Button variant="ghost" size="sm" icon={<PaperclipIcon />} aria-label={t('attach_file')} disabled />
          <Button variant="ghost" size="sm" icon={<SmileIcon />} aria-label={t('insert_emoji')} disabled />
          <Button variant="ghost" size="sm" icon={<ZapIcon />} aria-label={t('saved_replies')} disabled />
        </>
      }
      hint={<SubmitShortcutHint t={t} />}
      send={
        <Button icon={<SendIcon />} disabled={!canSend} loading={sending} onClick={send}>
          {isNote ? t('add_note') : t('send')}
        </Button>
      }
    />
  );

  return (
    <ReplyComposer
      notice={
        // @cpt-begin:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-show-failure
        failed ? (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>{t('send_failed_title')}</AlertTitle>
            <AlertDescription>{t('send_failed_description')}</AlertDescription>
          </Alert>
        ) : null
        // @cpt-end:cpt-template-inbox-flow-chat-answer-conversation:p1:inst-show-failure
      }
    >
      <ReplyComposerTabs
        value={tab}
        onValueChange={(value) => {
          if (isComposerTab(value)) onTabChange(value);
        }}
        tabs={[
          { value: 'reply', label: t('reply') },
          { value: 'note', label: t('note') },
        ]}
      >
        {box}
      </ReplyComposerTabs>
    </ReplyComposer>
  );
}
