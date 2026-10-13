import type { ReactNode } from 'react';
import { Separator } from '@gears-frontx/ui-kit';

import { SectionFrame } from '../SectionFrame/SectionFrame';
import styles from './ArchitectureMap.module.css';

export interface ArchitectureMapProps {
  /** The heading's id. */
  id: string;
  /** A short section label above the title. */
  label?: string;
  /** The section title; a newline breaks the line. */
  title: string;
  /** The lead beside the title. */
  lead?: string;
  /** The map, drawn by brand art with its own accessible description; it takes the column's width. */
  map: ReactNode;
}

/*
 * How a product is put together, as a map: a rule across the page column, the section frame with the label, the title and the lead, and the map drawing under them.
 */
// @cpt-dod:cpt-template-site-blocks-dod-section-blocks-architecture-map:p1
// @cpt-algo:cpt-template-site-blocks-algo-section-blocks-architecture-map:p1
export function ArchitectureMap({ id, label, title, lead, map }: ArchitectureMapProps) {
  // @cpt-begin:cpt-template-site-blocks-algo-section-blocks-architecture-map:p1:inst-rhythm
  return (
    <div className={styles.rhythm}>
      {/* @cpt-begin:cpt-template-site-blocks-algo-section-blocks-architecture-map:p1:inst-rule */}
      <div className={styles.rule}>
        <Separator />
      </div>
      {/* @cpt-end:cpt-template-site-blocks-algo-section-blocks-architecture-map:p1:inst-rule */}
      {/* @cpt-begin:cpt-template-site-blocks-algo-section-blocks-architecture-map:p1:inst-map */}
      <SectionFrame id={id} label={label} title={title} lead={lead}>
        <div className={styles.map}>{map}</div>
      </SectionFrame>
      {/* @cpt-end:cpt-template-site-blocks-algo-section-blocks-architecture-map:p1:inst-map */}
    </div>
  );
  // @cpt-end:cpt-template-site-blocks-algo-section-blocks-architecture-map:p1:inst-rhythm
}
