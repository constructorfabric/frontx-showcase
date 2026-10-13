import { Skeleton } from '@gears-frontx/ui-kit';
import styles from './PagePlaceholder.module.css';

// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props
export interface PagePlaceholderProps {
  /** Names what is loading, for assistive technology. */
  label?: string;
}
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props

/** A silhouette of a page, or of a part of one, while it loads: the kit's `Skeleton` across the page column. A named placeholder is a status, since a name on an element with no role is not announced. */
// @cpt-dod:cpt-template-catalogue-dod-catalogue-screen-blocks:p1
// @cpt-algo:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1
export function PagePlaceholder({ label }: PagePlaceholderProps) {
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-kit-parts
  return <Skeleton className={styles.placeholder} role={label ? 'status' : undefined} aria-label={label} />;
  // @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-kit-parts
}
