import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, YAxis } from 'recharts';
import { ChartContainer, type ChartConfig } from '@gears-frontx/ui-kit';
import styles from './ChartThumb.module.css';

export type ChartThumbName = 'area' | 'bar' | 'distribution' | 'trends';

export interface ChartThumbProps {
  chart: ChartThumbName;
  /** The distribution donut's label in its hole. */
  centre?: string;
  /** The trend's caption above the line: a label and a value at the far end. */
  caption?: { label: string; value: string };
}

// Recharts sizes its drawing from the container; the first paint (and a test DOM without layout) needs a starting size.
const INITIAL = { width: 220, height: 112 };

// @cpt-begin:cpt-template-site-brand-algo-brand-art-chart-art:p2:inst-series
// The brand blue against the purple over eight points, on a fixed 0 to 80 scale, so every thumbnail starts and peaks at the same place.
const series = [20, 32, 28, 46, 40, 60, 54, 72].map((value, index) => ({ index, value, other: [10, 18, 23, 25, 32, 38, 42, 49][index] }));
const SCALE: [number, number] = [0, 80];
const MARGIN = { top: 5, right: 5, bottom: 5, left: 5 };
const parts = [
  { id: 'first', share: 48 },
  { id: 'second', share: 32 },
  { id: 'third', share: 20 },
];
// @cpt-end:cpt-template-site-brand-algo-brand-art-chart-art:p2:inst-series

// The purple and the pale blue come from the thumbnail's palette, set on the container by the module.
const pairConfig = { value: { color: 'var(--primary)' }, other: { color: 'var(--chart-thumb-purple)' } } satisfies ChartConfig;
const partsConfig = {
  first: { color: 'var(--primary)' },
  second: { color: 'var(--chart-thumb-purple)' },
  third: { color: 'var(--chart-thumb-pale)' },
} satisfies ChartConfig;
const trendConfig = { value: { color: 'var(--chart-thumb-purple)' } } satisfies ChartConfig;

// @cpt-begin:cpt-template-site-brand-algo-brand-art-chart-art:p2:inst-area
function AreaThumb() {
  return (
    <ChartContainer config={pairConfig} className={styles.chart} initialDimension={INITIAL}>
      <AreaChart data={series} margin={MARGIN}>
        <YAxis hide domain={SCALE} />
        <Area type="linear" dataKey="other" stroke="var(--color-other)" strokeWidth={2} fill="var(--color-other)" fillOpacity={0.15} isAnimationActive={false} />
        <Area type="linear" dataKey="value" stroke="var(--color-value)" strokeWidth={2} fill="var(--color-value)" fillOpacity={0.08} isAnimationActive={false} />
      </AreaChart>
    </ChartContainer>
  );
}
// @cpt-end:cpt-template-site-brand-algo-brand-art-chart-art:p2:inst-area

// @cpt-begin:cpt-template-site-brand-algo-brand-art-chart-art:p2:inst-bar
function BarThumb() {
  return (
    <ChartContainer config={pairConfig} className={styles.chart} initialDimension={INITIAL}>
      {/* Bars at most 12px wide with 3px between the two of a pair, rounded on top only. */}
      <BarChart data={series} margin={MARGIN} barGap={3} maxBarSize={12}>
        <YAxis hide domain={SCALE} />
        <Bar dataKey="value" fill="var(--color-value)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
        <Bar dataKey="other" fill="var(--color-other)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ChartContainer>
  );
}
// @cpt-end:cpt-template-site-brand-algo-brand-art-chart-art:p2:inst-bar

// @cpt-begin:cpt-template-site-brand-algo-brand-art-chart-art:p2:inst-distribution
function DistributionThumb({ centre }: { centre?: string }) {
  return (
    <div className={styles.donut}>
      <ChartContainer config={partsConfig} className={styles.chart} initialDimension={INITIAL}>
        <PieChart>
          <Pie data={parts} dataKey="share" nameKey="id" innerRadius="62%" outerRadius="88%" paddingAngle={5} strokeWidth={0} isAnimationActive={false}>
            {parts.map((part) => (
              <Cell key={part.id} fill={`var(--color-${part.id})`} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      {centre ? <span className={styles.centre}>{centre}</span> : null}
    </div>
  );
}
// @cpt-end:cpt-template-site-brand-algo-brand-art-chart-art:p2:inst-distribution

// @cpt-begin:cpt-template-site-brand-algo-brand-art-chart-art:p2:inst-trends
function TrendThumb({ caption }: { caption?: { label: string; value: string } }) {
  return (
    <div className={styles.trend}>
      {caption ? (
        <span className={styles.caption}>
          {caption.label}
          <span>{caption.value}</span>
        </span>
      ) : null}
      <ChartContainer config={trendConfig} className={styles.chart} initialDimension={INITIAL}>
        <AreaChart data={series} margin={MARGIN}>
          <YAxis hide domain={SCALE} />
          <Area type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} fill="var(--color-value)" fillOpacity={0.2} isAnimationActive={false} />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
// @cpt-end:cpt-template-site-brand-algo-brand-art-chart-art:p2:inst-trends

// @cpt-algo:cpt-template-site-brand-algo-brand-art-chart-art:p2
/**
 * A small decorative chart drawn with the kit's chart container and Recharts primitives from a fixed synthetic series: no axes, labels or tooltips, for a tile that links to a chart page. It fills the width of its slot at a fixed height. Fills the kit gap "chart thumbnail": the kit's charts are full components with axes and legends.
 */
export function ChartThumb({ chart, centre, caption }: ChartThumbProps) {
  // @cpt-begin:cpt-template-site-brand-algo-brand-art-chart-art:p2:inst-thumb
  switch (chart) {
    case 'area':
      return <AreaThumb />;
    case 'bar':
      return <BarThumb />;
    case 'distribution':
      return <DistributionThumb centre={centre} />;
    case 'trends':
      return <TrendThumb caption={caption} />;
  }
  // @cpt-end:cpt-template-site-brand-algo-brand-art-chart-art:p2:inst-thumb
}
