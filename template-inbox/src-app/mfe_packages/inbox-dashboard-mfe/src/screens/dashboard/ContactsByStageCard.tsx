import { Cell, Pie, PieChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@gears-frontx/ui-kit';
import { StatDonutCard } from '@inbox-shared/blocks/StatCard';
import type { ContactStageSegment } from '@inbox-shared/api/dashboardTypes';
import type { Translate } from '@inbox-shared/i18n/translate';
import { contactsByStageChartConfig, seriesLabel } from './dashboardChartConfig';
import { contactsByStagePercent, formatCount, formatPercent } from './dashboardSelectors';

export type ContactsByStageCardProps = {
  segments: ContactStageSegment[];
  t: Translate;
};

const DONUT_DIMENSION = { width: 160, height: 160 };

/**
 * Row 1's fourth card: a
 * thick-ring donut of contact lifecycle stages plus a template-level legend
 * list under it (dot, label, count, percent) - a segmented donut with a
 * count+percent legend. The kit's `ChartLegendContent` only renders a
 * swatch-plus-label row, not the count/percent columns, so the legend
 * is the `StatDonutCard` block's own list, fed from the same `segments`
 * data and the colours the chart config resolves (the legend sits outside
 * the chart container, where its `--color-<id>` variables are not defined).
 */
export function ContactsByStageCard({ segments, t }: ContactsByStageCardProps) {
  const chartConfig = contactsByStageChartConfig(t);
  return (
    <StatDonutCard
      title={t('contacts_by_stage')}
      chart={
        <ChartContainer
          config={chartConfig}
          // The legend lists every segment's count and share in text, so the
          // donut itself is decoration to assistive technology - and holds no
          // tab stop either: Recharts' keyboard layer is off and the pie's own
          // root leaves the tab order.
          aria-hidden="true"
          initialDimension={DONUT_DIMENSION}
        >
          <PieChart accessibilityLayer={false}>
            <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="id" />} />
            <Pie
              rootTabIndex={-1}
              data={segments}
              dataKey="count"
              nameKey="id"
              innerRadius="65%"
              outerRadius="100%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {segments.map((segment) => (
                <Cell key={segment.id} fill={`var(--color-${segment.id})`} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      }
      legend={segments.map((segment) => ({
        id: segment.id,
        label: seriesLabel(chartConfig, segment.id),
        count: formatCount(segment.count),
        percent: formatPercent(contactsByStagePercent(segment, segments)),
        color: chartConfig[segment.id]?.color,
      }))}
    />
  );
}
