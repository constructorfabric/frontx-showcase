import { createElement, type ReactElement, type ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { CardDescription } from '@gears-frontx/ui-kit';
import { Card, CardTitle } from '@gears-frontx/kit-candidates';
import styles from './TemplatePair.module.css';

export interface TemplateCard {
  /** The card's figure, drawn by brand art; decoration only. */
  figure?: ReactNode;
  title: string;
  text: string;
  /** The element the whole card renders as: an anchor or the application's router link, with its destination and no children. */
  link: ReactElement;
}

export interface TemplatePairProps {
  /** The two templates applied together, in order. */
  items: readonly [TemplateCard, TemplateCard];
}

// @cpt-dod:cpt-template-site-blocks-dod-docs-blocks-template-pair:p1
// @cpt-algo:cpt-template-site-blocks-algo-docs-blocks-template-pair:p1
/** Two templates applied together: two whole-card links, figure left of the title (closed by an arrow) and text, joined by a "+" sign. */
export function TemplatePair({ items }: TemplatePairProps) {
  return (
    <div className={styles.frame}>
      {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-template-pair:p1:inst-cards */}
      <ul className={styles.grid}>
        {items.map((item) => (
          <li key={item.title} className={styles.cell}>
            <Card render={item.link} className={styles.card}>
              <span className={styles.figure} aria-hidden="true">
                {item.figure}
              </span>
              <span className={styles.body}>
                <CardTitle render={createElement('h3')} className={styles.title}>
                  {item.title}
                  <ArrowUpRight aria-hidden="true" className={styles.titleIcon} />
                </CardTitle>
                <CardDescription>{item.text}</CardDescription>
              </span>
            </Card>
          </li>
        ))}
      </ul>
      {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-template-pair:p1:inst-cards */}
      {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-template-pair:p1:inst-join */}
      <span className={styles.join} aria-hidden="true">
        +
      </span>
      {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-template-pair:p1:inst-join */}
    </div>
  );
}
