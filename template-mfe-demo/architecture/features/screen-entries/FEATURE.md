# Feature: Screen Entries, Kit Theme Scope and Screen Blocks

- [x] `p1` - **ID**: `cpt-template-mfe-demo-featstatus-screen-entries`

<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Mount a Screen Entry](#mount-a-screen-entry)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Screen Route Tree](#screen-route-tree)
  - [Kit Token Node](#kit-token-node)
  - [Anchor Root Selectors](#anchor-root-selectors)
  - [Theme Scope](#theme-scope)
  - [Screen Blocks](#screen-blocks)
- [4. States (CDSL)](#4-states-cdsl)
  - [No Feature-Owned State Machine](#no-feature-owned-state-machine)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Screen Entries](#screen-entries)
  - [Kit Theme Scope](#kit-theme-scope)
  - [Screen Blocks](#screen-blocks-1)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

## 1. Feature Context

- [x] `p1` - `cpt-template-mfe-demo-feature-screen-entries`

### 1.1 Overview

The entries the shell mounts for the three mechanics screens: a lifecycle per screen that mounts into Shadow DOM, renders a one-page route tree with a not-found page, registers the data loading screen's refresh handler before its mount settles and keeps exactly one copy of the kit's tokens in the shadow root; and the blocks every screen of the package is built from, the screen frame among them, which scopes the kit's tokens to the shell's theme.

### 1.2 Purpose

The shell mounts entries, not React components. Each screen needs a lifecycle that binds it to the package app, gives its route components the mounted bridge, answers any address inside the screen, and is ready for the next step of an actions chain as soon as its mount settles. Every screen draws with kit components and needs the kit's tokens inside its shadow root, where `:root` matches nothing; and since screens carry no stylesheet, the arrangements they share are blocks.

**Requirements**: `cpt-template-mfe-demo-fr-not-found`, `cpt-template-mfe-demo-fr-kit-built-screens`, `cpt-template-mfe-demo-nfr-runtime-isolation`, `cpt-template-mfe-demo-nfr-accessible-screens`

**Principles**: `cpt-template-mfe-demo-principle-handlers-before-settle`, `cpt-template-mfe-demo-principle-kit-tokens-in-shadow-root`

**Constraints**: `cpt-template-mfe-demo-constraint-css-modules`

**Components**: `cpt-template-mfe-demo-component-screen-entries`, `cpt-template-mfe-demo-component-kit-theme-scope`, `cpt-template-mfe-demo-component-screen-blocks`

**Scope**: the isolation, data loading and shared state lifecycles and route trees; the shared route tree builder, the not-found page and the bridge provider; the data loading entry's refresh handler; the kit-themed lifecycle base, the rewrite of the kit's `:root` selectors to the shadow host and the mapping from the shell's theme to the kit's light or dark scope; the screen blocks under `demo-mfe/src/blocks/` and their exemptions ledger. The one router copy this feature relies on comes from the shared dependency set owned by the package declarations feature.

**Out of scope**: screen content, hooks and translations (mechanics screens feature); the widgets host's lifecycle and route tree (nested widgets feature), which reuses this feature's not-found page, lifecycle base and blocks.

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-mfe-demo-actor-shell-host` | Loads an entry's exposed lifecycle module, mounts it into a shadow root it keeps across mounts with the screen's bridge, and delivers a chain's next step once the mount settles |
| `cpt-template-mfe-demo-actor-visitor` | Opens a screen's address, or an address inside the screen that names no page |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md)
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.3
- **ADRs**: `cpt-template-mfe-demo-adr-kit-tokens-in-shadow-root`
- **Interfaces**: `cpt-template-mfe-demo-interface-refresh-profile-action` (handler side)
- **Sequences**: `cpt-template-mfe-demo-seq-mount-screen`
- **Dependencies**: `cpt-template-mfe-demo-feature-demo-app`

## 2. Actor Flows (CDSL)

User-facing interactions that start with an actor (human or external system) and describe the end-to-end flow of a use case. Each flow has a triggering actor and shows how the system responds to actor actions.

**Use cases**: `cpt-template-mfe-demo-usecase-explore-isolation`, `cpt-template-mfe-demo-usecase-edit-profile`

### Mount a Screen Entry

- [x] `p1` - **ID**: `cpt-template-mfe-demo-flow-screen-entries-mount-screen`

**Actor**: `cpt-template-mfe-demo-actor-shell-host`

**Success Scenarios**:
- The shell mounts the isolation, data loading or shared state entry: the shadow root holds one kit token node and the screen renders at the screen's root.
- An actions chain mounts the data loading screen and then sends the refresh action: the handler is registered before the mount settles, so the refresh is delivered.

**Error Scenarios**:
- A route component renders outside a screen mount: it fails loudly instead of rendering without a bridge.
- The app was built without the microfrontends plugin: rendering fails loudly (demo app feature).

**Steps**:
1. [x] - `p1` - Shell host loads the entry's exposed module and mounts its default export, one lifecycle singleton per entry - `inst-export-entry`
2. [x] - `p1` - The lifecycle is bound to the package app and extends the kit-themed lifecycle base - `inst-choose-base`
3. [x] - `p1` - On every mount, the lifecycle keeps one kit token node in the shadow root (algorithm Kit Token Node) - `inst-kit-tokens`
4. [x] - `p1` - The lifecycle renders the entry's route tree through the extension router over the package app's registry, inside the provider that hands the mounted bridge to route components - `inst-render-route-tree`
5. [x] - `p1` - **IF** the entry is the data loading screen - `inst-if-data-loading`
   1. [x] - `p1` - Render the screen first through the base mount, so it is visible before any action arrives - `inst-render-first`
   2. [x] - `p1` - Register the refresh profile action handler on the bridge before `mount()` returns - `inst-register-handler`
   3. [x] - `p1` - On a refresh profile action the handler calls the demo app's refresh function and resolves at once - `inst-handle-refresh`

## 3. Processes / Business Logic (CDSL)

Internal system functions and procedures that do not interact with actors directly. These are reusable building blocks called by Actor Flows or other processes.

### Screen Route Tree

- [x] `p1` - **ID**: `cpt-template-mfe-demo-algo-screen-entries-screen-route-tree`

**Input**: A screen component that takes the bridge

**Output**: The screen's route tree: the screen at `/`, the not-found page for any other path

**Steps**:
1. [x] - `p1` - Provide the mounted screen's bridge to route components; a route component rendered outside a mount fails loudly - `inst-provide-bridge`
2. [x] - `p1` - Define the not-found page: a kit empty state whose title is a level-one heading "Page not found" and whose description says the address names no page of this screen - `inst-not-found-page`
3. [x] - `p1` - Define the index route component, which renders the screen with the bridge read from the provider - `inst-index-component`
4. [x] - `p1` - Create the root route rendering an outlet, with the not-found page as its not-found component - `inst-root-route`
5. [x] - `p1` - **RETURN** the root route with one child route at `/` - `inst-return-tree`
6. [x] - `p1` - **FOR EACH** of the three mechanics screens, build its entry's route tree from its screen component - `inst-per-entry-tree`

### Kit Token Node

- [x] `p1` - **ID**: `cpt-template-mfe-demo-algo-screen-entries-kit-token-node`

**Input**: The shadow root an entry is mounted into

**Output**: The shadow root holding exactly one style node with the kit's tokens

**Steps**:
1. [x] - `p1` - Rewrite the kit's token stylesheet for a shadow root once, at module load (algorithm Anchor Root Selectors) - `inst-rewrite-once`
2. [x] - `p1` - **IF** the shadow root already holds the style node marked `data-kit-theme`, replace its text and **RETURN** - `inst-reuse-node`
3. [x] - `p1` - **ELSE** create the marked style node with the tokens and append it to the shadow root - `inst-append-node`

### Anchor Root Selectors

- [x] `p1` - **ID**: `cpt-template-mfe-demo-algo-screen-entries-anchor-root-selectors`

**Input**: The kit's token stylesheet text, minified or not

**Output**: The same stylesheet with every `:root` selector naming the shadow host

**Steps**:
1. [x] - `p1` - Define the compound tail that may follow `:root`: classes, ids, attribute selectors and pseudo-classes with an optional non-nested argument; pseudo-elements end the tail - `inst-tail-pattern`
2. [x] - `p1` - Strip every comment, so that each remaining `:root` is a selector - `inst-strip-comments`
3. [x] - `p1` - **FOR EACH** `:root` with its tail: a bare `:root` becomes `:host`, a `:root` with a tail becomes `:host(<tail>)`, and **RETURN** the rewritten text - `inst-rewrite-root`

### Theme Scope

- [x] `p1` - **ID**: `cpt-template-mfe-demo-algo-screen-entries-theme-scope`

**Input**: The shell's theme identifier

**Output**: `light` or `dark`

**Steps**:
1. [x] - `p1` - Enumerate the shell's dark theme identifiers: `dark`, `dracula`, `dracula-large` - `inst-dark-set`
2. [x] - `p1` - **RETURN** `dark` for an enumerated identifier and `light` for any other, unknown identifiers included - `inst-return-scope`

### Screen Blocks

- [x] `p2` - **ID**: `cpt-template-mfe-demo-algo-screen-entries-screen-blocks`

**Input**: The content a screen hands a block (texts, rows, actions, children) and its behaviour props (the shell's theme, a busy flag, a ref, a domain slot's registry and callback)

**Output**: The section, laid out on the kit's tokens from kit components and kit candidates

**Steps**:
1. [x] - `p2` - ScreenFrame: render the screen's column filling the host; with a theme, set the kit's scope from it (algorithm Theme Scope), whose kit rule paints the frame; with the busy flag, make it a status region announced as busy - `inst-screen-frame`
2. [x] - `p2` - PageHeader: render the title as the level-one heading on the kit's heading-1 role, the muted description and the actions in an action row - `inst-page-header`
3. [x] - `p2` - BridgeInfoCard: render a card with a level-two title and the rows as a small description list whose values take the mono variant - `inst-bridge-info`
4. [x] - `p2` - ActionRow: lay the actions out in a wrapping row in which an action shrinks to the row's width - `inst-action-row`
5. [x] - `p2` - ReadingColumn: stack the cards in a column held to a reading width - `inst-reading-column`
6. [x] - `p2` - SkeletonCard and ScreenSkeleton: draw placeholder lines in a card, and a title and a line over that card, every shape hidden from assistive technology; the card alone may be the busy status region - `inst-skeletons`
7. [x] - `p2` - SwatchGrid: render each swatch as a list item painted with its token pair and captioned with the pair's names, the foreground pair reversed - `inst-swatches`
8. [x] - `p2` - TokenList: render the token names as a two-column list of code - `inst-token-list`
9. [x] - `p2` - WidgetSlot: render the extension domain's slot for the given registry and domain, with its attach callback, as a column of widgets - `inst-widget-slot`

## 4. States (CDSL)

Include when entities have explicit lifecycle states.

### No Feature-Owned State Machine

Not applicable. The kit token node is either absent or present once, and the step that keeps it single is the Kit Token Node algorithm; the mount, unmount and settle states of an entry belong to the shell's runtime.

## 5. Definitions of Done

Specific implementation tasks derived from flows and algorithms above.

### Screen Entries

- [x] `p1` - **ID**: `cpt-template-mfe-demo-dod-screen-entries-entries`

The system **MUST** expose one lifecycle per mechanics screen, bound to the package app, that renders a route tree with the screen at `/` and the not-found page for any other path through the extension router, provides the bridge to route components, and registers the data loading screen's refresh handler after the first render and before `mount()` returns.

**Implements**:
- `cpt-template-mfe-demo-flow-screen-entries-mount-screen`
- `cpt-template-mfe-demo-algo-screen-entries-screen-route-tree`

**Constraints**: `cpt-template-mfe-demo-constraint-shared-dependencies`

**Touches**:
- Entities: Entry, Refresh profile action

### Kit Theme Scope

- [x] `p1` - **ID**: `cpt-template-mfe-demo-dod-screen-entries-kit-theme-scope`

The system **MUST** keep exactly one style node of the kit's tokens, re-anchored on the shadow host, in the shadow root of every screen across remounts, and **MUST** map the shell's theme onto the kit's light or dark scope for every screen that receives it.

**Implements**:
- `cpt-template-mfe-demo-algo-screen-entries-kit-token-node`
- `cpt-template-mfe-demo-algo-screen-entries-anchor-root-selectors`
- `cpt-template-mfe-demo-algo-screen-entries-theme-scope`

**Touches**:
- Entities: Entry

### Screen Blocks

- [x] `p2` - **ID**: `cpt-template-mfe-demo-dod-screen-entries-screen-blocks`

The system **MUST** give the screens the ten blocks under `demo-mfe/src/blocks/`, each built from kit components and kit candidates, taking content and behaviour props only, laying its parts out on the kit's tokens with every other declaration recorded in the exemptions ledger, and each with a card, a showcase fixture and a test that runs axe on that fixture; the screens, the widgets host page and the not-found page **MUST** import no stylesheet.

**Implements**:
- `cpt-template-mfe-demo-algo-screen-entries-screen-blocks`

**Constraints**: `cpt-template-mfe-demo-constraint-css-modules`

**Touches**:
- Entities: Screen extension

## 6. Acceptance Criteria

- [x] The isolation and shared state lifecycles render their screens; every screen entry is built on the lifecycle that carries the kit tokens.
- [x] A screen's shadow root holds the kit's tokens re-anchored on the shadow host, in one style node however often it mounts.
- [x] The data loading lifecycle registers the refresh handler after mounting, and the handler delegates to the refresh function.
- [x] Every screen renders its page at the screen root with the mounted bridge and the not-found page for any other path.
- [x] Dark shell themes map to the kit's dark scope; light themes and unknown identifiers map to the light scope.
- [x] Every block renders its content in order with real headings, lists and status regions where it has them, passes axe on its showcase fixture, and the screen frame sets the scope only when it is given a theme.

**Test scenarios** (Vitest, in the composed `demo-mfe` package):
- `src/lifecycle.test.tsx`: "renders the hello world lifecycle content"; "renders the theme lifecycle content"; "builds every screen on the lifecycle that carries the kit tokens"; "re-anchors the ui-kit design tokens onto the shadow host it renders into"; "registers the refresh handler after profile mount and delegates to fetchUser".
- `src/lifecycle-theme-direction.test.tsx`: for each entry, "follows the shell's theme and the language's direction on the shadow host".
- `src/routes.test.tsx`: "render the screen at the screen root, with the mounted bridge"; "render the screen's not-found page for any other path".
- `src/shared/anchorKitThemeOnShadowHost.test.ts`: bare and compound rewrites, pseudo-elements kept outside `:host()`, idempotence, every `:root` of the pinned kit stylesheet in selector position, the stated quoted-value limitation.
- `src/shared/kitThemeScope.test.ts`: dark themes, light themes, unknown identifier.
- `src/blocks/<Block>/<Block>.test.tsx` for each of the ten blocks: content and order, headings and list or region roles, the screen frame's scope and busy region, the widget slot's props, and axe on the showcase fixture.
