import type { ReactNode } from 'react';
import styles from './ColumnsLayout.module.css';

export type ColumnsLayoutProps = {
  /** The narrow first column: who the person is (summary, details, checklist). */
  start: ReactNode;
  /** The wide middle column: what they have open (tickets, conversations). */
  main: ReactNode;
  /** The narrow last column: what happened lately. */
  end: ReactNode;
};

/**
 * A contact's page body: three columns of cards, stacked into one column on a
 * screen narrower than the contact-columns width
 * (`SCREEN_BREAKPOINTS_REM.contactColumns`).
 */
// @cpt-dod:cpt-template-inbox-dod-screen-frame-blocks:p2
export function ColumnsLayout({ start, main, end }: ColumnsLayoutProps) {
  return (
    <div className={styles.columns}>
      <div className={styles.column}>{start}</div>
      <div className={styles.column}>{main}</div>
      <div className={styles.column}>{end}</div>
    </div>
  );
}
