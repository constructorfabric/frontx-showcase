---
status: accepted
date: 2026-10-12
---

# The Screens Read and Write Through FrontX's Shared Query Cache and Keep Their Own State in FrontX Slices

<!-- toc -->

- [Context and Problem Statement](#context-and-problem-statement)
- [Decision Drivers](#decision-drivers)
- [Considered Options](#considered-options)
- [Decision Outcome](#decision-outcome)
  - [Consequences](#consequences)
  - [Confirmation](#confirmation)
- [Pros and Cons of the Options](#pros-and-cons-of-the-options)
  - [The template's own data and state layers](#the-templates-own-data-and-state-layers)
  - [FrontX's data and state layers](#frontxs-data-and-state-layers)
- [More Information](#more-information)
- [Traceability](#traceability)

<!-- /toc -->

**ID**: `cpt-template-inbox-adr-frontx-data-and-state-layers`

## Context and Problem Statement

The inbox screens need three things beside the mock backend: a way to read and write the services' data, a way for a write to reach every read it changed, and a place for what each screen keeps for itself across visits (the open conversation, search, filters, drafts). The app this template was adapted from solved all three on its own: its own query hooks with a cache that lived for the page and an epoch counter that dropped every read on a write, its own mock transport, and module-level stores per screen. FrontX ships each of these: query hooks over a QueryClient the host shares with every screen, a mock transport the host template supplies, and state slices with events, actions and effects in each package's store. Which layer do the screens use for server data, for keeping reads in step with writes and for their own state?

## Decision Drivers

* **Built from the ecosystem only** - the template demonstrates FrontX; a screen-private cache, transport or store demonstrates something else (PRD goal "Built from the ecosystem only").
* **Reads in step with writes** - a write must reach every read it changed, in every package that holds that read in the shared cache, including packages loaded later; what the refetch answers is the package's own mock state (`cpt-template-inbox-adr-package-mock-backend`), or the server once a backend is attached.
* **Instant return** - a screen must paint from what the page already read, without its loading state.
* **A place that outlives the mount** - a screen's own choices must survive its unmount without module-level variables, which exist once per package load and are invisible to the framework.
* **One switch to a backend** - the data layer must not change when the mocks are turned off.

## Considered Options

* **The template's own data and state layers** - own query hooks with a page-lifetime cache and an epoch that drops every read on a write, an own mock transport, and module-level stores per screen.
* **FrontX's data and state layers** - the screens read and write with FrontX's query hooks over the host's page-wide QueryClient, a write invalidates exactly the reads it changed, the services use the host template's mock transport, and each screen keeps its own state in a FrontX slice registered in its package's store.

## Decision Outcome

Chosen option: "FrontX's data and state layers", because it meets every driver with the ecosystem's own parts, and the own layers duplicate what FrontX ships while dropping more reads than a write changed.

The screens read with FrontX's query hook and write with its mutation hook. Each package's app joins the QueryClient the host owns for the page, so every package that reads the same request reads the same cache entry. A write names, on success, the reads it changed, and those are fetched again in every package that shows them (a chat post: messages and conversations; a started conversation: conversations and contacts; a sent mail: mails). Every service declares the host template's mock transport, and the framework's mock switch turns it on for every package. What a screen keeps across visits is a FrontX slice in its package's store (contacts, chat and mail each have one; the dashboard keeps nothing): components read it through the store selector and call actions, an action emits one event, and only the effects change the slice. Every package builds its app in one shared order, with the mock switch before the shared query cache, so that a package loading for the first time does not clear the reads other screens already made.

### Consequences

* Good, because the screens show the ecosystem's data and state layers at work, the purpose of the template.
* Good, because a write invalidates only what it changed, and a read nobody invalidated paints at once from the cache, including after another package loaded.
* Good, because the mock switch, the cache and the slices stay the same when a backend replaces the mocks.
* Bad, because the screens inherit the framework's gaps: the mock transport answers only with success, so a refused write is thrown from the mock as an error that carries a status; the query hook overrides the cache's default staleness, so a screen refetches in the background on every mount; and the shared cache clears itself on the mock switch's initial announcement unless the switch is built first. Each is worked around in one place and recorded in the template's design.
* Bad, because testing a screen against the shared cache needs a host app in another runtime, which FrontX exports no helper for; the template carries its own test host.

### Confirmation

The shared folder's data-layer test scans the sources of every inbox package and the shared folder and fails if an own query hook, an own mock transport or a store factory for screen state (an exported `...Store` constant or a `createStore` import) comes back, or if a stateful package lacks its slice; the module-level mock state that stands for the server (`cpt-template-inbox-adr-package-mock-backend`) is not screen state and is not forbidden. Each package's flux test holds its actions, effects and slice; the chat and mail screen tests hold the invalidations of their writes; the cross-screen test holds that a read made before another package loads is kept, and that a read another screen made paints from the shared cache on the first render. Every package builds its app with the shared builder, so the cross-screen test's case "keeps the reads a screen made when another screen package loads for the first time" (`inbox-chat-mfe/src/crossScreen.test.tsx`) fails if the mock switch comes after the shared cache.

## Pros and Cons of the Options

### The template's own data and state layers

* Good, because it works without the host's query cache and is independent of framework releases.
* Bad, because it duplicates FrontX's query, mock and state layers inside a template whose purpose is to show them.
* Bad, because the epoch drops every read on any write, so screens show loading states for data that did not change.
* Bad, because module-level stores exist once per package load and are invisible to the framework's tools.

### FrontX's data and state layers

* Good, because consistency, caching and state come from the ecosystem and improve with it.
* Good, because the invalidation of each write is explicit and listed in one table of the data guideline.
* Bad, because the template depends on the framework's current behaviour, including the gaps listed above, until FrontX closes them.

## More Information

The template's data guideline (`.frontx/ai/@gears-frontx/frontx-template-inbox/guidelines/inbox-data-contract.md`) holds the endpoint list, the invalidation table, the slices and the order of the app's plugins. The framework gaps the screens work around are stated as constraints in the template's design ([DESIGN.md](../DESIGN.md), section 2.2).

Applicability of the remaining checklist categories: **PERF** - addressed: a read nobody invalidated is answered from the cache without a loading state. **SEC** - Not applicable, because no credential or authorization is involved. **REL** - addressed: a failed background refresh keeps the last answer on screen. **DATA** - Not applicable, because no schema is fixed here. **INT** - addressed: the host's QueryClient and mock transport are the integration points. **OPS** - Not applicable. **MAINT** - addressed: one app builder fixes the plugin order for every package. **TEST** - addressed: a source scan and cross-runtime tests hold the decision. **COMPL** - Not applicable. **UX** - addressed: screens keep their place and paint at once on return. **BIZ** - Not applicable.

## Traceability

- **PRD**: [PRD.md](../PRD.md)
- **DESIGN**: [DESIGN.md](../DESIGN.md)

This decision directly addresses the following requirements and design elements:

* `cpt-template-inbox-fr-screen-facts` - Invalidation over the page's shared cache carries a write to every read it changed, so the screen that made it shows it in every view.
* `cpt-template-inbox-fr-screen-keeps-place` - Each screen's choices live in its slice, which outlives the mount.
* `cpt-template-inbox-fr-instant-return` - Reads are answered from the shared cache, and the plugin order keeps it on a first load.
* `cpt-template-inbox-fr-backend-switch` - The framework's mock switch is the one setting.
* `cpt-template-inbox-component-inbox-data` - The data component declares the services, their mock transport and their invalidations.
* `cpt-template-inbox-component-screen-frame` - The frame builds each package's app in the shared order.
