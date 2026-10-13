# Feature: Inbox Data

<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Read the inbox collections](#read-the-inbox-collections)
  - [Post a reply or a note](#post-a-reply-or-a-note)
  - [Start a conversation](#start-a-conversation)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Read the package's mock state](#read-the-packages-mock-state)
  - [Check a posted message](#check-a-posted-message)
  - [Store a posted message](#store-a-posted-message)
  - [Check a new conversation](#check-a-new-conversation)
  - [Store a new conversation](#store-a-new-conversation)
  - [Refuse a request](#refuse-a-request)
  - [Anchor the seed clock](#anchor-the-seed-clock)
- [4. States (CDSL)](#4-states-cdsl)
  - [Package mock state](#package-mock-state)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Inbox service and its registrar](#inbox-service-and-its-registrar)
  - [One mock state per package](#one-mock-state-per-package)
  - [Refusal with a status](#refusal-with-a-status)
  - [One seed clock per package](#one-seed-clock-per-package)
  - [Response types and contract values](#response-types-and-contract-values)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

- [x] `p1` - **ID**: `cpt-template-inbox-featstatus-data`

- [x] `p1` - `cpt-template-inbox-feature-data`

## 1. Feature Context

### 1.1 Overview

The inbox data feature is the shared folder's `api/` subfolder: the inbox service every screen that reads conversations or people uses, its registrar, the mock map that answers the service's requests through the host's mock transport, the package's mock state those answers come from, the seeds and the seed clock they are written against, the refusal error a mock throws for a write a backend would refuse, and the response types. Every package bundles its own copy of the folder, so every package keeps its own mock state, created from the same seed, and its own seed clock, anchored at the moment that copy loads.

### 1.2 Purpose

The screens are loaded and isolated one by one, yet a write must show on the screen that made it across its views and its remounts, and the template must run with no backend attached and switch to one without changing a screen. This feature gives the screens one service surface and a mock backend that stands for the server within each package. Another screen package answers from its own copy of the seed; since the packages read through one shared query cache under the same keys, the contacts screen first paints the cached answer chat filled, reply included, until its own mount refetch drops the reply there. A real backend gives one set of facts to every screen; the mocks do not simulate that.

**Requirements**: `cpt-template-inbox-fr-screen-facts`, `cpt-template-inbox-fr-mock-backend`, `cpt-template-inbox-fr-backend-switch`, `cpt-template-inbox-fr-agent-guidelines`

**Principles**: `cpt-template-inbox-principle-one-server-one-cache`

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-inbox-actor-inbox-user` | Reads the collections and writes replies, notes and new conversations through a screen |
| `cpt-template-inbox-actor-project-developer` | Turns the mock switch off and points the same service at a backend |
| `cpt-template-inbox-actor-inbox-backend` | Answers the same endpoints in place of the mock map once the switch is off |
| `cpt-template-inbox-actor-ai-agent` | Reads the data guideline before changing a service, a mock or a screen's data |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md), component `cpt-template-inbox-component-inbox-data`, sequences `cpt-template-inbox-seq-write-propagation` and `cpt-template-inbox-seq-attach-backend`
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.1
- **ADRs**: `cpt-template-inbox-adr-package-mock-backend`, `cpt-template-inbox-adr-frontx-data-and-state-layers`
- **Code**: `src-app/mfe_packages/shared/inbox/api/` (paths relative to `template-inbox/`); the data guideline `.frontx/ai/@gears-frontx/frontx-template-inbox/guidelines/inbox-data-contract.md`
- **Dependencies**: None. The app builder that holds the mock switch is part of [Screen Frame and Shared UI](../screen-frame/FEATURE.md); the dashboard and mail services follow this feature's pattern inside their own packages.

## 2. Actor Flows (CDSL)

### Read the inbox collections

- [x] `p1` - **ID**: `cpt-template-inbox-flow-data-read-collections`

**Actor**: `cpt-template-inbox-actor-inbox-user`

**Use cases**: `cpt-template-inbox-usecase-answer-and-view-contact`, `cpt-template-inbox-usecase-browse-directory`, `cpt-template-inbox-usecase-attach-backend`

**Success Scenarios**:
- A screen's read through the query hook answers with the whole collection; with the mock switch on it comes from the package's state, with the switch off from the backend at the same base URL.

**Error Scenarios**:
- With the switch off, a backend failure rejects the read and the screen's load state shows it; the mock map itself never fails a read.

**Steps**:
1. [x] - `p1` - The screen package's init registers the inbox service before its app is built; a registration in a runtime that already has the service does nothing - `inst-register-service`
2. [x] - `p1` - The service is built over the REST protocol with a 30 second timeout at the base URL `/api/inbox` - `inst-build-protocol`
3. [x] - `p1` - The service declares the host's mock transport on that protocol with the inbox mock map and a 100 ms delay, without switching it on; the app's mock switch decides whether it answers - `inst-declare-mock`
4. [x] - `p1` - API: GET /api/inbox/me, /api/inbox/channels, /api/inbox/conversations, /api/inbox/messages, /api/inbox/contacts (response: the agent, or one whole collection each) - `inst-declare-reads`
5. [x] - `p1` - A screen asks the registry for the service by its class and gets the runtime's one instance - `inst-get-service`
6. [x] - `p1` - With the switch on, the mock map answers each read with a copy: the agent and the channels from the seed, the conversations, messages and contacts from the package's state (`cpt-template-inbox-algo-data-package-state`) - `inst-answer-read`

### Post a reply or a note

- [x] `p1` - **ID**: `cpt-template-inbox-flow-data-post-message`

**Actor**: `cpt-template-inbox-actor-inbox-user`

**Use cases**: `cpt-template-inbox-usecase-answer-and-view-contact`

**Success Scenarios**:
- The reply or note joins the package's transcript, its conversation's snippet and last activity move to it, and every view of the screen that made it reads it after the write's invalidation; another screen package can paint that cached answer until its own refetch answers from its own copy of the seed.

**Error Scenarios**:
- A post without a conversation, a non-blank body or a kind of reply or note is refused with 400; a post into a conversation the package's state does not hold is refused with 404. Nothing is stored and the mutation fails with the status.

**Steps**:
1. [x] - `p1` - API: POST /api/inbox/messages (request: conversation id, body, kind; response: the stored message) - `inst-declare-post`
2. [x] - `p1` - The mock map checks the request with `cpt-template-inbox-algo-data-check-post`, stores it with `cpt-template-inbox-algo-data-store-post` and answers with a copy of the stored message - `inst-answer-post`

### Start a conversation

- [x] `p1` - **ID**: `cpt-template-inbox-flow-data-start-conversation`

**Actor**: `cpt-template-inbox-actor-inbox-user`

**Use cases**: `cpt-template-inbox-usecase-answer-and-view-contact`

**Success Scenarios**:
- A new, empty conversation with an existing contact joins the package's conversation list and the contact's own list of conversations.

**Error Scenarios**:
- A create without a channel or a contact is refused with 400; one for a contact the package's state does not hold is refused with 404. Nothing is stored.

**Steps**:
1. [x] - `p1` - API: POST /api/inbox/conversations (request: channel id, contact id, optional assignee; response: the created conversation) - `inst-declare-create`
2. [x] - `p1` - The mock map checks the request with `cpt-template-inbox-algo-data-check-create`, stores it with `cpt-template-inbox-algo-data-store-create` and answers with a copy of the created conversation - `inst-answer-create`

## 3. Processes / Business Logic (CDSL)

### Read the package's mock state

- [x] `p1` - **ID**: `cpt-template-inbox-algo-data-package-state`

**Input**: none; called by every inbox mock factory

**Output**: the package's inbox mock state (contacts, conversations, messages and the id sequences)

**Steps**:
1. [x] - `p1` - Look the state up in the module variable of the package's copy of the mock store - `inst-look-up-state`
2. [x] - `p1` - **IF** no state is there, create it from copies of the seed's contacts, conversations and messages with both id sequences at zero, keep it in the module variable and **RETURN** it - `inst-seed-state`
3. [x] - `p1` - **RETURN** the stored state - `inst-return-state`

### Check a posted message

- [x] `p1` - **ID**: `cpt-template-inbox-algo-data-check-post`

**Input**: the request body of POST /api/inbox/messages

**Output**: the well-formed request, or a refusal with a status

**Steps**:
1. [x] - `p1` - Read the conversation id, the body and the kind as strings; a body that is not an object, or a field that is not a string, reads as missing - `inst-read-post-fields`
2. [x] - `p1` - **IF** the conversation id is missing or empty, or the body is missing or blank, refuse with 400 (`cpt-template-inbox-algo-data-refuse`) - `inst-refuse-incomplete-post`
3. [x] - `p1` - **IF** the kind is neither reply nor note, refuse with 400 - `inst-refuse-unknown-kind`
4. [x] - `p1` - **IF** no conversation in the package's state has the id, refuse with 404 - `inst-refuse-unknown-conversation`
5. [x] - `p1` - **RETURN** the conversation id, the body and the kind - `inst-return-post`

### Store a posted message

- [x] `p1` - **ID**: `cpt-template-inbox-algo-data-store-post`

**Input**: a checked post request

**Output**: the stored message

**Steps**:
1. [x] - `p1` - Advance the package's posted-message sequence - `inst-count-post`
2. [x] - `p1` - Build an outbound text message with the id `m-sent-<sequence>`, the current time, the posted body, no links, image or attachments and no receipt yet, internal when the kind is note - `inst-build-message`
3. [x] - `p1` - Append it to the package's transcript - `inst-append-message`
4. [x] - `p1` - Move its conversation's snippet and last activity to the message - `inst-move-snippet`
5. [x] - `p1` - **RETURN** the message - `inst-return-message`

### Check a new conversation

- [x] `p1` - **ID**: `cpt-template-inbox-algo-data-check-create`

**Input**: the request body of POST /api/inbox/conversations

**Output**: the well-formed request, or a refusal with a status

**Steps**:
1. [x] - `p1` - Read the channel id and the contact id as strings; a body that is not an object, or a field that is not a string, reads as missing - `inst-read-create-fields`
2. [x] - `p1` - **IF** the channel id or the contact id is missing or empty, refuse with 400 - `inst-refuse-incomplete-create`
3. [x] - `p1` - **IF** no contact in the package's state has the id, refuse with 404; the channel is not checked, since channels the user creates stay in the chat screen's state - `inst-refuse-unknown-contact`
4. [x] - `p1` - **RETURN** the channel id, the contact id and the assignee, empty when the request names none - `inst-return-create`

### Store a new conversation

- [x] `p1` - **ID**: `cpt-template-inbox-algo-data-store-create`

**Input**: a checked create request

**Output**: the created conversation

**Steps**:
1. [x] - `p1` - Advance the package's created-conversation sequence - `inst-count-create`
2. [x] - `p1` - Build an open, empty chat conversation with the id `c-new-<sequence>`, the contact's name as its subject, the current time as its last activity, the brand, no team inbox, no priority, tags, files or suggested replies, and the requested assignee - `inst-build-conversation`
3. [x] - `p1` - Append it to the package's conversation list - `inst-append-conversation`
4. [x] - `p1` - Add a reference to it to the contact's own list of conversations, and to no other contact's - `inst-link-contact`
5. [x] - `p1` - **RETURN** the conversation - `inst-return-conversation`

### Refuse a request

- [x] `p1` - **ID**: `cpt-template-inbox-algo-data-refuse`

**Input**: the status a backend would answer with and a message

**Output**: none; the call throws

**Steps**:
1. [x] - `p1` - The refusal error carries the status and the message and no data field, so the protocol reports a failed request rather than a recovered response - `inst-carry-status`
2. [x] - `p1` - Throw the refusal error from the mock factory - `inst-throw-refusal`

### Anchor the seed clock

- [x] `p2` - **ID**: `cpt-template-inbox-algo-data-seed-anchor`

**Input**: none; runs when a package's copy of the seed clock loads

**Output**: the package's anchor instant and the seed instants measured back from it

**Steps**:
1. [x] - `p2` - Take the current time as the anchor once, when the package's copy of the module loads - `inst-resolve-once`
2. [x] - `p2` - Write every seed instant as an ISO string a number of minutes, hours or days back from the anchor - `inst-offset-instants`

## 4. States (CDSL)

### Package mock state

- [x] `p2` - **ID**: `cpt-template-inbox-state-data-package-mock-state`

**States**: Absent, Seeded

**Initial State**: Absent

**Transitions**:
1. [x] - `p2` - **FROM** Absent **TO** Seeded **WHEN** a mock factory of the package reads the state for the first time in the page - `inst-seed-on-first-read`
2. [x] - `p2` - **FROM** Seeded **TO** Absent **WHEN** the state is reset (between test cases); the next read seeds it again with fresh id sequences - `inst-reset-state`

A page reload also returns to Absent, since the state is held in memory only. A screen's unmount and remount keep it Seeded. Every package that bundles the store has its own state, with its own transitions.

## 5. Definitions of Done

### Inbox service and its registrar

- [x] `p1` - **ID**: `cpt-template-inbox-dod-data-inbox-service`

The system **MUST** provide one inbox service at the base URL `/api/inbox` with the five reads and the two writes of the DESIGN, declare the host's mock transport on it with the inbox mock map without switching it on, and register it through a registrar of its own that does nothing when the service is already registered, so a package registers only the services its screen reads and the app's mock switch alone decides between the mock map and a backend.

**Implements**:
- `cpt-template-inbox-flow-data-read-collections`
- `cpt-template-inbox-flow-data-post-message`
- `cpt-template-inbox-flow-data-start-conversation`

**Constraints**: `cpt-template-inbox-constraint-collection-endpoints`

**Covers (DESIGN)**:
- `cpt-template-inbox-component-inbox-data`
- `cpt-template-inbox-seq-attach-backend`

**Touches**:
- API: `GET /api/inbox/me`, `GET /api/inbox/channels`, `GET /api/inbox/conversations`, `GET /api/inbox/messages`, `GET /api/inbox/contacts`, `POST /api/inbox/messages`, `POST /api/inbox/conversations`
- DB: none
- Entities: `Agent`, `Channel`, `Conversation`, `Message`, `Contact`

### One mock state per package

- [x] `p1` - **ID**: `cpt-template-inbox-dod-data-package-state`

The system **MUST** keep the inbox mock state in a module variable of the mock store, so every package that bundles it keeps its own copy, seeded lazily from copies of the same seed, kept across the screen's unmount and remount within the page and reset by a page reload or `resetInboxMockState()`, answer every read with a copy and store every accepted write there, so a write is visible on the screen whose package made it for the page session, and no state passes between packages outside FrontX's mechanisms: shared properties, actions chains and the host's shared query cache.

**Implements**:
- `cpt-template-inbox-algo-data-package-state`
- `cpt-template-inbox-algo-data-store-post`
- `cpt-template-inbox-algo-data-store-create`
- `cpt-template-inbox-state-data-package-mock-state`

**Constraints**: `cpt-template-inbox-constraint-collection-endpoints`

**Covers (DESIGN)**:
- `cpt-template-inbox-component-inbox-data`
- `cpt-template-inbox-seq-write-propagation`

**Touches**:
- API: `GET /api/inbox/conversations`, `GET /api/inbox/messages`, `GET /api/inbox/contacts`, `POST /api/inbox/messages`, `POST /api/inbox/conversations`
- DB: none; the state is held in memory for the page session
- Entities: `Contact`, `Conversation`, `Message`

### Refusal with a status

- [x] `p1` - **ID**: `cpt-template-inbox-dod-data-refusal`

The system **MUST** refuse a write a backend would refuse by throwing an error that carries the backend's status and no data field, so the request fails with that status although the host's mock transport answers only with success.

**Implements**:
- `cpt-template-inbox-algo-data-refuse`
- `cpt-template-inbox-algo-data-check-post`
- `cpt-template-inbox-algo-data-check-create`

**Constraints**: `cpt-template-inbox-constraint-mock-success-only`

**Touches**:
- API: `POST /api/inbox/messages`, `POST /api/inbox/conversations`
- DB: none
- Entities: `Conversation`, `Contact`

### One seed clock per package

- [x] `p2` - **ID**: `cpt-template-inbox-dod-data-seed-clock`

The system **MUST** write every seed instant as an ISO string measured back from the anchor `ANCHOR_MS`, taken when the package's copy of the seed clock loads, so each screen measures "an hour ago" from its own load moment and its seeds read the same on any day.

**Implements**:
- `cpt-template-inbox-algo-data-seed-anchor`

**Touches**:
- API: none
- DB: none
- Entities: `Conversation`, `Message`

### Response types and contract values

- [x] `p2` - **ID**: `cpt-template-inbox-dod-data-response-types`

The system **MUST** define the response and request types of the inbox endpoints and of the dashboard overview, and the values the screens share with the data layer (the channel ids, the brand, the team inbox routing values), in the shared folder, so screens and services agree on one shape whether a mock or a backend answers.

**Implements**:
- `cpt-template-inbox-flow-data-read-collections`

**Constraints**: `cpt-template-inbox-constraint-collection-endpoints`

**Touches**:
- API: every endpoint of the inbox service; `GET /api/dashboard/overview` (response type only)
- DB: none
- Entities: `Agent`, `Channel`, `Conversation`, `Message`, `Contact`, `Dashboard overview`

## 6. Acceptance Criteria

- [x] Every read answers from the seeded data rather than the network, and a reply posted through the service is in the transcript a later read serves (`InboxApiService.test.ts`: "answers from the seeded dataset instead of the network", "keeps a posted reply in the transcript a later read serves").
- [x] Posted messages are numbered in sequence, a note is internal, and the conversation's snippet and last activity move to the posted message (`InboxApiService.test.ts`).
- [x] A post without a conversation or body, with an unknown kind, or into an unknown conversation is refused with 400, 400 and 404, and stores nothing; a create without a channel or contact is refused with 400 and an unknown contact with 404 (`InboxApiService.test.ts`).
- [x] A created conversation is served in the list, takes posts and joins its contact's conversations and no other contact's (`InboxApiService.test.ts`).
- [x] Responses are copies, so a caller changing one cannot change the next (`InboxApiService.test.ts`, `mockStore.test.ts`).
- [x] Turning the framework's mock switch off takes every mock plugin off its protocol, and turning it on puts each back once (`InboxApiService.test.ts`: "takes every mock plugin off its protocol when the framework switch turns mocks off, and puts each back once").
- [x] Each module graph has its own state, created from the same seed; a reply posted through one graph stays in that graph's reads and out of another graph's; the store answers with copies; and a reset brings the conversations, the messages and their snippets back to the seed (`mockStore.test.ts`).
- [x] Every seed instant is measured back from the moment the package's copy of the module loaded, and a copy loaded later has its own, later anchor (`seedClock.test.ts`).
- [x] The seed is consistent: conversation references point at conversations of that contact, every conversation's contact exists, each thread's newest message sits at its conversation's last activity, instants are ISO strings and phone numbers use the reserved fictional range (`dataset.test.ts`).
- [x] The shared query cache keeps the reads a screen made when another screen package loads for the first time, and a read another screen made is painted from the shared cache on the first render, without a loading state (`inbox-chat-mfe/src/crossScreen.test.tsx`).
- [x] The packages that are present keep no query hooks, mock plugin or store factory of their own, read and write through the hooks of `@gears-frontx/react` without opting out of the shared cache, and declare every service's mocks on the host's mock transport (`dataLayer.test.ts`).
- [x] The data guideline in the template's AI bundle states the services, each package's mock state, the invalidation per write, each screen's state and the mock switch, citing only paths under `src-app/mfe_packages/` (the guideline is not code and carries no markers).

All tests named here are in `src-app/mfe_packages/inbox-contacts-mfe/src/shared-inbox/`, where the shared folder's tests run.
