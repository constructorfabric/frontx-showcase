---
status: accepted
date: 2026-10-12
---

# Each Screen Package Keeps Its Own Mock Backend State

<!-- toc -->

- [Context and Problem Statement](#context-and-problem-statement)
- [Decision Drivers](#decision-drivers)
- [Considered Options](#considered-options)
- [Decision Outcome](#decision-outcome)
  - [Consequences](#consequences)
  - [Confirmation](#confirmation)
- [Pros and Cons of the Options](#pros-and-cons-of-the-options)
  - [State in each package's module](#state-in-each-packages-module)
  - [One state per page on a global key](#one-state-per-page-on-a-global-key)
  - [A shared runtime module](#a-shared-runtime-module)
- [More Information](#more-information)
- [Traceability](#traceability)

<!-- /toc -->

**ID**: `cpt-template-inbox-adr-package-mock-backend`

## Context and Problem Statement

The template's four screens are separate microfrontend packages, and every load of a package evaluates its own copy of each module it bundles, the shared folder included. The template ships no backend: its services answer from mock maps over seed data. Contacts, dashboard and chat read the same seed of people, conversations and messages, and chat writes replies, notes and new conversations. Mail has data of its own that no other screen reads. Where does the mock backend keep its state, so that what the user changes on a screen stays on that screen for the page session, while each package stays isolated and bundles only what it reads?

## Decision Drivers

* **MFE isolation** - microfrontends pass data only through FrontX's own mechanisms (shared properties, actions chains and the host's shared query cache); a screen package must not reach into state another package holds by any other route.
* **Load isolation** - each package is loaded on its own and must not depend on another package's code or load order.
* **Stand-in for a server** - within a screen, the mock state must behave like a server: a write is there in the next read, across the screen's views and its remounts, so that replacing it with a real backend changes nothing in the screens.
* **No extra package** - the shared folder is bundled into each screen; the template claims no workspace package or shared runtime module of its own.

## Considered Options

* **State in each package's module** - each package's copy of the mock store keeps its own state in a module variable, created from the seed on first read.
* **One state per page on a global key** - the state lives on the page's global object under a registry symbol that every copy of the module resolves to the same key, created from the seed by the first reader.
* **A shared runtime module** - the mock store is a module the packages share at run time through the module federation shared scope, loaded once for the page.

## Decision Outcome

Chosen option: "State in each package's module", because it is the only option that keeps every screen package isolated: the packages share nothing outside FrontX's own mechanisms, and each still bundles its own code and loads on its own.

The inbox mock state (contacts, conversations, messages and the counters for what the package created) is kept in a module variable of `shared/inbox/api/mockStore.ts`. Every package that bundles it (chat, contacts, dashboard) has its own copy, created lazily from the same seed on its first read, kept across that screen's unmount and remount within the page, and reset by a page reload or by `resetInboxMockState()` in tests. Mail keeps its own mock state the same way in `inbox-mail-mfe/src/api/mailMockStore.ts`, so mail never bundles the inbox seed and the inbox screens never bundle mail's. The seed's reference instant is the moment the package's copy of `seedClock.ts` loads, so each screen measures relative times from its own load moment. The mock maps hand out clones, so nothing a screen does to a response reaches the state. The state stands for the server only: what a screen has read lives in the host's shared query cache (`queryCacheShared()`), which still holds what one package has read for the others, and what a screen keeps for itself lives in its own state slice (`cpt-template-inbox-adr-frontx-data-and-state-layers`).

### Consequences

* Good, because no mock state lives outside the packages' own modules, and no package reads another package's mock state.
* Good, because a write (a reply, a note, a new conversation, a sent mail) is in the state of the package that made it, so that screen shows it once its own read has answered, across its views and its remounts, the way a backend keeps what it was told.
* Good, because the mock maps answer the same requests a real backend would, so a real backend replaces them without a screen change.
* Good, because each package bundles only the seeds of the services it reads.
* Bad, because the screens do not share facts: another screen package answers from its own copy of the seed, so a reply posted in chat is not in the contact's activity on the contacts screen, and the dashboard's activity rows point at the dashboard package's own contacts list. A real backend gives one set of facts to every screen; the mocks do not simulate that.
* Bad, because the packages read the same endpoints under the same query keys in the host's one shared query cache, and every mount refetches in the background, so answers pass between packages through the cache and a screen can flicker: after chat posts a reply, the contacts screen first paints the cached answer chat filled, reply included, until its own mount refetch answers from its own copy of the seed and the reply disappears there; a return to chat can briefly paint contacts' answer until chat's refetch brings the reply back.
* Neutral, because the state lasts only for the page session, which is what a demo without a backend needs; a test resets it between cases.

### Confirmation

The tests confirm it: the mock store test (`inbox-contacts-mfe/src/shared-inbox/mockStore.test.ts`) holds that each module graph has its own state created from the same seed, that a reply posted through one graph stays in that graph's reads and out of another graph's, that the store answers with copies, and that a reset brings the conversations, the messages and their snippets back to the seed. The seed clock test holds that every instant is measured back from the moment the module loaded, and that a package's copy loaded later has its own, later anchor. The dashboard's activity contacts test (`activityContacts.test.ts`) holds that every activity row points at a contact the package lists and that the people are read at request time. The mail service test holds that a sent mail is in the module that took it and that a second evaluation of the mock layer starts from the seed. The cross-screen test (`inbox-chat-mfe/src/crossScreen.test.tsx`) holds that a read another screen made is painted from the shared cache on the first render. The dataset test holds the seed's references between people, conversations and messages.

## Pros and Cons of the Options

### State in each package's module

* Good, because it is the simplest form and needs no global object.
* Good, because it keeps every package isolated and shares nothing outside FrontX's mechanisms.
* Bad, because each package answers from its own copy: a reply posted in chat does not reach contacts, so the screens agree only once a real backend is attached.

### One state per page on a global key

* Good, because every copy of the module, in every package, would resolve the same key and so the same state, and a write in one screen would show in every other.
* Bad, because it shares data between microfrontends outside FrontX's mechanisms, through the page's global object, which breaks the isolation the screens are built on.
* Bad, because it relies on a global object and a naming rule for the key that the type system does not check.

### A shared runtime module

* Good, because one module instance would hold the state without a global key.
* Bad, because it ties the screens' loading together: the shared module must be negotiated at load time between packages, against each package loading on its own, as the ecosystem's isolation of microfrontend loads intends.
* Bad, because it shares data between microfrontends outside shared properties and actions chains.
* Bad, because the template would claim a shared runtime module of its own, beyond the screen packages, the shared folder and its guidelines.

## More Information

The template's data guideline (`.frontx/ai/@gears-frontx/frontx-template-inbox/guidelines/inbox-data-contract.md`) states where the state lives and what lives in it against the query cache and the slices.

Applicability of the remaining checklist categories: **PERF** - Not applicable, because the state is held in memory for one page. **SEC** - Not applicable, because the state holds seed data only and is never sent anywhere. **REL** - addressed: the state survives a screen's unmount and is reset only by a page reload, or in tests by `resetInboxMockState()` and `resetMailMockState()`. **DATA** - addressed: each package creates its state from the seed it bundles, so the state always matches the package's own shape. **INT** - addressed: the mock state stands for the backend data contract, so a backend replaces it unchanged. **OPS** - Not applicable, because nothing is deployed for it. **MAINT** - addressed: one module per state owns it and its reset. **TEST** - addressed: tests reset the state and load separate module graphs over it. **COMPL** - Not applicable. **UX** - addressed: what the user changes on a screen is what that screen shows for the page session. **BIZ** - Not applicable.

## Traceability

- **PRD**: [PRD.md](../PRD.md)
- **DESIGN**: [DESIGN.md](../DESIGN.md)

This decision directly addresses the following requirements and design elements:

* `cpt-template-inbox-fr-screen-facts` - The package's state keeps what the user changes on a screen across its views and its remounts.
* `cpt-template-inbox-fr-mock-backend` - The mock backend answers every read and write from that state for the page session.
* `cpt-template-inbox-fr-backend-switch` - The state stands for the server, so switching to a real backend changes no screen.
* `cpt-template-inbox-component-inbox-data` - The data component owns the mock stores.
