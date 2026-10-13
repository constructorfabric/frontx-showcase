import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts';
import { ChartContainer, type ChartConfig } from '@gears-frontx/ui-kit';
import styles from './MetricBars.module.css';

export interface MetricBar {
  /** The bar's label; a newline breaks it onto a second line. */
  label: string;
  /** The bar's length as a share of the full width, 0 to 100. Only the proportion is drawn; no figure is shown. */
  share: number;
  /** `reference` is the way of working compared against (purple), `featured` the one the card argues for (brand blue). */
  tone: 'reference' | 'featured';
}

export interface MetricBarsProps {
  bars: readonly MetricBar[];
}

const barsConfig = { reference: { color: 'var(--metric-bars-reference)' }, featured: { color: 'var(--primary)' } } satisfies ChartConfig;
const INITIAL = { width: 369, height: 104 };
// The label column: the label ends 8px before the bars.
const LABEL_COLUMN = 92;
const LABEL_GAP = 8;
const LABEL_LINE = 11;

// @cpt-algo:cpt-template-site-brand-algo-brand-art-chart-art:p2
// @cpt-begin:cpt-template-site-brand-algo-brand-art-chart-art:p2:inst-bar-label
/** A bar's label, right-aligned and centred on its bar; a newline in the label breaks the line. Drawn by hand: Recharts' own wrapping measures words outside the page's shadow root, in another font. */
function BarLabel({ y, payload }: { y?: number | string; payload?: { value?: string | number } }) {
  const lines = String(payload?.value ?? '').split('\n');
  const centre = Number(y ?? 0);
  return (
    <text x={LABEL_COLUMN - LABEL_GAP} y={centre - ((lines.length - 1) * LABEL_LINE) / 2} textAnchor="end" dominantBaseline="central" className={styles.label}>
      {lines.map((line, index) => (
        <tspan key={line} x={LABEL_COLUMN - LABEL_GAP} dy={index === 0 ? 0 : LABEL_LINE}>
          {line}
        </tspan>
      ))}
    </text>
  );
}
// @cpt-end:cpt-template-site-brand-algo-brand-art-chart-art:p2:inst-bar-label

/** Two or more labelled horizontal bars without figures, for a card that compares ways of working by proportion only. Drawn with the kit's chart container and Recharts primitives; it fills the width of its slot at a fixed height. */
export function MetricBars({ bars }: MetricBarsProps) {
  // @cpt-begin:cpt-template-site-brand-algo-brand-art-chart-art:p2:inst-bars
  return (
    <ChartContainer config={barsConfig} className={styles.chart} initialDimension={INITIAL}>
      <BarChart data={[...bars]} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 0 }} barCategoryGap={15}>
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis type="category" dataKey="label" width={LABEL_COLUMN} tickLine={false} axisLine={false} tick={<BarLabel />} />
        <Bar dataKey="share" radius={[0, 5, 5, 0]} barSize={18} isAnimationActive={false}>
          {bars.map((bar) => (
            <Cell key={bar.label} fill={`var(--color-${bar.tone})`} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
  // @cpt-end:cpt-template-site-brand-algo-brand-art-chart-art:p2:inst-bars
}
