# Feature: Screen Frame and Shared UI

<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Mount a screen](#mount-a-screen)
  - [Paint a screen's data or its load state](#paint-a-screens-data-or-its-load-state)
  - [Recover from a screen failure](#recover-from-a-screen-failure)
  - [Open an address no page matches](#open-an-address-no-page-matches)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Build the screen package's app](#build-the-screen-packages-app)
  - [Anchor the kit tokens on the shadow host](#anchor-the-kit-tokens-on-the-shadow-host)
  - [Map the host theme onto the kit scope](#map-the-host-theme-onto-the-kit-scope)
  - [Read a host property](#read-a-host-property)
  - [Follow the language's direction](#follow-the-languages-direction)
  - [Translate in the host's language](#translate-in-the-hosts-language)
  - [Measure the screen's layout](#measure-the-screens-layout)
  - [Move focus to the screen heading](#move-focus-to-the-screen-heading)
  - [Decide the first paint](#decide-the-first-paint)
  - [Fold and open the side column](#fold-and-open-the-side-column)
  - [Select the first item on its own](#select-the-first-item-on-its-own)
  - [Submit with the keyboard](#submit-with-the-keyboard)
- [4. States (CDSL)](#4-states-cdsl)
  - [Screen error boundary](#screen-error-boundary)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Lifecycle base class](#lifecycle-base-class)
  - [Screen frame](#screen-frame)
  - [One app builder](#one-app-builder)
  - [Shared strings and translator](#shared-strings-and-translator)
  - [Failures stay inside the screen](#failures-stay-inside-the-screen)
  - [Layout from the screen's own width](#layout-from-the-screens-own-width)
  - [One heading, focused on every mount](#one-heading-focused-on-every-mount)
  - [Shared components from the kit](#shared-components-from-the-kit)
  - [Blocks](#blocks)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

- [x] `p2` - **ID**: `cpt-template-inbox-featstatus-screen-frame`

- [x] `p2` - `cpt-template-inbox-feature-screen-frame`

## 1. Feature Context

### 1.1 Overview

The screen frame and shared UI feature is what every inbox screen has around it and draws with: the lifecycle base class each package's lifecycle extends, the frame it renders inside the screen's shadow root, the app builder every package's init calls, the shared catalogue and translator, the shared components (heading, route roots, load states, avatars, field rows, layout breakpoints, formatting, submit shortcut, automatic first selection) and the blocks every screen draws its panes, lists, threads, composers and cards with. It owns `src-app/mfe_packages/shared/inbox/lifecycle/`, `i18n/`, `ui/` and `blocks/`, and the template overlay a project copies: the manifest, the README, the AI bundle's `extension.json` and the chrome guideline. The DESIGN keeps the frame and the shared UI as two components; they are one feature because neither can be specified without the other.

### 1.2 Purpose

The host owns the chrome, yet each screen renders in a shadow root of its own, where the host's theme, direction, popups, layout and errors do not reach by themselves. This feature gives every screen the same host integration and the same app, so a screen adds only its own content.

**Requirements**: `cpt-template-inbox-fr-instant-return`, `cpt-template-inbox-fr-host-theme-language`, `cpt-template-inbox-fr-failure-isolation`, `cpt-template-inbox-fr-backend-switch`, `cpt-template-inbox-fr-screens-stand-alone`, `cpt-template-inbox-fr-agent-guidelines`, `cpt-template-inbox-nfr-accessibility`, `cpt-template-inbox-nfr-container-layout`, `cpt-template-inbox-nfr-kit-only`

**Principles**: `cpt-template-inbox-principle-share-only-shared-folder`, `cpt-template-inbox-principle-host-owns-chrome`, `cpt-template-inbox-principle-container-layout`, `cpt-template-inbox-principle-kit-first`

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-inbox-actor-application-shell` | Mounts a screen in its shadow root and publishes the theme and language the frame follows |
| `cpt-template-inbox-actor-inbox-user` | Sees the screen paint, recover from a failure, follow the theme and language, and take focus on every mount of a screen |
| `cpt-template-inbox-actor-project-developer` | Builds every package's app with one builder and adds a language with translation files only |
| `cpt-template-inbox-actor-ai-agent` | Reads the chrome guideline before changing a screen or adding one |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md), components `cpt-template-inbox-component-screen-frame` and `cpt-template-inbox-component-shared-ui`
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.2
- **ADRs**: `cpt-template-inbox-adr-frontx-data-and-state-layers`
- **Code**: `src-app/mfe_packages/shared/inbox/lifecycle/`, `src-app/mfe_packages/shared/inbox/i18n/`, `src-app/mfe_packages/shared/inbox/ui/`, `src-app/mfe_packages/shared/inbox/blocks/` (paths relative to `template-inbox/`). The overlay files (`frontx-template.json`, `README.md`, `.frontx/ai/@gears-frontx/frontx-template-inbox/extension.json` and `guidelines/inbox-chrome-contract.md`), the stylesheets, the block cards and the exemptions ledger are not code the traceability scan reads and carry no markers; acceptance criteria cover them.
- **Dependencies**: [Inbox Data](../data/FEATURE.md) (the shared components format and draw its response types)

## 2. Actor Flows (CDSL)

### Mount a screen

- [x] `p1` - **ID**: `cpt-template-inbox-flow-screen-frame-mount`

**Actor**: `cpt-template-inbox-actor-application-shell`

**Use cases**: `cpt-template-inbox-usecase-browse-directory`

**Success Scenarios**:
- The screen paints in the host's theme and direction, with the kit tokens resolving inside the shadow root, popups inside the shadow root, and its route tree matched inside the screen's own address entry; on every mount, focus lands on the screen's heading.

**Error Scenarios**:
- A package app built without the microfrontends plugin has no registry for the router; the lifecycle's render throws an error naming the cause before the frame renders.

**Steps**:
1. [x] - `p1` - The shell mounts the package's lifecycle, which extends the theme-aware React lifecycle of `@gears-frontx/react` and carries the package's app, catalogues and route tree - `inst-construct-lifecycle`
2. [x] - `p1` - **IF** the shadow root already holds the kit token style node from an earlier mount, refresh its text - `inst-refresh-kit-tokens`
3. [x] - `p1` - **ELSE** append one style node carrying the kit tokens anchored on the shadow host (`cpt-template-inbox-algo-screen-frame-anchor-kit-tokens`) - `inst-add-kit-tokens`
4. [x] - `p1` - **IF** the package app has no MFE registry, fail the render - `inst-require-registry`
5. [x] - `p1` - Render the frame with the bridge, the package's catalogues, its route tree and the registry - `inst-render-frame`
6. [x] - `p1` - The frame reads the host's theme and language shared properties (`cpt-template-inbox-algo-screen-frame-bridge-property`) - `inst-read-host-properties`
7. [x] - `p1` - Build the translator for that language (`cpt-template-inbox-algo-screen-frame-translate`) - `inst-build-translator`
8. [x] - `p1` - Set the shadow host's text direction from the language (`cpt-template-inbox-algo-screen-frame-direction`) - `inst-sync-direction`
9. [x] - `p1` - Measure the frame's width before the first paint and pick the layout (`cpt-template-inbox-algo-screen-frame-measure-layout`) - `inst-measure-layout`
10. [x] - `p1` - After the mount, request the heading's focus in a mount effect (`cpt-template-inbox-algo-screen-frame-heading-focus`); the frame reads nothing outside the screen's container for it - `inst-decide-focus`
11. [x] - `p1` - Provide the bridge, the translator and the portal node to everything rendered inside - `inst-provide-context`
12. [x] - `p1` - **RETURN** the frame root: the kit theme scope from the host theme (`cpt-template-inbox-algo-screen-frame-theme-scope`) and the direction on it, the portal node first, then the context and layout providers, an error boundary, and inside it the framework's extension router over the package registry and route tree once the width is measured - `inst-return-frame`

### Paint a screen's data or its load state

- [x] `p1` - **ID**: `cpt-template-inbox-flow-screen-frame-load-states`

**Actor**: `cpt-template-inbox-actor-inbox-user`

**Use cases**: `cpt-template-inbox-usecase-browse-directory`

**Success Scenarios**:
- A screen whose reads already have answers paints at once, including after another screen loaded for the first time; a background refetch that fails leaves it as it is.

**Error Scenarios**:
- A read that never answered and failed shows the load-error pane with Retry, which asks only the failed reads again and shows the loading pane meanwhile.

**Steps**:
1. [x] - `p1` - The screen decides its first paint from every query that paint needs (`cpt-template-inbox-algo-screen-frame-first-paint`) - `inst-decide-first-paint`
2. [x] - `p1` - **IF** it is loading, show the loading pane, a busy status around the kit's spinner - `inst-show-loading`
3. [x] - `p1` - **IF** it failed, show the load-error pane: a destructive alert whose title is the screen's heading, with Retry - `inst-show-load-error`

### Recover from a screen failure

- [x] `p1` - **ID**: `cpt-template-inbox-flow-screen-frame-recover`

**Actor**: `cpt-template-inbox-actor-inbox-user`

**Success Scenarios**:
- A page that throws while rendering is replaced by an alert inside the screen while the host and its navigation keep working; moving to another page of the screen, or Try again, renders normally.

**Error Scenarios**:
- A failure that repeats keeps the alert; the screen never reloads the page, which is the host's.

**Steps**:
1. [x] - `p1` - A render failure inside the screen is caught by the boundary around the pages, inside the router, or by the frame's boundary around the router - `inst-catch-failure`
2. [x] - `p1` - Log the failure with its component stack to the console - `inst-log-failure`
3. [x] - `p1` - Show a destructive alert in place of the failed part, with Try again as its only button; moving to another page of the screen also clears it, through the boundary's reset key - `inst-show-alert`
4. [x] - `p1` - The pages' boundary takes the matched pages of the screen's own router as its reset key, so another page of the screen clears the failure (`cpt-template-inbox-state-screen-frame-error-boundary`) - `inst-key-on-matches`

### Open an address no page matches

- [x] `p1` - **ID**: `cpt-template-inbox-flow-screen-frame-not-found`

**Actor**: `cpt-template-inbox-actor-inbox-user`

**Success Scenarios**:
- An address inside the screen that names none of its pages shows the screen's own not-found page, with the screen's one heading.

**Error Scenarios**:
- None: the page is the error state.

**Steps**:
1. [x] - `p1` - Render the not-found page in place of the screen: an empty state whose title is the screen heading and a description, named for tests by the screen - `inst-render-not-found`

## 3. Processes / Business Logic (CDSL)

### Build the screen package's app

- [x] `p1` - **ID**: `cpt-template-inbox-algo-screen-frame-build-app`

**Input**: the `@gears-frontx/react` of the runtime the app belongs to

**Output**: the package's app

**Steps**:
1. [x] - `p1` - Create the app from that runtime's own framework - `inst-create-app`
2. [x] - `p1` - Add the effects plugin - `inst-add-effects`
3. [x] - `p1` - Add the mock switch, on by default because the template ships no backend; it switches the mock plugins of the services registered before the build - `inst-add-mock-switch`
4. [x] - `p1` - Join the host's shared query cache after the mock switch, so the switch's announcement does not clear the reads other screens already made - `inst-join-shared-cache`
5. [x] - `p1` - Add the microfrontends plugin with the GTS type system, which gives the app the registry the extension router builds from - `inst-add-microfrontends`
6. [x] - `p1` - **RETURN** the built app - `inst-build-app`

### Anchor the kit tokens on the shadow host

- [x] `p1` - **ID**: `cpt-template-inbox-algo-screen-frame-anchor-kit-tokens`

**Input**: the kit's theme stylesheet

**Output**: the stylesheet with every root selector naming the shadow host

**Steps**:
1. [x] - `p1` - Strip the comments, so every remaining root selector is a selector - `inst-strip-comments`
2. [x] - `p1` - Rewrite a bare root selector as the host selector, and one with a compound tail as the functional host selector holding that tail, keeping a pseudo-element outside - `inst-rewrite-root`
3. [x] - `p1` - Rewrite the kit stylesheet once, when the lifecycle module loads - `inst-anchor-once`

### Map the host theme onto the kit scope

- [x] `p1` - **ID**: `cpt-template-inbox-algo-screen-frame-theme-scope`

**Input**: the host's theme identifier

**Output**: the kit token scope, light or dark

**Steps**:
1. [x] - `p1` - **IF** the identifier is one of the host's dark themes, **RETURN** dark, **ELSE RETURN** light, an unknown identifier included - `inst-scope-for-theme`

### Read a host property

- [x] `p1` - **ID**: `cpt-template-inbox-algo-screen-frame-bridge-property`

**Input**: the bridge, a shared property id and a fallback

**Output**: the property's current value

**Steps**:
1. [x] - `p1` - Subscribe to the property's changes through the bridge, and unsubscribe on unmount - `inst-subscribe`
2. [x] - `p1` - Read the value during render, and once more after subscribing, so a change between the two is not lost - `inst-read-value`
3. [x] - `p1` - **RETURN** the value, or the fallback while the property is not published - `inst-return-value`

### Follow the language's direction

- [x] `p1` - **ID**: `cpt-template-inbox-algo-screen-frame-direction`

**Input**: the language code and an element inside the shadow root

**Output**: the direction on the frame and on the shadow host

**Steps**:
1. [x] - `p1` - Read the primary subtag of the language; **IF** it is a right-to-left language, the direction is rtl, **ELSE** ltr - `inst-direction-of`
2. [x] - `p1` - After the commit, **IF** the element renders in a shadow root, set the shadow host's direction - `inst-set-host-dir`

### Translate in the host's language

- [x] `p1` - **ID**: `cpt-template-inbox-algo-screen-frame-translate`

**Input**: the bridge, the package's catalogues and the shared catalogues

**Output**: a translator for the host's language

**Steps**:
1. [x] - `p1` - Name each catalogue by its file name, so a new language is a new file; the shared catalogues are every catalogue file beside the translator - `inst-catalogues-from-files`
2. [x] - `p1` - Read the host's language, English while none is published - `inst-read-language`
3. [x] - `p1` - **IF** both the shared and the package layer have that language, use it, **ELSE** English as a whole; merge the package's catalogue over the shared one - `inst-choose-catalogue`
4. [x] - `p1` - Build the translator, rebuilt only when the language or the catalogues change - `inst-build-translate`
5. [x] - `p1` - For a call with a numeric count, pick the plural form by the locale's plural rules, falling back to the other form and then the plain key - `inst-pick-template`
6. [x] - `p1` - **IF** the catalogue has no such key, warn once per key and **RETURN** the key - `inst-missing-key`
7. [x] - `p1` - **IF** the call passes no parameters, **RETURN** the template - `inst-no-params`
8. [x] - `p1` - Fill the named parameters, writing numbers with the locale's digit grouping and leaving a parameter the call did not pass visible - `inst-fill-params`

### Measure the screen's layout

- [x] `p2` - **ID**: `cpt-template-inbox-algo-screen-frame-measure-layout`

**Input**: the frame root element

**Output**: the layout the panes take (single, compact or wide) and whether the width has been read

**Steps**:
1. [x] - `p2` - Pick the layout from the width in rem: wide when unknown, single below the single-pane breakpoint, compact below the inline-column breakpoint, wide from it - `inst-layout-for-width`
2. [x] - `p2` - Read the element's width in a layout effect before the first paint, a zero width reading as unknown, and mark the width measured; change state only when the picked layout changes - `inst-read-width`
3. [x] - `p2` - Read it again on every resize, and stop observing on unmount - `inst-observe-resize`
4. [x] - `p2` - **RETURN** the layout and whether it has been measured - `inst-return-measure`

### Move focus to the screen heading

- [x] `p1` - **ID**: `cpt-template-inbox-algo-screen-frame-heading-focus`

**Input**: a focus request on a screen's mount or on a change of page

**Output**: focus on the one visible screen heading

**Steps**:
1. [x] - `p1` - A mount or a change of page requests focus: advance the package's request counter and tell every heading - `inst-request-focus`
2. [x] - `p1` - A heading that mounts or renders with an open request answers it **IF** it renders a visible box: it marks the request answered and takes focus - `inst-answer-request`
3. [x] - `p1` - **ELSE** the request stays open for that heading until it gets a box, another heading answers it or a newer request replaces it - `inst-wait-for-box`
4. [x] - `p1` - A screen's root route requests focus when the page it shows changes, never for the first page - `inst-request-on-page-change`

### Decide the first paint

- [x] `p1` - **ID**: `cpt-template-inbox-algo-screen-frame-first-paint`

**Input**: every query result the screen's first paint needs

**Output**: failed, loading and a retry

**Steps**:
1. [x] - `p1` - Take the queries with no answer, and among them those that failed and are not being fetched again - `inst-collect-gating`
2. [x] - `p1` - **RETURN** failed when any such query failed, loading when any unanswered query is loading for the first time or retrying, and a retry that asks the failed ones again; a query with an answer never gates - `inst-return-first-paint`

### Fold and open the side column

- [x] `p2` - **ID**: `cpt-template-inbox-algo-screen-frame-side-column`

**Input**: the screen's layout and the user's toggles

**Output**: the side column, beside the list or as a sheet

**Steps**:
1. [x] - `p2` - The column is open on a wide screen and folded below the inline-column width; a toggle's choice holds only for the width it was made at - `inst-resolve-collapsed`
2. [x] - `p2` - The toggle flips the column; a pick made in the sheet folds it - `inst-toggle-column`
3. [x] - `p2` - **IF** the screen is narrower than the inline-column width, render the column as a sheet over the screen inside the frame's portal node - `inst-render-sheet`
4. [x] - `p2` - **ELSE** render it as a column beside the list, inert and hidden from assistive technology while folded - `inst-render-column`

### Select the first item on its own

- [x] `p2` - **ID**: `cpt-template-inbox-algo-screen-frame-auto-select`

**Input**: the list's scope, whether its data has settled, its first item, the selection and the scope the slice remembers as owed a pick

**Output**: the owed scope and a way to arm it

**Steps**:
1. [x] - `p2` - Start from the scope the screen's slice remembers as owed a pick - `inst-hold-owed`
2. [x] - `p2` - **IF** the pick is owed to the current scope and the list has settled, pay it, and select the first item only when there is one and nothing is selected - `inst-pay-pick`
3. [x] - `p2` - **RETURN** the owed scope and the arm action - `inst-return-owed`

### Submit with the keyboard

- [x] `p2` - **ID**: `cpt-template-inbox-algo-screen-frame-submit-shortcut`

**Input**: a key press in a composer

**Output**: a submit, or nothing

**Steps**:
1. [x] - `p2` - **IF** the key is not Enter with Command or Control, do nothing - `inst-ignore-other-keys`
2. [x] - `p2` - **IF** an input method is still composing or the composer cannot submit, do nothing - `inst-ignore-composing`
3. [x] - `p2` - Prevent the default and submit - `inst-submit`

## 4. States (CDSL)

### Screen error boundary

- [x] `p1` - **ID**: `cpt-template-inbox-state-screen-frame-error-boundary`

**States**: Rendering, Failed

**Initial State**: Rendering

**Transitions**:
1. [x] - `p1` - **FROM** Rendering **TO** Failed **WHEN** a descendant throws while rendering - `inst-to-failed`
2. [x] - `p1` - **FROM** Failed **TO** Rendering **WHEN** the reset key changes, that is the screen's router matches another page - `inst-reset-on-key`
3. [x] - `p1` - **FROM** Failed **TO** Rendering **WHEN** the user presses Try again - `inst-try-again`

## 5. Definitions of Done

### Lifecycle base class

- [x] `p1` - **ID**: `cpt-template-inbox-dod-screen-frame-lifecycle`

The system **MUST** provide the lifecycle base class every package's lifecycle extends: it extends the framework's theme-aware React lifecycle, puts the kit's tokens, anchored on the shadow host, into a shadow root once however often the screen mounts there, and renders the package's route tree inside the frame over the registry of the package's app.

**Implements**:
- `cpt-template-inbox-flow-screen-frame-mount`
- `cpt-template-inbox-algo-screen-frame-anchor-kit-tokens`

**Constraints**: `cpt-template-inbox-constraint-host-prerequisite`

**Covers (DESIGN)**:
- `cpt-template-inbox-component-screen-frame`

**Touches**:
- API: the host's screen domain mount
- DB: none
- Entities: none

### Screen frame

- [x] `p1` - **ID**: `cpt-template-inbox-dod-screen-frame-frame`

The system **MUST** render every screen inside a frame that takes the kit theme scope from the host theme and the direction from the host language, renders the portal node first and hands it, the translator and the bridge to the screen, measures its own width before the routes render, keeps an error boundary around the framework's extension router, and moves focus to the heading on every mount; it **MUST NOT** read or write the page address or the document head.

**Implements**:
- `cpt-template-inbox-flow-screen-frame-mount`
- `cpt-template-inbox-algo-screen-frame-theme-scope`
- `cpt-template-inbox-algo-screen-frame-bridge-property`
- `cpt-template-inbox-algo-screen-frame-direction`

**Constraints**: `cpt-template-inbox-constraint-one-router-copy`, `cpt-template-inbox-constraint-host-prerequisite`

**Covers (DESIGN)**:
- `cpt-template-inbox-component-screen-frame`

**Touches**:
- API: the theme and language shared properties
- DB: none
- Entities: none

### One app builder

- [x] `p1` - **ID**: `cpt-template-inbox-dod-screen-frame-app-builder`

The system **MUST** build every package's app with one builder in a fixed plugin order (effects, the mock switch on by default, the shared query cache, microfrontends), so the mock switch is one setting for every screen and a package loading for the first time leaves the page's reads in place.

**Implements**:
- `cpt-template-inbox-algo-screen-frame-build-app`

**Constraints**: `cpt-template-inbox-constraint-mock-before-shared-cache`

**Covers (DESIGN)**:
- `cpt-template-inbox-component-screen-frame`
- `cpt-template-inbox-seq-attach-backend`

**Touches**:
- API: the host's page-wide query cache
- DB: none
- Entities: none

### Shared strings and translator

- [x] `p1` - **ID**: `cpt-template-inbox-dod-screen-frame-translations`

The system **MUST** take every shared string from the shared catalogue and merge each package's catalogue over it for the host's language, falling back to English as a whole when either layer lacks the language, with parameters, plural forms and a visible key for a missing string.

**Implements**:
- `cpt-template-inbox-algo-screen-frame-translate`

**Covers (DESIGN)**:
- `cpt-template-inbox-component-screen-frame`

**Touches**:
- API: the language shared property
- DB: none
- Entities: none

### Failures stay inside the screen

- [x] `p1` - **ID**: `cpt-template-inbox-dod-screen-frame-failure-isolation`

The system **MUST** catch a render failure inside the screen with an alert offering Try again, clear a page's failure when the screen's own router moves to another page, give every route tree a not-found page and root route components that wrap the pages in that boundary, and show the loading and load-error panes only for reads that have no answer.

**Implements**:
- `cpt-template-inbox-flow-screen-frame-recover`
- `cpt-template-inbox-flow-screen-frame-not-found`
- `cpt-template-inbox-flow-screen-frame-load-states`
- `cpt-template-inbox-algo-screen-frame-first-paint`
- `cpt-template-inbox-state-screen-frame-error-boundary`

**Constraints**: `cpt-template-inbox-constraint-refetch-on-mount`

**Covers (DESIGN)**:
- `cpt-template-inbox-component-shared-ui`

**Touches**:
- API: the query results of the screen's reads
- DB: none
- Entities: none

### Layout from the screen's own width

- [x] `p2` - **ID**: `cpt-template-inbox-dod-screen-frame-container-layout`

The system **MUST** keep the pane breakpoints in one table, pick the screen's layout from the frame's measured width rather than the viewport, give it to everything inside the frame, and fold the side column into a sheet inside the frame below the inline-column width.

**Implements**:
- `cpt-template-inbox-algo-screen-frame-measure-layout`
- `cpt-template-inbox-algo-screen-frame-side-column`

**Covers (DESIGN)**:
- `cpt-template-inbox-component-shared-ui`

**Touches**:
- API: none
- DB: none
- Entities: none

### One heading, focused on every mount

- [x] `p1` - **ID**: `cpt-template-inbox-dod-screen-frame-heading-focus`

The system **MUST** give each screen one visible top-level heading component, focusable from script only, that answers a focus request on a mount of the screen or a change of page once it renders a visible box.

**Implements**:
- `cpt-template-inbox-algo-screen-frame-heading-focus`

**Covers (DESIGN)**:
- `cpt-template-inbox-component-shared-ui`

**Touches**:
- API: none
- DB: none
- Entities: none

### Shared components from the kit

- [x] `p2` - **ID**: `cpt-template-inbox-dod-screen-frame-shared-components`

The system **MUST** provide the pieces every screen draws, built from kit components only: identity and presence avatars on tones that keep text contrast in both themes, field rows with a missing-value dash, date, time and label formatting in the shipped locale, the submit shortcut and its hint, the automatic first selection, the split of pinned rows, client-made id suffixes and class-name joining.

**Implements**:
- `cpt-template-inbox-algo-screen-frame-auto-select`
- `cpt-template-inbox-algo-screen-frame-submit-shortcut`

**Constraints**: `cpt-template-inbox-constraint-kit-gaps`

**Covers (DESIGN)**:
- `cpt-template-inbox-component-shared-ui`

**Touches**:
- API: none
- DB: none
- Entities: `Contact`, `Conversation`, `Message` (formatting and avatars)

### Blocks

- [x] `p2` - **ID**: `cpt-template-inbox-dod-screen-frame-blocks`

The system **MUST** draw every pane, column, list, thread, composer and card arrangement of the screens through the blocks in `shared/inbox/blocks/`: each block is built only from kit components, kit candidates (`@gears-frontx/kit-candidates`) and kit tokens, takes content and behaviour props only, keeps a layout-only stylesheet whose every other declaration is a row of `shared/inbox/blocks/styles-exemptions.json` naming the kit gap or kit defect it waits for, and has a card (`<Block>.md`) and a test with an accessibility check; screen components import no stylesheet.

**Implements**:
- `cpt-template-inbox-algo-screen-frame-side-column`

**Constraints**: `cpt-template-inbox-constraint-kit-gaps`

**Covers (DESIGN)**:
- `cpt-template-inbox-component-shared-ui`

**Touches**:
- API: none
- DB: none
- Entities: none

## 6. Acceptance Criteria

- [x] The lifecycle anchors the kit tokens on the shadow host, dark block included, puts them into a shadow root once however often the screen mounts, renders the screen at its root inside a frame carrying the kit theme scope, turns the frame and the shadow host right to left for a regional right-to-left language, keeps the portal node inside the shadow root ahead of the screen, moves focus to the heading when the screen mounts, and leaves the document title to the site (each of the four packages' `src/lifecycle.test.tsx`); contacts, the screen with several pages, also moves focus to the new page's heading on a route change (`inbox-contacts-mfe/src/lifecycle.test.tsx`).
- [x] The frame mounts the routes only in the layout the measured width picks, clears a page's failure when the screen's own router moves to another page, and the failure alert's only button is Try again, which renders the page afresh (`InboxScreenFrame.test.tsx`, `ScreenErrorBoundary.test.tsx`).
- [x] The root selector rewrite covers expanded and minified stylesheets, keeps the theme scopes, moves a compound tail inside the host selector, keeps a pseudo-element outside, is idempotent and finds every root of the pinned kit stylesheet in selector position (`anchorKitThemeOnShadowHost.test.ts`); every dark host theme maps to the dark scope and an unknown one to light (`kitThemeScope.test.ts`).
- [x] A host property is read on first render, falls back while unpublished, follows updates, is not lost between render and subscription and is unsubscribed on unmount (`useBridgeProperty.test.tsx`); the direction follows the language's primary subtag and is a no-op outside a shadow root (`useHostDirection.test.tsx`).
- [x] The translator fills parameters, picks plural forms, groups digits, returns a missing key and warns once; catalogues merge package over shared and fall back to English as a whole; the hook follows a language switch and names catalogues by file (`i18n.test.ts`, `useInboxTranslate.test.tsx`).
- [x] The first paint waits for an unanswered query, shows the error for one that failed and retries only it, and keeps a painted screen when a background refetch fails (`firstPaint.test.ts`).
- [x] A screen keeps the reads it made when another screen package loads for the first time, and paints a read another screen made from the shared cache on its first render without a loading state (`inbox-chat-mfe/src/crossScreen.test.tsx`).
- [x] The layout follows the breakpoint table, reads before the first paint and on crossing a breakpoint, and every package stylesheet queries the frame container on a width the table names and never the viewport (`screenLayout.test.tsx`).
- [x] A focus request goes to the heading with a visible box, waits for a box that grows from zero, and is never answered late by a heading another one already answered (`ScreenHeading.test.tsx`).
- [x] Formatting, the shortcut hint and the id suffix behave as specified (`format.test.ts`, `submitShortcut.test.tsx`, `uniqueSuffix.test.ts`).
- [x] Every block renders its parts and passes the axe WCAG A and AA rules in its test (`blocks/<Block>.test.tsx`); a list of rows gives the kit's list only list items (`NavColumn.test.tsx`, `ListPane.test.tsx`, and each list and detail screen's own test); every declaration of a block stylesheet that is not layout on a kit token has a row in `shared/inbox/blocks/styles-exemptions.json`, and no screen component imports a stylesheet (held by the hosting repository's styles check).
- [x] The manifest has the overlay shape with no shared files and claims only the four packages, the shared folder and the AI bundle (checked by the hosting repository's template checks); the README and the chrome guideline state what the host owns, what each screen keeps, how to open another screen, the menu order band and how to add a screen.

Tests named without a package are in `src-app/mfe_packages/inbox-contacts-mfe/src/shared-inbox/`, where the shared folder's tests run.
