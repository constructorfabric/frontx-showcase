import { createElement, useId, type ReactNode } from 'react';
import { CardContent, CardFooter, CardHeader } from '@gears-frontx/ui-kit';
import { Card, CardTitle, DescriptionDetails, DescriptionItem, DescriptionList, DescriptionTerm } from '@gears-frontx/kit-candidates';
import styles from './Facts.module.css';

export interface Fact {
  label: string;
  value: string;
}

export interface FactsProps {
  title: string;
  facts: readonly Fact[];
  /** Links under the facts, one per line. */
  actions?: ReactNode;
}

// @cpt-dod:cpt-template-site-blocks-dod-docs-blocks-facts:p1
// @cpt-algo:cpt-template-site-blocks-algo-docs-blocks-facts:p1
/** What a reader should know before starting: a titled card of name and value pairs with optional actions. */
export function Facts({ title, facts, actions }: FactsProps) {
  const headingId = useId();
  return (
    // @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-facts:p1:inst-region
    <aside aria-labelledby={headingId}>
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle render={createElement('h2')} id={headingId}>
            {title}
          </CardTitle>
        </CardHeader>
        {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-facts:p1:inst-region */}
        {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-facts:p1:inst-pairs */}
        <CardContent>
          <DescriptionList>
            {facts.map((fact) => (
              <DescriptionItem key={fact.label}>
                <DescriptionTerm>{fact.label}</DescriptionTerm>
                <DescriptionDetails>{fact.value}</DescriptionDetails>
              </DescriptionItem>
            ))}
          </DescriptionList>
        </CardContent>
        {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-facts:p1:inst-pairs */}
        {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-facts:p1:inst-actions */}
        {actions ? <CardFooter className={styles.actions}>{actions}</CardFooter> : null}
        {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-facts:p1:inst-actions */}
      </Card>
    </aside>
  );
}
