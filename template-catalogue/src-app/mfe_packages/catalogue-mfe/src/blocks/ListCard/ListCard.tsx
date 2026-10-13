import { createElement, type MouseEventHandler, type ReactNode } from 'react';
import { ArrowUpRightIcon, type LucideIcon } from 'lucide-react';
import { Heading, Text } from '@gears-frontx/kit-candidates';
import { BlockAnchor, type AnchorRender } from '../anchor';
import styles from './ListCard.module.css';

// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props
export interface ListCardProps {
  title: string;
  icon: LucideIcon;
  /** How many rows the card lists. */
  count: number;
  testId?: string;
  /** The rows (`ListCardEntry`). */
  children: ReactNode;
}
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props

/** A bordered list with a tinted header band (an icon, the title as the card's heading, a count) over divided link rows. */
// @cpt-dod:cpt-template-catalogue-dod-catalogue-screen-blocks:p1
// @cpt-algo:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1
export function ListCard({ title, icon: Icon, count, testId, children }: ListCardProps) {
  return (
    <section className={styles.card} aria-label={title} data-testid={testId}>
      <div className={styles.header}>
        <Icon aria-hidden="true" className={styles.icon} />
        {/* @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-text */}
        <Heading size="heading-2" render={createElement('h2')}>
          {title}
        </Heading>
        <Text variant="meta" tone="muted" render={<span />} className={styles.count}>
          {count}
        </Text>
        {/* @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-text */}
      </div>
      {/* @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-lay-out-slots */}
      <ul className={styles.entries}>{children}</ul>
      {/* @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-lay-out-slots */}
    </section>
  );
}

// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props
export interface ListCardEntryProps {
  label: string;
  /** A sentence under the label. */
  description?: string;
  /** The short label on the right, before the arrow. */
  meta: string;
  href?: string;
  /** Draws the row on the router's link instead of a plain anchor. */
  render?: AnchorRender;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  testId?: string;
}
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props

/** One row of a list card: the name (and a sentence) on the left, a short meta label and an arrow on the right, the whole row one link. */
export function ListCardEntry({ label, description, meta, href, render, onClick, testId }: ListCardEntryProps) {
  return (
    <li>
      {/* @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-link */}
      <BlockAnchor href={href} render={render} onClick={onClick} className={styles.entry} data-testid={testId}>
        {/* @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-link */}
        {/* @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-text */}
        <span className={styles.text}>
          <span>{label}</span>
          {description ? (
            <Text variant="meta" tone="muted" render={<span />}>
              {description}
            </Text>
          ) : null}
        </span>
        <Text variant="meta" tone="muted" render={<span />} className={styles.meta}>
          {meta}
          <ArrowUpRightIcon aria-hidden="true" className={styles.arrow} />
        </Text>
        {/* @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-text */}
      </BlockAnchor>
    </li>
  );
}
