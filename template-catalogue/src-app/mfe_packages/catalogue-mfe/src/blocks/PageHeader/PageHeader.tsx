import { createElement, type ReactNode } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@gears-frontx/ui-kit';
import { Heading, Text } from '@gears-frontx/kit-candidates';
import type { AnchorRender } from '../anchor';
import styles from './PageHeader.module.css';

// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props
export interface PageTrail {
  /** The accessible name of the breadcrumb's navigation. */
  label: string;
  /** The catalogue's root: its name and its link (the router's link). */
  root: string;
  rootRender: AnchorRender;
  /** The current page's name. */
  current: string;
}
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props

// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props
export interface PageHeaderProps {
  /** The trail above the page. */
  trail?: PageTrail;
  /** The way back, above the title (an `IconLink`). */
  back?: ReactNode;
  /** The page's one `h1`. */
  title: string;
  /** What sits on the right of the title's row (a link or the family's name). */
  aside?: ReactNode;
  /** The sentence under the title. */
  lead?: string;
}
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props

/** The top of a catalogue page: the trail, the way back, the one `h1` with an item on the right of its row, and the lead. */
// @cpt-dod:cpt-template-catalogue-dod-catalogue-screen-blocks:p1
// @cpt-algo:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1
export function PageHeader({ trail, back, title, aside, lead }: PageHeaderProps) {
  return (
    <div className={styles.top}>
      {/* @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-kit-parts */}
      {trail ? (
        <div className={styles.trail}>
          <Breadcrumb aria-label={trail.label}>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={trail.rootRender}>{trail.root}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{trail.current}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      ) : null}
      {/* @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-kit-parts */}
      {/* @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-lay-out-slots */}
      {back ? <div className={styles.back}>{back}</div> : null}
      {/* @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-lay-out-slots */}
      <header className={styles.header}>
        {/* @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-text */}
        <Heading size="display" render={createElement('h1')}>
          {title}
        </Heading>
        {/* @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-text */}
        {/* @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-lay-out-slots */}
        {aside ? <div className={styles.aside}>{aside}</div> : null}
        {/* @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-lay-out-slots */}
      </header>
      {/* @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-text */}
      {lead ? (
        <div className={styles.lead}>
          <Text tone="muted">{lead}</Text>
        </div>
      ) : null}
      {/* @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-text */}
    </div>
  );
}
