import { useMemo } from 'react';
import { useApiQuery } from '@gears-frontx/react';
import { getInboxApi } from '@inbox-shared/api/registry';
import { getDashboardApi } from '../../api/registerDashboardApi';
import type { Translate } from '@inbox-shared/i18n/translate';
import { firstPaintOf, LoadErrorPane, LoadingPane } from '@inbox-shared/ui/QueryStates';
import { ScreenHeading } from '@inbox-shared/ui/ScreenHeading';
import { Heading } from '@gears-frontx/kit-candidates';
import { PagePane, PagePaneHeader } from '@inbox-shared/blocks/PagePane';
import { CardBoard, CardRowNarrowWide, CardRowTrio, CardRowWideNarrow } from '@inbox-shared/blocks/CardGrid';
import { ActivityTable } from './ActivityTable';
import { ConversionBySourceCard } from './ConversionBySourceCard';
import { KpiRow } from './KpiRow';
import { NewContactsCard } from './NewContactsCard';
import { RecordsCreatedCard } from './RecordsCreatedCard';
import { ResolvedPerDayCard } from './ResolvedPerDayCard';
import { StageFunnelCard } from './StageFunnelCard';
import { SummaryCard } from './SummaryCard';
import { TopAgentsCard } from './TopAgentsCard';
import { WorkloadStrip } from './WorkloadStrip';
import { resolvedActivity } from './dashboardSelectors';

export type DashboardScreenProps = {
  t: Translate;
};

/**
 * The dashboard's top-level orchestration. Unlike the chat, mail and contacts
 * screens it has no secondary sidebar: a single full-width, scrollable pane
 * holding six rows - KPIs, the resolved/new-contacts/summary trio,
 * records-created plus top agents, the full-width team-workload strip, the
 * stage-funnel plus conversion-by-source pair, and finally the activity table
 * - fed by one `getDashboard` fetch plus the inbox service's own
 * `getContacts` (the activity table reuses those contact identities rather
 * than inventing new people - see `dashboardMocks.ts`).
 */
export function DashboardScreen({ t }: DashboardScreenProps) {
  // @cpt-flow:cpt-template-inbox-flow-dashboard-view-overview:p1
  // @cpt-dod:cpt-template-inbox-dod-dashboard-overview:p1
  const dashboardService = getDashboardApi();
  const inboxService = getInboxApi();

  // @cpt-begin:cpt-template-inbox-flow-dashboard-view-overview:p1:inst-read-overview-and-contacts
  const dashboardQuery = useApiQuery(dashboardService.getDashboard);
  const contactsQuery = useApiQuery(inboxService.getContacts);
  // @cpt-end:cpt-template-inbox-flow-dashboard-view-overview:p1:inst-read-overview-and-contacts

  const firstPaint = firstPaintOf([dashboardQuery, contactsQuery]);
  const data = dashboardQuery.data;
  const contacts = contactsQuery.data?.contacts;
  // One list for the summary counts and the table, so they never disagree.
  // @cpt-begin:cpt-template-inbox-flow-dashboard-view-overview:p1:inst-resolve-activity
  const activity = useMemo(
    () => (data === undefined || contacts === undefined ? [] : resolvedActivity(data.activity, contacts, data.topAgents)),
    [data, contacts]
  );
  // @cpt-end:cpt-template-inbox-flow-dashboard-view-overview:p1:inst-resolve-activity

  // The same gate and the same panes as the other three screens: each pane
  // fills the section on its own (the `PaneState` block is `flex: 1`), so the rail's
  // layout does not jump when the data arrives.
  // @cpt-begin:cpt-template-inbox-flow-dashboard-view-overview:p1:inst-gate-first-paint
  if (firstPaint.failed) return <LoadErrorPane onRetry={firstPaint.retry} t={t} />;
  if (firstPaint.loading || data === undefined || contacts === undefined) return <LoadingPane />;
  // @cpt-end:cpt-template-inbox-flow-dashboard-view-overview:p1:inst-gate-first-paint

  return (
    <PagePane>
      <PagePaneHeader heading={<Heading size="heading-2" render={<ScreenHeading />}>{t('dashboard')}</Heading>} />
      <CardBoard>
        {/* @cpt-begin:cpt-template-inbox-flow-dashboard-view-overview:p1:inst-render-kpis */}
        <KpiRow kpis={data.kpis} contactsByStage={data.contactsByStage} t={t} />
        {/* @cpt-end:cpt-template-inbox-flow-dashboard-view-overview:p1:inst-render-kpis */}

        {/* @cpt-begin:cpt-template-inbox-flow-dashboard-view-overview:p1:inst-render-trend-cards */}
        <CardRowTrio>
          <ResolvedPerDayCard data={data.resolvedPerDay} t={t} />
          <NewContactsCard newContacts={data.newContacts} t={t} />
          <SummaryCard activity={activity} trend={data.summaryTrend} t={t} />
        </CardRowTrio>
        {/* @cpt-end:cpt-template-inbox-flow-dashboard-view-overview:p1:inst-render-trend-cards */}

        {/* @cpt-begin:cpt-template-inbox-flow-dashboard-view-overview:p1:inst-render-records-and-agents */}
        <CardRowWideNarrow>
          <RecordsCreatedCard records={data.recordsCreated} t={t} />
          <TopAgentsCard agents={data.topAgents} t={t} />
        </CardRowWideNarrow>
        {/* @cpt-end:cpt-template-inbox-flow-dashboard-view-overview:p1:inst-render-records-and-agents */}

        {/* @cpt-begin:cpt-template-inbox-flow-dashboard-view-overview:p1:inst-render-workload */}
        <WorkloadStrip workload={data.workload} t={t} />
        {/* @cpt-end:cpt-template-inbox-flow-dashboard-view-overview:p1:inst-render-workload */}

        {/* @cpt-begin:cpt-template-inbox-flow-dashboard-view-overview:p1:inst-render-funnel-and-conversion */}
        <CardRowNarrowWide>
          <StageFunnelCard stages={data.stageFunnel} t={t} />
          <ConversionBySourceCard sources={data.conversionBySource} t={t} />
        </CardRowNarrowWide>
        {/* @cpt-end:cpt-template-inbox-flow-dashboard-view-overview:p1:inst-render-funnel-and-conversion */}

        {/* @cpt-begin:cpt-template-inbox-flow-dashboard-view-overview:p1:inst-render-activity-table */}
        <ActivityTable rows={activity} t={t} />
        {/* @cpt-end:cpt-template-inbox-flow-dashboard-view-overview:p1:inst-render-activity-table */}
      </CardBoard>
    </PagePane>
  );
}
