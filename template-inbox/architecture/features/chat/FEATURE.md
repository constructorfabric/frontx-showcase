# Feature: Chat Screen

<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Answer a conversation](#answer-a-conversation)
  - [Start a conversation](#start-a-conversation)
  - [View the contact](#view-the-contact)
  - [Organize channels and triage](#organize-channels-and-triage)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Order the conversation list](#order-the-conversation-list)
  - [Keep the chat's place](#keep-the-chats-place)
- [4. States (CDSL)](#4-states-cdsl)
  - [Composer send state](#composer-send-state)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Conversations, thread and composer](#conversations-thread-and-composer)
  - [Start a conversation](#start-a-conversation-1)
  - [View contact](#view-contact)
  - [Chat keeps its place](#chat-keeps-its-place)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

- [x] `p3` - **ID**: `cpt-template-inbox-featstatus-chat`

- [x] `p3` - `cpt-template-inbox-feature-chat`

## 1. Feature Context

### 1.1 Overview

The chat screen is the package `inbox-chat-mfe`: channels and the agent's own new channels, the conversation list with search and sort, the open conversation's thread, the reply-and-note composer with a draft per conversation and a failure state, starting a conversation with an existing contact, the customer-details panel where the agent changes the conversation's assignee, team inbox, priority, status and tags for the session, and "View contact".

### 1.2 Purpose

Chat is where the user acts on conversations, and its writes stay in the chat package's mock state for the page session, across the screen's views and its remounts. A reply, a note or a new conversation goes to the inbox service and invalidates the reads it changed in the page-wide query cache; everything else the agent chooses or changes stays in the `inbox/chat` slice, so a trip to another screen and back finds the same channel, conversation, drafts and triage changes. "View contact" is offered only where the screen sits in the host's screen domain.

**Requirements**: `cpt-template-inbox-fr-chat`, `cpt-template-inbox-fr-view-contact`, `cpt-template-inbox-fr-screen-keeps-place`, `cpt-template-inbox-fr-host-navigation`, `cpt-template-inbox-fr-page-metadata`

**Principles**: `cpt-template-inbox-principle-one-server-one-cache`

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-inbox-actor-inbox-user` | Picks channels and conversations, answers with replies and notes, starts conversations, triages them, and opens the customer's page |
| `cpt-template-inbox-actor-application-shell` | Mounts the screen in its screen domain and carries the "View contact" chain to the contacts screen |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md), component `cpt-template-inbox-component-chat-screen`, sequences `cpt-template-inbox-seq-view-contact` and `cpt-template-inbox-seq-write-propagation`
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.5
- **ADRs**: `cpt-template-inbox-adr-package-mock-backend`, `cpt-template-inbox-adr-frontx-data-and-state-layers`
- **Code**: `src-app/mfe_packages/inbox-chat-mfe/` (paths relative to `template-inbox/`): `src/screens/chat/`, `src/routes.tsx`, `src/lifecycle.tsx`, `src/init.ts`, `src/slices/`, `src/events/`, `src/actions/`, `src/effects/`, and the manifest `mfe.json`
- **Dependencies**: [Inbox Data](../data/FEATURE.md) (the inbox service, its writes and response types), [Screen Frame and Shared UI](../screen-frame/FEATURE.md) (lifecycle, frame, shared components, first-paint gate, automatic first pick, and the blocks the screen draws with: `NavColumn`, `ListPane`, `ThreadListItem`, `DetailPane`, `ThreadPane`, `TranscriptMessage`, `ReplyComposer`, `InspectorPanel`, `ContactSummary`, `ChipRow`, `PaneState`), [Cross-Screen Navigation](../cross-screen-navigation/FEATURE.md) (the chain `openScreen` sends)

## 2. Actor Flows (CDSL)

User-facing interactions that start with an actor and describe the end-to-end flow of a use case.

**Use cases**: `cpt-template-inbox-usecase-answer-and-view-contact`

### Answer a conversation

- [x] `p1` - **ID**: `cpt-template-inbox-flow-chat-answer-conversation`

**Actor**: `cpt-template-inbox-actor-inbox-user`

**Success Scenarios**:
- The user opens the screen: the default channel's first conversation opens by itself
- The user posts a reply or a note: it shows in the thread at once, the draft clears, and every screen that reads messages or conversations reads them again

**Error Scenarios**:
- A read the first paint needs fails: the screen shows an error with a retry instead of the panes
- The post is refused: the composer says the post did not go out and keeps the draft
- The conversation is closed: the composer takes no reply

**Steps**:
1. [x] - `p1` - API: GET /api/inbox/me, /api/inbox/channels, /api/inbox/conversations, /api/inbox/messages and /api/inbox/contacts through the inbox service and the page-wide query cache - `inst-read-collections`
2. [x] - `p1` - Read the channel, the stored selection, the search, the sort, the composer tab, the details toggle, the triage patches and the agent's own channels and conversations from the `inbox/chat` slice - `inst-read-chat-state`
3. [x] - `p1` - Merge the fetched conversations with the ones started since the read and with this mount's sent replies, and lay the agent's triage patches over all of them - `inst-merge-conversations`
4. [x] - `p1` - Index the contacts by id - `inst-index-contacts`
5. [x] - `p1` - Narrow and order the conversations of the current channel (algorithm Order the conversation list) - `inst-select-visible`
6. [x] - `p1` - Open the first visible conversation automatically when the channel is still owed a pick, and write the selection back to the slice - `inst-auto-select`
7. [x] - `p1` - Build the open thread from the transcript read plus this mount's sent replies, never showing one twice - `inst-thread-messages`
8. [x] - `p1` - **IF** a read the first paint needs failed, show the error pane with a retry; **ELSE IF** any is still loading, show the loading pane - `inst-gate-first-paint`
9. [x] - `p1` - Render the thread with its header actions (star, snooze, spam, close, back on a narrow screen), the suggested replies, and the composer bound to the open conversation - `inst-render-thread`
10. [x] - `p1` - The composer reads and writes the open conversation's own draft in the slice - `inst-read-draft`
11. [x] - `p1` - User sends: **IF** no conversation is open, it is closed, or the trimmed draft is empty, do nothing - `inst-check-sendable`
12. [x] - `p1` - API: POST /api/inbox/messages with the conversation, the trimmed body and the composer tab as the kind - `inst-post-message`
13. [x] - `p1` - **IF** the post is accepted: invalidate the messages and conversations reads, clear the draft only if the box still holds what was sent, and append the stored message to the thread - `inst-post-accepted`
14. [x] - `p1` - **IF** the post is refused: end the post in flight and mark the conversation failed, leaving the draft as it is - `inst-post-refused`
15. [x] - `p1` - **IF** the latest post of the open conversation failed, the composer shows the failure above the kept draft - `inst-show-failure`

### Start a conversation

- [x] `p1` - **ID**: `cpt-template-inbox-flow-chat-start-conversation`

**Actor**: `cpt-template-inbox-actor-inbox-user`

**Success Scenarios**:
- The user picks an existing contact in the new-chat dialog: the conversation is created in the current channel, assigned to the agent, opens, and its reply box takes focus

**Error Scenarios**:
- The create is refused: the list says the conversation could not be started
- The user switched channel or left the screen before the answer: the conversation is listed in its own channel and nothing is opened

**Steps**:
1. [x] - `p1` - User starts a chat with a contact: clear the earlier failure and API: POST /api/inbox/conversations with the current channel, the contact and the agent's name as assignee - `inst-request-start`
2. [x] - `p1` - **IF** the create is accepted: invalidate the conversations and contacts reads and add the conversation to the slice - `inst-start-accepted`
3. [x] - `p1` - **IF** the screen is still mounted and on the channel the conversation was started from, open it and request the composer's focus - `inst-open-started`
4. [x] - `p1` - **IF** the create is refused, mark the start as failed - `inst-start-refused`
5. [x] - `p1` - The composer takes focus once for a pending request and consumes it - `inst-focus-started`

### View the contact

- [x] `p1` - **ID**: `cpt-template-inbox-flow-chat-view-contact`

**Actor**: `cpt-template-inbox-actor-inbox-user`

**Success Scenarios**:
- The user chooses "View contact" in the details panel: the contacts screen opens on the customer's page with one history entry, and Back returns to the conversation as it was

**Error Scenarios**:
- The screen is not mounted in the host's screen domain: no "View contact" action is offered

**Steps**:
1. [x] - `p1` - **IF** there is no bridge or it does not occupy the host's screen domain, offer no contact link - `inst-check-screen-domain`
2. [x] - `p1` - **IF** a contact link is available, the details panel renders the "View contact" button - `inst-offer-action`
3. [x] - `p1` - User chooses it: open the contacts screen at the contact's page through the shared `openScreen` chain: the mount, then contacts' `show_contact` with the contact id - `inst-open-contacts`

### Organize channels and triage

- [x] `p1` - **ID**: `cpt-template-inbox-flow-chat-organize-and-triage`

**Actor**: `cpt-template-inbox-actor-inbox-user`

**Success Scenarios**:
- The user switches channel: the list shows that channel and its first conversation opens by itself
- The user creates a channel: the screen switches into it, on the empty state
- The user changes the assignee, team inbox, priority, status or tags, or marks spam: the change shows at once and lasts for the page session

**Error Scenarios**:
- None: these changes stay in the slice and make no request

**Steps**:
1. [x] - `p1` - Count each channel's conversations and open conversations over the merged list - `inst-channel-counts`
2. [x] - `p1` - User picks a channel: store it, clear the selection and arm the automatic first pick for it - `inst-select-channel`
3. [x] - `p1` - User creates a channel: add it to the slice with a fresh id, switch into it and arm the automatic first pick - `inst-create-channel`
4. [x] - `p1` - User marks or unmarks spam: toggle the `spam` tag in the conversation's patch, leaving it in its channel - `inst-toggle-spam`
5. [x] - `p1` - **IF** the details panel is shown, render it with the customer and route each assignee, team inbox, priority, status and tag change to a patch of the open conversation - `inst-triage-panel`

## 3. Processes / Business Logic (CDSL)

Internal functions the flows above call.

### Order the conversation list

- [x] `p2` - **ID**: `cpt-template-inbox-algo-chat-order-conversations`

**Input**: The merged conversations, the contacts by id, the channel, the search text, the sort order

**Output**: The conversations the list shows, and the open count

**Steps**:
1. [x] - `p2` - Normalize the search text: trimmed and lower case - `inst-normalize-search`
2. [x] - `p2` - Keep the conversations of the channel whose subject, last message or contact name contains the search text, all of them when the search is empty - `inst-match-channel-search`
3. [x] - `p2` - **RETURN** them sorted pinned first, then by the chosen order (last activity, oldest, priority, unread), falling back to recency on a tie - `inst-sort-pinned-first`
4. [x] - `p2` - Count the open conversations of a list - `inst-count-open`

### Keep the chat's place

- [x] `p2` - **ID**: `cpt-template-inbox-algo-chat-keep-state`

**Input**: A change the agent makes on the screen

**Output**: The `inbox/chat` slice holding it for the page session

**Steps**:
1. [x] - `p2` - The action emits one `mfe/inbox-chat/*` event per change - `inst-emit-event`
2. [x] - `p2` - The effects, the only code that dispatches to the slice, turn the event into its reducer - `inst-dispatch-reducer`
3. [x] - `p2` - Store the channel, the selection with the pick still owed, the search, the sort, the composer tab and the details toggle - `inst-store-view-state`
4. [x] - `p2` - Merge a triage patch into the conversation's earlier patch - `inst-store-triage`
5. [x] - `p2` - Store a draft per conversation: set, append a suggested reply to it, or clear it only while it still holds what was sent - `inst-store-drafts`
6. [x] - `p2` - Add a created channel (and switch to it) or a started conversation - `inst-store-created`
7. [x] - `p2` - The package registers the slice with its effects after the app is built - `inst-register-slice`

## 4. States (CDSL)

### Composer send state

- [x] `p2` - **ID**: `cpt-template-inbox-state-chat-composer-send`

**States**: READY, SENDING, FAILED (per conversation)

**Initial State**: READY

**Transitions**:
1. [x] - `p2` - **FROM** READY **TO** SENDING **WHEN** the agent sends a non-empty draft into an open conversation: the failure mark is cleared and one more post is counted in flight; a send from FAILED takes the same path - `inst-start-sending`
2. [x] - `p2` - **FROM** SENDING **TO** READY **WHEN** a post settles and no other post of that conversation is in flight - `inst-post-settles`
3. [x] - `p2` - **FROM** SENDING **TO** FAILED **WHEN** the post is refused: the conversation's failure mark is set - `inst-post-fails`

## 5. Definitions of Done

### Conversations, thread and composer

- [x] `p1` - **ID**: `cpt-template-inbox-dod-chat-conversations`

The system **MUST** render channels, the searchable and sortable conversation list, the open thread and the reply-and-note composer from the inbox service's reads, post replies and notes through the service, invalidate the messages and conversations reads on success, keep the draft and show the failure on refusal, and keep triage changes and created channels in the slice only.

**Implements**:
- `cpt-template-inbox-flow-chat-answer-conversation`
- `cpt-template-inbox-flow-chat-organize-and-triage`
- `cpt-template-inbox-algo-chat-order-conversations`
- `cpt-template-inbox-state-chat-composer-send`

**Constraints**: `cpt-template-inbox-constraint-kit-gaps`

**Touches**:
- API: `GET /api/inbox/me`, `GET /api/inbox/channels`, `GET /api/inbox/conversations`, `GET /api/inbox/messages`, `GET /api/inbox/contacts`, `POST /api/inbox/messages`
- Entities: `Agent`, `Channel`, `Conversation`, `Message`, `Contact`

### Start a conversation

- [x] `p1` - **ID**: `cpt-template-inbox-dod-chat-start-conversation`

The system **MUST** start a conversation with an existing contact through the inbox service, invalidate the conversations and contacts reads on success, open it with the reply box focused only while the screen is on the channel it was started from, and say so when the create is refused.

**Implements**:
- `cpt-template-inbox-flow-chat-start-conversation`

**Touches**:
- API: `POST /api/inbox/conversations`
- Entities: `Conversation`, `Contact`

### View contact

- [x] `p1` - **ID**: `cpt-template-inbox-dod-chat-view-contact`

The system **MUST** offer "View contact" only where the screen occupies the host's screen domain, and open the contact's page in the contacts screen through the shared chain, the mount followed by contacts' `show_contact` action with the contact id.

**Implements**:
- `cpt-template-inbox-flow-chat-view-contact`

**Touches**:
- API: the screen domain's mount action, `gts.frontx.mfes.comm.action.v1~frontx.inbox_contacts.nav.show_contact.v1~` with payload `{ contact }`
- Entities: `Contact`

### Chat keeps its place

- [x] `p1` - **ID**: `cpt-template-inbox-dod-chat-keeps-place`

The system **MUST** keep the channel, the open conversation, the search, the sort, the composer tab, the details toggle, the drafts, the triage patches and the agent's created channels and started conversations in the `inbox/chat` slice, changed only through its actions, events and effects.

**Implements**:
- `cpt-template-inbox-algo-chat-keep-state`

**Touches**:
- Entities: `Channel`, `Conversation`

## 6. Acceptance Criteria

- [x] The screen lists the seeded channels and conversations and opens the default channel's first conversation; a channel switch picks again without disturbing a selection made inside one channel (`src/screens/chat/ChatScreen.test.tsx`)
- [x] Search narrows the list and the open counter together, matching the contact behind a conversation too; each sort order falls back to recency on a tie; pinned conversations come first (`src/screens/chat/conversationOrdering.test.ts`, `src/screens/chat/ChatScreen.test.tsx`)
- [x] A sent draft clears only if the box still holds what was sent; a closed conversation takes no reply; a failed first-paint read shows a retry (`src/screens/chat/ChatScreen.test.tsx`, `src/chatFlux.test.ts`)
- [x] The shared query cache keeps the reads a screen made when another screen package loads for the first time, and a read another screen made is painted from the shared cache on the first render, without a loading state (`src/crossScreen.test.tsx`)
- [x] "View contact" opens the contact's page through the screen domain, and no contact link is offered outside it (`src/screens/chat/chatNavigation.test.tsx`, `src/lifecycle.test.tsx`)
- [x] Every action turns into the slice update it names, from the effects only (`src/chatFlux.test.ts`)
- [x] An address naming no page of the screen shows the screen's not-found page, and the document title is left to the site (`src/routes.test.tsx`, `src/lifecycle.test.tsx`)
- [x] Every list on the screen (channels, conversations, shared files) holds nothing but list items (`src/screens/chat/ChatScreen.test.tsx`)
- [x] The manifest lists the screen in the demos nav group at order 63 with its `seo` block (`src/manifest.test.ts`)
