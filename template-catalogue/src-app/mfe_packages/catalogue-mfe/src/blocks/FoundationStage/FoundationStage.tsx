import type { ReactNode } from 'react';
import { PreviewStage } from '../PreviewStage';
import styles from './FoundationStage.module.css';

// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props
export interface FoundationStageProps {
  /** The foundation page. */
  children: ReactNode;
}
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props

/** A foundation page's stage as the page's last block: the preview stage at the reference's gap above the footer. */
// @cpt-dod:cpt-template-catalogue-dod-catalogue-screen-blocks:p1
// @cpt-algo:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1
export function FoundationStage({ children }: FoundationStageProps) {
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-lay-out-slots
  return (
    <div className={styles.end}>
      <PreviewStage>{children}</PreviewStage>
    </div>
  );
  // @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-lay-out-slots
}
