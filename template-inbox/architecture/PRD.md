# PRD - template-inbox

<!-- toc -->

- [1. Overview](#1-overview)
  - [1.1 Purpose](#11-purpose)
  - [1.2 Background / Problem Statement](#12-background--problem-statement)
  - [1.3 Goals (Business Outcomes)](#13-goals-business-outcomes)
  - [1.4 Glossary](#14-glossary)
- [2. Actors](#2-actors)
  - [2.1 Human Actors](#21-human-actors)
  - [2.2 System Actors](#22-system-actors)
- [3. Operational Concept & Environment](#3-operational-concept--environment)
  - [3.1 Module-Specific Environment Constraints](#31-module-specific-environment-constraints)
- [4. Scope](#4-scope)
  - [4.1 In Scope](#41-in-scope)
  - [4.2 Out of Scope](#42-out-of-scope)
- [5. Functional Requirements](#5-functional-requirements)
  - [5.1 Screens](#51-screens)
  - [5.2 Working as One Application](#52-working-as-one-application)
  - [5.3 Integration with the Host](#53-integration-with-the-host)
  - [5.4 Data Source](#54-data-source)
  - [5.5 Extending the Template](#55-extending-the-template)
- [6. Non-Functional Requirements](#6-non-functional-requirements)
  - [6.1 NFR Inclusions](#61-nfr-inclusions)
  - [6.2 NFR Exclusions](#62-nfr-exclusions)
- [7. Public Library Interfaces](#7-public-library-interfaces)
  - [7.1 Public API Surface](#71-public-api-surface)
  - [7.2 External Integration Contracts](#72-external-integration-contracts)
- [8. Use Cases](#8-use-cases)
- [9. Acceptance Criteria](#9-acceptance-criteria)
- [10. Dependencies](#10-dependencies)
- [11. Assumptions](#11-assumptions)
- [12. Risks](#12-risks)

<!-- /toc -->

## 1. Overview

### 1.1 Purpose

template-inbox is a FrontX template that adds a small helpdesk product to a FrontX application: four screens (contacts, dashboard, chat and mail) that work together as one application while each is a separate microfrontend. A person can browse a customer directory, open a customer's page, read team metrics, answer conversations and read and send mail, and what they do on one screen shows on the others.

The template exists to show what a multi-screen FrontX application looks like when it is built only from the ecosystem: the UI kit for every control, the FrontX data and state layers for every read, write and remembered choice, the screen domain and actions for moving between screens. It runs without a backend, on mocked services that a project switches off in one place to talk to a real one.

### 1.2 Background / Problem Statement

A single screen shows little of what an application built from microfrontends has to solve. A real product has several screens that read people, conversations and messages, that move the user from one to another, and that keep what the user changed while each screen is loaded, cached and isolated on its own. Without a working example, a team adopting FrontX has to discover for itself how separately loaded screens keep their own data while sharing one query cache, through which reads also pass between them, how one screen opens another at a specific page, and how a screen keeps its place when the user comes back.

The inbox app was first written as an overlay on template-shell in a draft pull request of the templates repository. This repository carries it as a site-owned template so that the site can show it at stable addresses and keep it on the same shape and the same ecosystem releases as every other screen of the site.

### 1.3 Goals (Business Outcomes)

- **A working multi-screen product**: the four screens run in any project that has template-shell and template-mfe applied, with no wiring beyond copying the template. Target: all four screens open from the host's navigation at their addresses.
- **A screen shows what the user changed on it**: what the user changes on a screen is what that screen shows, across its views and its remounts, for the page session. Target: every write the screens offer is visible on the screen that made it, across its views and its remounts, without a page reload.
- **Built from the ecosystem only**: every control comes from the UI kit, every read and write goes through the FrontX data layer, and every remembered choice is FrontX state. Target: no screen-private query cache, mock transport or store.
- **Ready for a real backend**: switching the mocks off sends every request to a backend with the screens unchanged. Target: one switch, no screen code change.

### 1.4 Glossary

| Term | Definition |
|------|------------|
| screen | A microfrontend the application shell mounts in its screen domain and lists in its navigation; each inbox screen is one package. |
| person's page | The page of one contact inside the contacts screen, opened from the directory or from another screen. |
| shared folder | The code the four screens share; it is bundled into each screen rather than loaded as a package of its own. |
| mock backend | The services' built-in answers that stand in for a server while no backend is attached. |
| page session | The time from loading the page to reloading or leaving it. |

## 2. Actors

### 2.1 Human Actors

#### Inbox User

**ID**: `cpt-template-inbox-actor-inbox-user`

**Role**: Uses the four screens in a browser as a support agent would: browses contacts, reads the dashboard, answers conversations, reads and sends mail.
**Needs**: Screens that agree with each other, links between them that behave like links, and a screen that keeps its place when they come back to it.

#### Project Developer

**ID**: `cpt-template-inbox-actor-project-developer`

**Role**: Applies the template onto a FrontX project, keeps some or all of its screens, adds screens beside them, and attaches a real backend; works alongside AI agents.
**Needs**: A template that runs as copied, a documented way to switch from mocks to a backend, and written rules for adding a screen.

### 2.2 System Actors

#### Application Shell

**ID**: `cpt-template-inbox-actor-application-shell`

**Role**: The host application from template-shell and template-mfe: mounts each screen in its screen domain, writes and reads the page address, lists the screens in its navigation, and supplies the theme, the language and the page-wide query cache.

#### Inbox Backend

**ID**: `cpt-template-inbox-actor-inbox-backend`

**Role**: A server a project attaches in place of the mock backend; it serves the people, conversations, messages, dashboard figures and mail the screens read and accepts the writes they send.

#### AI Coding Agent

**ID**: `cpt-template-inbox-actor-ai-agent`

**Role**: An agent working in a project that carries the template; it reads the template's guidelines before changing an inbox screen or adding one.

## 3. Operational Concept & Environment

### 3.1 Module-Specific Environment Constraints

- The template applies only onto a project that already has template-shell and template-mfe applied; it brings no host of its own.
- The screens use the exact ecosystem releases the hosting project installs; a template update follows the project's releases.

## 4. Scope

### 4.1 In Scope

- Four screens: contacts (a directory and each person's page), dashboard (team metrics), chat (conversations with replies and notes) and mail (mailboxes, reading, reply and compose).
- Opening a person's page in contacts from a chat conversation.
- Each screen's writes kept for the session by a mock backend of the screen's own package, and the switch to a real backend.
- Each screen keeping its own choices (open item, search, filters, drafts) across visits within the session.
- Page metadata for every screen and its pages.
- Guidelines for AI agents on the screens' data and on what the shell owns.

### 4.2 Out of Scope

- A backend: the template ships answers for a session only, lost on reload.
- Facts shared between screens by the mocks: each screen package answers from its own copy of the seed, so a write on one screen is not on another; a real backend shares facts between screens.
- Persisting the triage changes the chat details panel offers (assignee, priority, status, tags, spam) or a created channel beyond the screen's own state.
- Authentication, user accounts and permissions.
- Real-time updates pushed from a server.
- A host, a navigation or a theme of its own.

## 5. Functional Requirements

### 5.1 Screens

#### Contacts directory

- [x] `p1` - **ID**: `cpt-template-inbox-fr-contacts-directory`

The template **MUST** provide a contacts screen that lists every contact and lets the user narrow the list by type and activity, search it, sort it and page through it, and **MUST** show how many contacts each filter holds.

**Rationale**: The directory is the entry point to the people every other screen refers to.

**Actors**: `cpt-template-inbox-actor-inbox-user`

#### A person's page

- [x] `p1` - **ID**: `cpt-template-inbox-fr-contact-page`

The contacts screen **MUST** give every contact a page of their own, with their details, tickets and latest activity, addressable on its own, and **MUST** show a not-found state for an address that names no contact.

**Rationale**: A person's page is what other screens link to and what the user shares or reopens.

**Actors**: `cpt-template-inbox-actor-inbox-user`

#### Team dashboard

- [x] `p1` - **ID**: `cpt-template-inbox-fr-dashboard`

The template **MUST** provide a dashboard screen with headline figures and their trends, charts of resolved and created records and new contacts, team workload, the contact stage funnel, conversion by source, the top agents and the recent activity, and every person the activity names **MUST** be a contact the directory lists.

**Rationale**: The dashboard shows the inbox's people and work from a team's point of view.

**Actors**: `cpt-template-inbox-actor-inbox-user`

#### Chat

- [x] `p1` - **ID**: `cpt-template-inbox-fr-chat`

The template **MUST** provide a chat screen with channels, a searchable and sortable conversation list, the open conversation's thread, a composer that posts a reply or an internal note, a way to start a conversation with an existing contact, and the customer's details beside the thread, where the user can change the conversation's assignee, priority, status and tags for the session.

**Rationale**: Chat is where the user acts on conversations; its writes are what the screen must keep for the session.

**Actors**: `cpt-template-inbox-actor-inbox-user`

#### Mail

- [x] `p1` - **ID**: `cpt-template-inbox-fr-mail`

The template **MUST** provide a mail screen with mailboxes, a searchable mail list, a reading pane with the mail's earlier messages, reply, and compose, and the compose dialog **MUST** keep the draft until the mail is sent and tell the user when sending fails.

**Rationale**: Mail is the second channel of the product, with its own data and its own write.

**Actors**: `cpt-template-inbox-actor-inbox-user`

### 5.2 Working as One Application

#### View a contact from a conversation

- [x] `p1` - **ID**: `cpt-template-inbox-fr-view-contact`

The chat screen **MUST** let the user open the conversation's contact on their page in the contacts screen with one action that adds one history entry, so that Back returns to the conversation as it was, without reloading the page; where the chat screen is not mounted in the host's screen domain, it **MUST NOT** offer that action.

**Rationale**: Moving between screens must behave like following a link, or the screens read as separate applications.

**Actors**: `cpt-template-inbox-actor-inbox-user`, `cpt-template-inbox-actor-application-shell`

#### A screen shows what the user changed on it

- [x] `p1` - **ID**: `cpt-template-inbox-fr-screen-facts`

Each screen **MUST** show what the user changed on it, across its views and its remounts, for the whole page session, without a page reload: a reply or note posted, a conversation started or a mail sent **MUST** show in every view of the screen that made it once that screen's own read has answered, including after the screen unmounts and mounts again. Screens **MUST NOT** share mock state: each screen package answers from its own copy of the seed. Since the screens read through one shared query cache, a screen **MAY** paint another package's cached answer until its own refetch answers.

**Rationale**: Each screen is loaded and isolated on its own and passes data only through FrontX's mechanisms (shared properties, actions chains and the host's shared query cache); within a screen, a write must stay the way a backend keeps it, or a reply would vanish on the next visit. A real backend gives one set of facts to every screen; the mocks do not simulate that.

**Actors**: `cpt-template-inbox-actor-inbox-user`

#### A screen keeps its place

- [x] `p2` - **ID**: `cpt-template-inbox-fr-screen-keeps-place`

Each screen **MUST** keep what the user chose on it (the open channel, conversation, mailbox or mail, search, sort, filter, tab, unsent drafts and the session's triage changes) when the user leaves it and comes back within the page session.

**Rationale**: Moving between screens is part of the work; losing a draft or a selection on every visit makes the screens unusable together.

**Actors**: `cpt-template-inbox-actor-inbox-user`

#### Data already read paints at once

- [x] `p2` - **ID**: `cpt-template-inbox-fr-instant-return`

A screen **MUST** paint from data already read in the page session instead of showing its loading state again, including when another screen loads for the first time in between, and a failed background refresh **MUST** leave the screen as it is.

**Rationale**: The screens share their reads; showing a loading state for data the page already holds reads as a fault.

**Actors**: `cpt-template-inbox-actor-inbox-user`

### 5.3 Integration with the Host

#### Screens join the host's navigation

- [x] `p1` - **ID**: `cpt-template-inbox-fr-host-navigation`

Each screen **MUST** appear in the host's navigation, in one group with the host's other demos, and open at a stable address, as soon as the template is applied, with no change to the host's code.

**Rationale**: A template that needs host wiring is not an overlay a project can copy.

**Actors**: `cpt-template-inbox-actor-project-developer`, `cpt-template-inbox-actor-application-shell`

#### Theme, language and direction from the host

- [x] `p1` - **ID**: `cpt-template-inbox-fr-host-theme-language`

Each screen **MUST** follow the host's theme and language as they change, including right-to-left languages, and **MUST** take every string from a catalogue for that language, so that adding a language needs only new translation files.

**Rationale**: The host owns the theme and the language; a screen that keeps its own is out of step with the page.

**Actors**: `cpt-template-inbox-actor-application-shell`, `cpt-template-inbox-actor-project-developer`

#### Failures stay inside the screen

- [x] `p1` - **ID**: `cpt-template-inbox-fr-failure-isolation`

A screen that fails to render **MUST** show a recoverable error inside the screen while the host and its navigation keep working; a screen whose data fails to load **MUST** show a retry; an address inside a screen that matches none of its pages **MUST** show the screen's own not-found page.

**Rationale**: One faulty screen must not take the application down.

**Actors**: `cpt-template-inbox-actor-inbox-user`

#### Page metadata per screen

- [x] `p2` - **ID**: `cpt-template-inbox-fr-page-metadata`

Each screen **MUST** declare its page title and description once, beside its registration, and **MUST** declare a person's page as not indexable, since it stands for every contact rather than one page.

**Rationale**: The host derives the document head and discovery files from that one declaration.

**Actors**: `cpt-template-inbox-actor-application-shell`

### 5.4 Data Source

#### Runs without a backend

- [x] `p1` - **ID**: `cpt-template-inbox-fr-mock-backend`

The template **MUST** answer every read and write the screens make from a built-in mock backend seeded with consistent data, **MUST** refuse a write a backend would refuse, and **MUST** keep every change for the page session.

**Rationale**: The template is a demo and a starting point; it must work the moment it is applied.

**Actors**: `cpt-template-inbox-actor-inbox-user`, `cpt-template-inbox-actor-project-developer`

#### One switch to a real backend

- [x] `p1` - **ID**: `cpt-template-inbox-fr-backend-switch`

The template **MUST** let a project send every request to a real backend by changing one setting shared by the four screens, with the screens and the requests unchanged; the real backend then gives every screen one set of facts.

**Rationale**: A starting point that has to be rewritten to meet a backend is not one.

**Actors**: `cpt-template-inbox-actor-project-developer`, `cpt-template-inbox-actor-inbox-backend`

### 5.5 Extending the Template

#### Screens stand alone

- [x] `p2` - **ID**: `cpt-template-inbox-fr-screens-stand-alone`

The template **MUST** let a project keep any subset of the four screens: no screen depends on another screen's code, and the shared checks keep passing with the screens the project keeps.

**Rationale**: A project takes what it needs from a template.

**Actors**: `cpt-template-inbox-actor-project-developer`

#### Guidelines for agents

- [x] `p2` - **ID**: `cpt-template-inbox-fr-agent-guidelines`

The template **MUST** ship guidelines that state how the screens' data works (services, each package's mock state, invalidation, each screen's state, the backend switch) and what the host owns against what each screen keeps, including how to add a screen.

**Rationale**: Developers change the template together with AI agents; rules an agent cannot read are rules it breaks.

**Actors**: `cpt-template-inbox-actor-ai-agent`, `cpt-template-inbox-actor-project-developer`

## 6. Non-Functional Requirements

### 6.1 NFR Inclusions

#### Accessible screens

- [x] `p1` - **ID**: `cpt-template-inbox-nfr-accessibility`

Every screen **MUST** have exactly one top-level heading, **MUST** move focus to it whenever the screen mounts and when the user moves to another page of the screen, and **MUST** keep every text it styles at a contrast of at least 4.5:1 in the light and the dark theme.

**Threshold**: one top-level heading per screen state; 4.5:1 text contrast in both themes for every badge, avatar and label the screens choose.

**Rationale**: The screens are a public demo of the ecosystem; an inaccessible demo argues against it.

#### Layout follows the room the host leaves

- [x] `p2` - **ID**: `cpt-template-inbox-nfr-container-layout`

Every screen **MUST** lay out its panes by the width the host gives it, not the window's, and **MUST** never paint in a layout that width does not have.

**Threshold**: no first paint in a layout other than the one for the measured width; every pane rule follows the screen's width.

**Rationale**: The host's sidebar takes part of the window; a screen sized by the window overflows or wastes the space it has.

#### Built from the kit

- [x] `p1` - **ID**: `cpt-template-inbox-nfr-kit-only`

Every control of every screen **MUST** come from the FrontX UI kit, styled only with the kit's tokens, with no utility-class framework.

**Threshold**: no control outside the kit; no colour or size outside the kit's tokens except where the kit lacks one, and each such case recorded.

**Rationale**: The template demonstrates the kit; a home-made control demonstrates something else.

### 6.2 NFR Exclusions

- Response time and throughput: not applicable, because every answer comes from the mock backend in the page; a project's backend sets its own targets.
- Data durability: not applicable, because the mock backend keeps changes only for the page session by design.
- Security and authorization: not applicable, because the template has no accounts and sends no data anywhere while mocked.

## 7. Public Library Interfaces

### 7.1 Public API Surface

#### Screen addresses

- [x] `p1` - **ID**: `cpt-template-inbox-interface-screen-addresses`

**Type**: URL grammar of the host

**Stability**: stable

**Description**: Each screen is reachable at its own address token in the host's address, and a person's page at the contacts token with the contact's id as the route inside the screen.

**Breaking Change Policy**: a token or a page path is never reused for other content; a change is a template version bump.

#### Open a person's page

- [x] `p2` - **ID**: `cpt-template-inbox-interface-open-person-page`

**Type**: Protocol (the contacts screen's `show_contact` action with a closed schema, payload `{ contact }`, sent after the host mounts the screen)

**Stability**: experimental

**Description**: The contacts screen declares the action that shows a person's page, so any screen in the same host can open that page with one history entry, naming the person and never the screen's routes.

**Breaking Change Policy**: template version bump; the action's type id carries its version, and a changed payload shape is a new version.

#### Template overlay

- [x] `p2` - **ID**: `cpt-template-inbox-interface-overlay`

**Type**: Data format (the template manifest and the subtrees it claims)

**Stability**: experimental

**Description**: The four screen packages, the shared folder and the guidelines bundle, which a project with template-shell and template-mfe copies as they are.

**Breaking Change Policy**: template version bump on any change to a claimed subtree.

### 7.2 External Integration Contracts

#### Backend data contract

- [x] `p1` - **ID**: `cpt-template-inbox-contract-backend-data`

**Direction**: required from the backend a project attaches

**Protocol/Format**: the collections and writes the services declare, with their response types

**Compatibility**: the mock backend answers exactly what a backend must serve, so a backend that serves it needs no screen change.

#### Host services

- [x] `p1` - **ID**: `cpt-template-inbox-contract-host-services`

**Direction**: required from the host (template-shell and template-mfe)

**Protocol/Format**: the screen domain and its actions, the theme and language shared properties, the page-wide query cache and the mock transport the host supplies

**Compatibility**: pinned to the host's exact releases; a host upgrade is a template update.

## 8. Use Cases

#### Answer a conversation and check the customer

- [x] `p2` - **ID**: `cpt-template-inbox-usecase-answer-and-view-contact`

**Actor**: `cpt-template-inbox-actor-inbox-user`

**Preconditions**:
- The host is running with the template applied.

**Main Flow**:
1. The user opens the chat screen and a conversation.
2. The user posts a reply.
3. The user chooses "View contact".
4. The contacts screen opens on the customer's page.
5. The user goes Back.

**Postconditions**:
- The chat screen shows the same conversation, with the reply, and its draft cleared.

**Alternative Flows**:
- **The reply is refused**: the composer says the send failed and keeps the text, and the user can send again.

#### Browse the directory

- [x] `p2` - **ID**: `cpt-template-inbox-usecase-browse-directory`

**Actor**: `cpt-template-inbox-actor-inbox-user`

**Preconditions**:
- The host is running with the template applied.

**Main Flow**:
1. The user opens the contacts screen and narrows the list with a filter and a search.
2. The user opens a person's page.
3. The user leaves for another screen and comes back.

**Postconditions**:
- The directory shows the same filter and search.

**Alternative Flows**:
- **An address naming no contact**: the screen shows the contact-not-found state.

#### Send a mail

- [x] `p2` - **ID**: `cpt-template-inbox-usecase-send-mail`

**Actor**: `cpt-template-inbox-actor-inbox-user`

**Preconditions**:
- The mail screen is open.

**Main Flow**:
1. The user opens compose, writes a recipient, a subject and a body.
2. The user sends the mail.

**Postconditions**:
- The mail is listed under Sent.

**Alternative Flows**:
- **The send fails**: the dialog stays open with the draft and says the send failed.

#### Attach a real backend

- [x] `p2` - **ID**: `cpt-template-inbox-usecase-attach-backend`

**Actor**: `cpt-template-inbox-actor-project-developer`

**Preconditions**:
- The project has the template applied, and a backend serves the backend data contract.

**Main Flow**:
1. The developer turns the mock backend off in the one shared setting.
2. The developer runs the project.

**Postconditions**:
- Every screen reads from and writes to the backend, with the screens and the requests unchanged, and the screens show one set of facts.

## 9. Acceptance Criteria

- [ ] Each of the four screens opens from the host's navigation at its address in a project with template-shell and template-mfe applied and the template copied in.
- [ ] A reply posted in chat shows in the conversation once chat's own read has answered, also after the user returns from contacts, where chat may briefly paint contacts' cached answer first; "View contact" opens the contact's page in contacts, and Back returns to the conversation, with one history entry added.
- [ ] Leaving a screen and returning keeps its selection, search, filter and drafts, and paints without a loading state.
- [ ] Every screen's unit, type and lint checks pass, alone and with any screen of the four removed.
- [ ] Every screen renders in the light and the dark theme with no console error, and takes the right-to-left direction when the host's language is written right to left.

## 10. Dependencies

| Dependency | Description | Criticality |
|------------|-------------|-------------|
| template-shell and template-mfe | The host, its screen domain, navigation, address, theme and language, the page-wide query cache and the mock transport | p1 |
| FrontX ecosystem releases | The UI kit, the data, state, routing and microfrontend libraries, at the host's exact versions | p1 |
| The host's screen domain and actions chains | The mount action and the chain's next step through which another screen reaches a person's page | p2 |
| gears-frontx-templates draft PR #13 at `3c468ef` | The inbox app this template was adapted from | p3 |

## 11. Assumptions

- The host supplies one query cache for the whole page that every screen joins.
- Every screen package bundles the seed of each service it reads, so each answers from its own copy of the same seed.
- A contact's id is a single path segment once encoded.

## 12. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| The template diverges from the upstream draft it was adapted from | A later re-sync from upstream is a manual merge | The template README lists every adapted file and the reason |
| Some UI kit badge tones stay under 4.5:1 text contrast in the light theme | Status colours could fail contrast | The screens use only the tones that pass in both themes, and the gap is recorded |
| A framework change makes a first load clear the page's shared reads | Returning to a screen shows its loading state again | The screens' app is built in one shared order, held by a test |
| A demo user expects a write on one screen to show on another | The demo reads as losing data between screens | The PRD, the data guideline and the README state that each screen package keeps its own mock state, and a real backend shares facts between screens |
