import type { ReactNode } from 'react';
import styles from './PagePane.module.css';

export type PagePaneProps = {
  /** The header (`PagePaneHeader`) and the body (`PagePaneBody`, or a block that scrolls on its own). */
  children: ReactNode;
  /** Out of the page while another page of the screen stands in front of it (the directory behind a contact's page). */
  hidden?: boolean;
};

/**
 * A screen's main pane when the screen has no list beside it: the contacts
 * directory, a contact's page, the dashboard. A column that fills the room
 * the side column leaves, with a header row on top and a body under it.
 */
// @cpt-dod:cpt-template-inbox-dod-screen-frame-blocks:p2
export function PagePane({ children, hidden = false }: PagePaneProps) {
  return (
    <div className={styles.pane} hidden={hidden}>
      {children}
    </div>
  );
}

export type PagePaneHeaderProps = {
  /** Controls before the heading: the side column toggle, a back button, an avatar. */
  leading?: ReactNode;
  /** The pane's heading: the screen's `ScreenHeading`, or text while another page holds the screen's one heading. */
  heading: ReactNode;
  /** A line under the heading: a count. */
  subheading?: ReactNode;
  /** Details right after the heading on its line: a type badge, a presence label. */
  after?: ReactNode;
  /** A search field at the end of the row. A header with one wraps, so the field drops under the heading on a narrow screen. */
  search?: ReactNode;
  /** Buttons at the end of the row. */
  actions?: ReactNode;
};

/** The header row a page pane opens with. */
export function PagePaneHeader({ leading, heading, subheading, after, search, actions }: PagePaneHeaderProps) {
  return (
    <div className={styles.header}>
      {leading}
      <div className={styles.titles}>
        {heading}
        {subheading}
      </div>
      {after}
      {search !== undefined || actions !== undefined ? <span className={styles.spacer} /> : null}
      {search === undefined ? null : <div className={styles.search}>{search}</div>}
      {actions}
    </div>
  );
}

export type PagePaneBodyProps = {
  children: ReactNode;
};

/** The body of a page pane: it scrolls on its own, inside the pane's padding. */
export function PagePaneBody({ children }: PagePaneBodyProps) {
  return <div className={styles.body}>{children}</div>;
}
