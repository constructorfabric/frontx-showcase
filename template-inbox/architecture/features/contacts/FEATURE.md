# Feature: Contacts Screen

<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Browse the directory](#browse-the-directory)
  - [Open a person's page](#open-a-persons-page)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Filter the directory](#filter-the-directory)
  - [Build the activity timeline](#build-the-activity-timeline)
  - [Keep the directory's place](#keep-the-directorys-place)
  - [Accept the show-contact step](#accept-the-show-contact-step)
- [4. States (CDSL)](#4-states-cdsl)
  - [Contacts screen view](#contacts-screen-view)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Directory](#directory)
  - [Person's page](#persons-page)
  - [Directory keeps its place](#directory-keeps-its-place)
  - [Show-contact action and handler registration](#show-contact-action-and-handler-registration)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

- [x] `p3` - **ID**: `cpt-template-inbox-featstatus-contacts`

- [x] `p3` - `cpt-template-inbox-feature-contacts`

## 1. Feature Context

### 1.1 Overview

The contacts screen is the package `inbox-contacts-mfe`: the directory of every contact with five filters and their counts, a search, a sortable and paged table, and each person's page with their details, tickets and latest activity at an address of its own. It is the target the other screens link to: its manifest declares the `show_contact` action and its lifecycle registers the handler when the screen mounts, so a chain from chat lands on a person's page. The screen draws only through kit components, kit candidates and the shared blocks (`shared/inbox/blocks/`: `NavColumn` for the filters, `PagePane` for the directory and a person's page, `ColumnsLayout`, `ContactSummary`, `RecordList`, `ChipRow`, `CellActions`, `DataTableIdentityCell`, `PaneState`, `PresenceAvatar`) and imports no stylesheet of its own ([Screen Frame](../screen-frame/FEATURE.md), Blocks).

### 1.2 Purpose

The directory is the entry point to the people every other screen refers to, and a person's page is what chat's "View contact" opens and what a user reloads or shares. The screen keeps its filter and search in its own slice so a return finds the directory as it was, reads only through the inbox service and the page-wide query cache, and writes nothing to the backend.

**Requirements**: `cpt-template-inbox-fr-contacts-directory`, `cpt-template-inbox-fr-contact-page`, `cpt-template-inbox-fr-screen-keeps-place`, `cpt-template-inbox-fr-host-navigation`, `cpt-template-inbox-fr-page-metadata`

**Principles**: `cpt-template-inbox-principle-one-server-one-cache`

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-inbox-actor-inbox-user` | Narrows, searches, sorts and pages the directory, opens a person's page and goes back to the directory |
| `cpt-template-inbox-actor-application-shell` | Mounts the screen in its screen domain, writes the screen's address entry, and dispatches the `show_contact` step another screen's chain carries, validated against the screen's schema |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md), component `cpt-template-inbox-component-contacts-screen`, sequence `cpt-template-inbox-seq-return-to-screen`
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.4
- **ADRs**: `cpt-template-inbox-adr-frontx-data-and-state-layers`
- **Screen actions**: the hosting site's contract for moving between screens ([architecture/ADR/0006-cross-screen-deep-links.md](../../../../architecture/ADR/0006-cross-screen-deep-links.md)); the `show_contact` action type and its handler are the [Cross-Screen Navigation](../cross-screen-navigation/FEATURE.md) feature's.
- **Code**: `src-app/mfe_packages/inbox-contacts-mfe/` (paths relative to `template-inbox/`): `src/screens/contacts/`, `src/routes.tsx`, `src/lifecycle.tsx`, `src/init.ts`, `src/slices/`, `src/events/`, `src/actions/`, `src/effects/`, and the manifest `mfe.json`
- **Dependencies**: [Inbox Data](../data/FEATURE.md) (the inbox service and its response types), [Screen Frame and Shared UI](../screen-frame/FEATURE.md) (lifecycle, frame, shared components), [Cross-Screen Navigation](../cross-screen-navigation/FEATURE.md) (the `show_contact` action type and handler)

## 2. Actor Flows (CDSL)

User-facing interactions that start with an actor and describe the end-to-end flow of a use case.

**Use cases**: `cpt-template-inbox-usecase-browse-directory`

### Browse the directory

- [x] `p1` - **ID**: `cpt-template-inbox-flow-contacts-browse-directory`

**Actor**: `cpt-template-inbox-actor-inbox-user`

**Success Scenarios**:
- The user opens the screen and sees every contact, 25 to a table page, with each filter's count beside it
- The user picks a filter and types a search; the table and the people count narrow together
- The user opens a person's page from a table row

**Error Scenarios**:
- The contacts or the conversations fail to load: the screen shows an error with a retry instead of an empty directory
- The transcript fails to load: the directory still paints, since the transcript only dates the activity timeline

**Steps**:
1. [x] - `p1` - API: GET /api/inbox/contacts, GET /api/inbox/conversations and GET /api/inbox/messages through the inbox service and the page-wide query cache - `inst-read-collections`
2. [x] - `p1` - Read the filter and the search from the `inbox/contacts` slice - `inst-read-directory-state`
3. [x] - `p1` - Narrow the contacts to the chosen filter and search (algorithm Filter the directory) - `inst-select-visible`
4. [x] - `p1` - **IF** the contacts or the conversations failed to load, show the error pane with a retry; **ELSE IF** either is still loading, show the loading pane - `inst-gate-first-paint`
5. [x] - `p1` - Render the five filters in the filter column, each with the count of contacts it holds - `inst-render-filter-counts`
6. [x] - `p1` - User picks a filter: emit the filter change and fold the filter column where it opened as a sheet - `inst-select-filter`
7. [x] - `p1` - User types in the search field: emit the search change - `inst-search`
8. [x] - `p1` - Render the narrowed contacts in the kit data table, which sorts by column header and pages 25 rows at a time - `inst-render-table`
9. [x] - `p1` - User opens a contact from a row: remember that the directory opened this page, and move the screen's router to `/<contactId>` - `inst-open-contact`

### Open a person's page

- [x] `p1` - **ID**: `cpt-template-inbox-flow-contacts-open-person-page`

**Actor**: `cpt-template-inbox-actor-inbox-user`

**Success Scenarios**:
- The address names a contact: the person's page shows their details, tickets and latest activity, with the directory kept mounted and hidden behind it
- The user goes back to the directory: the screen's router moves to the directory in place of the person's page in the history, and the directory comes back as it was left

**Error Scenarios**:
- The address names no contact: the screen says the contact was not found and offers the way back to the directory
- The address names no page of the screen at all: the screen's own not-found page renders

**Steps**:
1. [x] - `p1` - The layout route reads the contact id from the screen's route and moves focus to the new page - `inst-read-route`
2. [x] - `p1` - **IF** the address inside the screen matches neither the directory nor a person's page, render the screen's not-found page - `inst-route-not-found`
3. [x] - `p1` - Find the contact the id names in the contacts read - `inst-find-contact`
4. [x] - `p1` - Join the contact's conversation references against the conversations read, leaving out a reference with no conversation behind it - `inst-join-conversations`
5. [x] - `p1` - **IF** a contact matches, render the person's page with their details, tickets and the activity timeline (algorithm Build the activity timeline) - `inst-render-person-page`
6. [x] - `p1` - **IF** the id names no contact, render the contact-not-found state with a button back to the directory, which goes back the same way as step 7 - `inst-not-found`
7. [x] - `p1` - User goes back: move the screen's router to `/` with `replace: true`, so the directory takes the person's page's place in the history and the browser's Back never returns to that page; the screen never calls `window.history` - `inst-back-to-directory`

## 3. Processes / Business Logic (CDSL)

Internal functions the flows above call.

### Filter the directory

- [x] `p2` - **ID**: `cpt-template-inbox-algo-contacts-filter-directory`

**Input**: Every contact, the chosen filter (all, users, leads, active, new), the search text

**Output**: The contacts the table shows, and each filter's count

**Steps**:
1. [x] - `p2` - Count each filter over the whole collection, so a filter reads the same number the table shows under it - `inst-count-filter`
2. [x] - `p2` - Normalize the search text: trimmed and lower case - `inst-normalize-search`
3. [x] - `p2` - Drop a contact the chosen filter does not match - `inst-match-filter`
4. [x] - `p2` - **IF** the search is empty, keep the contact; **ELSE** keep it when its name, email or company contains the search text - `inst-match-search`

### Build the activity timeline

- [x] `p2` - **ID**: `cpt-template-inbox-algo-contacts-activity-timeline`

**Input**: The contact, their conversations, the messages read

**Output**: The person's page activity entries, newest first

**Steps**:
1. [x] - `p2` - Date each conversation at its first message; a conversation with no message yet has no entry and falls back to its own last activity - `inst-conversation-starts`
2. [x] - `p2` - **FOR EACH** ticket of the contact, add an "opened ticket" entry at its opening time - `inst-ticket-entries`
3. [x] - `p2` - **FOR EACH** conversation of the contact, add a "started a conversation" entry at its start - `inst-conversation-entries`
4. [x] - `p2` - Add the entry for the day the contact was added - `inst-added-entry`
5. [x] - `p2` - **IF** the contact signed up (a lead never did), add the sign-up entry - `inst-signed-up-entry`
6. [x] - `p2` - **RETURN** the entries sorted newest first - `inst-sort-newest-first`

### Keep the directory's place

- [x] `p2` - **ID**: `cpt-template-inbox-algo-contacts-keep-directory-state`

**Input**: A filter or search change from the directory

**Output**: The `inbox/contacts` slice holding it for the page session

**Steps**:
1. [x] - `p2` - The action emits one `mfe/inbox-contacts/*` event per change - `inst-emit-event`
2. [x] - `p2` - The effects, the only code that dispatches to the slice, turn the event into its reducer - `inst-dispatch-reducer`
3. [x] - `p2` - The reducer stores the filter or the search in the slice, which lives in the package's store for the page and outlives an unmount - `inst-store-directory-state`
4. [x] - `p2` - The package registers the slice with its effects after the app is built - `inst-register-slice`

### Accept the show-contact step

- [x] `p2` - **ID**: `cpt-template-inbox-algo-contacts-accept-show-contact`

**Input**: The host mounting the screen with the bridge

**Output**: The screen rendered and ready for the chain's `show_contact` step

**Steps**:
1. [x] - `p2` - Render the screen through the shared inbox lifecycle - `inst-render-screen`
2. [x] - `p2` - Register the `show_contact` handler on the bridge before mount returns, since the chain dispatches its next step as soon as it does - `inst-register-handler`

## 4. States (CDSL)

### Contacts screen view

- [x] `p2` - **ID**: `cpt-template-inbox-state-contacts-screen-view`

**States**: DIRECTORY, PERSON_PAGE

**Initial State**: DIRECTORY

**Transitions**:
1. [x] - `p2` - **FROM** DIRECTORY **TO** PERSON_PAGE **WHEN** a person's page is opened: the screen's router moves to `/<contactId>`, which writes the screen's entry in the page address, and the directory stays mounted and hidden - `inst-open-person-page`
2. [x] - `p2` - **FROM** PERSON_PAGE **TO** DIRECTORY **WHEN** the user goes back to the directory ("Back to contacts" or the contact-not-found state's button): the screen's router replaces the person's page with `/` in the history - `inst-back-to-directory`

## 5. Definitions of Done

### Directory

- [x] `p1` - **ID**: `cpt-template-inbox-dod-contacts-directory`

The system **MUST** list every contact from the inbox service with five filters and their counts, a search over name, email and company, column sorting and 25-row paging, and an error pane with a retry when the contacts or the conversations fail to load.

**Implements**:
- `cpt-template-inbox-flow-contacts-browse-directory`
- `cpt-template-inbox-algo-contacts-filter-directory`

**Touches**:
- API: `GET /api/inbox/contacts`, `GET /api/inbox/conversations`, `GET /api/inbox/messages`
- Entities: `Contact`, `Conversation`, `Message`

### Person's page

- [x] `p1` - **ID**: `cpt-template-inbox-dod-contacts-person-page`

The system **MUST** give every contact a page at `/<contactId>` inside the screen with details, tickets and an activity timeline, keep the directory mounted behind it and show the contact-not-found state for an id that names no contact; going back moves the screen's own router to the directory in place of the person's page in the history, so the browser's Back never returns to that page, and never calls `window.history`.

**Implements**:
- `cpt-template-inbox-flow-contacts-open-person-page`
- `cpt-template-inbox-algo-contacts-activity-timeline`
- `cpt-template-inbox-state-contacts-screen-view`

**Touches**:
- API: `URL /?screen=inbox-contacts;route=<id>`
- Entities: `Contact`, `Conversation`, `Message`

### Directory keeps its place

- [x] `p1` - **ID**: `cpt-template-inbox-dod-contacts-keeps-place`

The system **MUST** keep the directory's filter and search in the `inbox/contacts` slice, changed only through its actions, events and effects, so leaving the screen and coming back within the page session returns to them.

**Implements**:
- `cpt-template-inbox-algo-contacts-keep-directory-state`

**Touches**:
- Entities: `Contact`

### Show-contact action and handler registration

- [x] `p1` - **ID**: `cpt-template-inbox-dod-contacts-show-contact-handler`

The system **MUST** register the `show_contact` handler in the screen's `mount()` before it returns, and the package manifest **MUST** declare the `show_contact` action and carry its closed schema, whose target is the contacts screen only and whose payload is one non-empty contact id.

**Implements**:
- `cpt-template-inbox-algo-contacts-accept-show-contact`

**Constraints**: `cpt-template-inbox-constraint-contacts-show-action`

**Touches**:
- API: `gts.frontx.mfes.comm.action.v1~frontx.inbox_contacts.nav.show_contact.v1~`, payload `{ contact }`

## 6. Acceptance Criteria

- [x] The directory pages the seeded contacts and counts every filter from the same collection; search and filter narrow the table and the count together; a column header sorts the table (`src/screens/contacts/ContactsScreen.test.tsx`, `src/screens/contacts/contactFilters.test.ts`)
- [x] A route naming a contact opens their page, even one off the first table page; an id the directory lacks shows the contact-not-found state; an address naming no page shows the screen's not-found page (`src/screens/contacts/ContactsScreen.test.tsx`, `src/lifecycle.test.tsx`, `src/routes.test.tsx`)
- [x] The activity timeline dates a started conversation at its first message and a conversation with no message at its own last activity (`src/screens/contacts/contactActivity.test.ts`)
- [x] Back to the directory goes through the screen router, never calls `window.history.back`, and finds the directory as it was left (`src/screens/contacts/ContactsScreen.test.tsx`); the directory takes the person's page's place in the history, so the browser's Back never returns to it (`src/lifecycle.test.tsx`)
- [x] The filter and the search survive a remount and change only through the effects (`src/contactsFlux.test.ts`, `src/screens/contacts/ContactsScreen.test.tsx`)
- [x] The lifecycle registers the `show_contact` handler when the screen mounts (`src/lifecycle.test.tsx`)
- [x] The manifest lists the screen in the demos nav group at order 61 with its `seo` block, the person's page not indexable, and declares the `show_contact` action with its closed schema (`src/manifest.test.ts`, `src/shared-inbox/openScreen.test.ts`)
- [x] The screen leaves the document title to the site (`src/lifecycle.test.tsx`)
- [x] The person's page lays its cards out in three columns that stack below the contact-columns width, lists tickets and conversations as list items, and holds the directory's row actions at the end of their cell (`src/shared-inbox/blocks/ColumnsLayout.test.tsx`, `RecordList.test.tsx`, `CellActions.test.tsx`)
