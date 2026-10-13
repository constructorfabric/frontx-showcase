import { createElement, type ReactNode } from 'react';
import { CardContent, CardDescription, CardFooter, CardHeader } from '@gears-frontx/ui-kit';
import { Card, CardTitle, Text } from '@gears-frontx/kit-candidates';
import styles from './Panels.module.css';

export interface Panel {
  /** A short label above the title, such as a package path. */
  label?: string;
  title: string;
  text: string;
  /** The panel's links or buttons, one per line under the text. */
  actions?: ReactNode;
}

export interface PanelsProps {
  items: readonly Panel[];
}

// @cpt-dod:cpt-template-site-blocks-dod-docs-blocks-panels:p1
// @cpt-algo:cpt-template-site-blocks-algo-docs-blocks-panels:p1
/** Ways in, explained: kit cards two to a row, each a title, a sentence and its links. */
export function Panels({ items }: PanelsProps) {
  return (
    // @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-panels:p1:inst-grid
    <ul className={styles.grid}>
      {items.map((item) => (
        <li key={item.title} className={styles.cell}>
          {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-panels:p1:inst-grid */}
          {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-panels:p1:inst-panel */}
          <Card className={styles.card}>
            <CardHeader>
              {item.label ? (
                <Text variant="label" tone="muted" render={createElement('code')}>
                  {item.label}
                </Text>
              ) : null}
              <CardTitle render={createElement('h3')}>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{item.text}</CardDescription>
            </CardContent>
            {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-panels:p1:inst-panel */}
            {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-panels:p1:inst-actions */}
            {item.actions ? <CardFooter className={styles.actions}>{item.actions}</CardFooter> : null}
            {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-panels:p1:inst-actions */}
          </Card>
        </li>
      ))}
    </ul>
  );
}
