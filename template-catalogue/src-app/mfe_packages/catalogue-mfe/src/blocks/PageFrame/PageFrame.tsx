import type { ReactNode } from 'react';
import styles from './PageFrame.module.css';

// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props
export interface PageFrameProps {
  testId?: string;
  /** The page's blocks, top to bottom. */
  children: ReactNode;
}
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props

/** One page of the catalogue: an `article` whose blocks stack top to bottom at the page column's width. */
// @cpt-dod:cpt-template-catalogue-dod-catalogue-screen-blocks:p1
// @cpt-algo:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1
export function PageFrame({ testId, children }: PageFrameProps) {
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-lay-out-slots
  return (
    <article className={styles.page} data-testid={testId}>
      {children}
    </article>
  );
  // @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-lay-out-slots
}
