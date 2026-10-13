import { Badge, type ChartConfig } from '@gears-frontx/ui-kit';
import { StatKpiCard } from '@inbox-shared/blocks/StatCard';
import type { DashboardKpiCard } from '@inbox-shared/api/dashboardTypes';
import {
  avgFirstResponseChartConfig,
  openConversationsChartConfig,
  resolvedThisWeekChartConfig,
} from './dashboardChartConfig';
import {
  deltaTone,
  formatDeltaPercent,
  formatKpiFooterValue,
  formatKpiValue,
  kpiDeltaPercent,
  kpiValue,
} from './dashboardSelectors';
import type { Translate } from '@inbox-shared/i18n/translate';
import { AreaSparkline, BarSparkline, LineSparkline } from './Sparkline';
import { kpiFooterLabel, kpiLabel } from './datasetLabels';

const CHART_CONFIG_BY_ID: Record<string, (t: Translate) => ChartConfig> = {
  'open-conversations': openConversationsChartConfig,
  'resolved-this-week': resolvedThisWeekChartConfig,
  'avg-first-response': avgFirstResponseChartConfig,
};

export type KpiCardProps = {
  kpi: DashboardKpiCard;
  t: Translate;
};

/**
 * Row 1's own card shape for its three generic KPIs: a big number, a delta
 * badge toned by whether the move is good news for this particular metric,
 * a label, a small inline chart whose type varies card to card, and a
 * footer stat. The chart type switch below keeps the row varied rather
 * than four identical widgets. Row 1's
 * fourth card, "Contacts by stage", is its own bespoke component
 * (`ContactsByStageCard`) rather than a fourth branch here - a donut with a
 * count+percent legend needs its own shape, not a `series`/`value` pair.
 */
export function KpiCard({ kpi, t }: KpiCardProps) {
  const value = kpiValue(kpi);
  const delta = kpiDeltaPercent(kpi);
  const tone = deltaTone(delta, kpi.goodWhenPositive);
  const config = (CHART_CONFIG_BY_ID[kpi.id] ?? openConversationsChartConfig)(t);

  // The value, the delta and the label already say what the sparkline
  // draws; the card hides it from assistive technology.
  return (
    <StatKpiCard
      value={formatKpiValue(kpi, value)}
      delta={<Badge variant={tone}>{formatDeltaPercent(delta)}</Badge>}
      label={kpiLabel(kpi.id, t)}
      chart={
        <>
          {kpi.chartType === 'area' && <AreaSparkline data={kpi.series} config={config} />}
          {kpi.chartType === 'bar' && <BarSparkline data={kpi.series} config={config} />}
          {kpi.chartType === 'line' && <LineSparkline data={kpi.series} config={config} />}
        </>
      }
      footer={{ label: kpiFooterLabel(kpi.id, t), value: formatKpiFooterValue(kpi) }}
    />
  );
}
