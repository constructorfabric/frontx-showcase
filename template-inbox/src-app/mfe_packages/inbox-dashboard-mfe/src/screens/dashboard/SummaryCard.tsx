import { useId } from 'react';
import { CircleAlertIcon, ClockIcon, MessageSquareIcon } from 'lucide-react';
import { Area, AreaChart } from 'recharts';
import { Button, ChartContainer } from '@gears-frontx/ui-kit';
import { StatSummaryCard } from '@inbox-shared/blocks/StatCard';
import type { ActivityItem } from '@inbox-shared/api/dashboardTypes';
import type { Translate } from '@inbox-shared/i18n/translate';
import { labelOf } from '@inbox-shared/ui/format';
import { summaryTrendChartConfig } from './dashboardChartConfig';
import { chartSummary } from './chartSummary';
import { formatCount } from './dashboardSelectors';

export type SummaryCardProps = {
  activity: ActivityItem[];
  trend: number[];
  t: Translate;
};

const CHART_DIMENSION = { width: 200, height: 48 };
const CHART_MARGIN = { top: 4, right: 4, bottom: 0, left: 4 };

/**
 * Row 2's third block: three icon-stat cells counted straight from the same
 * activity collection row 6's table renders (never a separately-stored
 * total), a small gradient-filled trend area, and one CTA button that stays
 * inert - this
 * template ships no report screen behind it, so it stays disabled rather
 * than silently doing nothing (same reasoning as the rail's profile menu
 * items).
 */
export function SummaryCard({ activity, trend, t }: SummaryCardProps) {
  const gradientId = `dashboard-summary-fill-${useId()}`;
  const openCount = activity.filter((item) => item.status === 'open').length;
  const pendingCount = activity.filter((item) => item.status === 'pending').length;
  const escalatedCount = activity.filter((item) => item.status === 'escalated').length;

  const trendData = trend.map((value, index) => ({ index, value }));

  return (
    <StatSummaryCard
      title={t('summary')}
      figures={[
        { icon: <MessageSquareIcon />, value: formatCount(openCount), label: labelOf('open', t) },
        { icon: <ClockIcon />, value: formatCount(pendingCount), label: labelOf('pending', t) },
        { icon: <CircleAlertIcon />, value: formatCount(escalatedCount), label: labelOf('escalated', t) },
      ]}
      chart={
        <ChartContainer
          config={summaryTrendChartConfig(t)}
          role="img"
          aria-label={chartSummary(
            t('chart_activity_trend'),
            trend.map((value) => ({ label: '', value: formatCount(value) })),
            t
          )}
          initialDimension={CHART_DIMENSION}
        >
          <AreaChart data={trendData} margin={CHART_MARGIN} accessibilityLayer={false}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={2}
              fill={`url(#${gradientId})`}
            />
          </AreaChart>
        </ChartContainer>
      }
      action={
        <Button variant="outline" disabled>
          {t('view_report')}
        </Button>
      }
    />
  );
}
