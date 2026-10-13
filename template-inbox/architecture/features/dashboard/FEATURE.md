# Feature: Dashboard Screen

<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [View the overview](#view-the-overview)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Answer the overview in the mock backend](#answer-the-overview-in-the-mock-backend)
  - [Resolve the activity rows](#resolve-the-activity-rows)
  - [Summarize a chart](#summarize-a-chart)
  - [Register the dashboard's services](#register-the-dashboards-services)
- [4. States (CDSL)](#4-states-cdsl)
  - [No feature-owned state machine](#no-feature-owned-state-machine)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Overview screen](#overview-screen)
  - [Overview service](#overview-service)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

- [x] `p3` - **ID**: `cpt-template-inbox-featstatus-dashboard`

- [x] `p3` - `cpt-template-inbox-feature-dashboard`

## 1. Feature Context

### 1.1 Overview

The dashboard screen is the package `inbox-dashboard-mfe`: the overview service and its seed, and one scrollable pane of six rows: KPI cards with sparklines; the resolved-per-day chart, the new-contacts card and the summary card; the records-created chart and the top agents; the team workload strip; the stage funnel and conversion by source; and the recent activity table, whose people are contacts the package lists. The screen and its cards import no stylesheet: they draw through the blocks of `shared/inbox/blocks/` (the page pane, the card board and its row arrangements, the stat card arrangements, the data table section), kit components and the kit candidates.

### 1.2 Purpose

The dashboard shows the inbox's people and work from a team's point of view. It reads its own overview in one request and the inbox's contacts, resolves every activity row against both so a row names a person the package's contacts list holds, gives every chart a text alternative, and keeps no state of its own and writes nothing.

**Requirements**: `cpt-template-inbox-fr-dashboard`, `cpt-template-inbox-fr-mock-backend`, `cpt-template-inbox-fr-host-navigation`, `cpt-template-inbox-fr-page-metadata`

**Principles**: `cpt-template-inbox-principle-kit-first`

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-inbox-actor-inbox-user` | Reads the team's figures, charts and recent activity, and pages and sorts the activity table |
| `cpt-template-inbox-actor-inbox-backend` | Stands in place of the mock answer once a project attaches it, serving the overview endpoint |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md), component `cpt-template-inbox-component-dashboard-screen`
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.7
- **ADRs**: `cpt-template-inbox-adr-package-mock-backend`
- **Code**: `src-app/mfe_packages/inbox-dashboard-mfe/` (paths relative to `template-inbox/`): `src/api/`, `src/screens/dashboard/`, `src/routes.tsx`, `src/lifecycle.tsx`, `src/init.ts`, and the manifest `mfe.json`
- **Dependencies**: [Inbox Data](../data/FEATURE.md) (the contacts read, the package's mock state the activity rows are built from, the overview's response type), [Screen Frame and Shared UI](../screen-frame/FEATURE.md) (lifecycle, app builder, frame, shared components, blocks, first-paint gate)

## 2. Actor Flows (CDSL)

User-facing interactions that start with an actor and describe the end-to-end flow of a use case.

### View the overview

- [x] `p1` - **ID**: `cpt-template-inbox-flow-dashboard-view-overview`

**Actor**: `cpt-template-inbox-actor-inbox-user`

**Success Scenarios**:
- The user opens the screen: the six rows render from one overview answer and the contacts read, and the activity table lists only rows whose contact and agent are known

**Error Scenarios**:
- The overview or the contacts fail to load: the screen shows an error with a retry instead of a blank pane

**Steps**:
1. [x] - `p1` - API: GET /api/dashboard/overview through the overview service and GET /api/inbox/contacts through the inbox service, both through the page-wide query cache - `inst-read-overview-and-contacts`
2. [x] - `p1` - Resolve the activity rows against the contacts and the top agents once, for both the summary counts and the table (algorithm Resolve the activity rows) - `inst-resolve-activity`
3. [x] - `p1` - **IF** either read failed, show the error pane with a retry; **ELSE IF** either is still loading, show the loading pane - `inst-gate-first-paint`
4. [x] - `p1` - Render the KPI row: each card with its value, delta and sparkline - `inst-render-kpis`
5. [x] - `p1` - Render the resolved-per-day chart, the new-contacts card and the summary card, each chart labelled with its text alternative (algorithm Summarize a chart) - `inst-render-trend-cards`
6. [x] - `p1` - Render the records-created chart and the top agents - `inst-render-records-and-agents`
7. [x] - `p1` - Render the team workload strip - `inst-render-workload`
8. [x] - `p1` - Render the stage funnel and conversion by source - `inst-render-funnel-and-conversion`
9. [x] - `p1` - Render the activity table, which pages and sorts its rows - `inst-render-activity-table`

## 3. Processes / Business Logic (CDSL)

Internal functions the flow above calls.

### Answer the overview in the mock backend

- [x] `p2` - **ID**: `cpt-template-inbox-algo-dashboard-overview-answer`

**Input**: A GET /api/dashboard/overview request

**Output**: The whole overview in one response

**Steps**:
1. [x] - `p2` - Copy the seed's KPI cards, resolved-per-day, new-contacts, summary trend, records-created, contacts-by-stage, workload, stage funnel, conversion-by-source and top-agents sections - `inst-copy-seed`
2. [x] - `p2` - Build the activity rows from the ids of the contacts in the package's inbox mock state, read on each request - `inst-activity-from-contacts`
3. [x] - `p2` - **FOR EACH** of 26 rows, cycle through the contact ids, the kinds, the statuses and the top agents, with instants relative to the seed clock; no rows when there are no contacts - `inst-cycle-activity-rows`
4. [x] - `p2` - **RETURN** the overview as the endpoint's answer - `inst-serve-overview`

### Resolve the activity rows

- [x] `p2` - **ID**: `cpt-template-inbox-algo-dashboard-resolve-activity`

**Input**: The overview's activity rows, the contacts, the top agents

**Output**: The rows with their contact and owner name

**Steps**:
1. [x] - `p2` - Index the contacts by id and the agents' names by id - `inst-index-contacts-and-agents`
2. [x] - `p2` - **FOR EACH** row, keep it with its contact and owner name only when both are known, leaving out a row that would render half empty - `inst-keep-complete-rows`

### Summarize a chart

- [x] `p2` - **ID**: `cpt-template-inbox-algo-dashboard-chart-summary`

**Input**: A chart's title, its plotted points, the translator

**Output**: One sentence a screen reader reads in place of the drawing

**Steps**:
1. [x] - `p2` - **RETURN** the title and every point, a labelled point as label and value and a bare trend point as its value, joined as a list in the app's locale through the catalogue's wording - `inst-summarize-points`

### Register the dashboard's services

- [x] `p2` - **ID**: `cpt-template-inbox-algo-dashboard-register-services`

**Input**: The package's first load

**Output**: The package's app with the inbox and overview services registered

**Steps**:
1. [x] - `p2` - The overview service declares its mock plugin over the overview mock map without switching it on - `inst-declare-mock`
2. [x] - `p2` - Register the overview service once - `inst-register-once`
3. [x] - `p2` - Register the inbox service and the overview service, initialize the registry and build the app through the shared app builder; no slice is registered - `inst-register-and-build`

## 4. States (CDSL)

### No feature-owned state machine

Not applicable. The dashboard keeps no slice and writes nothing; what it shows is the overview and the contacts the page-wide query cache holds, and the activity table's sort order and page are the kit data table's own state.

## 5. Definitions of Done

### Overview screen

- [x] `p1` - **ID**: `cpt-template-inbox-dod-dashboard-overview`

The system **MUST** render the six rows from one overview read and the contacts read, list in the activity table only rows whose contact and owner are known, give every chart a text alternative, use only passing kit tones, draw every card and row through the inbox blocks with no stylesheet of its own, and show an error with a retry when a read fails.

**Implements**:
- `cpt-template-inbox-flow-dashboard-view-overview`
- `cpt-template-inbox-algo-dashboard-resolve-activity`
- `cpt-template-inbox-algo-dashboard-chart-summary`

**Constraints**: `cpt-template-inbox-constraint-kit-gaps`

**Touches**:
- API: `GET /api/dashboard/overview`, `GET /api/inbox/contacts`
- Entities: `Dashboard overview`, `Contact`

### Overview service

- [x] `p1` - **ID**: `cpt-template-inbox-dod-dashboard-service`

The system **MUST** register the overview service in the package beside the inbox service and answer the overview as one whole response whose activity rows name the contacts of the package's mock state.

**Implements**:
- `cpt-template-inbox-algo-dashboard-overview-answer`
- `cpt-template-inbox-algo-dashboard-register-services`

**Constraints**: `cpt-template-inbox-constraint-collection-endpoints`

**Touches**:
- API: `GET /api/dashboard/overview`
- Entities: `Dashboard overview`, `Contact`

## 6. Acceptance Criteria

- [x] Every row renders: the KPI cards with delta badges computed from their series, the resolved-per-day chart, the new-contacts card and the summary card, the records-created chart and the ranked top agents, the workload strip, the stage funnel and conversion by source, and the activity table with contacts resolved from the inbox data (`src/screens/dashboard/DashboardScreen.test.tsx`)
- [x] A failed read shows an error with a retry, and the loading state lasts until both reads answered (`src/screens/dashboard/DashboardScreen.test.tsx`)
- [x] Every chart has a text alternative and decorative ones are hidden, inside the shadow root too (`src/screens/dashboard/DashboardScreen.test.tsx`, `src/lifecycle.test.tsx`)
- [x] The activity table pages and sorts (`src/screens/dashboard/DashboardScreen.test.tsx`)
- [x] The top agents are a ranked list of list items and every workload bar is named by its metric (`src/screens/dashboard/DashboardScreen.test.tsx`); the card board, the stat cards and the data table section render their content with no accessibility violation (`inbox-contacts-mfe/src/shared-inbox/blocks/CardGrid.test.tsx`, `StatCard.test.tsx`, `DataTableSection.test.tsx`)
- [x] The service answers the whole overview from the seed instead of the network, and every activity row points at a contact the package lists and a roster agent, with the people read from the package's mock state at request time (`src/api/DashboardApiService.test.ts`, `src/api/activityContacts.test.ts`, `src/api/dashboardDataset.test.ts`)
- [x] The KPI, delta, totals and funnel calculations hold (`src/screens/dashboard/dashboardSelectors.test.ts`)
- [x] An address naming no page of the screen shows the screen's not-found page, and the document title is left to the site (`src/routes.test.tsx`, `src/lifecycle.test.tsx`)
- [x] The manifest lists the screen in the demos nav group at order 62 with its `seo` block (`src/manifest.test.ts`)
