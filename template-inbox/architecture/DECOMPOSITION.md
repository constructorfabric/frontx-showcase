# Decomposition: template-inbox

<!-- toc -->

- [1. Overview](#1-overview)
- [2. Entries](#2-entries)
  - [2.1 Inbox Data - HIGH](#21-inbox-data---high)
  - [2.2 Screen Frame and Shared UI - HIGH](#22-screen-frame-and-shared-ui---high)
  - [2.3 Cross-Screen Navigation - HIGH](#23-cross-screen-navigation---high)
  - [2.4 Contacts Screen - HIGH](#24-contacts-screen---high)
  - [2.5 Chat Screen - HIGH](#25-chat-screen---high)
  - [2.6 Mail Screen - HIGH](#26-mail-screen---high)
  - [2.7 Dashboard Screen - MEDIUM](#27-dashboard-screen---medium)
- [3. Feature Dependencies](#3-feature-dependencies)

<!-- /toc -->

## 1. Overview

The DESIGN of template-inbox has eight components: four in the shared folder that every screen bundles (inbox data, screen frame, shared UI, cross-screen navigation) and one per screen package (contacts, dashboard, chat, mail). They form seven features: the screen frame and the shared UI are one feature. The decomposition follows the code's own seams: the shared folder's subfolders and the four packages. Each feature owns whole directories of the template, so a file belongs to exactly one feature, and a project that drops a screen drops exactly one feature with it.

- **Inbox data** owns `shared/inbox/api/`: the inbox service, the inbox mock store that chat, contacts and dashboard each bundle (mail's is in the mail package), the seeds, the seed clock and the refusal error that every package's services follow.
- **Screen frame and shared UI** owns `shared/inbox/lifecycle/`, `shared/inbox/i18n/` and `shared/inbox/ui/`, plus the template overlay (the manifest, the README and the AI bundle's chrome guideline). The DESIGN keeps the frame and the shared UI as two components; they are one feature because the frame renders the heading, route roots and not-found page from the shared UI, and the shared UI reads the frame's translator, portal container and layout context, so neither can be specified or marked without the other.
- **Cross-screen navigation** owns `shared/inbox/navigation/`: the screens' tokens and extension ids, `openScreen`, and contacts' `show_contact` action type and handler.
- **Contacts, dashboard, chat and mail** each own one package directory, including the package's manifest, route tree, lifecycle, init, slice and flux files, screen components, strings and, for dashboard and mail, the package's own service.

Test files and test helpers (`*.test.*`, `test-support/`, `inbox-contacts-mfe/src/shared-inbox/`) sit with the feature whose code they test and are ignored by the code scan; build configuration (`vite.config.ts`, `vitest.config.ts`) sits with its package and is ignored too. Paths below are relative to `template-inbox/`.

The priority marker of each entry is its implementation order by dependency (p1 foundation, p2 shared parts, p3 screens); the label after the title is the entry's importance to the product.

The site's contract for moving between screens, the mount action followed by the action the receiving screen declares, is defined in the root tree ([architecture/DESIGN.md](../../architecture/DESIGN.md), [architecture/ADR/0006-cross-screen-deep-links.md](../../architecture/ADR/0006-cross-screen-deep-links.md)); the contacts screen's `show_contact` action is the inbox's own. The host services (screen domain, shared properties, page-wide query cache, mock transport) come from template-shell and template-mfe and are not decomposed here. The DESIGN has no database (section 3.7), so no entry has a data element.

## 2. Entries

**Overall implementation status:**

- [x] `p1` - **ID**: `cpt-template-inbox-status-overall`

### 2.1 [Inbox Data](features/data/) - HIGH

- [x] `p1` - **ID**: `cpt-template-inbox-feature-data`

- **Purpose**: Gives each screen a backend that keeps its writes for the page session: the inbox service and its registrar, the mock maps over the host's mock transport, the mock state each package keeps in its own copy of the mock store, created from the same seed, the seeds and the seed clock, and the refusal of invalid writes with a status. Every other feature reads its data through this one.

- **Depends On**: None

- **Scope**:
  - `src-app/mfe_packages/shared/inbox/api/` (the inbox service, its registrar, its mock maps, the package's mock store, the dataset and seed clock, the response types including the dashboard's, the constants, the refusal error and the message assets)
  - `.frontx/ai/@gears-frontx/frontx-template-inbox/guidelines/inbox-data-contract.md` (the data guideline: services, each package's mock state, invalidation, each screen's state, the backend switch)
  - The invalidation each write performs on the shared cache, as the pattern the screens' mutations follow

- **Out of scope**:
  - The dashboard service and the mail service, their seeds and the mail's package state: they live in their packages and belong to `cpt-template-inbox-feature-dashboard` and `cpt-template-inbox-feature-mail`, which follow this feature's registration and mock-state pattern (the DESIGN names them in the inbox data component's scope and again in the screen components; the package directories decide ownership here)
  - The app builder that holds the mock switch (`cpt-template-inbox-feature-screen-frame`)
  - Screen state and read caching: slices belong to the screens, reads to the host's query cache

- **Requirements Covered**:

  - [x] `p1` - `cpt-template-inbox-fr-screen-facts`
  - [x] `p1` - `cpt-template-inbox-fr-mock-backend`
  - [x] `p1` - `cpt-template-inbox-fr-backend-switch`
  - [x] `p2` - `cpt-template-inbox-fr-agent-guidelines`

- **Design Principles Covered**:

  - [x] `p2` - `cpt-template-inbox-principle-one-server-one-cache`

- **Design Constraints Covered**:

  - [x] `p2` - `cpt-template-inbox-constraint-collection-endpoints`
  - [x] `p2` - `cpt-template-inbox-constraint-mock-success-only`

- **Domain Model Entities**:
  - Agent
  - Channel
  - Conversation
  - Message
  - Contact
  - Dashboard overview (response type only)

- **Design Components**:

  - [x] `p1` - `cpt-template-inbox-component-inbox-data`

- **API**:
  - GET /api/inbox/me
  - GET /api/inbox/channels
  - GET /api/inbox/conversations
  - GET /api/inbox/messages
  - GET /api/inbox/contacts
  - POST /api/inbox/messages
  - POST /api/inbox/conversations

- **Sequences**:

  - `cpt-template-inbox-seq-write-propagation`
  - `cpt-template-inbox-seq-attach-backend`

- **Data**: none; the mock state is held in memory for the page session (DESIGN section 3.7).

### 2.2 [Screen Frame and Shared UI](features/screen-frame/) - HIGH

- [x] `p2` - **ID**: `cpt-template-inbox-feature-screen-frame`

- **Purpose**: Gives every screen the same host integration inside its shadow root and the same app: the lifecycle base class, the frame with theme scope, direction, portal, measured size container, extension router and error boundaries, the app builder with its fixed plugin order, the shared strings and translator, and the shared components every screen draws. It also carries the template overlay a project copies.

- **Depends On**: `cpt-template-inbox-feature-data` (the shared components format and draw the inbox's response types)

- **Scope**:
  - `src-app/mfe_packages/shared/inbox/lifecycle/` (lifecycle base class, frame, app builder, screen context, kit theme anchoring and scope, host direction, bridge properties, route focus, screen error boundary, frame stylesheet)
  - `src-app/mfe_packages/shared/inbox/i18n/` (shared catalogue and the translator that merges a package's catalogue over it with a whole-language fallback to English)
  - `src-app/mfe_packages/shared/inbox/ui/` (screen heading, route roots with the per-page error boundary and not-found page, query states with the first-paint gate, loading and load-error panes, identity avatar, field rows, the side column toggle, breakpoint table and layout hook, formatting, submit shortcut, automatic first selection)
  - `src-app/mfe_packages/shared/inbox/blocks/` (the blocks every screen draws with, each with its layout-only stylesheet, card and test, and the exemptions ledger `styles-exemptions.json`; the dashboard's `CardGrid`, `StatCard` and `DataTableSection` and the contact page's `ColumnsLayout`, `RecordList` and `CellActions` are specified with those screens)
  - `frontx-template.json` and `README.md` (the template overlay and its consumer-facing record of the divergence from its source)
  - `.frontx/ai/@gears-frontx/frontx-template-inbox/extension.json` and `guidelines/inbox-chrome-contract.md` (the AI bundle and the chrome guideline: what the host owns, what each screen keeps, how to add a screen)
  - The rules every package's build settings follow: the `@inbox-shared` alias and one shared copy of the kit and both routing packages

- **Out of scope**:
  - Screen-specific content, slices and services (the screen features)
  - Opening another screen (`cpt-template-inbox-feature-cross-screen-navigation`)
  - The document title and head, the page address and the navigation, which belong to the host

- **Requirements Covered**:

  - [x] `p2` - `cpt-template-inbox-fr-instant-return`
  - [x] `p1` - `cpt-template-inbox-fr-host-theme-language`
  - [x] `p1` - `cpt-template-inbox-fr-failure-isolation`
  - [x] `p1` - `cpt-template-inbox-fr-backend-switch`
  - [x] `p2` - `cpt-template-inbox-fr-screens-stand-alone`
  - [x] `p2` - `cpt-template-inbox-fr-agent-guidelines`
  - [x] `p1` - `cpt-template-inbox-nfr-accessibility`
  - [x] `p2` - `cpt-template-inbox-nfr-container-layout`
  - [x] `p1` - `cpt-template-inbox-nfr-kit-only`

- **Design Principles Covered**:

  - [x] `p2` - `cpt-template-inbox-principle-share-only-shared-folder`
  - [x] `p2` - `cpt-template-inbox-principle-host-owns-chrome`
  - [x] `p2` - `cpt-template-inbox-principle-container-layout`
  - [x] `p2` - `cpt-template-inbox-principle-kit-first`

- **Design Constraints Covered**:

  - [x] `p2` - `cpt-template-inbox-constraint-host-prerequisite`
  - [x] `p2` - `cpt-template-inbox-constraint-mock-before-shared-cache`
  - [x] `p3` - `cpt-template-inbox-constraint-refetch-on-mount`
  - [x] `p2` - `cpt-template-inbox-constraint-one-router-copy`
  - [x] `p3` - `cpt-template-inbox-constraint-kit-gaps`

- **Domain Model Entities**:
  - None owned; the shared components read Contact, Conversation, Message and the dashboard's activity kinds for formatting and avatars

- **Design Components**:

  - [x] `p1` - `cpt-template-inbox-component-screen-frame`
  - [x] `p2` - `cpt-template-inbox-component-shared-ui`

- **API**:
  - The template overlay: the manifest and the subtrees it claims
  - The theme and language shared properties and the page-wide query cache the frame and the app builder join

- **Sequences**: none of its own; it carries the mount every sequence of the DESIGN starts from.

- **Data**: none.

### 2.3 [Cross-Screen Navigation](features/cross-screen-navigation/) - HIGH

- [x] `p2` - **ID**: `cpt-template-inbox-feature-cross-screen-navigation`

- **Purpose**: Lets one inbox screen open another at a page inside it with one history entry and no write to the page address: the screens' tokens and extension ids, the check whether a bridge occupies the host's screen domain, `openScreen` with its mount-then-action chain, and contacts' `show_contact` action type and the handler that moves the contacts screen's own router to a person's page.

- **Depends On**: None

- **Scope**:
  - `src-app/mfe_packages/shared/inbox/navigation/screens.ts` (the address tokens and screen extension ids the manifests are held to)
  - `src-app/mfe_packages/shared/inbox/navigation/openScreen.ts` (the `show_contact` action type, the screen-domain check, `openScreen`, `ShowContactHandler`)

- **Out of scope**:
  - Declaring the action and its schema in the contacts manifest and registering the handler (Contacts screen)
  - Deciding which screens accept the action: contacts opts in through its manifest and lifecycle (`cpt-template-inbox-feature-contacts`)
  - Offering "View contact" in the chat's UI (`cpt-template-inbox-feature-chat`)

- **Requirements Covered**:

  - [x] `p1` - `cpt-template-inbox-fr-view-contact`

- **Design Principles Covered**:

  - [x] `p2` - `cpt-template-inbox-principle-host-owns-chrome`

- **Design Constraints Covered**:

  - [x] `p2` - `cpt-template-inbox-constraint-contacts-show-action`

- **Domain Model Entities**:
  - None

- **Design Components**:

  - [x] `p1` - `cpt-template-inbox-component-cross-screen-navigation`

- **API**:
  - `gts.frontx.mfes.comm.action.v1~frontx.inbox_contacts.action.show_contact.v1~`, payload `{ contact }`, sent as the `next` step after the screen domain's mount action
  - URL /?screen=inbox-contacts;route=<id> (written by the framework router and the target's own router, never by inbox code)

- **Sequences**:

  - `cpt-template-inbox-seq-view-contact`

- **Data**: none.

### 2.4 [Contacts Screen](features/contacts/) - HIGH

- [x] `p3` - **ID**: `cpt-template-inbox-feature-contacts`

- **Purpose**: The directory of every contact with filters and their counts, search, sort and paging, and each person's page with details, tickets and latest activity, addressable on its own; the target the other screens link to.

- **Depends On**: `cpt-template-inbox-feature-data`, `cpt-template-inbox-feature-screen-frame`, `cpt-template-inbox-feature-cross-screen-navigation`

- **Scope**:
  - `src-app/mfe_packages/inbox-contacts-mfe/` (manifest with the screen extension, menu entry, demos nav group, `seo` block with the person's page not indexable, the `show_contact` action declaration and its closed schema; `init.ts`; `lifecycle.tsx` with the `show_contact` handler registration in `mount()`; `routes.tsx`; the `inbox/contacts` slice, events, actions and effects; `src/screens/contacts/` with its strings; package README, `index.html`, `package.json`, `tsconfig.json`)
  - Hosting the shared folder's tests in `src/shared-inbox/` (test files, not scanned)

- **Out of scope**:
  - Writes to the backend: contacts reads only
  - The `show_contact` handler's behaviour (`cpt-template-inbox-feature-cross-screen-navigation`)

- **Requirements Covered**:

  - [x] `p1` - `cpt-template-inbox-fr-contacts-directory`
  - [x] `p1` - `cpt-template-inbox-fr-contact-page`
  - [x] `p2` - `cpt-template-inbox-fr-screen-keeps-place`
  - [x] `p1` - `cpt-template-inbox-fr-host-navigation`
  - [x] `p2` - `cpt-template-inbox-fr-page-metadata`

- **Design Principles Covered**:

  - [x] `p2` - `cpt-template-inbox-principle-one-server-one-cache`

- **Design Constraints Covered**:

  - [x] `p2` - `cpt-template-inbox-constraint-contacts-show-action`

- **Domain Model Entities**:
  - Contact
  - Conversation
  - Message

- **Design Components**:

  - [x] `p1` - `cpt-template-inbox-component-contacts-screen`

- **API**:
  - GET /api/inbox/contacts, GET /api/inbox/conversations, GET /api/inbox/messages (through the inbox service)
  - URL /?screen=inbox-contacts and /?screen=inbox-contacts;route=<id>

- **Sequences**:

  - `cpt-template-inbox-seq-return-to-screen`

- **Data**: none.

### 2.5 [Chat Screen](features/chat/) - HIGH

- [x] `p3` - **ID**: `cpt-template-inbox-feature-chat`

- **Purpose**: Where the user acts on conversations: folders and channels, the conversation list with search and sort, the thread, the reply-and-note composer with per-conversation drafts and a failure state, starting a conversation with an existing contact, the customer-details panel with the session's triage changes, and "View contact".

- **Depends On**: `cpt-template-inbox-feature-data`, `cpt-template-inbox-feature-screen-frame`, `cpt-template-inbox-feature-cross-screen-navigation`

- **Scope**:
  - `src-app/mfe_packages/inbox-chat-mfe/` (manifest with the screen extension, menu entry, demos nav group and `seo` block; `init.ts`; `lifecycle.tsx`; `routes.tsx`; the `inbox/chat` slice, events, actions and effects; `src/screens/chat/` including `chatNavigation.ts`, which offers "View contact" only inside the host's screen domain, and its strings; package README, `index.html`, `package.json`, `tsconfig.json`)
  - The writes chat performs (reply or note, new conversation) and the reads each one invalidates

- **Out of scope**:
  - Persisting triage changes or created channels beyond the screen's slice (PRD section 4.2)
  - The chain `openScreen` sends (`cpt-template-inbox-feature-cross-screen-navigation`)

- **Requirements Covered**:

  - [x] `p1` - `cpt-template-inbox-fr-chat`
  - [x] `p1` - `cpt-template-inbox-fr-view-contact`
  - [x] `p2` - `cpt-template-inbox-fr-screen-keeps-place`
  - [x] `p1` - `cpt-template-inbox-fr-host-navigation`
  - [x] `p2` - `cpt-template-inbox-fr-page-metadata`

- **Design Principles Covered**:

  - [x] `p2` - `cpt-template-inbox-principle-one-server-one-cache`

- **Design Constraints Covered**:

  - [x] `p3` - `cpt-template-inbox-constraint-kit-gaps`

- **Domain Model Entities**:
  - Agent
  - Channel
  - Conversation
  - Message
  - Contact

- **Design Components**:

  - [x] `p1` - `cpt-template-inbox-component-chat-screen`

- **API**:
  - GET /api/inbox/me, /api/inbox/channels, /api/inbox/conversations, /api/inbox/messages, /api/inbox/contacts (through the inbox service)
  - POST /api/inbox/messages, POST /api/inbox/conversations
  - URL /?screen=inbox-chat

- **Sequences**:

  - `cpt-template-inbox-seq-view-contact`
  - `cpt-template-inbox-seq-write-propagation`

- **Data**: none.

### 2.6 [Mail Screen](features/mail/) - HIGH

- [x] `p3` - **ID**: `cpt-template-inbox-feature-mail`

- **Purpose**: The mail channel of the product with its own data: the mail service, its seed and its package mock state; mailboxes, the mail list with search and tabs, the reading pane with the history toggle, reply, and compose that keeps the draft until the mail is sent and shows a failed send.

- **Depends On**: `cpt-template-inbox-feature-data`, `cpt-template-inbox-feature-screen-frame`

- **Scope**:
  - `src-app/mfe_packages/inbox-mail-mfe/` (manifest with the screen extension, menu entry, demos nav group and `seo` block; `init.ts`; `lifecycle.tsx`; `routes.tsx`; `src/api/` with the mail service, its registrar, mock maps, mock store, dataset, constants and types; the `inbox/mail` slice, events, actions and effects; `src/screens/mail/` with its strings; package README, `index.html`, `package.json`, `tsconfig.json`)

- **Out of scope**:
  - The inbox service and its seed: mail neither reads nor bundles them
  - The refusal error and the seed clock, reused from `cpt-template-inbox-feature-data`

- **Requirements Covered**:

  - [x] `p1` - `cpt-template-inbox-fr-mail`
  - [x] `p2` - `cpt-template-inbox-fr-screen-keeps-place`
  - [x] `p1` - `cpt-template-inbox-fr-mock-backend`
  - [x] `p1` - `cpt-template-inbox-fr-host-navigation`
  - [x] `p2` - `cpt-template-inbox-fr-page-metadata`

- **Design Principles Covered**:

  - [x] `p2` - `cpt-template-inbox-principle-one-server-one-cache`

- **Design Constraints Covered**:

  - [x] `p2` - `cpt-template-inbox-constraint-collection-endpoints`
  - [x] `p2` - `cpt-template-inbox-constraint-mock-success-only`

- **Domain Model Entities**:
  - Mailbox
  - Mail
  - Mail message

- **Design Components**:

  - [x] `p1` - `cpt-template-inbox-component-mail-screen`

- **API**:
  - GET /api/mail/mailboxes
  - GET /api/mail/mails
  - GET /api/mail/messages
  - POST /api/mail/mails
  - URL /?screen=inbox-mail

- **Sequences**:

  - `cpt-template-inbox-seq-send-mail`

- **Data**: none.

### 2.7 [Dashboard Screen](features/dashboard/) - MEDIUM

- [x] `p3` - **ID**: `cpt-template-inbox-feature-dashboard`

- **Purpose**: The team's view of the inbox's people and work: the overview service and its seed, KPI cards with sparklines, the resolved, records-created and new-contacts charts each with a text summary, workload, the stage funnel, conversion by source, top agents and the activity table whose people are contacts the package lists.

- **Depends On**: `cpt-template-inbox-feature-data`, `cpt-template-inbox-feature-screen-frame`

- **Scope**:
  - `src-app/mfe_packages/inbox-dashboard-mfe/` (manifest with the screen extension, menu entry, demos nav group and `seo` block; `init.ts`; `lifecycle.tsx`; `routes.tsx`; `src/api/` with the overview service, its registrar, mock maps and dataset, whose activity rows are built from the package's own contacts on each request; `src/screens/dashboard/` with the cards, charts, chart configuration and summaries, selectors and its strings; package README, `index.html`, `package.json`, `tsconfig.json`)

- **Out of scope**:
  - Screen state: the dashboard keeps no slice and writes nothing
  - The dashboard's response type, which lives in the shared folder (`cpt-template-inbox-feature-data`)

- **Requirements Covered**:

  - [x] `p1` - `cpt-template-inbox-fr-dashboard`
  - [x] `p1` - `cpt-template-inbox-fr-mock-backend`
  - [x] `p1` - `cpt-template-inbox-fr-host-navigation`
  - [x] `p2` - `cpt-template-inbox-fr-page-metadata`

- **Design Principles Covered**:

  - [x] `p2` - `cpt-template-inbox-principle-kit-first`

- **Design Constraints Covered**:

  - [x] `p2` - `cpt-template-inbox-constraint-collection-endpoints`
  - [x] `p3` - `cpt-template-inbox-constraint-kit-gaps`

- **Domain Model Entities**:
  - Dashboard overview
  - Contact (activity rows name the package's contacts)

- **Design Components**:

  - [x] `p2` - `cpt-template-inbox-component-dashboard-screen`

- **API**:
  - GET /api/dashboard/overview
  - URL /?screen=inbox-dashboard

- **Sequences**: none of its own.

- **Data**: none.

---

## 3. Feature Dependencies

```text
cpt-template-inbox-feature-data
    |
    +-> cpt-template-inbox-feature-screen-frame
            |
            +-> cpt-template-inbox-feature-contacts   (also needs cross-screen-navigation)
            +-> cpt-template-inbox-feature-chat       (also needs cross-screen-navigation)
            +-> cpt-template-inbox-feature-mail
            +-> cpt-template-inbox-feature-dashboard

cpt-template-inbox-feature-cross-screen-navigation
    |
    +-> cpt-template-inbox-feature-contacts
    +-> cpt-template-inbox-feature-chat
```

**Dependency Rationale**:

- `cpt-template-inbox-feature-screen-frame` requires `cpt-template-inbox-feature-data`: the shared components format and draw the inbox's response types (avatars by presence, activity kinds and statuses).
- `cpt-template-inbox-feature-cross-screen-navigation` depends on no other feature: it uses only the framework's actions, the screen domain and the navigation facade.
- `cpt-template-inbox-feature-contacts` requires `cpt-template-inbox-feature-data`, `cpt-template-inbox-feature-screen-frame` and `cpt-template-inbox-feature-cross-screen-navigation`: it reads the inbox service, renders in the frame and registers the `show_contact` handler.
- `cpt-template-inbox-feature-chat` requires `cpt-template-inbox-feature-data`, `cpt-template-inbox-feature-screen-frame` and `cpt-template-inbox-feature-cross-screen-navigation`: it reads and writes through the inbox service, renders in the frame and sends the chain that opens a person's page.
- `cpt-template-inbox-feature-mail` requires `cpt-template-inbox-feature-data` and `cpt-template-inbox-feature-screen-frame`: its own service reuses the refusal error and the seed clock, and it renders in the frame.
- `cpt-template-inbox-feature-dashboard` requires `cpt-template-inbox-feature-data` and `cpt-template-inbox-feature-screen-frame`: its overview service builds activity rows from the package's contacts, and it renders in the frame.
- The four screen features do not depend on one another and can be developed in parallel; that independence is what lets a project keep any subset of the screens.
