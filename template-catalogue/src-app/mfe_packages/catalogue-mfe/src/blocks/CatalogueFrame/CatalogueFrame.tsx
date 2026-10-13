import type { ReactNode } from 'react';
import styles from './CatalogueFrame.module.css';

/** Below this width the navigation panel gives way to a page select above the page; it matches the stylesheet's one-column breakpoint. */
export const NARROW_QUERY = '(max-width: 48rem)';

// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props
export interface CatalogueFrameProps {
  /** The section bar across the top. */
  sections?: ReactNode;
  /** The page select a narrow screen shows under the section bar. */
  picker?: ReactNode;
  /** The navigation panel a wide screen shows beside the page. */
  panel?: ReactNode;
  /** What the screen mounts after its layout, such as its toast region. */
  overlay?: ReactNode;
  /** The current page. */
  children?: ReactNode;
}
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props

/**
 * The catalogue's frame, as the reference showcase lays it out: the section bar across the top, then the navigation panel and the page in two columns; on a narrow screen one column with the page select above the page. The page area is a plain element, not a `main`: the shell's layout already has the document's main landmark.
 */
// @cpt-flow:cpt-template-catalogue-flow-catalogue-screen-navigate:p1
// @cpt-algo:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1
// @cpt-dod:cpt-template-catalogue-dod-catalogue-screen-blocks:p1
export function CatalogueFrame({ sections, picker, panel, overlay, children }: CatalogueFrameProps) {
  return (
    <div className={styles.frame}>
      {/* @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-lay-out-slots */}
      {sections}
      {picker}
      <div className={styles.layout}>
        {panel}
        {/* @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-lay-out-slots */}
        {/* @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-render-content */}
        <div className={styles.content} data-testid="catalogue-page">
          {children}
        </div>
      </div>
      {overlay}
      {/* @cpt-end:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-render-content */}
    </div>
  );
}
