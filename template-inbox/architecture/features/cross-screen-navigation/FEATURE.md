# Feature: Cross-Screen Navigation

<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Open another screen at a page inside it](#open-another-screen-at-a-page-inside-it)
  - [Move the mounted screen to the named page](#move-the-mounted-screen-to-the-named-page)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Check the screen domain](#check-the-screen-domain)
- [4. States (CDSL)](#4-states-cdsl)
  - [No state of its own](#no-state-of-its-own)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Screen tokens and extension ids](#screen-tokens-and-extension-ids)
  - [Open another screen](#open-another-screen)
  - [Show-contact handler](#show-contact-handler)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

- [x] `p2` - **ID**: `cpt-template-inbox-featstatus-cross-screen-navigation`

- [x] `p2` - `cpt-template-inbox-feature-cross-screen-navigation`

## 1. Feature Context

### 1.1 Overview

The cross-screen navigation feature is the shared folder's `navigation/` subfolder: the address tokens and screen extension ids of the four screens, the check whether a bridge occupies the host's screen domain, the contacts screen's `show_contact` action type, `openScreen`, which opens another inbox screen, at its root or at a page through the action that screen declares, with one actions chain through the host, and the handler that moves the contacts screen's own router to a person's page when the chain's `show_contact` step reaches it.

### 1.2 Purpose

"View contact" in chat must open the person's page in contacts like a link: one history entry, Back returns to the conversation as it was, no page reload, and no inbox code writing the page address. The host's screen domain mounts a screen but carries no page inside it, so the chain adds the contacts screen's own `show_contact` action, with the person's id, as its next step; the sender never names the contacts screen's routes.

**Requirements**: `cpt-template-inbox-fr-view-contact`

**Principles**: `cpt-template-inbox-principle-host-owns-chrome`

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-inbox-actor-inbox-user` | Follows a link from one screen to a page inside another, and goes Back |
| `cpt-template-inbox-actor-application-shell` | Mounts the target in its screen domain, writes its address entry, validates the `show_contact` step against the contacts schema and dispatches it to the mounted target |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md), component `cpt-template-inbox-component-cross-screen-navigation`, sequence `cpt-template-inbox-seq-view-contact`
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.3
- **Screen actions**: the hosting site's contract for moving between screens ([architecture/DESIGN.md](../../../../architecture/DESIGN.md), [architecture/ADR/0006-cross-screen-deep-links.md](../../../../architecture/ADR/0006-cross-screen-deep-links.md)): `mount_ext`, then the action the receiving screen declares.
- **Code**: `src-app/mfe_packages/shared/inbox/navigation/screens.ts`, `src-app/mfe_packages/shared/inbox/navigation/openScreen.ts` (paths relative to `template-inbox/`)
- **Dependencies**: None. Contacts declares the action and its schema in its manifest and registers the handler in its lifecycle ([Contacts Screen](../contacts/FEATURE.md)); chat offers "View contact" only inside the screen domain ([Chat Screen](../chat/FEATURE.md)).

## 2. Actor Flows (CDSL)

### Open another screen at a page inside it

- [x] `p1` - **ID**: `cpt-template-inbox-flow-cross-screen-navigation-open-screen`

**Actor**: `cpt-template-inbox-actor-inbox-user`

**Use cases**: `cpt-template-inbox-usecase-answer-and-view-contact`

**Success Scenarios**:
- The chain reaches the host: the target screen mounts in the screen domain with one address entry, and the target's own action, when the chain carries one, shows the named page inside it.

**Error Scenarios**:
- A caller outside the host's screen domain sends nothing and is told so, and does not offer the link.

**Steps**:
1. [x] - `p1` - **IF** the caller's bridge does not occupy the host's screen domain (`cpt-template-inbox-algo-cross-screen-navigation-screen-domain`), **RETURN** not sent, sending nothing - `inst-refuse-outside-domain`
2. [x] - `p1` - Look up the target screen's extension id by its address token - `inst-resolve-extension`
3. [x] - `p1` - Build the screen domain's mount action for that extension - `inst-build-mount`
4. [x] - `p1` - Send one actions chain through the bridge: the mount alone when no action is named, otherwise the mount followed by the named action with its payload, targeted at the target extension - `inst-send-chain`
5. [x] - `p1` - **RETURN** sent - `inst-return-sent`

### Move the mounted screen to the named page

- [x] `p1` - **ID**: `cpt-template-inbox-flow-cross-screen-navigation-handle-show-contact`

**Actor**: `cpt-template-inbox-actor-application-shell`

**Use cases**: `cpt-template-inbox-usecase-answer-and-view-contact`

**Success Scenarios**:
- The receiving screen's own router replaces the entry the mount wrote with the named page, so the link makes one history entry and Back returns to the caller.

**Error Scenarios**:
- The host's mediator refuses a `show_contact` whose target is not the contacts screen or whose payload is not one non-empty contact id; a payload without a string contact, or a package app built without the microfrontends plugin, is refused by the handler with an error and the router does not move.

**Steps**:
1. [x] - `p1` - Read the contact's id from the action's payload - `inst-read-contact`
2. [x] - `p1` - **IF** the id is not a non-empty string, refuse with an error: the action schema and the handler disagree - `inst-reject-missing-contact`
3. [x] - `p1` - **IF** the package app has no router, refuse with an error: it was built without the microfrontends plugin - `inst-require-router`
4. [x] - `p1` - Replace the current entry of the screen's own router with the person's page, the id encoded as one path segment, through its navigation facade, resolved for this action - `inst-replace-entry`
5. [x] - `p1` - **RETURN** handled - `inst-return-handled`

## 3. Processes / Business Logic (CDSL)

### Check the screen domain

- [x] `p1` - **ID**: `cpt-template-inbox-algo-cross-screen-navigation-screen-domain`

**Input**: a bridge

**Output**: whether it belongs to a screen composed into the host's screen domain

**Steps**:
1. [x] - `p1` - **RETURN** whether the bridge's domain id is the screen domain's id - `inst-compare-domain`

## 4. States (CDSL)

### No state of its own

Not applicable: the feature holds no state. The address entry belongs to the host, and the receiving screen's position belongs to that screen's router.

## 5. Definitions of Done

### Screen tokens and extension ids

- [x] `p1` - **ID**: `cpt-template-inbox-dod-cross-screen-navigation-screen-ids`

The system **MUST** name each inbox screen by the address token its manifest declares as its route and by the id its manifest declares for its screen extension, in one place the navigation and the shared manifest test read.

**Implements**:
- `cpt-template-inbox-flow-cross-screen-navigation-open-screen`

**Constraints**: `cpt-template-inbox-constraint-contacts-show-action`

**Covers (DESIGN)**:
- `cpt-template-inbox-component-cross-screen-navigation`

**Touches**:
- API: URL `/?screen=inbox-contacts`, `inbox-dashboard`, `inbox-chat`, `inbox-mail`
- DB: none
- Entities: none

### Open another screen

- [x] `p1` - **ID**: `cpt-template-inbox-dod-cross-screen-navigation-open-screen`

The system **MUST** open another inbox screen with one actions chain, the screen domain's mount action followed, for a page, by the action the target declares (contacts' `show_contact` with the person's id), and **MUST** send nothing and say so when the caller does not occupy the host's screen domain; no inbox code writes the page address or names another screen's routes.

**Implements**:
- `cpt-template-inbox-flow-cross-screen-navigation-open-screen`
- `cpt-template-inbox-algo-cross-screen-navigation-screen-domain`

**Constraints**: `cpt-template-inbox-constraint-contacts-show-action`

**Covers (DESIGN)**:
- `cpt-template-inbox-component-cross-screen-navigation`
- `cpt-template-inbox-seq-view-contact`

**Touches**:
- API: the screen domain's mount action; `gts.frontx.mfes.comm.action.v1~frontx.inbox_contacts.action.show_contact.v1~`, payload `{ contact }`
- DB: none
- Entities: none

### Show-contact handler

- [x] `p1` - **ID**: `cpt-template-inbox-dod-cross-screen-navigation-show-contact-handler`

The system **MUST** provide the `show_contact` action type and the handler the contacts screen registers for it, which replaces the screen router's current entry with the person's page through the app's navigation facade and refuses a payload without a string contact.

**Implements**:
- `cpt-template-inbox-flow-cross-screen-navigation-handle-show-contact`

**Constraints**: `cpt-template-inbox-constraint-contacts-show-action`

**Covers (DESIGN)**:
- `cpt-template-inbox-component-cross-screen-navigation`
- `cpt-template-inbox-seq-view-contact`

**Touches**:
- API: `gts.frontx.mfes.comm.action.v1~frontx.inbox_contacts.action.show_contact.v1~`, payload `{ contact }`
- DB: none
- Entities: none

## 6. Acceptance Criteria

- [x] `openScreen` mounts the target screen and then sends it the target's typed action, in one chain; with no action it sends the mount alone; outside the host's screen domain it sends nothing and returns not sent (`openScreen.test.ts`).
- [x] The handler replaces the screen's own entry with the person's page through its navigation facade, the id encoded as one path segment, and refuses a payload without a contact or with an empty one (`openScreen.test.ts`).
- [x] The contacts entry declares `show_contact` and its manifest carries the action's closed schema, targeting only the contacts screen (`openScreen.test.ts`: "is declared by the contacts entry, with its closed schema targeting only the contacts screen").
- [x] Every present package's manifest declares the route and the screen extension id the tokens and ids name, and the four screens take menu orders 61 to 64 (`screens.test.ts`).
- [x] Chat's "View contact" sends one chain to the contacts screen with the contact's id as the `show_contact` payload, and is not offered outside the host's screen domain or outside a frame (`inbox-chat-mfe/src/screens/chat/chatNavigation.test.tsx`).

Tests named without a package are in `src-app/mfe_packages/inbox-contacts-mfe/src/shared-inbox/`, where the shared folder's tests run.
