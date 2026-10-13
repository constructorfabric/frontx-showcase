import type { ReactNode } from 'react';
import styles from './ReadingColumn.module.css';

// @cpt-dod:cpt-template-mfe-demo-dod-screen-entries-screen-blocks:p2
// @cpt-algo:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2
// @cpt-begin:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2:inst-reading-column
export interface ReadingColumnProps {
  /** The cards of the column, top to bottom. */
  children: ReactNode;
}

/*
 * A column of cards held to a reading width, for screens whose cards are records and forms rather than full-width panels.
 */
export function ReadingColumn({ children }: ReadingColumnProps) {
  return <div className={styles.column}>{children}</div>;
}
// @cpt-end:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2:inst-reading-column
