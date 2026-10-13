import type { ReactNode } from 'react';
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@gears-frontx/ui-kit';
import { Text } from '@gears-frontx/kit-candidates';
import styles from './RecordList.module.css';

export type RecordListItem = {
  id: string;
  /** The record's one-line title, truncated to the row. */
  title: string;
  /** A short muted note at the end of the title's line: a channel and a time. */
  meta?: string;
  /** One line under the title, truncated: a ticket number, the latest message. */
  description?: string;
  /** Status at the end of the row: a kit `StatusDot`, a `Badge`. */
  trailing?: ReactNode;
};

export type RecordListProps = {
  items: RecordListItem[];
};

/** A list of records on a card: tickets or conversations, one truncated line each, with their status at the end. */
// @cpt-dod:cpt-template-inbox-dod-screen-frame-blocks:p2
export function RecordList({ items }: RecordListProps) {
  return (
    <ItemGroup>
      {items.map((item) => (
        <Item key={item.id} size="sm" role="listitem">
          <ItemContent>
            <div className={styles.line}>
              <ItemTitle className={styles.title}>{item.title}</ItemTitle>
              {item.meta === undefined ? null : (
                <Text variant="meta" tone="muted" render={<span />} className={styles.meta}>
                  {item.meta}
                </Text>
              )}
            </div>
            {item.description === undefined ? null : (
              <ItemDescription className={styles.description}>{item.description}</ItemDescription>
            )}
          </ItemContent>
          {item.trailing === undefined ? null : <ItemActions>{item.trailing}</ItemActions>}
        </Item>
      ))}
    </ItemGroup>
  );
}
