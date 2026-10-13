import type { ReactNode } from 'react';
import {
  Button,
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerViewport,
} from '@gears-frontx/ui-kit';
import { Text } from '@gears-frontx/kit-candidates';
import styles from './ThreadPane.module.css';

export type ThreadPaneProps = {
  /** `ThreadPaneToolbar`, `ThreadPaneHeader`, `ThreadTranscript`, `ThreadSuggestions`, then the `ReplyComposer`. */
  children: ReactNode;
};

/**
 * The open conversation or mail: a column of header, transcript and composer.
 * It is the size container its parts query, so they lay out by the pane's
 * own width, which is narrow both alone on a phone and beside the list with
 * the inspector panel open.
 */
// @cpt-dod:cpt-template-inbox-dod-screen-frame-blocks:p2
export function ThreadPane({ children }: ThreadPaneProps) {
  return <div className={styles.thread}>{children}</div>;
}

export type ThreadPaneToolbarProps = {
  /** A back button, where the list and the thread take turns. */
  leading?: ReactNode;
  /** Buttons after it: archive, trash, star. */
  start: ReactNode;
  /** Buttons at the far end: reply. */
  end: ReactNode;
};

/** A row of actions above the header, the mail reading pane's. */
export function ThreadPaneToolbar({ leading, start, end }: ThreadPaneToolbarProps) {
  return (
    <div className={styles.toolbar}>
      {leading}
      <div className={styles.actions}>{start}</div>
      <span className={styles.spacer} />
      <div className={styles.actions}>{end}</div>
    </div>
  );
}

export type ThreadPaneHeaderProps = {
  /** A back button and the correspondent's avatar. */
  leading?: ReactNode;
  /** The subject: the screen's `ScreenHeading` where the list and the thread take turns, text beside the list. */
  heading: ReactNode;
  /** One muted line under it: the correspondent and their presence. */
  subtitle: string;
  /** A second muted line: the reply-to address. */
  detail?: string;
  /** The thread's controls at the end of the row; they move onto a line of their own when the pane is narrow. */
  actions?: ReactNode;
};

/**
 * The thread's header: who and what it is about, and what can be done to it.
 * A pane too narrow for the title and the actions on one line puts the
 * actions on a line of their own under the title.
 */
export function ThreadPaneHeader({ leading, heading, subtitle, detail, actions }: ThreadPaneHeaderProps) {
  return (
    <div className={styles.header}>
      {leading}
      <div className={styles.titles}>
        {heading}
        <Text variant="meta" tone="muted" render={<span />} className={styles.line}>
          {subtitle}
        </Text>
        {detail === undefined ? null : (
          <Text variant="meta" tone="muted" render={<span />} className={styles.line}>
            {detail}
          </Text>
        )}
      </div>
      {actions === undefined ? null : (
        <>
          <span className={styles.spacer} />
          <div className={styles.actions}>{actions}</div>
        </>
      )}
    </div>
  );
}

export type ThreadTranscriptProps = {
  /** The messages, inside the kit's MessageScrollerContent. */
  children: ReactNode;
  /** Inside the scroller after the content: the jump-to-newest button. */
  after?: ReactNode;
};

/**
 * The scrolling transcript: the kit's MessageScroller, padded inside the
 * pane, its messages `--space-4` apart. The caller keeps the
 * `MessageScrollerProvider` around it, keyed by the open item.
 */
export function ThreadTranscript({ children, after }: ThreadTranscriptProps) {
  return (
    <MessageScroller className={styles.transcript}>
      <MessageScrollerViewport>
        <MessageScrollerContent className={styles.transcriptContent}>{children}</MessageScrollerContent>
      </MessageScrollerViewport>
      {after}
    </MessageScroller>
  );
}

export type ThreadSuggestionsProps = {
  /** The group's name for assistive technology. */
  label: string;
  replies: string[];
  onUse: (reply: string) => void;
};

/** Drafted replies between the transcript and the composer, each a chip that fills the composer. */
export function ThreadSuggestions({ label, replies, onUse }: ThreadSuggestionsProps) {
  return (
    <div className={styles.suggestions} aria-label={label} role="group">
      {replies.map((reply, index) => (
        <Button key={`${index}-${reply}`} className={styles.suggestion} variant="outline" size="sm" onClick={() => onUse(reply)}>
          {reply}
        </Button>
      ))}
    </div>
  );
}

/** A plain-text message body, flat and full width, keeping its line breaks: the mail being read and its history. */
export function ThreadPlainText({ children }: { children: ReactNode }) {
  return (
    <Text render={<div />} className={styles.plainText}>
      {children}
    </Text>
  );
}
