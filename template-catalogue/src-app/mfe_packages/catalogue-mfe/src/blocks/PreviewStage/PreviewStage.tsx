import type { ReactNode } from 'react';
import { Card, CardContent } from '@gears-frontx/ui-kit';
import styles from './PreviewStage.module.css';

// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props
export interface PreviewStageProps {
  /** The example, or the foundation page, the stage shows. */
  children: ReactNode;
}
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props

/** The kit's Card around a working example: an example wider than the page scrolls inside the card instead of widening the page. */
// @cpt-dod:cpt-template-catalogue-dod-catalogue-screen-blocks:p1
// @cpt-algo:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1
export function PreviewStage({ children }: PreviewStageProps) {
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-kit-parts
  return (
    <Card className={styles.stage}>
      <CardContent className={styles.content}>{children}</CardContent>
    </Card>
  );
  // @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-kit-parts
}
