import type { ReactNode } from 'react';
import { Text } from '@gears-frontx/kit-candidates';
import styles from './IndexIntro.module.css';

// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props
export interface IndexIntroProps {
  /** The sentence on the left. */
  intro: string;
  /** The search field on the right (the kit's `Input`). */
  search: ReactNode;
}
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props

/** The index's intro row: a short sentence in a fixed column and the search field across the rest; stacked on a phone. */
// @cpt-dod:cpt-template-catalogue-dod-catalogue-screen-blocks:p1
// @cpt-algo:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1
export function IndexIntro({ intro, search }: IndexIntroProps) {
  return (
    <div className={styles.row}>
      {/* @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-text */}
      <Text tone="muted" className={styles.intro}>
        {intro}
      </Text>
      {/* @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-text */}
      {/* @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-lay-out-slots */}
      <div className={styles.search}>{search}</div>
      {/* @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-lay-out-slots */}
    </div>
  );
}
