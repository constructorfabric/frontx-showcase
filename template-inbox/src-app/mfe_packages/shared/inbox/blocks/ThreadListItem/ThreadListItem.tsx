import type { ReactNode } from 'react';
import { PinIcon, StarIcon } from 'lucide-react';
import { Badge, Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@gears-frontx/ui-kit';
import { Text } from '@gears-frontx/kit-candidates';
import { cx } from '../../ui/cx';
import styles from './ThreadListItem.module.css';

export type ThreadListItemProps = {
  /** The correspondent's avatar at the kit's large size. */
  avatar: ReactNode;
  /** The first line: a subject or a correspondent; may start with `VisuallyHidden` text. */
  title: ReactNode;
  /** The short time of the last activity, at the end of the first line. */
  time: string;
  /** The second line: the latest message or the subject and snippet. */
  preview: string;
  /** Marks before the time on the first line: `ThreadListItemPin`, `ThreadListItemStar`. */
  titleMarks?: ReactNode;
  /** Marks at the end of the second line: `ThreadListItemPin`, `ThreadListItemUnread`. */
  previewMarks?: ReactNode;
  /** The row the detail pane shows. */
  selected: boolean;
  /** A row already read steps its title and preview down to the muted, regular text; an unread one stays full strength. */
  read?: boolean;
  onSelect: () => void;
};

/**
 * One row of a conversation or mail list: a button with the avatar, the
 * title and the time on one line, the preview and the row's marks on the
 * next, both lines cut with an ellipsis.
 */
// @cpt-dod:cpt-template-inbox-dod-screen-frame-blocks:p2
export function ThreadListItem({
  avatar,
  title,
  time,
  preview,
  titleMarks,
  previewMarks,
  selected,
  read = false,
  onSelect,
}: ThreadListItemProps) {
  return (
    <Item
      className={cx(styles.row, selected && styles.rowSelected, read && styles.read)}
      variant={selected ? 'muted' : 'default'}
      render={<button type="button" onClick={onSelect} aria-current={selected ? 'true' : undefined} />}
    >
      <ItemMedia>{avatar}</ItemMedia>
      <ItemContent>
        <div className={styles.line}>
          <ItemTitle className={cx(styles.title, styles.text)}>{title}</ItemTitle>
          <span className={styles.marks}>
            {titleMarks}
            <Text variant="meta" tone="muted" render={<span />}>
              {time}
            </Text>
          </span>
        </div>
        <div className={styles.line}>
          <ItemDescription className={cx(styles.preview, styles.text)}>{preview}</ItemDescription>
          {previewMarks === undefined ? null : <span className={styles.marks}>{previewMarks}</span>}
        </div>
      </ItemContent>
    </Item>
  );
}

/** The pinned mark, named for assistive technology. */
export function ThreadListItemPin({ label }: { label: string }) {
  return <PinIcon className={styles.pin} role="img" aria-label={label} />;
}

/** The starred mark, named for assistive technology. */
export function ThreadListItemStar({ label }: { label: string }) {
  return <StarIcon className={styles.star} role="img" aria-label={label} />;
}

/**
 * The unread count: the kit's Badge on the line of the preview, its block
 * padding dropped so the badge, not the preview text, never sets the line's
 * height. (The kit's compact `xs` count sets 10px text, under the 12px floor
 * for text inside a control, and the row is a button.)
 */
export function ThreadListItemUnread({ count, label }: { count: number; label: string }) {
  return (
    <Badge className={styles.unread} aria-label={label}>
      {count}
    </Badge>
  );
}
