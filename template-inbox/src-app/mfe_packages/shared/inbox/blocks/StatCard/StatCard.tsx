import type { ReactElement, ReactNode } from 'react';
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle, ItemMedia } from '@gears-frontx/ui-kit';
import { DescriptionDetails, DescriptionItem, DescriptionList, DescriptionTerm, Text } from '@gears-frontx/kit-candidates';
import styles from './StatCard.module.css';

/** A name and its figure. */
export type StatPair = { label: string; value: string };

/** One headline figure of the summary: its icon, the figure, its label. */
export type StatFigure = { icon: ReactElement; value: string; label: string };

/** One row of a donut's legend; `color` is the series colour the chart config resolves. */
export type StatLegendRow = { id: string; label: string; count: string; percent: string; color?: string };

/** Name and figure pairs on the kit candidate DescriptionList, each figure at the end of its row. */
function StatPairs({ pairs }: { pairs: StatPair[] }) {
  return (
    <DescriptionList orientation="horizontal" size="sm" className={styles.pairs}>
      {pairs.map((pair) => (
        <DescriptionItem key={pair.label}>
          <DescriptionTerm>{pair.label}</DescriptionTerm>
          <DescriptionDetails>{pair.value}</DescriptionDetails>
        </DescriptionItem>
      ))}
    </DescriptionList>
  );
}

export type StatKpiCardProps = {
  value: string;
  /** The change against the previous period: a kit `Badge` toned by whether the move is good news. */
  delta: ReactNode;
  label: string;
  /** A sparkline; decoration to assistive technology, since the figure, the delta and the label say what it draws. */
  chart: ReactNode;
  footer: StatPair;
};

/** A key figure: the number with its delta, its label, a sparkline under them and one more figure in the footer. */
// @cpt-dod:cpt-template-inbox-dod-screen-frame-blocks:p2
export function StatKpiCard({ value, delta, label, chart, footer }: StatKpiCardProps) {
  return (
    <Card className={styles.card}>
      <CardContent className={styles.kpiContent}>
        <div className={styles.kpiTop}>
          <div className={styles.headline}>
            <span className={styles.kpiValue}>{value}</span>
            {delta}
          </div>
          <Text variant="meta" tone="muted" render={<span />}>
            {label}
          </Text>
        </div>
        <div className={styles.chartKpi} aria-hidden="true">
          {chart}
        </div>
      </CardContent>
      <CardFooter className={styles.footer}>
        <StatPairs pairs={[footer]} />
      </CardFooter>
    </Card>
  );
}

export type StatHeroCardProps = {
  title: string;
  value: string;
  delta: ReactNode;
  /** The figure's breakdown, one pair per part. */
  stats: StatPair[];
  /** The chart, carrying its own text alternative. */
  chart: ReactNode;
};

/** A card led by a large figure with its delta, its breakdown and a chart. */
export function StatHeroCard({ title, value, delta, stats, chart }: StatHeroCardProps) {
  return (
    <Card className={styles.card}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className={styles.heroContent}>
        <div className={styles.heroHeadline}>
          <span className={styles.heroValue}>{value}</span>
          {delta}
        </div>
        <StatPairs pairs={stats} />
        <div className={styles.chartHero}>{chart}</div>
      </CardContent>
    </Card>
  );
}

export type StatChartCardProps = {
  title: string;
  /** The chart, carrying its own text alternative. */
  chart: ReactNode;
};

/** A titled card that is one large chart. */
export function StatChartCard({ title, chart }: StatChartCardProps) {
  return (
    <Card className={styles.card}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={styles.chartLarge}>{chart}</div>
      </CardContent>
    </Card>
  );
}

export type StatSummaryCardProps = {
  title: string;
  /** The headline figures, three across. */
  figures: StatFigure[];
  /** A small trend chart under them, carrying its own text alternative. */
  chart: ReactNode;
  /** One button across the footer. */
  action: ReactNode;
};

/** Headline figures side by side, a small trend under them and one action across the footer. */
export function StatSummaryCard({ title, figures, chart, action }: StatSummaryCardProps) {
  return (
    <Card className={styles.card}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className={styles.summaryContent}>
        <div className={styles.figures}>
          {figures.map((figure) => (
            <div className={styles.figure} key={figure.label}>
              <ItemMedia variant="icon" aria-hidden="true">
                {figure.icon}
              </ItemMedia>
              <span className={styles.summaryValue}>{figure.value}</span>
              <Text variant="meta" tone="muted" render={<span />}>
                {figure.label}
              </Text>
            </div>
          ))}
        </div>
        <div className={styles.chartTrend}>{chart}</div>
      </CardContent>
      <CardFooter className={styles.actionFooter}>{action}</CardFooter>
    </Card>
  );
}

export type StatTrendCardProps = {
  title: string;
  /** A control in the header: the period select. */
  action: ReactNode;
  value: string;
  /** One line under the figure saying what it counts. */
  description: string;
  /** The chart, carrying its own text alternative. */
  chart: ReactNode;
};

/** A large figure over a tall trend chart, with a control in the header. */
export function StatTrendCard({ title, action, value, description, chart }: StatTrendCardProps) {
  return (
    <Card className={styles.card}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardAction>{action}</CardAction>
      </CardHeader>
      <CardContent className={styles.figureContent}>
        <span className={styles.heroValue}>{value}</span>
        <Text variant="meta" tone="muted">
          {description}
        </Text>
        <div className={styles.chartTall}>{chart}</div>
      </CardContent>
    </Card>
  );
}

export type StatBreakdownCardProps = {
  title: string;
  value: string;
  /** One line under the figure saying what it counts. */
  description: string;
  /** The chart breaking the figure down, carrying its own text alternative. */
  chart: ReactNode;
};

/** A large figure over the chart that breaks it down. */
export function StatBreakdownCard({ title, value, description, chart }: StatBreakdownCardProps) {
  return (
    <Card className={styles.card}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className={styles.figureContent}>
        <span className={styles.heroValue}>{value}</span>
        <Text variant="meta" tone="muted">
          {description}
        </Text>
        <div className={styles.chartBreakdown}>{chart}</div>
      </CardContent>
    </Card>
  );
}

export type StatDonutCardProps = {
  title: string;
  /** The donut; the legend lists every share in text, so the chart may be decoration. */
  chart: ReactNode;
  legend: StatLegendRow[];
};

/** A donut over a legend that lists each segment's count and share. */
export function StatDonutCard({ title, chart, legend }: StatDonutCardProps) {
  return (
    <Card className={styles.card}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className={styles.donutContent}>
        <div className={styles.chartDonut}>{chart}</div>
        <ul className={styles.legend}>
          {legend.map((row) => (
            <li className={styles.legendRow} key={row.id}>
              {/* The series colour is data from the chart config: the legend sits outside the chart container whose `--color-<id>` variables would name it. */}
              <span className={styles.legendDot} style={{ background: row.color }} aria-hidden="true" />
              <Text variant="meta" render={<span />} className={styles.legendLabel}>
                {row.label}
              </Text>
              <Text variant="meta" render={<span />} className={styles.legendCount}>
                {row.count}
              </Text>
              <Text variant="meta" tone="muted" render={<span />} className={styles.legendPercent}>
                {row.percent}
              </Text>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
