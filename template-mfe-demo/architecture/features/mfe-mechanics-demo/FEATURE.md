# Feature: MFE Mechanics Screens

- [x] `p1` - **ID**: `cpt-template-mfe-demo-featstatus-mfe-mechanics-demo`

<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Explore Isolation and Send Actions Chains](#explore-isolation-and-send-actions-chains)
  - [Edit the Profile](#edit-the-profile)
  - [View the Shell's Palette](#view-the-shells-palette)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Profile Form](#profile-form)
  - [Optimistic Update](#optimistic-update)
  - [Live Shared Property](#live-shared-property)
  - [Screen Translations](#screen-translations)
  - [Host Direction](#host-direction)
- [4. States (CDSL)](#4-states-cdsl)
  - [Profile Card Editing](#profile-card-editing)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Isolation Screen and Actions Chains](#isolation-screen-and-actions-chains)
  - [Data Loading Screen](#data-loading-screen)
  - [Shared State Screen](#shared-state-screen)
  - [Screen Hooks](#screen-hooks)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

## 1. Feature Context

- [x] `p1` - `cpt-template-mfe-demo-feature-mfe-mechanics-demo`

### 1.1 Overview

The three screens that each show one mechanic of the microfrontend runtime: isolation with the shell's shared theme and language and three cross-screen actions chains, data loading with optimistic edits and rollback, and the shell's theme as shared state with the palette the page is drawn in. Each is built from the package's blocks, kit components and kit candidates inside Shadow DOM, and all three follow the shell's language with their own translations and a right-to-left direction.

### 1.2 Purpose

Each mechanic needs a page that shows it plainly, so that a visitor sees it work and a developer reads it as a worked example. The screens share three hooks for the live shared properties, the translations and the shadow host's direction.

**Requirements**: `cpt-template-mfe-demo-fr-isolation-screen`, `cpt-template-mfe-demo-fr-screen-translations`, `cpt-template-mfe-demo-fr-cross-screen-actions`, `cpt-template-mfe-demo-fr-data-loading-screen`, `cpt-template-mfe-demo-fr-shared-state-screen`, `cpt-template-mfe-demo-fr-kit-built-screens`, `cpt-template-mfe-demo-nfr-accessible-screens`

**Principles**: the screens rely on `cpt-template-mfe-demo-principle-kit-tokens-in-shadow-root`, owned by the screen entries feature, and are built from that feature's blocks.

**Constraints**: `cpt-template-mfe-demo-constraint-css-modules`

**Components**: `cpt-template-mfe-demo-component-demo-screens`, `cpt-template-mfe-demo-component-screen-hooks`

**Scope**: `demo-mfe/src/screens/helloworld/`, `screens/profile/`, `screens/theme/` (components and translation files; no stylesheet) and the hooks `shared/useBridgeProperty.ts`, `shared/useScreenTranslations.ts`, `shared/useHostDirection.ts`.

**Out of scope**: the nested widgets page (nested widgets feature); each screen's lifecycle and route tree and the blocks the screens are built from (screen entries feature); the accounts API and the refresh function (demo app feature).

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-mfe-demo-actor-visitor` | Reads the screens, follows their buttons, edits the profile and changes the shell's theme and language |
| `cpt-template-mfe-demo-actor-shell-host` | Publishes the theme and language, mounts the screens the actions chains name and delivers the chains' later steps |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md)
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.4
- **Interfaces**: the sender side of `cpt-template-mfe-demo-interface-refresh-profile-action` and of the actions chains that open other screens
- **Sequences**: `cpt-template-mfe-demo-seq-open-and-refresh`
- **Dependencies**: `cpt-template-mfe-demo-feature-screen-entries`

## 2. Actor Flows (CDSL)

User-facing interactions that start with an actor (human or external system) and describe the end-to-end flow of a use case. Each flow has a triggering actor and shows how the system responds to actor actions.

**Use cases**: `cpt-template-mfe-demo-usecase-explore-isolation`, `cpt-template-mfe-demo-usecase-edit-profile`, `cpt-template-mfe-demo-usecase-ping-across-nesting`

### Explore Isolation and Send Actions Chains

- [x] `p1` - **ID**: `cpt-template-mfe-demo-flow-mfe-mechanics-demo-explore-isolation`

**Actor**: `cpt-template-mfe-demo-actor-visitor`

**Success Scenarios**:
- The visitor opens the isolation screen and reads the domain and instance it is mounted as and the shell's current theme and language, which follow every change without a reload.
- The visitor opens the shared state screen, or the data loading screen and then refreshes it, or the nested widgets screen and then mounts and pings the alpha widget, each with one actions chain.

**Error Scenarios**:
- A chain's step fails (for example the manifests cannot be read in the nested widgets screen): the runtime does not deliver the later steps; the screen sends nothing else, since dispatch is acceptance-only.

**Steps**:
1. [x] - `p1` - Read the theme and language live through the bridge and keep the shadow host's direction in step with the language - `inst-read-shared`
2. [x] - `p1` - Load the screen's strings for the shell's language (algorithm Screen Translations) - `inst-load-strings`
3. [x] - `p1` - **IF** the strings are loading, render the screen placeholder in a screen frame scoped to the shell's theme and announced as busy - `inst-show-loading`
4. [x] - `p1` - Render, in a screen frame scoped to the shell's theme, the page header, the description card, the bridge information card (domain, instance, theme, language) and the navigation card with the three action buttons - `inst-render-page`
5. [x] - `p1` - Visitor chooses to open the shared state screen: send one chain mounting it in the shell's screen domain - `inst-open-theme`
6. [x] - `p1` - Visitor chooses to open the data loading screen and refresh it: send one chain mounting it in the screen domain, then sending the refresh profile action to its extension - `inst-open-profile-refresh`
7. [x] - `p1` - Visitor chooses the nested widgets demo: send one chain mounting the nested widgets screen in the screen domain, then mounting the alpha widget in the `widgets` domain, then sending it the widget ping action - `inst-ping-widget`

### Edit the Profile

- [x] `p1` - **ID**: `cpt-template-mfe-demo-flow-mfe-mechanics-demo-edit-profile`

**Actor**: `cpt-template-mfe-demo-actor-visitor`

**Success Scenarios**:
- The profile loads; the visitor edits a name and saves; the edit shows at once, the form is disabled while saving and the stored profile reloads after the save.
- The refresh action or the refresh button reloads the profile.

**Error Scenarios**:
- The profile fails to load: the screen shows the error and a retry that refetches.
- The save fails: the previous values return, the form stays open with the error and the stored profile reloads.

**Steps**:
1. [x] - `p1` - Read the theme and language live and keep the shadow host's direction in step with the language - `inst-read-shared`
2. [x] - `p1` - Load the screen's strings - `inst-load-strings`
3. [x] - `p1` - Query the current user through the accounts service's cached query - `inst-query-user`
4. [x] - `p1` - **IF** the strings are loading, render the screen placeholder in a screen frame scoped to the shell's theme and announced as busy - `inst-show-strings-loading`
5. [x] - `p1` - **IF** the query is loading, render the page header with a loading line over a placeholder card announced as busy - `inst-show-loading`
6. [x] - `p1` - **IF** the query failed, render the page header and a destructive alert with the error message and a retry action that refetches - `inst-show-error`
7. [x] - `p1` - **ELSE** render, in a reading column, the profile card (algorithm Profile Form) with a refresh button that refetches, and the bridge information card - `inst-render-profile`
8. [x] - `p1` - Visitor saves an edit: send the normalized values through the profile mutation with the optimistic update (algorithm Optimistic Update) - `inst-save`

### View the Shell's Palette

- [x] `p1` - **ID**: `cpt-template-mfe-demo-flow-mfe-mechanics-demo-view-shared-state`

**Actor**: `cpt-template-mfe-demo-actor-visitor`

**Success Scenarios**:
- The visitor opens the shared state screen and sees the shell's theme name and seven swatches painted with the current values of the palette the page is drawn in; a theme change repaints them.

**Error Scenarios**:
- The language has no strings: the screen shows English (algorithm Screen Translations).

**Steps**:
1. [x] - `p1` - Read the theme and language live and keep the shadow host's direction in step with the language - `inst-read-shared`
2. [x] - `p1` - Load the screen's strings - `inst-load-strings`
3. [x] - `p1` - Define seven swatches (background, foreground, primary, secondary, muted, accent, destructive), each with its token and the key of its translated name - `inst-define-swatches`
4. [x] - `p1` - **IF** the strings are loading, render the screen placeholder in a screen frame scoped to the shell's theme and announced as busy - `inst-show-loading`
5. [x] - `p1` - Render, in a screen frame scoped to the shell's theme and a reading column, the page header, the theme name, the swatches painted with their token pairs and captioned with them, the list of token names and the bridge information card; the swatches show the kit's scope for the theme with the document's overrides on top - `inst-render-page`

## 3. Processes / Business Logic (CDSL)

Internal system functions and procedures that do not interact with actors directly. These are reusable building blocks called by Actor Flows or other processes.

### Profile Form

- [x] `p1` - **ID**: `cpt-template-mfe-demo-algo-mfe-mechanics-demo-profile-form`

**Input**: The loaded user, the saving flag, the save error and the save callback

**Output**: The profile card in view or edit mode

**Steps**:
1. [x] - `p1` - Derive the form values from the user: names coalesced from null and trimmed, the department when it is a string, trimmed, else empty - `inst-derive-values`
2. [x] - `p1` - Treat an edit buffer as the editing mode; show the buffer when present, else the derived values - `inst-edit-buffer`
3. [x] - `p1` - Normalize the shown values by trimming; the form is dirty when a normalized value differs from the derived one and valid when both names are non-empty - `inst-dirty-valid`
4. [x] - `p1` - A field change updates the buffer only while it exists - `inst-field-change`
5. [x] - `p1` - **IF** a submit arrives while the form is not dirty or not valid, **RETURN** without saving - `inst-submit-guard`
6. [x] - `p1` - **TRY** save the normalized values through the save callback - `inst-submit-save`
7. [x] - `p1` - Render the edit form (a field group of labelled inputs disabled while saving, the save error as an alert, save and cancel buttons) or the description list of role, department, identifier and timestamps - `inst-render-body`
8. [x] - `p1` - Render the card with the name as its level-two title, the email, the avatar as the card's action, and the refresh and edit buttons, disabled while saving - `inst-render-card`

### Optimistic Update

- [x] `p1` - **ID**: `cpt-template-mfe-demo-algo-mfe-mechanics-demo-optimistic-update`

**Input**: The edited first name, last name and department

**Output**: The cached current user updated at once, restored on failure and refetched after the save settles

**Steps**:
1. [x] - `p1` - Before the request, cancel an in-flight current user fetch, keep a snapshot of the cached value and set the optimistic value - `inst-on-mutate`
2. [x] - `p1` - **IF** nothing is cached, keep it unchanged; **ELSE** copy the cached user with the edited names and department and a new update time - `inst-apply-patch`
3. [x] - `p1` - **CATCH** a failed save: restore the snapshot - `inst-on-error`
4. [x] - `p1` - After the save settles either way, invalidate the current user query so the stored profile reloads - `inst-on-settled`

### Live Shared Property

- [x] `p1` - **ID**: `cpt-template-mfe-demo-algo-mfe-mechanics-demo-bridge-property`

**Input**: The bridge, a shared property id and a fallback

**Output**: The property's live value

**Steps**:
1. [x] - `p1` - Read the current value on the first render, or the fallback while the property is not published - `inst-read-initial`
2. [x] - `p1` - Subscribe to the property's changes and unsubscribe when the screen unmounts - `inst-subscribe`
3. [x] - `p1` - **RETURN** the value, passed through unvalidated (the type system validates it) - `inst-return-value`

### Screen Translations

- [x] `p1` - **ID**: `cpt-template-mfe-demo-algo-mfe-mechanics-demo-screen-translations`

**Input**: The screen's string sets collected once at module level from its `i18n` folder, and the bridge

**Output**: A lookup function and a loading flag

**Steps**:
1. [x] - `p1` - Import the set of a language; **IF** the language has none, warn and import English; **IF** English is missing too, or an import fails, log an error and use an empty set - `inst-import-set`
2. [x] - `p1` - Track whether the screen is mounted - `inst-track-mounted`
3. [x] - `p1` - Number every load; a load applies its strings and clears the loading flag only when it is still the latest load and the screen is still mounted - `inst-numbered-load`
4. [x] - `p1` - Load the bridge's current language (English when none is published) and reload on every language change whose language or set map differs from the latest load; stop listening when the screen unmounts - `inst-follow-language`
5. [x] - `p1` - Look a key up in the applied set; a missing key logs a warning and returns the key itself - `inst-lookup`
6. [x] - `p1` - **RETURN** the lookup and the loading flag - `inst-return-translations`

### Host Direction

- [x] `p1` - **ID**: `cpt-template-mfe-demo-algo-mfe-mechanics-demo-host-direction`

**Input**: An element inside the screen and the active language

**Output**: The shadow host's `dir` attribute

**Steps**:
1. [x] - `p1` - Enumerate the right-to-left languages: Arabic, Hebrew, Persian, Urdu - `inst-rtl-set`
2. [x] - `p1` - After each commit, **IF** the element is inside a shadow root, set the shadow host's direction to `rtl` for an enumerated language and `ltr` otherwise; outside a shadow root do nothing - `inst-set-dir`

## 4. States (CDSL)

Include when entities have explicit lifecycle states.

### Profile Card Editing

- [x] `p1` - **ID**: `cpt-template-mfe-demo-state-mfe-mechanics-demo-profile-edit`

**States**: VIEWING, EDITING

**Initial State**: VIEWING

**Transitions**:
1. [x] - `p1` - **FROM** VIEWING **TO** EDITING **WHEN** the visitor chooses to edit, which opens the buffer from the derived values - `inst-start-edit`
2. [x] - `p1` - **FROM** EDITING **TO** VIEWING **WHEN** the visitor cancels - `inst-cancel-edit`
3. [x] - `p1` - **FROM** EDITING **TO** VIEWING **WHEN** the save succeeds - `inst-save-succeeded`
4. [x] - `p1` - **FROM** EDITING **TO** EDITING **WHEN** the save fails, so the visitor keeps the edit and sees the error - `inst-save-failed`

A refetch that delivers a new profile while the card is EDITING leaves the buffer as it is; in VIEWING the shown values are derived from the latest profile on every render.

## 5. Definitions of Done

Specific implementation tasks derived from flows and algorithms above.

### Isolation Screen and Actions Chains

- [x] `p1` - **ID**: `cpt-template-mfe-demo-dod-mfe-mechanics-demo-isolation-screen`

The system **MUST** render the isolation screen with the bridge's domain and instance and the live theme and language, and **MUST** send each of the three cross-screen actions as one actions chain whose later steps are `next` continuations.

**Implements**:
- `cpt-template-mfe-demo-flow-mfe-mechanics-demo-explore-isolation`

**Touches**:
- Entities: Screen extension, Refresh profile action, Widget ping action

### Data Loading Screen

- [x] `p1` - **ID**: `cpt-template-mfe-demo-dod-mfe-mechanics-demo-data-loading-screen`

The system **MUST** render the current user's loading, error-with-retry and loaded states, edit first name, last name and department with an optimistic update that rolls back on failure and reloads after the save, treat surrounding spaces as no change, and render null names as empty fields.

**Implements**:
- `cpt-template-mfe-demo-flow-mfe-mechanics-demo-edit-profile`
- `cpt-template-mfe-demo-algo-mfe-mechanics-demo-profile-form`
- `cpt-template-mfe-demo-algo-mfe-mechanics-demo-optimistic-update`
- `cpt-template-mfe-demo-state-mfe-mechanics-demo-profile-edit`

**Touches**:
- API: `GET /api/accounts/user/current`, `PUT /api/accounts/user/profile` (mocked)
- Entities: User

### Shared State Screen

- [x] `p1` - **ID**: `cpt-template-mfe-demo-dod-mfe-mechanics-demo-shared-state-screen`

The system **MUST** render the shell's theme name and seven swatches captioned with their token pairs, painted with the token names the screen's frame scopes to the shell's theme, and repaint on a theme change.

**Implements**:
- `cpt-template-mfe-demo-flow-mfe-mechanics-demo-view-shared-state`

**Touches**:
- Entities: Screen extension

### Screen Hooks

- [x] `p1` - **ID**: `cpt-template-mfe-demo-dod-mfe-mechanics-demo-screen-hooks`

The system **MUST** give every mechanics screen the live value of a shared property, its strings for the shell's language with an English fallback and the latest-load rule, and the shadow host's direction for right-to-left languages.

**Implements**:
- `cpt-template-mfe-demo-algo-mfe-mechanics-demo-bridge-property`
- `cpt-template-mfe-demo-algo-mfe-mechanics-demo-screen-translations`
- `cpt-template-mfe-demo-algo-mfe-mechanics-demo-host-direction`

**Touches**:
- Entities: Entry

## 6. Acceptance Criteria

- [x] The isolation screen shows the bridge's domain and instance and the initial theme and language, follows their changes and sets the host's direction.
- [x] Each of the three buttons dispatches its actions chain: the shared state mount; the data loading mount then refresh; the nested widgets mount, then the alpha mount, then the ping.
- [x] The data loading screen shows its loading state, its load error with a working retry, the profile and the bridge values; a failed save keeps the form open with the error; spaces around stored values are no change; null name fields render as empty fields.
- [x] The optimistic update leaves an empty cache unchanged and maps the edited fields into the cached response, creating the extra fields when absent.
- [x] The shared state screen renders the theme name and the swatches with their token captions.
- [x] The translations hook loads the current language, returns the key for a missing string, falls back to English, reloads on change, unsubscribes on unmount and keeps the latest language when an earlier load settles later.
- [x] Every screen unsubscribes from the bridge properties on unmount.

**Test scenarios** (Vitest, in the composed `demo-mfe` package):
- `src/screens/helloworld/HelloWorldScreen.test.tsx`: bridge data and initial properties; subscriptions; language and host direction updates; the theme navigation chain; the profile mount and refresh chain; the nested widgets mount, widget mount and ping chain; unsubscribe on unmount.
- `src/screens/profile/ProfileScreen.test.tsx`: profile data and bridge values; null editable fields; loading state; load error with retry; save failure keeps the form open with the error; surrounding spaces are no change; refresh refetches; subscriptions; edits submitted through the mutation hook; language and direction; unsubscribe on unmount.
- `src/screens/profile/profileOptimisticUpdate.test.ts`: no cached profile; edited fields mapped; extra fields created.
- `src/screens/theme/CurrentThemeScreen.test.tsx`: bridge values and swatches; subscriptions; language and direction; unsubscribe on unmount.
- `src/shared/useBridgeProperty.test.tsx`, `src/shared/useScreenTranslations.test.tsx`, `src/shared/useHostDirection.test.tsx`: the three hooks as stated in the algorithms.
