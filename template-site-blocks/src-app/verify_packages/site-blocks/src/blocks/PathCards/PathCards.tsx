import { createElement, type ReactElement, type ReactNode } from 'react';
import { CardDescription } from '@gears-frontx/ui-kit';
import { Card, CardTitle, Text } from '@gears-frontx/kit-candidates';
import styles from './PathCards.module.css';

export interface PathCard {
  /** The card's figure, drawn by brand art; decoration only. */
  figure?: ReactNode;
  /** A short label above the title. */
  eyebrow?: string;
  title: string;
  text: string;
  /** The element the whole card renders as: an anchor or the application's router link, with its destination and no children. */
  link: ReactElement;
}

export interface PathCardsProps {
  items: readonly PathCard[];
}

// @cpt-dod:cpt-template-site-blocks-dod-docs-blocks-path-cards:p1
// @cpt-algo:cpt-template-site-blocks-algo-docs-blocks-path-cards:p1
/** The main paths through a section: three whole-card links side by side, each a figure beside its title, text and an arrow. */
export function PathCards({ items }: PathCardsProps) {
  return (
    // @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-path-cards:p1:inst-list
    <ul className={styles.grid}>
      {items.map((item) => (
        <li key={item.title} className={styles.cell}>
          {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-path-cards:p1:inst-list */}
          {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-path-cards:p1:inst-card-link */}
          <Card render={item.link} className={styles.card}>
            {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-path-cards:p1:inst-card-link */}
            {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-path-cards:p1:inst-figure-slot */}
            <span className={styles.figure} aria-hidden="true">
              {item.figure}
            </span>
            {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-path-cards:p1:inst-figure-slot */}
            {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-path-cards:p1:inst-copy */}
            <span className={styles.copy}>
              {item.eyebrow ? (
                <Text variant="label" tone="muted" render={createElement('span')}>
                  {item.eyebrow}
                </Text>
              ) : null}
              <CardTitle render={createElement('h2')}>{item.title}</CardTitle>
              <CardDescription className={styles.text}>{item.text}</CardDescription>
              <span aria-hidden="true">→</span>
            </span>
            {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-path-cards:p1:inst-copy */}
          </Card>
        </li>
      ))}
    </ul>
  );
}
