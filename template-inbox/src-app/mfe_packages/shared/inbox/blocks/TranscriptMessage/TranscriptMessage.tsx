import type { ReactElement, ReactNode } from 'react';
import { CheckCheckIcon, CheckIcon } from 'lucide-react';
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  Bubble,
  BubbleContent,
} from '@gears-frontx/ui-kit';
import { cx } from '../../ui/cx';
import styles from './TranscriptMessage.module.css';

type BubbleAlign = 'start' | 'end';
type BubbleVariant = 'default' | 'secondary' | 'muted';

export type TranscriptReceipt = {
  /** Read (two checks, full strength) or delivered (one check, dimmed). */
  read: boolean;
  /** The receipt's name for assistive technology. */
  label: string;
};

export type TranscriptMetaProps = {
  /** The time of day the message was sent. */
  time: string;
  /** The read receipt of an outbound message; absent while there is none. */
  receipt?: TranscriptReceipt;
};

function Meta({ time, receipt, overlay = false }: TranscriptMetaProps & { overlay?: boolean }) {
  return (
    <span className={cx(styles.meta, overlay && styles.metaOverlay)}>
      <span className={styles.metaTime}>{time}</span>
      {receipt === undefined ? null : receipt.read ? (
        <CheckCheckIcon className={styles.readTick} role="img" aria-label={receipt.label} />
      ) : (
        <CheckIcon className={styles.deliveredTick} role="img" aria-label={receipt.label} />
      )}
    </span>
  );
}

/**
 * The time and the read receipt inside the bubble they date, the bubble's
 * last child: it docks against the bubble's end edge on the last line, or on a
 * line of its own when the last line is full.
 */
// @cpt-dod:cpt-template-inbox-dod-screen-frame-blocks:p2
export function TranscriptMeta({ time, receipt }: TranscriptMetaProps) {
  return <Meta time={time} receipt={receipt} />;
}

export type TranscriptBubbleProps = {
  /** The speaker's side: `end` for the agent, `start` for the customer. */
  align: BubbleAlign;
  /** The kit Bubble's paint: the agent's primary fill, the customer's neutral one, an internal note's muted one. */
  variant: BubbleVariant;
  /** Attachments, the text and a `TranscriptMeta` last. */
  children: ReactNode;
};

/** A message bubble: the kit's Bubble with its tail at the bottom on the speaker's side. */
export function TranscriptBubble({ align, variant, children }: TranscriptBubbleProps) {
  return (
    <Bubble className={styles.bubble} align={align} variant={variant}>
      <BubbleContent className={styles.bubbleText}>{children}</BubbleContent>
    </Bubble>
  );
}

export type TranscriptImageBubbleProps = {
  align: BubbleAlign;
  variant: BubbleVariant;
  /** The image's address; `null` draws the bubble without it. */
  src: string | null;
  /** The image's text alternative when there is no caption to say it. */
  alt: string;
  /** The caption under the image; the time trails it. Without one the time sits on the image. */
  caption?: string;
  time: string;
  receipt?: TranscriptReceipt;
};

/**
 * An image message: the same bubble as a text one, the image full bleed at
 * its top. A caption follows the image with the time trailing it; without a
 * caption the time sits on the image's bottom corner on a scrim.
 */
export function TranscriptImageBubble({ align, variant, src, alt, caption, time, receipt }: TranscriptImageBubbleProps) {
  return (
    <Bubble className={styles.bubble} align={align} variant={variant}>
      <BubbleContent className={cx(styles.bubbleText, styles.imageContent)}>
        {caption ? (
          <>
            {/* The caption right below already says it; repeating it as alt text would read it twice. */}
            {src === null ? null : <img src={src} alt="" className={cx(styles.image, styles.imageWithCaption)} />}
            <span className={styles.caption}>
              {caption}
              <Meta time={time} receipt={receipt} />
            </span>
          </>
        ) : (
          <span className={styles.imageFrame}>
            {src === null ? null : <img src={src} alt={alt} className={styles.image} />}
            <Meta time={time} receipt={receipt} overlay />
          </span>
        )}
      </BubbleContent>
    </Bubble>
  );
}

export type TranscriptAttachmentProps = {
  /** A lucide file or paperclip icon. */
  icon: ReactElement;
  name: string;
  size: string;
};

/** A file inside a bubble: the kit's Attachment, never wider than the bubble. */
export function TranscriptAttachment({ icon, name, size }: TranscriptAttachmentProps) {
  return (
    <Attachment className={styles.attachment}>
      <AttachmentMedia>{icon}</AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{name}</AttachmentTitle>
        <AttachmentDescription>{size}</AttachmentDescription>
      </AttachmentContent>
    </Attachment>
  );
}
