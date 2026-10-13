import type { ContactStageSegment, DashboardKpiCard } from '@inbox-shared/api/dashboardTypes';
import type { Translate } from '@inbox-shared/i18n/translate';
import { CardRowQuad } from '@inbox-shared/blocks/CardGrid';
import { ContactsByStageCard } from './ContactsByStageCard';
import { KpiCard } from './KpiCard';

export type KpiRowProps = {
  kpis: DashboardKpiCard[];
  contactsByStage: ContactStageSegment[];
  t: Translate;
};

export function KpiRow({ kpis, contactsByStage, t }: KpiRowProps) {
  return (
    <CardRowQuad>
      {kpis.map((kpi) => (
        <KpiCard key={kpi.id} kpi={kpi} t={t} />
      ))}
      <ContactsByStageCard segments={contactsByStage} t={t} />
    </CardRowQuad>
  );
}
