import type { ReactElement, ReactNode } from 'react';
import { Badge } from '@gears-frontx/ui-kit';
import { Heading, Text } from '@gears-frontx/kit-candidates';
import styles from './DataTableSection.module.css';

export type DataTableSectionProps = {
  /** The section's heading, an `h2` under the screen's `h1`. */
  title: string;
  /** How many rows the table holds, shown beside the heading. */
  count: string;
  /** A field at the end of the toolbar. */
  search: ReactNode;
  /** The kit `DataTable`. */
  children: ReactNode;
};

/**
 * A table with its toolbar: the heading, the row count and a search field at
 * the end of the line, which drops under the heading below the dashboard's
 * narrow width.
 */
// @cpt-dod:cpt-template-inbox-dod-screen-frame-blocks:p2
export function DataTableSection({ title, count, search, children }: DataTableSectionProps) {
  return (
    <div className={styles.section}>
      <div className={styles.toolbar}>
        <Heading size="heading-2">{title}</Heading>
        <Badge variant="secondary">{count}</Badge>
        <div className={styles.search}>{search}</div>
      </div>
      {children}
    </div>
  );
}

export type DataTableHeaderLabelProps = {
  /** A lucide icon for the column. */
  icon: ReactElement;
  children: ReactNode;
};

/** A column header's icon and label, inside the kit's `DataTableSortButton`. */
export function DataTableHeaderLabel({ icon, children }: DataTableHeaderLabelProps) {
  return (
    <span className={styles.headerLabel}>
      {icon}
      {children}
    </span>
  );
}

export type DataTableIdentityCellProps = {
  /** The person's avatar at the kit's small size. */
  avatar: ReactNode;
  name: string;
  /** A muted line under the name: the company. */
  description?: string;
};

/** A cell naming a person: the avatar and the name, with one muted line under it; both lines truncate. */
export function DataTableIdentityCell({ avatar, name, description }: DataTableIdentityCellProps) {
  return (
    <div className={styles.identity}>
      {avatar}
      <span className={styles.lines}>
        <span className={styles.truncate}>{name}</span>
        {description === undefined ? null : (
          <Text variant="meta" tone="muted" render={<span />} className={styles.truncate}>
            {description}
          </Text>
        )}
      </span>
    </div>
  );
}
