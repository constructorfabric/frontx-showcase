import type { ReactNode } from 'react';
import styles from './ListCardGrid.module.css';

// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props
export interface ListCardGridProps {
  /** The accessible name of the group of cards. */
  label: string;
  /** The cards (`ListCard`). */
  children: ReactNode;
}
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props

/** The index's cards in two columns (one on a phone), each card as tall as its own rows. */
// @cpt-dod:cpt-template-catalogue-dod-catalogue-screen-blocks:p1
// @cpt-algo:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1
export function ListCardGrid({ label, children }: ListCardGridProps) {
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-lay-out-slots
  return (
    <div className={styles.grid} role="group" aria-label={label}>
      {children}
    </div>
  );
  // @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-lay-out-slots
}
