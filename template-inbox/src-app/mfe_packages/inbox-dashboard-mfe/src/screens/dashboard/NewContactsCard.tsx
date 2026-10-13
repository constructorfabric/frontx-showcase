import { Bar, ComposedChart, Line, XAxis } from 'recharts';
import { Badge, ChartContainer, ChartTooltip, ChartTooltipContent } from '@gears-frontx/ui-kit';
import { StatHeroCard } from '@inbox-shared/blocks/StatCard';
import type { NewContactsSeries } from '@inbox-shared/api/dashboardTypes';
import { weekdayLabel } from '@inbox-shared/ui/format';
import type { Translate } from '@inbox-shared/i18n/translate';
import { chartSummary } from './chartSummary';
import { newContactsChartConfig } from './dashboardChartConfig';
import {
  deltaTone,
  formatCount,
  formatDeltaPercent,
  newContactsDeltaPercent,
  newContactsInboundTotal,
  newContactsOutboundTotal,
  newContactsTotal,
} from './dashboardSelectors';

export type NewContactsCardProps = {
  newContacts: NewContactsSeries;
  t: Translate;
};

const CHART_DIMENSION = { width: 320, height: 140 };
const CHART_MARGIN = { top: 4, right: 4, bottom: 0, left: 4 };

/**
 * Row 2's compound hero card: a big number, a delta badge, an Inbound/
 * Outbound breakdown, and a combo chart - a subtle, low-opacity bar for the
 * inbound volume with a bold line for the combined daily total riding over
 * it, so the line reads as the hero and the bars as its context.
 */
export function NewContactsCard({ newContacts, t }: NewContactsCardProps) {
  const total = newContactsTotal(newContacts.series);
  const delta = newContactsDeltaPercent(newContacts);
  const tone = deltaTone(delta, true);
  const inboundTotal = newContactsInboundTotal(newContacts);
  const outboundTotal = newContactsOutboundTotal(newContacts);

  const chartData = newContacts.series.map((point) => ({
    day: weekdayLabel(point.day),
    inbound: point.inbound,
    total: point.inbound + point.outbound,
  }));

  return (
    <StatHeroCard
      title={t('new_contacts')}
      value={formatCount(total)}
      delta={<Badge variant={tone}>{formatDeltaPercent(delta)}</Badge>}
      stats={[
        { label: t('inbound'), value: formatCount(inboundTotal) },
        { label: t('outbound'), value: formatCount(outboundTotal) },
      ]}
      chart={
        <ChartContainer
          config={newContactsChartConfig(t)}
          role="img"
          aria-label={chartSummary(
            t('new_contacts'),
            chartData.map((point) => ({
              label: point.day,
              value: t('chart_new_contacts_day', {
                inbound: formatCount(point.inbound),
                total: formatCount(point.total),
              }),
            })),
            t
          )}
          initialDimension={CHART_DIMENSION}
        >
          <ComposedChart data={chartData} margin={CHART_MARGIN}>
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              fontSize={11}
              stroke="var(--muted-foreground)"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="inbound"
              fill="var(--color-inbound)"
              fillOpacity={0.35}
              radius={[4, 4, 0, 0]}
              barSize={16}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="var(--color-total)"
              strokeWidth={2.5}
              dot={false}
            />
          </ComposedChart>
        </ChartContainer>
      }
    />
  );
}
