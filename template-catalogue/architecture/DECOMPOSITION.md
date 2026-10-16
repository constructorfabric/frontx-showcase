# Decomposition: template-catalogue

<!-- toc -->

- [1. Overview](#1-overview)
- [2. Entries](#2-entries)
  - [2.1 Demo File Generation - HIGH](#21-demo-file-generation---high)
  - [2.2 Cross-Screen Navigation - HIGH](#22-cross-screen-navigation---high)
  - [2.3 Catalogue Screen - HIGH](#23-catalogue-screen---high)
- [3. Feature Dependencies](#3-feature-dependencies)

<!-- /toc -->

## 1. Overview

The [DESIGN](./DESIGN.md) of template-catalogue describes one screen MFE package, `catalogue-mfe`, made of two halves: the demo files, produced on request by a generator from the kit demo at the pinned release (`cpt-template-catalogue-adr-generated-from-kit-demo`), and the screen around them. The decomposition follows that boundary and splits off the part of the screen that crosses the screen's own boundary, which gives three features:

- **Demo file generation** owns the generator, its lock and its recorded adaptations, and the files it writes. It runs only on request and never in a build.
- **Cross-screen navigation** owns what enters the screen from another one: the catalogue's own `show_component` action and its handler. The catalogue opens no other screen and reads no list of screens.
- **Catalogue screen** owns the package as the host sees it and the pages a visitor reads: the screen manifest, the lifecycle, the frame that brings theme and language into the shadow root, the page registry, the route tree and layout, and the pages.

Every DESIGN component, principle and constraint is assigned below. Two elements are shared, each with its reason stated in the entries that share it: the principle `cpt-template-catalogue-principle-host-lists-screens`, shared by the screen and the navigation feature (the screen discovers the component pages from the generated files; the navigation feature keeps the catalogue to its own pages, reachable through its own action, and lists no other screen), and the NFR `cpt-template-catalogue-nfr-self-contained`, shared by all three features (the screen owns the exact pins and the manifest, the navigation module references nothing outside the package, and the generator runs on Node built-ins only). The DESIGN has no data entities (section 3.7), so no feature has a Data entry.

Each feature lists its code scope. A file belongs to exactly one feature. The template's paths that are no feature's code scope are: the tests and test support (`*.test.*`, `src/test-support/`), the build and test configuration (`vite.config.ts`, `vitest.config.ts`, `tsconfig.json`, `index.html`, `src/vite-env.d.ts`), the template manifest `frontx-template.json` and the documentation (the template's and the package's `README.md`). Generated files belong to the generation feature as its output; the registry excludes them from the marker scan, because every regeneration overwrites them.

Each feature is a single phase with no sub-decomposition. Catalogue screen is the largest feature by code: its six components form one route tree under one lifecycle and frame and are specified and marked together; splitting it would cut through the route tree and the page registry every page reads.

How the template is composed into the site, and the site's own decisions, are described in the site's [DESIGN](../../architecture/DESIGN.md) and [ADR directory](../../architecture/ADR/); this decomposition names none of their ids.

## 2. Entries

**Overall implementation status:**

- [x] `p1` - **ID**: `cpt-template-catalogue-status-overall`

### 2.1 [Demo File Generation](features/catalogue-generation/) - HIGH

- [x] `p1` - **ID**: `cpt-template-catalogue-feature-catalogue-generation`

- **Purpose**: Produce, check, record and move the catalogue's demo files (the kit demo's example files, foundation pages and their shared helper) from the kit demo at the commit the pinned kit release was published from, through the content rules and the recorded adaptations, and store them so builds need no network. This is what keeps the catalogue the kit as released, with every difference stated and checked.

- **Depends On**: None

- **Scope**:
  - Reading the locked demo files from the gears-frontx repository at the locked commit, or from a local checkout, with a per-commit cache that, at the locked commit, accepts a file only when its content hash matches the lock, and on a move to a new commit keeps what it fetches, which the moved lock then records.
  - The content rules every demo file passes, and refusing any refused text that survives an adaptation.
  - Parsing and strictly applying each recorded adaptation, and refusing an adaptation without its kind or reason.
  - Writing the demo files into the package (`src/examples/`, `src/pages/`, `src/shared.tsx`) at the paths the generated imports require.
  - The check mode: regenerate in memory and fail, naming the cause, on a hand edit, an extra or missing file, a pin that differs from the lock, a changed source or an adaptation that no longer applies.
  - The record mode: turn a deliberate edit of a demo file into its adaptation, keeping or requiring its kind and reason.
  - The move mode: move the lock to a new commit, refuse a commit that declares another kit version, write every file and list the adaptations to port.
  - The package's `generate` and `generate:check` commands and the generation procedure in the template's AI bundle.

- **Out of scope**:
  - Reading or rendering the demo files at runtime (Catalogue screen).
  - Writing component metadata (family, label, description, page metadata) for a new example: the developer adds it and the screen's tests name what is missing.
  - Running during a build or a test run.

- **Code**:
  - `src-app/mfe_packages/catalogue-mfe/scripts/generate-catalogue.mjs`
  - `src-app/mfe_packages/catalogue-mfe/kit-demo/kit-demo.lock.json` and `src-app/mfe_packages/catalogue-mfe/kit-demo/adaptations/` (data the generator reads and writes)
  - `src-app/mfe_packages/catalogue-mfe/src/examples/`, `src-app/mfe_packages/catalogue-mfe/src/pages/`, `src-app/mfe_packages/catalogue-mfe/src/shared.tsx` (generated output, excluded from the marker scan)
  - `.frontx/ai/@gears-frontx/frontx-template-catalogue/guidelines/catalogue-generation.md`

- **Requirements Covered**:

  - [x] `p1` - `cpt-template-catalogue-fr-demo-files-from-kit`
  - [x] `p1` - `cpt-template-catalogue-fr-generation-check`
  - [x] `p2` - `cpt-template-catalogue-fr-record-adaptation`
  - [x] `p1` - `cpt-template-catalogue-fr-kit-release-move`
  - [x] `p1` - `cpt-template-catalogue-nfr-offline-build`
  - [x] `p1` - `cpt-template-catalogue-nfr-self-contained` (the generator's part: Node built-ins and the package's own files only)

- **Design Principles Covered**:

  - [x] `p1` - `cpt-template-catalogue-principle-kit-demo-is-source`

- **Design Constraints Covered**:

  - [x] `p1` - `cpt-template-catalogue-constraint-no-published-demo`
  - [x] `p2` - `cpt-template-catalogue-constraint-generated-layout`

- **Domain Model Entities**:
  - Kit demo lock
  - Adaptation

- **Design Components**:

  - [x] `p1` - `cpt-template-catalogue-component-catalogue-generator`

- **API**:
  - `cpt-template-catalogue-interface-generation-commands`: `npm run generate`, `npm run generate:check`, `generate -- --record <file>`, `generate -- --ref <commit>`, `--source <dir>`
  - `cpt-template-catalogue-contract-kit-demo-source`: the kit demo's files over HTTPS at a commit, or a local checkout

- **Sequences**:

  - `cpt-template-catalogue-seq-generate-demo-files`

- **Data**: none; the lock and the adaptations are files of the package, listed under Domain Model Entities.

### 2.2 [Cross-Screen Navigation](features/cross-screen-navigation/) - HIGH

- [x] `p1` - **ID**: `cpt-template-catalogue-feature-cross-screen-navigation`

- **Purpose**: Let other screens of the host application open the catalogue at a component's page through the catalogue's own typed `show_component` action, with one history entry, a working Back and no reload, while the catalogue itself names, lists and reads no other screen.

- **Depends On**: None

- **Scope**:
  - The `show_component` action type the package declares, and the handler that moves the catalogue's router to the named component's page by replacing the entry `mount_ext` wrote.
  - Keeping the catalogue free of links to other screens and of reads of the host's screen list.

- **Out of scope**:
  - The `mfe.json` file and the lifecycle that carry the action's schema and register the handler (Catalogue screen owns both files; the schema's content and the registration point are this feature's contract, which its DoD states).
  - Listing the application's screens, the example screens among them (the host's menu).
  - Writing the URL by hand: the framework router writes it.

- **Code**:
  - `src-app/mfe_packages/catalogue-mfe/src/frame/showComponent.ts`

- **Requirements Covered**:

  - [x] `p2` - `cpt-template-catalogue-fr-links-to-screens`
  - [x] `p1` - `cpt-template-catalogue-fr-show-component`
  - [x] `p1` - `cpt-template-catalogue-nfr-self-contained` (shared with the other two features: this feature references nothing outside the package)

- **Design Principles Covered**:

  - [x] `p2` - `cpt-template-catalogue-principle-host-lists-screens` (shared with Catalogue screen: this feature lists no other screen; the screen discovers the component pages from the generated files)

- **Design Constraints Covered**:

  - [x] `p1` - `cpt-template-catalogue-constraint-query-addressing`

- **Domain Model Entities**:
  - Catalogue entry

- **Design Components**:

  - [x] `p1` - `cpt-template-catalogue-component-cross-screen-navigation`

- **API**:
  - `cpt-template-catalogue-interface-show-component`: `gts.frontx.mfes.comm.action.v1~frontx.catalogue.nav.show_component.v1~` with payload `{ component }`, handled when targeted at the catalogue's extension
  - `cpt-template-catalogue-contract-host-application`: the screen domain, and the host's registration of the action schema and validation of every chain against it

- **Sequences**:

  - `cpt-template-catalogue-seq-show-component`

- **Data**: none.

### 2.3 [Catalogue Screen](features/catalogue-screen/) - HIGH

- [x] `p2` - **ID**: `cpt-template-catalogue-feature-catalogue-screen`

- **Purpose**: Give every kit component and foundation its own page at its own address inside one screen, with an index, a not-found page and in-screen navigation, rendered in the host's theme and language inside the shadow root, each page failing alone. This is the catalogue a visitor and a crawler read.

- **Depends On**: `cpt-template-catalogue-feature-catalogue-generation` (the page registry derives the component pages from the stored demo files the generator writes); `cpt-template-catalogue-feature-cross-screen-navigation` (the lifecycle registers its `show_component` handler)

- **Scope**:
  - The screen manifest: the remote, the exposed lifecycle module, the required shared properties, the accepted action and its closed schema, the screen extension (route token, label, order) and the `seo` block with one entry per page.
  - The lifecycle and the package's app: the token stylesheet injected once per shadow root, the frame rendered with the extension router over the route tree, the `show_component` handler registered in `mount()`, and a module that exports its lifecycle only.
  - The screen frame: the host theme mapped onto the kit's light or dark scope, the text direction on the frame and the shadow host, the kit's `:root` selectors rewritten for the shadow host, and the screen's strings loaded in the host's language with English as the fallback.
  - The page registry: a lazy loader and a lazy source loader per stored example file, the foundation entries, the families in fixed order with their icons, the paths of every page, the installed kit version and the type definitions address, and the build plugin that serves an example's source as base64.
  - The route tree and the layout: the section bar, the navigation panel and its row reveal, the page select below the narrow breakpoint, the screen-wide search and the toast region.
  - The pages: index, component page (Preview and Code tabs, "Use in your app", "Component contract"), foundation page, not found; each example behind its own error boundary.
  - The blocks the layout and the pages are drawn with (layout CSS Modules on the kit's tokens, every other declaration a ledger row with its kit gap), the kit candidates the pages use, and the package's dependency pins.

- **Out of scope**:
  - Producing or changing a demo file (Demo File Generation).
  - The `show_component` handler's behaviour (Cross-Screen Navigation).
  - A theme switch or a stored theme, a contracts page, a States tab, an evaluation lab page and the reference showcase's extra pages (excluded by the PRD).

- **Code**:
  - `src-app/mfe_packages/catalogue-mfe/mfe.json`
  - `src-app/mfe_packages/catalogue-mfe/package.json` (the exact pins; its `generate` and `generate:check` scripts are the generation feature's commands)
  - `src-app/mfe_packages/catalogue-mfe/exampleSourcePlugin.ts`
  - `src-app/mfe_packages/catalogue-mfe/src/lifecycle.tsx`, `src-app/mfe_packages/catalogue-mfe/src/init.ts`
  - `src-app/mfe_packages/catalogue-mfe/src/catalog.ts`, `src-app/mfe_packages/catalogue-mfe/src/exampleSource.ts`, `src-app/mfe_packages/catalogue-mfe/src/routes.tsx`
  - `src-app/mfe_packages/catalogue-mfe/src/frame/ScreenFrame.tsx`, `kitThemeScope.ts`, `anchorKitThemeOnShadowHost.ts`, `useScreenTranslations.ts`, `kitVersion.ts`, `ExampleErrorBoundary.tsx` (all in `src/frame/`)
  - `src-app/mfe_packages/catalogue-mfe/src/screens/catalogue/` (`CatalogueLayout.tsx`, `CataloguePages.tsx`, `CatalogueSearch.tsx`, `CatalogueText.tsx`, `revealRow.ts`, `i18n/en.json`)
  - `src-app/mfe_packages/catalogue-mfe/src/blocks/` (one folder per block, `anchor.tsx`, `styles-exemptions.json`, `blocks-policy.test.ts`)
  - `.frontx/ai/@gears-frontx/frontx-template-catalogue/extension.json` and `guidelines/catalogue-contract.md`

- **Requirements Covered**:

  - [x] `p1` - `cpt-template-catalogue-fr-component-pages`
  - [x] `p1` - `cpt-template-catalogue-fr-foundation-pages`
  - [x] `p1` - `cpt-template-catalogue-fr-index`
  - [x] `p1` - `cpt-template-catalogue-fr-component-page-content`
  - [x] `p1` - `cpt-template-catalogue-fr-screen-navigation`
  - [x] `p1` - `cpt-template-catalogue-fr-host-theme-language`
  - [x] `p1` - `cpt-template-catalogue-fr-page-metadata`
  - [x] `p1` - `cpt-template-catalogue-nfr-failure-containment`
  - [x] `p1` - `cpt-template-catalogue-nfr-self-contained` (the package's exact pins and its manifest)
  - [x] `p2` - `cpt-template-catalogue-nfr-page-semantics`

- **Design Principles Covered**:

  - [x] `p2` - `cpt-template-catalogue-principle-host-lists-screens` (shared with Cross-Screen Navigation, reason stated there)
  - [x] `p1` - `cpt-template-catalogue-principle-page-per-address`
  - [x] `p2` - `cpt-template-catalogue-principle-contain-failures`

- **Design Constraints Covered**:

  - [x] `p1` - `cpt-template-catalogue-constraint-shadow-root`
  - [x] `p1` - `cpt-template-catalogue-constraint-loader-scans-imports`
  - [x] `p2` - `cpt-template-catalogue-constraint-lifecycle-default-export`
  - [x] `p2` - `cpt-template-catalogue-constraint-styling-and-pins`

- **Domain Model Entities**:
  - Catalogue entry
  - Family
  - Section
  - Page metadata

- **Design Components**:

  - [x] `p1` - `cpt-template-catalogue-component-screen-manifest`
  - [x] `p1` - `cpt-template-catalogue-component-screen-lifecycle`
  - [x] `p1` - `cpt-template-catalogue-component-screen-frame`
  - [x] `p1` - `cpt-template-catalogue-component-page-registry`
  - [x] `p1` - `cpt-template-catalogue-component-layout`
  - [x] `p1` - `cpt-template-catalogue-component-pages`
  - [x] `p1` - `cpt-template-catalogue-component-blocks`

- **API**:
  - `cpt-template-catalogue-interface-catalogue-addresses`: `/?screen=catalogue`, `route=components/<slug>`, `route=foundations/<slug>`
  - `cpt-template-catalogue-contract-host-application`: the screen domain mount, the theme and language shared properties

- **Sequences**:

  - `cpt-template-catalogue-seq-open-component-page`

- **Data**: none.

---

## 3. Feature Dependencies

```text
cpt-template-catalogue-feature-catalogue-generation    cpt-template-catalogue-feature-cross-screen-navigation
                         |                                                  |
                         +--------------------------+-----------------------+
                                                    v
                              cpt-template-catalogue-feature-catalogue-screen
```

**Dependency Rationale**:

- `cpt-template-catalogue-feature-catalogue-screen` requires `cpt-template-catalogue-feature-catalogue-generation`: the page registry builds one component page per stored example file and renders the stored foundation pages, so the screen has no pages until the generator has written them.
- `cpt-template-catalogue-feature-catalogue-screen` requires `cpt-template-catalogue-feature-cross-screen-navigation`: the lifecycle registers the `show_component` handler that feature owns.
- `cpt-template-catalogue-feature-catalogue-generation` and `cpt-template-catalogue-feature-cross-screen-navigation` are independent of each other and can be developed in parallel.
