import { MetricBars } from '@gears-frontx/site-brand/art/MetricBars';
import { MetricComparison } from './MetricComparison';

const bars = (scratch: number, frontx: number) => <MetricBars bars={[{ label: 'From scratch', share: scratch, tone: 'reference' }, { label: 'With FrontX', share: frontx, tone: 'featured' }]} />;

export const showcase = { title: 'Metric comparison', group: 'section', summary: 'Two ways of working compared, metric by metric: a title with its unit, a statement, a chart and an explanation per card.', fullBleed: true } as const;

export default function MetricComparisonShowcase() {
  return (
    <MetricComparison
      id="showcase-metric-comparison"
      title={'Your AI agent.\nWith a ready-made foundation.'}
      lead="AI helps you code in both cases. The difference is what you start with."
      note="Illustrative comparison"
      metrics={[
        { title: 'First-screen delivery speed', unit: 'relative', statement: 'Faster', benefit: 'delivery', chart: bars(49, 84), explanation: 'Reach the first screen sooner. Start with Shell and screen templates instead of assembling the application structure.' },
        { title: 'Review efficiency', unit: 'relative', statement: 'Fewer', benefit: 'corrections per change', chart: bars(39, 79), explanation: 'UI Kit components and Design Guardrails give developers and AI agents shared conventions, so a change needs fewer corrections.' },
        { title: 'Regression checks passed', unit: 'share', statement: 'More', benefit: 'checks passed', chart: bars(81, 94), explanation: 'Use shared conventions as a basis for review. Your team still defines and runs the checks.' },
      ]}
    />
  );
}
