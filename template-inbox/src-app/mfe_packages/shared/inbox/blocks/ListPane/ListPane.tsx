import { Children, type ReactNode } from 'react';
import { ItemGroup, SidebarGroupLabel, Tabs, TabsContent, TabsList, TabsTrigger } from '@gears-frontx/ui-kit';
import { Text } from '@gears-frontx/kit-candidates';
import { cx } from '../../ui/cx';
import styles from './ListPane.module.css';

export type ListPaneProps = {
  /** The landmark's name: the channel or the mailbox the list shows. */
  label: string;
  /** Out of the layout while the open item takes the screen to itself (the single-pane layout). */
  hidden: boolean;
  /** Controls before the heading: the side column toggle. */
  leading?: ReactNode;
  /** The pane's heading: the screen's `ScreenHeading`, or text while the open item holds the screen's one heading. */
  heading: ReactNode;
  /** How many rows the list holds. */
  count: number;
  /** Buttons at the end of the header row. */
  actions?: ReactNode;
  /** The rows under the header: `ListPaneNotice`, `ListPaneSearch`, `ListPaneToolbar`, `ListPaneTabs`, `ListPaneBody`. */
  children: ReactNode;
};

/**
 * The list half of a list and detail screen: a header with the side column
 * toggle, the heading, the count and the actions, then the search, the
 * toolbar and the rows. 22rem beside the detail pane, narrower when the
 * detail pane would drop under its minimum, the whole screen in the
 * single-pane layout.
 */
// @cpt-dod:cpt-template-inbox-dod-screen-frame-blocks:p2
export function ListPane({ label, hidden, leading, heading, count, actions, children }: ListPaneProps) {
  return (
    <section className={cx(styles.pane, hidden && styles.singlePaneHidden)} aria-label={label}>
      <div className={styles.header}>
        {leading}
        <div className={styles.heading}>{heading}</div>
        {/* The count follows the visible list, so a search moves it with the rows. */}
        <Text variant="meta" tone="muted" render={<span />}>
          {count}
        </Text>
        {actions === undefined ? null : (
          <>
            <span className={styles.spacer} />
            {actions}
          </>
        )}
      </div>
      {children}
    </section>
  );
}

/** A row for a notice above the list: a kit `Alert`. */
export function ListPaneNotice({ children }: { children: ReactNode }) {
  return <div className={styles.row}>{children}</div>;
}

/** The row holding the list's search field, which takes the whole row. */
export function ListPaneSearch({ children }: { children: ReactNode }) {
  return <div className={cx(styles.row, styles.search)}>{children}</div>;
}

export type ListPaneToolbarProps = {
  /** A summary of the list at the start of the row: the open count. */
  summary: string;
  /** A control at the end of the row: the sort select. */
  control: ReactNode;
};

/** The row under the search: a summary at one end, a control at the other. */
export function ListPaneToolbar({ summary, control }: ListPaneToolbarProps) {
  return (
    <div className={cx(styles.row, styles.toolbar)}>
      <Text variant="label" tone="muted" render={<span />}>
        {summary}
      </Text>
      {control}
    </div>
  );
}

export type ListPaneTab = {
  value: string;
  label: string;
  /** The tab's rows, a `ListPaneBody`. */
  content: ReactNode;
};

export type ListPaneTabsProps = {
  value: string;
  onValueChange: (value: unknown) => void;
  tabs: ListPaneTab[];
};

/** Tabs over the list (all, unread), each panel filling the rest of the pane so its rows scroll inside it. */
export function ListPaneTabs({ value, onValueChange, tabs }: ListPaneTabsProps) {
  return (
    <Tabs className={styles.tabs} value={value} onValueChange={onValueChange}>
      <TabsList variant="line" className={styles.row}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className={styles.tabPanel}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

/** The scrolling area holding the list's groups, or an empty state. */
export function ListPaneBody({ children }: { children: ReactNode }) {
  return <div className={styles.body}>{children}</div>;
}

export type ListPaneGroupProps = {
  /** A label above the group: "Pinned". */
  label?: string;
  /** The rows, `ThreadListItem`s. */
  children: ReactNode;
};

/**
 * A run of rows, a kit `ItemGroup`: the kit gives the group the list role, so
 * each row sits in a box that carries the list item role and lays nothing
 * out, and stays the group's flex child.
 */
export function ListPaneGroup({ label, children }: ListPaneGroupProps) {
  return (
    <>
      {label === undefined ? null : <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <ItemGroup className={styles.group}>
        {Children.map(children, (row) => (
          <div role="listitem" className={styles.listItem}>
            {row}
          </div>
        ))}
      </ItemGroup>
    </>
  );
}
