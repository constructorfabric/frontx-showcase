import { createElement, type ReactElement, type ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { CardDescription } from '@gears-frontx/ui-kit';
import { Card, CardTitle } from '@gears-frontx/kit-candidates';
import styles from './TemplateRow.module.css';

export interface TemplateRowItem {
  /** The card's figure, drawn by brand art; decoration only. */
  figure?: ReactNode;
  title: string;
  text: string;
  /** The element the whole card renders as: an anchor or the application's router link, with its destination and no children. */
  link: ReactElement;
}

export interface TemplateRowProps {
  item: TemplateRowItem;
}

// @cpt-dod:cpt-template-site-blocks-dod-docs-blocks-template-row:p1
// @cpt-algo:cpt-template-site-blocks-algo-docs-blocks-template-row:p1
/** A template that follows the leading ones: one full-width whole-card link, figure left of the title and text, an arrow at the far end. */
export function TemplateRow({ item }: TemplateRowProps) {
  return (
    // @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-template-row:p1:inst-card-link
    <Card render={item.link} className={styles.card}>
      <span className={styles.figure} aria-hidden="true">
        {item.figure}
      </span>
      <span className={styles.body}>
        <CardTitle render={createElement('h2')}>{item.title}</CardTitle>
        <CardDescription>{item.text}</CardDescription>
      </span>
      <ArrowUpRight aria-hidden="true" className={styles.arrow} />
    </Card>
    // @cpt-end:cpt-template-site-blocks-algo-docs-blocks-template-row:p1:inst-card-link
  );
}
