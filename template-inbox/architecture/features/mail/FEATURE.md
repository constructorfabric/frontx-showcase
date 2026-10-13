# Feature: Mail Screen

<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Read and reply](#read-and-reply)
  - [Compose a mail](#compose-a-mail)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Answer a send in the mock backend](#answer-a-send-in-the-mock-backend)
  - [Read the package's mail state](#read-the-packages-mail-state)
  - [Select the mails to show](#select-the-mails-to-show)
  - [Register the mail service](#register-the-mail-service)
  - [Keep the mail screen's place](#keep-the-mail-screens-place)
- [4. States (CDSL)](#4-states-cdsl)
  - [Compose dialog](#compose-dialog)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Mail service and mock backend](#mail-service-and-mock-backend)
  - [Reading and replying](#reading-and-replying)
  - [Compose](#compose)
  - [Mail keeps its place](#mail-keeps-its-place)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

- [x] `p3` - **ID**: `cpt-template-inbox-featstatus-mail`

- [x] `p3` - `cpt-template-inbox-feature-mail`

## 1. Feature Context

### 1.1 Overview

The mail screen is the package `inbox-mail-mfe` with its own data: the mail service, its seed and its package mock state; the mailboxes with their counts, the mail list with search and the all and unread tabs, the reading pane with the history toggle and a reply box, and the compose dialog that keeps the draft until the mail is sent and says when sending fails.

### 1.2 Purpose

Mail is the second channel of the product, with its own data and its own write. The package registers only its own service, which answers from typed mock maps and the package's mail state that a sent mail joins, and refuses a send a backend would refuse; what the reader chooses and types stays in the `inbox/mail` slice, so a return finds the same mailbox, mail, search, tab, history toggles and reply drafts.

**Requirements**: `cpt-template-inbox-fr-mail`, `cpt-template-inbox-fr-screen-keeps-place`, `cpt-template-inbox-fr-mock-backend`, `cpt-template-inbox-fr-host-navigation`, `cpt-template-inbox-fr-page-metadata`

**Principles**: `cpt-template-inbox-principle-one-server-one-cache`

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-inbox-actor-inbox-user` | Picks mailboxes and mails, searches and filters, reads a mail's history, replies, and composes a mail |
| `cpt-template-inbox-actor-inbox-backend` | Stands in place of the mock answers once a project attaches it, serving the mail endpoints the service declares |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md), component `cpt-template-inbox-component-mail-screen`, sequence `cpt-template-inbox-seq-send-mail`
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.6
- **ADRs**: `cpt-template-inbox-adr-package-mock-backend`, `cpt-template-inbox-adr-frontx-data-and-state-layers`
- **Code**: `src-app/mfe_packages/inbox-mail-mfe/` (paths relative to `template-inbox/`): `src/api/`, `src/screens/mail/`, `src/routes.tsx`, `src/lifecycle.tsx`, `src/init.ts`, `src/slices/`, `src/events/`, `src/actions/`, `src/effects/`, and the manifest `mfe.json`
- **Dependencies**: [Inbox Data](../data/FEATURE.md) (the refusal error and the seed clock the mail service reuses), [Screen Frame and Shared UI](../screen-frame/FEATURE.md) (lifecycle, app builder, frame, shared components, first-paint gate, automatic first pick, and the blocks the screen draws with: `NavColumn`, `ListPane`, `ThreadListItem`, `DetailPane`, `ThreadPane`, `ReplyComposer`, `PaneState`)

## 2. Actor Flows (CDSL)

User-facing interactions that start with an actor and describe the end-to-end flow of a use case.

**Use cases**: `cpt-template-inbox-usecase-send-mail`

### Read and reply

- [x] `p1` - **ID**: `cpt-template-inbox-flow-mail-read-and-reply`

**Actor**: `cpt-template-inbox-actor-inbox-user`

**Success Scenarios**:
- The user opens the screen: Inbox is selected and its first mail opens by itself
- The user opens a mail with history and expands it; the toggle stays as left for that mail
- The user replies: the reply is filed under Sent and the reply box clears

**Error Scenarios**:
- A read the first paint needs fails: the screen shows an error with a retry instead of the panes
- The reply is refused: the draft stays in the box

**Steps**:
1. [x] - `p1` - API: GET /api/mail/mailboxes, GET /api/mail/mails and GET /api/mail/messages through the mail service and the page-wide query cache - `inst-read-collections`
2. [x] - `p1` - Read the mailbox, the stored selection, the search, the tab, the history toggles and the drafts from the `inbox/mail` slice - `inst-read-mail-state`
3. [x] - `p1` - Track the mails a reply is out for, so only that mail's Send waits - `inst-track-replies`
4. [x] - `p1` - Merge the fetched mails with the mail this mount sent, never twice, beside the mailboxes and the earlier messages - `inst-merge-sent`
5. [x] - `p1` - Open the first visible mail automatically when the mailbox is still owed a pick, and write the selection back to the slice - `inst-auto-select`
6. [x] - `p1` - Find the open mail and its earlier messages for the history toggle - `inst-open-mail-history`
7. [x] - `p1` - User picks a mailbox: store it, clear the selection and arm the automatic first pick for it - `inst-select-mailbox`
8. [x] - `p1` - **IF** a read the first paint needs failed, show the error pane with a retry; **ELSE IF** any is still loading, show the loading pane - `inst-gate-first-paint`
9. [x] - `p1` - User sends a reply: **IF** no mail is open, a reply to it is already out, or the trimmed draft is empty, do nothing; **ELSE** API: POST /api/mail/mails addressed to the correspondent, titled after the mail it answers, in reply to it - `inst-send-reply`
10. [x] - `p1` - **IF** the send is accepted: invalidate the mails read, clear the reply draft only if it still holds what was sent, add the filed mail to the list and free that mail's Send - `inst-send-accepted`
11. [x] - `p1` - **IF** the send is refused: free that mail's Send and keep the draft - `inst-send-refused`

### Compose a mail

- [x] `p1` - **ID**: `cpt-template-inbox-flow-mail-compose`

**Actor**: `cpt-template-inbox-actor-inbox-user`

**Success Scenarios**:
- The user writes a recipient and a subject or a body and sends: the dialog closes, the draft clears, and the mail is listed under Sent

**Error Scenarios**:
- The send fails: the dialog stays open with the draft and says the send failed; Send tries again

**Steps**:
1. [x] - `p1` - Allow Send only with a recipient and at least a subject or a body - `inst-check-complete`
2. [x] - `p1` - User submits: **IF** the draft is incomplete or a send is out, do nothing - `inst-guard-submit`
3. [x] - `p1` - Hand the draft to the screen, which sends it to the typed address with no reply reference and keeps the callbacks of the promise it returns - `inst-compose-request`
4. [x] - `p1` - Wait for the send - `inst-await-send`
5. [x] - `p1` - **IF** the send is accepted, resolve the composed mail's promise - `inst-compose-accepted`
6. [x] - `p1` - **IF** the send is refused, reject the composed mail's promise with the error - `inst-compose-refused`
7. [x] - `p1` - Settle the waiting dialog for the request that answered - `inst-settle-compose`
8. [x] - `p1` - **IF** the latest send failed, the dialog shows the failure above its buttons - `inst-show-failure`

## 3. Processes / Business Logic (CDSL)

Internal functions the flows above call.

### Answer a send in the mock backend

- [x] `p2` - **ID**: `cpt-template-inbox-algo-mail-mock-send`

**Input**: The request body of POST /api/mail/mails, or a read of a mail collection

**Output**: The filed mail, a refusal with status 400, or a copy of the collection

**Steps**:
1. [x] - `p2` - Read the recipient address, the subject and the body from the body - `inst-read-fields`
2. [x] - `p2` - **IF** the recipient address is empty, refuse the request with 400 - `inst-refuse-no-recipient`
3. [x] - `p2` - **IF** both the subject and the body are empty, refuse the request with 400 - `inst-refuse-empty`
4. [x] - `p2` - File the mail under Sent in the package's mail state with the next id of the sent sequence and the current instant, as a real backend would assign them - `inst-file-under-sent`
5. [x] - `p2` - Serve the mailboxes and the earlier messages from the seed and the mails from the package's state, each as a copy - `inst-serve-reads`
6. [x] - `p2` - **RETURN** a copy of the filed mail - `inst-answer-filed`

### Read the package's mail state

- [x] `p2` - **ID**: `cpt-template-inbox-algo-mail-package-state`

**Input**: None

**Output**: The package's mail state

**Steps**:
1. [x] - `p2` - **IF** the module variable of the package's mail mock store already holds the state, **RETURN** it - `inst-read-existing`
2. [x] - `p2` - Create it from a copy of the seed with a fresh sent sequence, keep it in the module variable and **RETURN** it - `inst-create-from-seed`

### Select the mails to show

- [x] `p2` - **ID**: `cpt-template-inbox-algo-mail-select-mails`

**Input**: Every mail, the mailbox, the tab, the search text

**Output**: The mails the list shows, and the mailbox counts

**Steps**:
1. [x] - `p2` - Normalize the search text: trimmed and lower case - `inst-normalize-search`
2. [x] - `p2` - Keep the mails of the mailbox - `inst-filter-mailbox`
3. [x] - `p2` - **IF** the tab is unread, keep the unread mails only - `inst-filter-tab`
4. [x] - `p2` - Keep the mails whose correspondent or subject contains the search text, all of them when it is empty - `inst-filter-search`
5. [x] - `p2` - **RETURN** them pinned first, then newest first - `inst-sort-pinned-first`
6. [x] - `p2` - Count every mail and every unread mail of a mailbox - `inst-count-mailbox`

### Register the mail service

- [x] `p2` - **ID**: `cpt-template-inbox-algo-mail-register-service`

**Input**: The package's first load

**Output**: The package's app with the mail service registered

**Steps**:
1. [x] - `p2` - The service declares its mock plugin over the mail mock map without switching it on - `inst-declare-mock`
2. [x] - `p2` - Register the service once - `inst-register-once`
3. [x] - `p2` - Register the mail service only (no inbox service, no inbox seed), initialize the registry and build the app through the shared app builder - `inst-build-app`

### Keep the mail screen's place

- [x] `p2` - **ID**: `cpt-template-inbox-algo-mail-keep-state`

**Input**: A change the reader makes on the screen

**Output**: The `inbox/mail` slice holding it for the page session

**Steps**:
1. [x] - `p2` - The action emits one `mfe/inbox-mail/*` event per change - `inst-emit-event`
2. [x] - `p2` - The effects, the only code that dispatches to the slice, turn the event into its reducer - `inst-dispatch-reducer`
3. [x] - `p2` - Store the mailbox, the selection with the pick still owed, the search, the tab and the history toggle per mail - `inst-store-view-state`
4. [x] - `p2` - Store a reply draft per mail, and clear it only while it still holds what was sent - `inst-store-drafts`
5. [x] - `p2` - The package registers the slice with its effects after the app is built - `inst-register-slice`

## 4. States (CDSL)

### Compose dialog

- [x] `p2` - **ID**: `cpt-template-inbox-state-mail-compose-dialog`

**States**: CLOSED, EDITING, SENDING, FAILED

**Initial State**: CLOSED

**Transitions**:
1. [x] - `p2` - **FROM** CLOSED **TO** EDITING **WHEN** the user opens compose - `inst-open-compose`
2. [x] - `p2` - **FROM** EDITING **TO** CLOSED **WHEN** the user dismisses the dialog: the draft and the failure are discarded - `inst-dismiss-compose`
3. [x] - `p2` - **FROM** EDITING **TO** SENDING **WHEN** the user sends a complete draft: the failure is cleared; a send from FAILED takes the same path - `inst-start-sending`
4. [x] - `p2` - **FROM** SENDING **TO** CLOSED **WHEN** the send is accepted: the draft is cleared and the dialog closes - `inst-sent-closes`
5. [x] - `p2` - **FROM** SENDING **TO** FAILED **WHEN** the send fails: the dialog and the draft stay and the failure shows - `inst-failed-keeps-draft`

## 5. Definitions of Done

### Mail service and mock backend

- [x] `p1` - **ID**: `cpt-template-inbox-dod-mail-service`

The system **MUST** register the mail service alone in the package, answer every mail read with a whole collection from the seed or the package's mail state, file an accepted send under Sent with a server-assigned id and instant, and refuse a send without a recipient or without both subject and body by throwing an error with status 400.

**Implements**:
- `cpt-template-inbox-algo-mail-mock-send`
- `cpt-template-inbox-algo-mail-package-state`
- `cpt-template-inbox-algo-mail-register-service`

**Constraints**: `cpt-template-inbox-constraint-collection-endpoints`, `cpt-template-inbox-constraint-mock-success-only`

**Touches**:
- API: `GET /api/mail/mailboxes`, `GET /api/mail/mails`, `GET /api/mail/messages`, `POST /api/mail/mails`
- Entities: `Mailbox`, `Mail`, `Mail message`

### Reading and replying

- [x] `p1` - **ID**: `cpt-template-inbox-dod-mail-reading`

The system **MUST** show the mailboxes with counts read off the mails, the mail list with search and the all and unread tabs, the reading pane with the history toggle, and a reply that is filed under Sent, holds only its own mail's Send while out, and keeps its draft when refused.

**Implements**:
- `cpt-template-inbox-flow-mail-read-and-reply`
- `cpt-template-inbox-algo-mail-select-mails`

**Touches**:
- API: `GET /api/mail/mailboxes`, `GET /api/mail/mails`, `GET /api/mail/messages`, `POST /api/mail/mails`
- Entities: `Mailbox`, `Mail`, `Mail message`

### Compose

- [x] `p1` - **ID**: `cpt-template-inbox-dod-mail-compose`

The system **MUST** keep the compose dialog and its draft until the mail is sent, close and clear it once the send is accepted, and keep it open with the draft and a failure message when the send fails.

**Implements**:
- `cpt-template-inbox-flow-mail-compose`
- `cpt-template-inbox-state-mail-compose-dialog`

**Touches**:
- API: `POST /api/mail/mails`
- Entities: `Mail`

### Mail keeps its place

- [x] `p1` - **ID**: `cpt-template-inbox-dod-mail-keeps-place`

The system **MUST** keep the mailbox, the open mail, the search, the tab, the history toggles and the reply drafts in the `inbox/mail` slice, changed only through its actions, events and effects.

**Implements**:
- `cpt-template-inbox-algo-mail-keep-state`

**Touches**:
- Entities: `Mailbox`, `Mail`

## 6. Acceptance Criteria

- [x] The service answers the mailboxes, the mails and the history from the seed instead of the network, files a sent mail under Sent with the id and instant it assigns, refuses a mail without a recipient or without a subject and a body and keeps nothing, and keeps its state in the package's own module: the sent mail is in that module, and a second evaluation of the mock layer starts from the seed (`src/api/MailApiService.test.ts`, `src/api/mailDataset.test.ts`)
- [x] The screen opens on Inbox with its first mail selected, picks again on a mailbox switch, filters by tab and search, and puts pinned mail first (`src/screens/mail/MailScreen.test.tsx`, `src/screens/mail/mailSelectors.test.ts`)
- [x] Send waits while a reply to the same mail is out but not for another mail; a refused reply keeps its draft (`src/screens/mail/MailScreen.test.tsx`)
- [x] Compose sends into Sent only with a recipient and a subject or a body, keeps the dialog and draft when the send fails and says so, and discards the draft on Cancel (`src/screens/mail/MailScreen.test.tsx`)
- [x] The mailbox, the open mail, the search and the drafts survive a remount, and every action turns into the slice update it names (`src/screens/mail/MailScreen.test.tsx`, `src/mailFlux.test.ts`, `src/lifecycle.test.tsx`)
- [x] An address naming no page of the screen shows the screen's not-found page, and the document title is left to the site (`src/routes.test.tsx`, `src/lifecycle.test.tsx`)
- [x] Every list on the screen (mailboxes, mails) holds nothing but list items (`src/screens/mail/MailScreen.test.tsx`)
- [x] The manifest lists the screen in the demos nav group at order 64 with its `seo` block (`src/manifest.test.ts`)
