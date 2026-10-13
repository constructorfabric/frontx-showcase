import { createElement, type ReactNode } from 'react';
import { Separator } from '@gears-frontx/ui-kit';
import { Card, CardTitle, Text } from '@gears-frontx/kit-candidates';

import { SectionFrame } from '../SectionFrame/SectionFrame';
import styles from './MetricComparison.module.css';

export interface Metric {
  /** What is compared. */
  title: string;
  /** The measure it is read in, small at the far end of the title row; empty for none. */
  unit: string;
  /** The big statement line and the short phrase beside it. */
  statement: string;
  benefit: string;
  /** A small chart of the comparison, drawn by brand art; without one the card reserves no space for it. */
  chart?: ReactNode;
  /** What the difference comes from, under a rule. */
  explanation: string;
}

export interface MetricComparisonProps {
  /** The heading's id. */
  id: string;
  /** The section title; a newline breaks the line. */
  title: string;
  lead?: string;
  /** A small line above the lead that says what the comparison is, such as an illustrative one. */
  note?: string;
  metrics: readonly Metric[];
}

/*
 * Two ways of working compared, metric by metric: the section frame with the title, the note and the lead, three kit cards across (one column under 900px), each a title row with its unit when it has one, a statement line, a chart when it has one and an explanation under a rule, and a rule across the band's bottom edge. The block carries no figure of its own: every word on a card is a prop.
 */
// @cpt-dod:cpt-template-site-blocks-dod-section-blocks-metric-comparison:p1
// @cpt-algo:cpt-template-site-blocks-algo-section-blocks-metric-comparison:p1
export function MetricComparison({ id, title, lead, note, metrics }: MetricComparisonProps) {
  // @cpt-begin:cpt-template-site-blocks-algo-section-blocks-metric-comparison:p1:inst-frame
  return (
    <div className={styles.rhythm}>
      <SectionFrame id={id} title={title} lead={lead} note={note}>
        {/* @cpt-begin:cpt-template-site-blocks-algo-section-blocks-metric-comparison:p1:inst-cards */}
        <ul className={styles.grid}>
          {metrics.map((metric) => (
            <li key={metric.title} className={styles.cell}>
              <Card className={styles.card} data-has-chart={metric.chart ? 'true' : 'false'}>
                {/* @cpt-begin:cpt-template-site-blocks-algo-section-blocks-metric-comparison:p1:inst-card-head */}
                <div className={styles.head}>
                  <CardTitle render={createElement('h3')}>{metric.title}</CardTitle>
                  {metric.unit ? (
                    <Text variant="meta" tone="muted" render={createElement('span')} className={styles.unit}>
                      {metric.unit}
                    </Text>
                  ) : null}
                </div>
                {/* @cpt-end:cpt-template-site-blocks-algo-section-blocks-metric-comparison:p1:inst-card-head */}
                {/* @cpt-begin:cpt-template-site-blocks-algo-section-blocks-metric-comparison:p1:inst-card-statement */}
                <p className={styles.benefit}>
                  <strong className={styles.statement}>{metric.statement}</strong>
                  <Text variant="meta" tone="muted" render={createElement('span')} className={styles.benefitText}>
                    {metric.benefit}
                  </Text>
                </p>
                {/* @cpt-end:cpt-template-site-blocks-algo-section-blocks-metric-comparison:p1:inst-card-statement */}
                {/* @cpt-begin:cpt-template-site-blocks-algo-section-blocks-metric-comparison:p1:inst-card-chart */}
                {metric.chart ? <div className={styles.chart}>{metric.chart}</div> : null}
                {/* @cpt-end:cpt-template-site-blocks-algo-section-blocks-metric-comparison:p1:inst-card-chart */}
                {/* @cpt-begin:cpt-template-site-blocks-algo-section-blocks-metric-comparison:p1:inst-card-explanation */}
                <div className={styles.explanation}>
                  <Separator />
                  <Text tone="muted" className={styles.explanationText}>
                    {metric.explanation}
                  </Text>
                </div>
                {/* @cpt-end:cpt-template-site-blocks-algo-section-blocks-metric-comparison:p1:inst-card-explanation */}
              </Card>
            </li>
          ))}
        </ul>
        {/* @cpt-end:cpt-template-site-blocks-algo-section-blocks-metric-comparison:p1:inst-cards */}
      </SectionFrame>
      <Separator />
    </div>
  );
  // @cpt-end:cpt-template-site-blocks-algo-section-blocks-metric-comparison:p1:inst-frame
}
