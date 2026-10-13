import { createElement, type ReactNode } from 'react';
import { Heading, Text } from '@gears-frontx/kit-candidates';
import styles from './ComponentGuide.module.css';

// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props
export interface ComponentGuideProps {
  /** The two columns (`GuideColumn`). */
  children: ReactNode;
}
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props

/** How to use a component, under its example: two columns (one on a phone), the page's last block. */
// @cpt-dod:cpt-template-catalogue-dod-catalogue-screen-blocks:p1
// @cpt-algo:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1
export function ComponentGuide({ children }: ComponentGuideProps) {
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-lay-out-slots
  return <div className={styles.guide}>{children}</div>;
  // @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-lay-out-slots
}

// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props
export interface GuideColumnProps {
  /** The id of the column's heading, which names the column. */
  id: string;
  title: string;
  /** A code sample under the heading. */
  code?: ReactNode;
  note: string;
  /** A link at the column's foot. */
  link?: ReactNode;
}
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props

/** One column of the guide: its `h2`, an optional code sample, a note and an optional link. */
export function GuideColumn({ id, title, code, note, link }: GuideColumnProps) {
  return (
    <section className={styles.column} aria-labelledby={id}>
      {/* @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-text */}
      <div className={styles.title}>
        <Heading size="heading-2" render={createElement('h2', { id })}>
          {title}
        </Heading>
      </div>
      {/* @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-text */}
      {code}
      {/* @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-text */}
      <div className={code ? styles.noteAfterCode : undefined}>
        <Text variant="meta" tone="muted">
          {note}
        </Text>
      </div>
      {/* @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-text */}
      {/* @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-lay-out-slots */}
      {link ? <div className={code ? styles.linkAfterCode : styles.link}>{link}</div> : null}
      {/* @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-lay-out-slots */}
    </section>
  );
}
