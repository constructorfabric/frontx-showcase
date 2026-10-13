# Decomposition: template-mfe-demo

<!-- toc -->

- [1. Overview](#1-overview)
- [2. Entries](#2-entries)
  - [2.1 Package Declarations and Overlay - HIGH](#21-package-declarations-and-overlay---high)
  - [2.2 Demo App and Accounts API - HIGH](#22-demo-app-and-accounts-api---high)
  - [2.3 Screen Entries, Kit Theme Scope and Screen Blocks - HIGH](#23-screen-entries-kit-theme-scope-and-screen-blocks---high)
  - [2.4 MFE Mechanics Screens - HIGH](#24-mfe-mechanics-screens---high)
  - [2.5 Nested Widgets Domain - HIGH](#25-nested-widgets-domain---high)
  - [2.6 Widget Packages - MEDIUM](#26-widget-packages---medium)
- [3. Feature Dependencies](#3-feature-dependencies)

<!-- /toc -->

## 1. Overview

The template's [DESIGN](./DESIGN.md) is decomposed along its component model: one feature per component group that changes together, so that every DESIGN component, principle and constraint belongs to exactly one feature and every PRD functional and non-functional requirement is assigned to at least one feature. Six features result, ordered from the declarations every package rests on, through `demo-mfe`'s app, screen entries and screen blocks, to the three mechanics screens, the nested widgets screen and the two widget packages it mounts.

Each feature lists its code scope as paths relative to the template's root directory. A file belongs to exactly one feature. Test files belong to the feature that owns the code they test, as stated per feature; the repository's Studio registry keeps tests, test helpers and build configurations out of the marker scan, so markers live only in the listed source files. Translation files and CSS Modules belong to the feature of the screen or package they sit in.

Three design elements apply to more than one feature, and each is assigned to one owner with the reason stated: the principle that each loaded runtime builds one FrontX app and the constraint that the mock plugin comes before the shared query cache are owned by the demo app feature, which defines the app builder pattern; the widgets host and both widget packages build their apps by the same rule inside their own scope. The CSS Modules constraint is owned by the screen entries feature, which holds the package's blocks, the only styled code; the screens, the widgets host page and both widgets follow it by importing no stylesheet. One requirement is assigned to three features on purpose: the not-found page inside every screen and routed widget is built by the screen entries for the three mechanics screens, by the nested widgets feature for its own screen (whose not-found page also settles its mount) and by the widget packages feature for widgets-fixture-a's route tree.

The DESIGN defines no database or table (the accounts data is a mock held in the browser), so no feature carries a data entry. Each of the DESIGN's four sequences is assigned to the feature that starts it, and each PRD interface and contract is named in the API entry of the feature that provides or consumes it.

How the site composes the template, deep-links into its screens, lays out the production build and generates page metadata belongs to the site's own decomposition: [DECOMPOSITION.md](../../architecture/DECOMPOSITION.md).

## 2. Entries

**Overall implementation status:**

- [x] `p1` - **ID**: `cpt-template-mfe-demo-status-overall`

### 2.1 [Package Declarations and Overlay](features/package-declarations/) - HIGH

- [x] `p1` - **ID**: `cpt-template-mfe-demo-feature-package-declarations`

- **Purpose**: Declares everything the runtime and the shell learn about the three packages: action schemas, remote manifests, the `widgets` domain, entries, the four screen extensions with address, placement and page metadata, and the three widget extensions. It also makes the template a self-contained overlay that keeps template-mfe's identity and builds against the shell's shared dependencies at exact pins.

- **Depends On**: None

- **Scope**:
  - The three package manifests: refresh and ping action schemas, remote manifests, `widgets` domain, entries, screen and widget extensions, routes, presentation (label, order, the demos nav group's id) and `seo` blocks.
  - The extension and action identifiers the code uses, mirrored once from the manifests.
  - The template manifest with its exclusive subtrees, the AI bundle with the demo contract guideline, and the READMEs that classify every difference from template-mfe.
  - Per-package build and test setup: package dependencies at exact pins, the shared dependency set, preview ports, test helpers.

- **Out of scope**:
  - Any runtime behaviour: lifecycles, screens and the nested app are later features.
  - Generating pages from the `seo` blocks and listing the screens of a nav group in the header, which the site does.

- **Code scope**:
  - `frontx-template.json`, `README.md`, `.frontx/ai/@gears-frontx/frontx-template-mfe-demo/`
  - `src-app/mfe_packages/demo-mfe/mfe.json`, `package.json`, `README.md`, `index.html`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `src/vite-env.d.ts`, `src/shared/README.md`, `src/test-support/`
  - `src-app/mfe_packages/demo-mfe/src/shared/extension-ids.ts`
  - `src-app/mfe_packages/widgets-fixture-a/mfe.json`, `package.json`, `README.md`, `index.html`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `src/vite-env.d.ts`
  - `src-app/mfe_packages/widgets-fixture-b/mfe.json`, `package.json`, `README.md`, `index.html`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `src/vite-env.d.ts`
  - Tests: `demo-mfe/src/manifest.test.ts`, `demo-mfe/src/refresh-profile-action-schema.test.ts`, `widgets-fixture-a/src/manifest.test.ts`, `widgets-fixture-a/src/shared-deps.vite-config.test.ts`, `widgets-fixture-b/src/manifest.test.ts`

- **Requirements Covered**:

  - [x] `p1` - `cpt-template-mfe-demo-fr-demo-screens`
  - [x] `p1` - `cpt-template-mfe-demo-fr-screen-metadata`
  - [x] `p1` - `cpt-template-mfe-demo-fr-self-contained-overlay`

- **Design Principles Covered**:

  - [x] `p1` - `cpt-template-mfe-demo-principle-declared-entities`
  - [x] `p2` - `cpt-template-mfe-demo-principle-upstream-identity`

- **Design Constraints Covered**:

  - [x] `p1` - `cpt-template-mfe-demo-constraint-shell-prerequisite`
  - [x] `p1` - `cpt-template-mfe-demo-constraint-exclusive-with-upstream-demo`
  - [x] `p1` - `cpt-template-mfe-demo-constraint-shared-dependencies`
  - [x] `p2` - `cpt-template-mfe-demo-constraint-exact-pins`

- **Domain Model Entities**:
  - Remote manifest
  - Entry
  - Screen extension
  - Widgets domain
  - Widget extension
  - Refresh profile action
  - Widget ping action
  - Demos nav group

- **Design Components**:

  - [x] `p1` - `cpt-template-mfe-demo-component-package-manifests`

- **API**:
  - The four screen addresses `mfe-hello-world`, `mfe-profile`, `mfe-theme`, `mfe-widgets` (`cpt-template-mfe-demo-interface-screen-addresses`)
  - The host's demos nav group the screens name (`cpt-template-mfe-demo-contract-demos-nav-group`)
  - The shell host the packages build and run against (`cpt-template-mfe-demo-contract-shell-host`)

### 2.2 [Demo App and Accounts API](features/demo-app/) - HIGH

- [x] `p1` - **ID**: `cpt-template-mfe-demo-feature-demo-app`

- **Purpose**: Gives `demo-mfe`'s screens one FrontX app per loaded runtime, joined to the host's query cache without clearing it, with a mocked accounts API that the data loading screen reads and edits and a refresh function that the profile refresh action calls.

- **Depends On**: `cpt-template-mfe-demo-feature-package-declarations`

- **Scope**:
  - The package app built once at module level with the effects, mock, shared query cache and microfrontends plugins, in that plugin order, and the accessor for its registry.
  - The accounts API service with the current user query and the profile mutation, its types, the mock map and the in-browser mock user store.
  - The refresh function that invalidates the current user query.

- **Out of scope**:
  - The data loading screen's states and optimistic edit (mechanics screens feature).
  - Registering the refresh action handler on the profile entry (screen entries feature).
  - The nested app of the widgets host and the widget apps, which apply the same app rules in their own features.

- **Code scope**:
  - `src-app/mfe_packages/demo-mfe/src/init.ts`
  - `src-app/mfe_packages/demo-mfe/src/api/AccountsApiService.ts`, `api/types.ts`, `api/mocks.ts`, `api/mock-user-store.ts`
  - `src-app/mfe_packages/demo-mfe/src/actions/profileActions.ts`
  - Tests: `demo-mfe/src/init.test.ts`, `demo-mfe/src/api/AccountsApiService.test.ts`, `demo-mfe/src/api/mocks.test.ts`, `demo-mfe/src/actions/profileActions.test.ts`

- **Requirements Covered**:

  - [x] `p2` - `cpt-template-mfe-demo-nfr-cache-continuity`

- **Design Principles Covered**:

  - [x] `p1` - `cpt-template-mfe-demo-principle-one-app-per-runtime`

- **Design Constraints Covered**:

  - [x] `p1` - `cpt-template-mfe-demo-constraint-mocks-before-shared-cache`

- **Domain Model Entities**:
  - User

- **Design Components**:

  - [x] `p1` - `cpt-template-mfe-demo-component-demo-app`

- **API**:
  - The accounts API's current user query and profile update, served by mocks in the browser

### 2.3 [Screen Entries, Kit Theme Scope and Screen Blocks](features/screen-entries/) - HIGH

- [x] `p1` - **ID**: `cpt-template-mfe-demo-feature-screen-entries`

- **Purpose**: Turns the three mechanics screens into entries the shell can mount: a lifecycle per screen that mounts into Shadow DOM, renders a one-page route tree with a not-found page, registers its action handlers before its mount settles and keeps exactly one copy of the kit's tokens in the shadow root; and gives every screen of the package the blocks it is built from, including the screen frame that scopes the kit's tokens to the shell's theme.

- **Depends On**: `cpt-template-mfe-demo-feature-demo-app`

- **Scope**:
  - The isolation, data loading and shared state lifecycles and their route trees.
  - The shared route tree builder, the not-found page and the provider that hands the mounted bridge to route components.
  - The data loading entry's refresh action handler, registered after the first render and before `mount()` returns.
  - The kit-themed lifecycle base, the rewrite of the kit's `:root` selectors to the shadow host and the mapping from the shell's theme to the kit's light or dark scope.
  - The screen blocks (ScreenFrame, PageHeader, BridgeInfoCard, ActionRow, ReadingColumn, ScreenSkeleton, SkeletonCard, SwatchGrid, TokenList, WidgetSlot), their cards, showcase fixtures and the exemptions ledger.

- **Out of scope**:
  - Screen content, hooks and translations (mechanics screens feature).
  - The widgets host's lifecycle and route tree (nested widgets feature), which reuses this feature's not-found page, kit-themed lifecycle base and blocks.

- **Code scope**:
  - `src-app/mfe_packages/demo-mfe/src/lifecycle-helloworld.tsx`, `lifecycle-profile.tsx`, `lifecycle-theme.tsx`
  - `src-app/mfe_packages/demo-mfe/src/routes-helloworld.tsx`, `routes-profile.tsx`, `routes-theme.tsx`
  - `src-app/mfe_packages/demo-mfe/src/shared/screenRoutes.tsx`
  - `src-app/mfe_packages/demo-mfe/src/shared/KitThemedLifecycle.ts`, `shared/anchorKitThemeOnShadowHost.ts`, `shared/kitThemeScope.ts`
  - `src-app/mfe_packages/demo-mfe/src/blocks/` (each block's `.tsx`, `.module.css`, `.md`, `.showcase.tsx`, `index.ts`; `styles-exemptions.json`)
  - Tests: `demo-mfe/src/lifecycle.test.tsx`, `demo-mfe/src/lifecycle-theme-direction.test.tsx`, `demo-mfe/src/routes.test.tsx` (it also covers the widgets host's route tree), `demo-mfe/src/shared/anchorKitThemeOnShadowHost.test.ts`, `demo-mfe/src/shared/kitThemeScope.test.ts`, each block's `.test.tsx`, `demo-mfe/src/test-support/axe.ts`

- **Requirements Covered**:

  - [x] `p2` - `cpt-template-mfe-demo-fr-not-found`
  - [x] `p2` - `cpt-template-mfe-demo-fr-kit-built-screens`
  - [x] `p1` - `cpt-template-mfe-demo-nfr-runtime-isolation`

- **Design Principles Covered**:

  - [x] `p1` - `cpt-template-mfe-demo-principle-handlers-before-settle`
  - [x] `p2` - `cpt-template-mfe-demo-principle-kit-tokens-in-shadow-root`

- **Design Constraints Covered**:

  - [x] `p2` - `cpt-template-mfe-demo-constraint-css-modules`

- **Domain Model Entities**:
  - Entry

- **Design Components**:

  - [x] `p1` - `cpt-template-mfe-demo-component-screen-entries`
  - [x] `p2` - `cpt-template-mfe-demo-component-kit-theme-scope`
  - [x] `p2` - `cpt-template-mfe-demo-component-screen-blocks`

- **API**:
  - The handler side of the profile refresh action (`cpt-template-mfe-demo-interface-refresh-profile-action`)

- **Sequences**:

  - `cpt-template-mfe-demo-seq-mount-screen`

### 2.4 [MFE Mechanics Screens](features/mfe-mechanics-demo/) - HIGH

- [x] `p1` - **ID**: `cpt-template-mfe-demo-feature-mfe-mechanics-demo`

- **Purpose**: The three screens that each show one mechanic of the microfrontend runtime: isolation with the shell's shared theme and language and three cross-screen actions chains, data loading with optimistic edits and rollback, and the shell's theme as shared state with the palette the page is drawn in. All of them are built from kit components inside Shadow DOM and follow the shell's language with their own translations and a right-to-left direction.

- **Depends On**: `cpt-template-mfe-demo-feature-screen-entries`

- **Scope**:
  - The isolation screen: bridge information, live theme and language, and the three actions chains (open the shared state screen; open the data loading screen then refresh it; open the nested widgets screen, mount a named widget, ping it).
  - The data loading screen: query states with retry, the profile card with trimmed, null-safe values, the optimistic edit with rollback and reload.
  - The shared state screen: the theme name and seven swatches captioned with their token pairs, painted with the palette the screen's kit scope and the document's overrides give.
  - The screen hooks: live shared property value, translations with English fallback and latest-load-wins, and the shadow host's direction.
  - Each screen's composition of blocks, kit components and kit candidates, with no stylesheet; its translation files; accessible names, landmarks and announced loading states.

- **Out of scope**:
  - The nested widgets page (nested widgets feature).
  - The lifecycle and route of each screen and the blocks it is built from (screen entries feature).

- **Code scope**:
  - `src-app/mfe_packages/demo-mfe/src/screens/helloworld/`
  - `src-app/mfe_packages/demo-mfe/src/screens/profile/`
  - `src-app/mfe_packages/demo-mfe/src/screens/theme/`
  - `src-app/mfe_packages/demo-mfe/src/shared/useBridgeProperty.ts`, `shared/useScreenTranslations.ts`, `shared/useHostDirection.ts`
  - Tests: the `*.test.ts(x)` files in those screen folders, `demo-mfe/src/shared/useBridgeProperty.test.tsx`, `shared/useScreenTranslations.test.tsx`, `shared/useHostDirection.test.tsx`

- **Requirements Covered**:

  - [x] `p1` - `cpt-template-mfe-demo-fr-isolation-screen`
  - [x] `p2` - `cpt-template-mfe-demo-fr-screen-translations`
  - [x] `p1` - `cpt-template-mfe-demo-fr-cross-screen-actions`
  - [x] `p1` - `cpt-template-mfe-demo-fr-data-loading-screen`
  - [x] `p1` - `cpt-template-mfe-demo-fr-shared-state-screen`
  - [x] `p2` - `cpt-template-mfe-demo-nfr-accessible-screens`

- **Design Principles Covered**:

  - None of the template's principles is owned here; the screens rely on the kit token principle owned by the screen entries feature.

- **Design Constraints Covered**:

  - None of the template's constraints is owned here; the screens import no stylesheet under the CSS Modules constraint owned by the screen entries feature.

- **Domain Model Entities**:
  - User
  - Refresh profile action

- **Design Components**:

  - [x] `p1` - `cpt-template-mfe-demo-component-demo-screens`
  - [x] `p2` - `cpt-template-mfe-demo-component-screen-hooks`

- **API**:
  - The sender side of the profile refresh action and of the actions chains that open other screens

- **Sequences**:

  - `cpt-template-mfe-demo-seq-open-and-refresh`

### 2.5 [Nested Widgets Domain](features/widgets-nested-domain/) - HIGH

- [x] `p1` - **ID**: `cpt-template-mfe-demo-feature-widgets-nested-domain`

- **Purpose**: The nested widgets screen: a screen that is itself a host. It builds a nested FrontX app, discovers the widgets other packages declare from the shell's published manifests aggregate read relative to the shell's document, owns the `widgets` extension domain with concurrent mounting, mounts every widget when its slot attaches, offers a ping per widget that handles one, and settles its mount only once the domain is owned and attached.

- **Depends On**: `cpt-template-mfe-demo-feature-screen-entries`

- **Scope**:
  - The nested app with the Module Federation handler, built once per loaded runtime with the mock plugin before the shared query cache.
  - The bootstrap: fetch the aggregate relative to the document, register schemas, the shell's theme, language and screen extension schemas, manifests, domains and entries, the screen domain declaration, take ownership of the `widgets` domain, register the widgets-domain extensions once across remounts.
  - The page with loading and error states, the ping buttons and the domain slot that mounts every widget with the replace history intent, composed of the screen blocks and kit parts on the kit-themed lifecycle base.
  - The widgets host's lifecycle, its route tree and the not-found page that settles the mount.

- **Out of scope**:
  - The widgets themselves (widget packages feature).
  - Address writing for settled mounts, which the nested app's framework router does.
  - The isolation screen's chain that targets this screen (mechanics screens feature).

- **Code scope**:
  - `src-app/mfe_packages/demo-mfe/src/lifecycle-widgets-host.tsx`
  - `src-app/mfe_packages/demo-mfe/src/routes-widgets-host.tsx`
  - Tests: `demo-mfe/src/lifecycle-widgets-host.test.tsx`, `lifecycle-widgets-host.remount.test.tsx`, `lifecycle-widgets-host.gts-order.test.ts`

- **Requirements Covered**:

  - [x] `p1` - `cpt-template-mfe-demo-fr-nested-widgets`
  - [x] `p2` - `cpt-template-mfe-demo-fr-not-found`
  - [x] `p1` - `cpt-template-mfe-demo-nfr-mount-independence`

- **Design Principles Covered**:

  - None of the template's principles is owned here; the screen applies the one-app-per-runtime and handlers-before-settle principles owned by the demo app and screen entries features.

- **Design Constraints Covered**:

  - [x] `p1` - `cpt-template-mfe-demo-constraint-document-relative-aggregate`

- **Domain Model Entities**:
  - Widgets domain
  - Widget extension

- **Design Components**:

  - [x] `p1` - `cpt-template-mfe-demo-component-widgets-host`

- **API**:
  - The `widgets` extension domain (`cpt-template-mfe-demo-interface-widgets-domain`)
  - The published manifests aggregate it reads (`cpt-template-mfe-demo-contract-manifest-aggregate`)

- **Sequences**:

  - `cpt-template-mfe-demo-seq-widgets-bootstrap`
  - `cpt-template-mfe-demo-seq-ping-across-nesting`

### 2.6 [Widget Packages](features/widget-fixtures/) - MEDIUM

- [x] `p2` - **ID**: `cpt-template-mfe-demo-feature-widget-fixtures`

- **Purpose**: The two widget packages mounted in the nested widgets screen: `widgets-fixture-a`, whose one entry backs two widget instances with separate module state, per-instance ping time kept in the instance's own address and a button that opens the isolation screen two levels up; and `widgets-fixture-b`, a second package that mounts next to them.

- **Depends On**: `cpt-template-mfe-demo-feature-widgets-nested-domain`

- **Scope**:
  - widgets-fixture-a: one app per loaded copy, a separate React root per container, the per-instance random witness, the ping handler registered before `mount()` returns that rejects pings while unmounted and writes the ping time into the instance's address, the route tree with the instance page and a not-found page, the button that asks the shell's screen domain to mount the isolation screen.
  - widgets-fixture-b: one widget with its own app that renders a labelled kit item and logs its mount.
  - Both packages draw with kit components and import no stylesheet.

- **Out of scope**:
  - Discovering and mounting the widgets (nested widgets feature).
  - Page metadata: widgets are not pages.

- **Code scope**:
  - `src-app/mfe_packages/widgets-fixture-a/src/lifecycle.tsx`, `src/routes.tsx`
  - `src-app/mfe_packages/widgets-fixture-b/src/lifecycle.tsx`
  - Tests: `widgets-fixture-a/src/lifecycle.test.tsx`, `widgets-fixture-a/src/routes.test.tsx`, `widgets-fixture-b/src/lifecycle.test.tsx`

- **Requirements Covered**:

  - [x] `p2` - `cpt-template-mfe-demo-fr-widget-instances`
  - [x] `p2` - `cpt-template-mfe-demo-fr-not-found`

- **Design Principles Covered**:

  - None of the template's principles is owned here; each widget package applies the one-app-per-runtime principle owned by the demo app feature.

- **Design Constraints Covered**:

  - None of the template's constraints is owned here; both packages follow the CSS Modules and mock-order constraints owned by the screen entries and demo app features.

- **Domain Model Entities**:
  - Widget extension
  - Widget ping action

- **Design Components**:

  - [x] `p2` - `cpt-template-mfe-demo-component-widget-fixture-a`
  - [x] `p3` - `cpt-template-mfe-demo-component-widget-fixture-b`

- **API**:
  - The widget ping action handled by each widgets-fixture-a instance

---

## 3. Feature Dependencies

```text
cpt-template-mfe-demo-feature-package-declarations
    |
    v
cpt-template-mfe-demo-feature-demo-app
    |
    v
cpt-template-mfe-demo-feature-screen-entries
    |
    +-> cpt-template-mfe-demo-feature-mfe-mechanics-demo
    |
    +-> cpt-template-mfe-demo-feature-widgets-nested-domain
            |
            v
        cpt-template-mfe-demo-feature-widget-fixtures
```

**Dependency Rationale**:

- `cpt-template-mfe-demo-feature-demo-app` requires `cpt-template-mfe-demo-feature-package-declarations`: the app registers the accounts service and its mocks inside a package whose dependencies, shared set and shell prerequisite the declarations fix.
- `cpt-template-mfe-demo-feature-screen-entries` requires `cpt-template-mfe-demo-feature-demo-app`: every lifecycle renders through the registry of the package app, and the profile entry's refresh handler calls the app's refresh function.
- `cpt-template-mfe-demo-feature-mfe-mechanics-demo` requires `cpt-template-mfe-demo-feature-screen-entries`: the screens are rendered by the entries' route trees, read the bridge the entries provide, take the kit's tokens from the kit-themed lifecycle and are built from the entries feature's blocks.
- `cpt-template-mfe-demo-feature-widgets-nested-domain` requires `cpt-template-mfe-demo-feature-screen-entries`: its route tree reuses the screen entries' not-found page, its lifecycle the kit-themed base and its page the blocks, and the `widgets` domain and screen extension it registers are declared by the package declarations feature beneath them.
- `cpt-template-mfe-demo-feature-widget-fixtures` requires `cpt-template-mfe-demo-feature-widgets-nested-domain`: the widgets target the `widgets` domain the nested widgets screen owns and are mounted and pinged through it.
- `cpt-template-mfe-demo-feature-mfe-mechanics-demo` and `cpt-template-mfe-demo-feature-widgets-nested-domain` are independent of each other at build time and can be developed in parallel; the isolation screen's third actions chain reaches the nested widgets screen only at run time, through declared identifiers.
