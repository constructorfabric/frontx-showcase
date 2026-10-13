/**
 * Dashboard domain - the mock map for `DashboardApiService`.
 *
 * One entry, matching the one endpoint the service exposes - see its own doc
 * comment for why this screen answers through a single response rather than
 * one per section the way mail's mailboxes/mails/messages do. Nothing here is
 * written to, so the factory answers with a fresh copy of the seed.
 *
 * The activity rows point at the inbox's contacts, and this is the one place
 * the two datasets meet: the ids are read here, from this package's own copy
 * of the inbox mock store (`mockStore.ts`), the one its contacts reads answer
 * from, and handed to `createActivity`, so neither dataset imports the other
 * and every row names a person the package's contacts list holds. The rest of the overview is this package's
 * own seed: no other screen reads it.
 */

import {
  contactsByStage,
  conversionBySource,
  createActivity,
  kpiCards,
  newContacts,
  recordsCreated,
  resolvedPerDay,
  stageFunnel,
  summaryTrend,
  topAgents,
  workload,
} from './dashboardDataset';
import type { GetDashboardResponse } from '@inbox-shared/api/dashboardTypes';
import { readInboxMockState } from '@inbox-shared/api/mockStore';
import type { MockMap } from '@gears-frontx/react';

// @cpt-algo:cpt-template-inbox-algo-dashboard-overview-answer:p2
// @cpt-dod:cpt-template-inbox-dod-dashboard-service:p1
/** The whole overview response, exactly as the endpoint serves it. */
export const createDashboardOverview = (): GetDashboardResponse =>
  structuredClone({
    // @cpt-begin:cpt-template-inbox-algo-dashboard-overview-answer:p2:inst-copy-seed
    kpis: kpiCards,
    resolvedPerDay,
    newContacts,
    summaryTrend,
    recordsCreated,
    contactsByStage,
    workload,
    stageFunnel,
    conversionBySource,
    topAgents,
    // @cpt-end:cpt-template-inbox-algo-dashboard-overview-answer:p2:inst-copy-seed
    // @cpt-begin:cpt-template-inbox-algo-dashboard-overview-answer:p2:inst-activity-from-contacts
    activity: createActivity(readInboxMockState().contacts.map((contact) => contact.id)),
    // @cpt-end:cpt-template-inbox-algo-dashboard-overview-answer:p2:inst-activity-from-contacts
  });

export const dashboardMockMap: MockMap = {
  // @cpt-begin:cpt-template-inbox-algo-dashboard-overview-answer:p2:inst-serve-overview
  'GET /api/dashboard/overview': (): GetDashboardResponse => createDashboardOverview(),
  // @cpt-end:cpt-template-inbox-algo-dashboard-overview-answer:p2:inst-serve-overview
};
