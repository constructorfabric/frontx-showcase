import type { ReactNode } from 'react';
import styles from './CellActions.module.css';

export type CellActionsProps = {
  /** Icon buttons acting on the row. */
  children: ReactNode;
};

/** A table row's actions, at the end of their cell. */
// @cpt-dod:cpt-template-inbox-dod-screen-frame-blocks:p2
export function CellActions({ children }: CellActionsProps) {
  return <div className={styles.actions}>{children}</div>;
}
