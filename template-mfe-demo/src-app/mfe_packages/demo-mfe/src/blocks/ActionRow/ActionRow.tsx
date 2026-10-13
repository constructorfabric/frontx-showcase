import type { ReactNode } from 'react';
import styles from './ActionRow.module.css';

// @cpt-dod:cpt-template-mfe-demo-dod-screen-entries-screen-blocks:p2
// @cpt-algo:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2
// @cpt-begin:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2:inst-action-row
export interface ActionRowProps {
  /** The actions, usually kit Buttons, in reading order. */
  children: ReactNode;
}

/*
 * A row of actions that wraps onto further lines when the width runs out; an action whose label is wider than the row shrinks to the row's width instead of running past its edge.
 */
export function ActionRow({ children }: ActionRowProps) {
  return <div className={styles.row}>{children}</div>;
}
// @cpt-end:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2:inst-action-row
