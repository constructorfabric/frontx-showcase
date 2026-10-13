import type { ReactNode } from 'react';
import styles from './ChipRow.module.css';

export type ChipRowProps = {
  /** Kit `Badge` chips, and the control that adds one. */
  children: ReactNode;
};

/** A wrapping row of chips: a conversation's or a contact's tags. */
// @cpt-dod:cpt-template-inbox-dod-screen-frame-blocks:p2
export function ChipRow({ children }: ChipRowProps) {
  return <div className={styles.row}>{children}</div>;
}
