import type { ReactNode } from 'react';
import { cx } from '../../ui/cx';
import styles from './DetailPane.module.css';

export type DetailPaneProps = {
  /** The open item (`ThreadPane`, and the chat's `InspectorPanel` beside it), or a `PaneState` when nothing is open. */
  children: ReactNode;
  /** Out of the layout while the list takes the screen to itself (the single-pane layout with nothing open). */
  hidden: boolean;
  /** An inspector panel sits beside the thread, so the pane's minimum grows by its width. */
  asideOpen?: boolean;
};

/**
 * The detail half of a list and detail screen. Beside the list it never gets
 * narrower than 24rem, the minimum the breakpoints are built on, and the list
 * gives way instead; with the chat's inspector panel open beside the thread
 * the minimum grows by the panel.
 */
// @cpt-dod:cpt-template-inbox-dod-screen-frame-blocks:p2
export function DetailPane({ children, hidden, asideOpen = false }: DetailPaneProps) {
  return (
    <div className={cx(styles.detailPane, hidden && styles.singlePaneHidden, asideOpen && styles.detailPaneWithDetails)}>
      {children}
    </div>
  );
}
