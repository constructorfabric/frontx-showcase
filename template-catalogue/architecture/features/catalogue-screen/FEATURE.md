# Feature: Catalogue Screen

- [x] `p2` - **ID**: `cpt-template-catalogue-featstatus-catalogue-screen`

<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Mount the Screen](#mount-the-screen)
  - [Browse the Index](#browse-the-index)
  - [Browse a Component](#browse-a-component)
  - [Browse a Foundation](#browse-a-foundation)
  - [Move Between Pages](#move-between-pages)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Build the Page Registry](#build-the-page-registry)
  - [Serve an Example's Source](#serve-an-examples-source)
  - [Follow the Host's Theme and Language](#follow-the-hosts-theme-and-language)
  - [Anchor the Kit Tokens on the Shadow Host](#anchor-the-kit-tokens-on-the-shadow-host)
  - [Load the Screen's Strings](#load-the-screens-strings)
  - [Reveal the Current Row](#reveal-the-current-row)
  - [Draw a Block](#draw-a-block)
- [4. States (CDSL)](#4-states-cdsl)
  - [Example Boundary State Machine](#example-boundary-state-machine)
  - [Example Source State Machine](#example-source-state-machine)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Screen Manifest and Lifecycle](#screen-manifest-and-lifecycle)
  - [Page Registry From the Stored Files](#page-registry-from-the-stored-files)
  - [Routes and In-Screen Navigation](#routes-and-in-screen-navigation)
  - [Pages](#pages)
  - [Blocks](#blocks)
  - [Host Theme and Language](#host-theme-and-language)
  - [Failure Containment](#failure-containment)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

## 1. Feature Context

- [x] `p2` - `cpt-template-catalogue-feature-catalogue-screen`

### 1.1 Overview

The catalogue screen as the host sees it and as a visitor reads it: the package app and its lifecycle, the frame that brings the host's theme, text direction and language into the shadow root, the page registry built from the stored demo files, the route tree with its navigation, and the pages (index, component, foundation, not found). The code is `catalogue-mfe`'s `src/lifecycle.tsx`, `src/init.ts`, `src/catalog.ts`, `src/exampleSource.ts`, `exampleSourcePlugin.ts`, `src/routes.tsx`, the screen helpers in `src/frame/` other than the navigation module, the compositions in `src/screens/catalogue/` and the blocks they are drawn with in `src/blocks/`; its declarations are `mfe.json` and `package.json`.

### 1.2 Purpose

Every kit component and foundation gets its own page at its own address inside one screen, discovered from the stored demo files rather than listed by hand, rendered in the host's theme and language inside the shadow root, each example and foundation page failing alone. The page metadata is declared once per page in the manifest and held to the route tree by the package's tests.

**Requirements**: `cpt-template-catalogue-fr-component-pages`, `cpt-template-catalogue-fr-foundation-pages`, `cpt-template-catalogue-fr-index`, `cpt-template-catalogue-fr-component-page-content`, `cpt-template-catalogue-fr-screen-navigation`, `cpt-template-catalogue-fr-host-theme-language`, `cpt-template-catalogue-fr-page-metadata`, `cpt-template-catalogue-nfr-failure-containment`, `cpt-template-catalogue-nfr-self-contained`, `cpt-template-catalogue-nfr-page-semantics`

**Principles**: `cpt-template-catalogue-principle-host-lists-screens`, `cpt-template-catalogue-principle-page-per-address`, `cpt-template-catalogue-principle-contain-failures`

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-catalogue-actor-visitor` | Opens the index, a component page or a foundation page, searches, and moves between pages |
| `cpt-template-catalogue-actor-host-application` | Loads the entry, mounts the screen in its screen domain inside a shadow root, and supplies the theme and language shared properties |
| `cpt-template-catalogue-actor-crawler` | Reads each page at its canonical address with the title and description the manifest declares for it |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md), components `cpt-template-catalogue-component-screen-manifest`, `cpt-template-catalogue-component-screen-lifecycle`, `cpt-template-catalogue-component-screen-frame`, `cpt-template-catalogue-component-page-registry`, `cpt-template-catalogue-component-layout` and `cpt-template-catalogue-component-pages`; sequence `cpt-template-catalogue-seq-open-component-page`
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.3
- **Contract**: the template's AI guideline `catalogue-contract.md` in `.frontx/ai/@gears-frontx/frontx-template-catalogue/guidelines/`
- **Dependencies**: [Demo File Generation](../catalogue-generation/FEATURE.md) (the stored example files and foundation pages the registry reads); [Cross-Screen Navigation](../cross-screen-navigation/FEATURE.md) (the `show_component` handler the lifecycle registers)

## 2. Actor Flows (CDSL)

**Use cases**: `cpt-template-catalogue-usecase-browse-component`

### Mount the Screen

- [x] `p1` - **ID**: `cpt-template-catalogue-flow-catalogue-screen-mount`

**Actor**: `cpt-template-catalogue-actor-host-application`

**Success Scenarios**:
- The host loads the entry and mounts the screen: the kit's tokens are in the shadow root once, the route tree renders inside the frame, and the `show_component` handler is registered before `mount()` returns, so a chained `show_component` action finds it.
- The host mounts into the same shadow root again: the existing token style node gets the text, no second node is added.

**Error Scenarios**:
- The package app has no MFE registry: rendering fails, naming the missing microfrontends plugin.

**Steps**:
1. [x] - `p1` - When the entry first loads, build the package's own app with effects, the host's shared query cache and microfrontends over the GTS type system - `inst-create-app`
2. [x] - `p1` - When the entry first loads, rewrite the kit's token stylesheet for a shadow root (Anchor the Kit Tokens on the Shadow Host) - `inst-anchor-tokens`
3. [x] - `p1` - **IF** the shadow root already holds the kit's token style node, replace its text - `inst-replace-token-style`
4. [x] - `p1` - **ELSE** append one style node, marked as the kit's tokens, with the rewritten text - `inst-append-token-style`
5. [x] - `p1` - Render the screen frame, the screen's strings and the framework's extension router over the package registry and the catalogue's route tree; **IF** the app has no registry, fail naming the missing plugin - `inst-render-router`
6. [x] - `p1` - Register the `show_component` handler on the bridge before `mount()` returns - `inst-register-handler`
7. [x] - `p1` - **RETURN** the lifecycle as the module's only export, its default - `inst-export-lifecycle`

### Browse the Index

- [x] `p1` - **ID**: `cpt-template-catalogue-flow-catalogue-screen-browse-index`

**Actor**: `cpt-template-catalogue-actor-visitor`

**Success Scenarios**:
- The index lists every component under its family, in the fixed family order, each family with its count; the search narrows the list by name and description.

**Error Scenarios**:
- Nothing matches the search: the page says so.

**Steps**:
1. [x] - `p1` - The visitor opens the catalogue's root address; the router renders the index - `inst-match-index-route`
2. [x] - `p1` - **IF** the screen's strings are still loading, show a placeholder - `inst-wait-for-strings`
3. [x] - `p1` - Keep the components whose name or description contains the screen-wide search, trimmed and lower-cased; an empty search keeps all - `inst-filter-components`
4. [x] - `p1` - Group the kept components by family in the fixed family order and drop the families left empty - `inst-group-families`
5. [x] - `p1` - Render the breadcrumb, the one `h1`, the intro and the search field - `inst-render-index-header`
6. [x] - `p1` - **IF** no family is left, say that nothing matches; **ELSE** render one list card per family with its icon, title, count and a row per component linking its page - `inst-render-families`

### Browse a Component

- [x] `p1` - **ID**: `cpt-template-catalogue-flow-catalogue-screen-browse-component`

**Actor**: `cpt-template-catalogue-actor-visitor`

**Success Scenarios**:
- The component page shows the breadcrumb, the way back to the index, the title with the family, the description, the example working in the Preview tab and its source in the Code tab, then how to install and connect the component for the installed kit version.

**Error Scenarios**:
- The slug names no component: the not-found page is shown.
- The example throws: the page says the example crashed with the error's message; the navigation and every other page keep working.
- The source does not load: the Code tab says so instead of loading forever, and the download link is left out.

**Steps**:
1. [x] - `p1` - The visitor opens `components/<slug>`; the router renders the component page - `inst-match-component-route`
2. [x] - `p1` - Find the registry entry for the slug; **IF** there is none, render the not-found page - `inst-find-component`
3. [x] - `p1` - Load the example's source once for the page (Example Source State Machine) - `inst-load-source`
4. [x] - `p1` - **IF** the screen's strings are still loading, show a placeholder - `inst-wait-for-strings`
5. [x] - `p1` - Render the breadcrumb, the back link, the one `h1` with the family beside it and the description - `inst-render-component-header`
6. [x] - `p1` - In the Preview tab, render the example lazily in the kit's card, behind its own error boundary keyed by the slug and a loading placeholder - `inst-render-preview`
7. [x] - `p1` - **IF** the example throws, show the crash label and the error's message as an alert in place of the example - `inst-contain-crash`
8. [x] - `p1` - In the Code tab, show the source with a copy button, a loading placeholder, or a note that it did not load - `inst-render-code`
9. [x] - `p1` - Render "Use in your app" (the install line for the installed kit version, the note on the theme import, the example file to download once its source is loaded) and "Component contract" (the type definitions link for the installed version) - `inst-render-guide`

### Browse a Foundation

- [x] `p1` - **ID**: `cpt-template-catalogue-flow-catalogue-screen-browse-foundation`

**Actor**: `cpt-template-catalogue-actor-visitor`

**Success Scenarios**:
- The foundation page shows the breadcrumb and the page's `h1`, then the stored foundation page in the kit's card, reading the token values in effect for the host's theme.

**Error Scenarios**:
- The slug names no foundation: the not-found page is shown.
- The foundation page throws: it fails alone behind its boundary.

**Steps**:
1. [x] - `p1` - The visitor opens `foundations/<slug>`; the router renders the foundation page - `inst-match-foundation-route`
2. [x] - `p1` - Find the foundation entry for the slug; **IF** there is none, render the not-found page - `inst-find-foundation`
3. [x] - `p1` - **IF** the screen's strings are still loading, show a placeholder - `inst-wait-for-strings`
4. [x] - `p1` - Render the breadcrumb, the `h1` and the stored foundation page in the kit's card behind its own error boundary keyed by the slug - `inst-render-foundation`

### Move Between Pages

- [x] `p1` - **ID**: `cpt-template-catalogue-flow-catalogue-screen-navigate`

**Actor**: `cpt-template-catalogue-actor-visitor`

**Success Scenarios**:
- On a wide screen, the section bar and the navigation panel mark the current section and page, and the current row is kept in sight by scrolling only the panel.
- On a narrow screen, a page select under the section bar replaces the panel and opens the chosen page.
- Every entry is a real link to the page's address.

**Error Scenarios**:
- A path outside the route tree, or a slug that names no page: the not-found page links back to the index.

**Steps**:
1. [x] - `p1` - Render the section bar (Components, Foundations), each section a link to its first page, marking the current page's section - `inst-mark-section`
2. [x] - `p1` - **IF** the screen is narrower than the breakpoint, render the page select under the section bar; **ELSE** render the navigation panel beside the page - `inst-choose-panel-or-select`
3. [x] - `p1` - In the panel, list All components, the foundations, every component under its family's label in the fixed family order, and the installed kit version - `inst-render-panel`
4. [x] - `p1` - Mark the current page's row; a foundation's row and the section rows take the fill, a component's row takes the current ink while All components keeps the fill - `inst-mark-current-row`
5. [x] - `p1` - When the current row changes, reveal the current row (Reveal the Current Row) - `inst-reveal-current-row`
6. [x] - `p1` - Navigate to the page the visitor picks in the page select - `inst-select-page`
7. [x] - `p1` - Render the page of the current route in a content area that is not a `main` landmark, and the screen's own named toast region - `inst-render-content`
8. [x] - `p1` - **IF** the route matches no page, render the not-found page with its `h1` and a link to the index - `inst-render-not-found`

## 3. Processes / Business Logic (CDSL)

### Build the Page Registry

- [x] `p1` - **ID**: `cpt-template-catalogue-algo-catalogue-screen-page-registry`

**Input**: The stored example files `src/examples/*.tsx` and foundation pages `src/pages/`, as the build tool's import scan sees them.

**Output**: The component entries in slug order, the three foundation entries, the lookups by family and slug, and every page path.

**Steps**:
1. [x] - `p1` - Discover one lazy loader per stored example file through a static glob the build can scan - `inst-glob-examples`
2. [x] - `p1` - Discover one lazy source loader per stored example file through the same glob with the example-source query - `inst-glob-sources`
3. [x] - `p1` - Declare the three foundation entries (semantic colors, typography, layout and elevation) with their paths, label keys, icons and stored pages - `inst-foundation-entries`
4. [x] - `p1` - **FOR EACH** example file, build its entry: the slug from the file name, the path `components/<slug>`, the label key, its row icon or the fallback icon, its family, a lazy component, and a source loader that decodes the source or rejects when there is none; sort the entries by slug - `inst-component-entries`
5. [x] - `p1` - Provide the components of a family and the component or foundation of a slug - `inst-lookups`
6. [x] - `p1` - **RETURN** every page path: the index, the foundations and the components - `inst-all-paths`

### Serve an Example's Source

- [x] `p1` - **ID**: `cpt-template-catalogue-algo-catalogue-screen-example-source`

**Input**: An import of an example file with the example-source query, in the build and in the tests.

**Output**: The example file's text, carried as one base64 string and decoded on the page.

**Steps**:
1. [x] - `p1` - **IF** the import does not carry the example-source query, leave it to the build tool - `inst-match-source-query`
2. [x] - `p1` - Watch the file and **RETURN** a module whose default export is the file's text as base64, which the MFE loader's import scan cannot mistake for an import - `inst-serve-base64`
3. [x] - `p1` - On the page, decode the base64 string back to the UTF-8 text - `inst-decode-source`

### Follow the Host's Theme and Language

- [x] `p1` - **ID**: `cpt-template-catalogue-algo-catalogue-screen-host-theme`

**Input**: The bridge's theme and language shared properties.

**Output**: The frame around every page, with the kit's token scope, the text direction and the bridge for route components.

**Steps**:
1. [x] - `p1` - Read each shared property, with `light` and `en` while the host has broadcast no string value, and follow its changes; a new bridge is read again - `inst-read-property`
2. [x] - `p1` - Map the host theme onto the kit's dark scope when it is one of the host's dark themes, else onto the light scope - `inst-map-theme`
3. [x] - `p1` - Derive the text direction from the language's primary subtag (right-to-left for Arabic, Hebrew, Persian and Urdu) and set it on the shadow host - `inst-set-direction`
4. [x] - `p1` - **RETURN** the frame element carrying the token scope and the direction, providing the bridge to the route components - `inst-render-frame`

### Anchor the Kit Tokens on the Shadow Host

- [x] `p1` - **ID**: `cpt-template-catalogue-algo-catalogue-screen-anchor-tokens`

**Input**: The kit's token stylesheet, minified or not.

**Output**: The same stylesheet with every `:root` selector naming the shadow host.

**Steps**:
1. [x] - `p1` - Strip the comments, so every remaining `:root` is a selector - `inst-strip-comments`
2. [x] - `p1` - Rewrite a bare `:root` to `:host`, and a `:root` with a compound tail of classes, ids, attributes or pseudo-classes to `:host(<tail>)`, leaving a pseudo-element outside - `inst-rewrite-root`

### Load the Screen's Strings

- [x] `p1` - **ID**: `cpt-template-catalogue-algo-catalogue-screen-load-strings`

**Input**: The screen's language modules `src/screens/catalogue/i18n/<language>.json` and the bridge's language property.

**Output**: The translation function and whether the strings are still loading, shared by the whole route tree.

**Steps**:
1. [x] - `p1` - Load the strings once for the whole route tree and give them to every route component - `inst-provide-strings`
2. [x] - `p1` - Take the current language from the bridge (`en` while none) and load it unless it was already loaded from the same modules - `inst-initial-language`
3. [x] - `p1` - Follow the language property and load each new language - `inst-follow-language`
4. [x] - `p1` - Import the language's module; **IF** there is none, warn and import English; **IF** English is missing too, or the import fails, use no strings - `inst-import-module`
5. [x] - `p1` - Number each load and apply only the latest one, and only while the screen is mounted - `inst-apply-latest`
6. [x] - `p1` - **RETURN** a translation function that answers the string, or the key itself, with a warning when it is missing from loaded strings (a key asked for while the strings load gets no warning) - `inst-translate`

### Reveal the Current Row

- [x] `p2` - **ID**: `cpt-template-catalogue-algo-catalogue-screen-reveal-row`

**Input**: The navigation panel, the current row and the viewport's height.

**Output**: The panel's own scroll position changed so the row is in sight; the page itself does not scroll.

**Steps**:
1. [x] - `p2` - Take the visible part of the panel: its box clipped to the viewport - `inst-visible-part`
2. [x] - `p2` - **IF** the row starts above the visible part, scroll the panel up by the difference - `inst-scroll-up`
3. [x] - `p2` - **ELSE IF** the row ends below the visible part, scroll the panel down by the difference, keeping a row taller than the visible part with its top in sight - `inst-scroll-down`

### Draw a Block

- [x] `p1` - **ID**: `cpt-template-catalogue-algo-catalogue-screen-draw-block`

**Input**: A block's content and behaviour props from a composition: texts, items, slots, links, handlers and the current state.

**Output**: The block's part of the page, laid out by the block and drawn by the kit's components and the kit candidates.

**Steps**:
1. [x] - `p1` - Take content and behaviour props only (texts, items, slots, links, handlers, the current state), with no variant, tone, layout or size switch - `inst-take-content-props`
2. [x] - `p1` - Lay the block's slots out with its layout stylesheet on the kit's tokens, leaving out a slot the composition does not fill - `inst-lay-out-slots`
3. [x] - `p1` - Draw headings, text and links with the kit candidates in the kit's type roles, each heading on the element the page's outline needs - `inst-draw-text`
4. [x] - `p1` - Draw controls, surfaces, the trail and the placeholder with the kit's components - `inst-draw-kit-parts`
5. [x] - `p1` - Draw a link on the router's link the composition passes, with the block's props merged over its own, or on a plain anchor - `inst-draw-link`
6. [x] - `p1` - Mark the current page or section the composition names on the link assistive technology reads - `inst-mark-state`

## 4. States (CDSL)

### Example Boundary State Machine

- [x] `p1` - **ID**: `cpt-template-catalogue-state-catalogue-screen-example-boundary`

**States**: Rendering, Failed

**Initial State**: Rendering

**Transitions**:
1. [x] - `p1` - **FROM** Rendering **TO** Failed **WHEN** the example or foundation page inside throws while rendering; the error is kept and logged with its component stack - `inst-enter-failed`

### Example Source State Machine

- [x] `p2` - **ID**: `cpt-template-catalogue-state-catalogue-screen-example-source`

**States**: Loading, Loaded, Failed

**Initial State**: Loading

**Transitions**:
1. [x] - `p2` - **FROM** Loading **TO** Loaded **WHEN** the source resolves while the page is mounted - `inst-source-loaded`
2. [x] - `p2` - **FROM** Loading **TO** Failed **WHEN** the source does not load; the error is logged with the slug - `inst-source-failed`

## 5. Definitions of Done

### Screen Manifest and Lifecycle

- [x] `p1` - **ID**: `cpt-template-catalogue-dod-catalogue-screen-manifest-lifecycle`

The system **MUST** declare the screen in `mfe.json` (the remote, the entry exposing the lifecycle, the theme and language properties it requires, the `show_component` action with its closed schema (target: the catalogue's screen; payload: an enum of the component slugs), the screen extension with token `catalogue`, label "UI Kit", order 30, and one `seo` entry per page), **MUST** inject the kit's tokens into the shadow root once per root, register the `show_component` handler in `mount()`, and **MUST** export the lifecycle as the module's only export.

**Implements**:
- `cpt-template-catalogue-flow-catalogue-screen-mount`
- `cpt-template-catalogue-algo-catalogue-screen-anchor-tokens`

**Constraints**: `cpt-template-catalogue-constraint-shadow-root`, `cpt-template-catalogue-constraint-lifecycle-default-export`

**Touches**:
- API: the screen domain mount, the catalogue's `show_component` action
- DB: none
- Entities: Page metadata

### Page Registry From the Stored Files

- [x] `p1` - **ID**: `cpt-template-catalogue-dod-catalogue-screen-page-registry`

The system **MUST** derive one component page per stored example file through static globs, each with its family, icon, lazy example and lazy source served as base64, **MUST** keep the three foundation pages, and **MUST** pin the kit and the libraries the examples import exactly.

**Implements**:
- `cpt-template-catalogue-algo-catalogue-screen-page-registry`
- `cpt-template-catalogue-algo-catalogue-screen-example-source`

**Constraints**: `cpt-template-catalogue-constraint-loader-scans-imports`, `cpt-template-catalogue-constraint-styling-and-pins`

**Touches**:
- API: `components/<slug>`, `foundations/<slug>`
- DB: none
- Entities: Catalogue entry, Family

### Routes and In-Screen Navigation

- [x] `p1` - **ID**: `cpt-template-catalogue-dod-catalogue-screen-routes-navigation`

The system **MUST** route the index, a component pattern and a foundation pattern with a not-found page for anything else, the declared pages equalling the routed ones, and **MUST** offer the section bar, the navigation panel with the current row kept in sight, and the page select on a narrow screen, every entry a real link, without adding a `main` landmark.

**Implements**:
- `cpt-template-catalogue-flow-catalogue-screen-navigate`
- `cpt-template-catalogue-algo-catalogue-screen-reveal-row`

**Constraints**: `cpt-template-catalogue-constraint-styling-and-pins`

**Touches**:
- API: `/?screen=catalogue`, `route=components/<slug>`, `route=foundations/<slug>`
- DB: none
- Entities: Section, Page metadata

### Pages

- [x] `p1` - **ID**: `cpt-template-catalogue-dod-catalogue-screen-pages`

The system **MUST** render the index (families with counts, search), the component page (Preview, Code, "Use in your app", "Component contract") and the foundation page, each with one `h1` and the breadcrumb, composed from the kit's components, the kit candidates and the package's blocks, with no stylesheet of their own.

**Implements**:
- `cpt-template-catalogue-flow-catalogue-screen-browse-index`
- `cpt-template-catalogue-flow-catalogue-screen-browse-component`
- `cpt-template-catalogue-flow-catalogue-screen-browse-foundation`
- `cpt-template-catalogue-state-catalogue-screen-example-source`

**Constraints**: `cpt-template-catalogue-constraint-styling-and-pins`

**Touches**:
- API: `https://unpkg.com/@gears-frontx/ui-kit@<version>/dist/components/<slug>/<slug>.d.ts` (linked, never fetched)
- DB: none
- Entities: Catalogue entry, Family

### Blocks

- [x] `p1` - **ID**: `cpt-template-catalogue-dod-catalogue-screen-blocks`

The system **MUST** draw the frame and the pages with the package's blocks in `src/blocks/<Block>/` (the frame, the section bar, the navigation panel, the page select, the page frame and header, the index intro, the list card and its grid, the preview and foundation stages, the guide, the icon link, the code sample and the placeholder), each built from the kit's components, the kit candidates and the kit's tokens, with content and behaviour props only and a stylesheet that declares layout; **MUST** keep every other declaration a block needs as a row of `src/blocks/styles-exemptions.json` naming the kit gap it waits for; **MUST NOT** import a stylesheet in a composition other than the kit theme the lifecycle anchors; and **MUST** draw no text under the kit's 12px label size, the index rows' meta label included.

**Implements**:
- `cpt-template-catalogue-algo-catalogue-screen-draw-block`
- `cpt-template-catalogue-flow-catalogue-screen-navigate`
- `cpt-template-catalogue-flow-catalogue-screen-browse-index`
- `cpt-template-catalogue-flow-catalogue-screen-browse-component`

**Constraints**: `cpt-template-catalogue-constraint-styling-and-pins`

**Touches**:
- API: none
- DB: none
- Entities: none

### Host Theme and Language

- [x] `p1` - **ID**: `cpt-template-catalogue-dod-catalogue-screen-host-theme-language`

The system **MUST** render every page in the kit's light or dark scope mapped from the host's theme, with the host language's text direction on the frame and the shadow host, following both while mounted, **MUST** show the screen's strings in the host's language with English as the fallback, and **MUST NOT** offer a theme switch or store a theme.

**Implements**:
- `cpt-template-catalogue-algo-catalogue-screen-host-theme`
- `cpt-template-catalogue-algo-catalogue-screen-load-strings`

**Constraints**: `cpt-template-catalogue-constraint-shadow-root`

**Touches**:
- API: the theme and language shared properties
- DB: none
- Entities: none

### Failure Containment

- [x] `p1` - **ID**: `cpt-template-catalogue-dod-catalogue-screen-failure-containment`

The system **MUST** render each example and foundation page behind its own error boundary, keyed by the page's slug so another page starts fresh, and **MUST** say on the page what failed while the navigation and every other page keep working.

**Implements**:
- `cpt-template-catalogue-state-catalogue-screen-example-boundary`

**Constraints**: `cpt-template-catalogue-constraint-shadow-root`

**Touches**:
- API: none
- DB: none
- Entities: Catalogue entry

## 6. Acceptance Criteria

- [x] Every foundation and component page renders at its own route with one `h1` named like its navigation row and no error boundary reached (`src/pages.test.tsx`, "every catalogue page").
- [x] The route tree holds the index, one page per example file and one per foundation, each path once; an unknown slug and an unknown path render the not-found page (`src/routes.test.tsx`).
- [x] The index lists the families in the panel's order, names each region once, groups by family with a count and filters by search; the section bar and the panel mark the current page (`src/routes.test.tsx`, `src/componentPage.test.tsx`).
- [x] A component page shows the way back, the family, the description, the example, its source and how to use it (`src/componentPage.test.tsx`).
- [x] The section bar has Components and Foundations, the panel lists no other screen of the application, and on a phone the page select opens the chosen page (`src/componentPage.test.tsx`, `src/routes.test.tsx`, `src/blocks/SectionTabs/SectionTabs.test.tsx`).
- [x] Every component has one family and a description, every page a name, and every type definitions link names a file the installed kit ships (`src/catalog.test.ts`).
- [x] The example source survives the MFE loader and non-ASCII text (`src/exampleSource.test.ts`).
- [x] The lifecycle is the theme-aware lifecycle exported as the default, anchors the tokens once however often it mounts, renders the route tree over the package registry, scopes the kit's tokens to the host's theme and follows the language's direction (`src/lifecycle.test.tsx`).
- [x] The manifest declares metadata for exactly the routed pages, titled by their labels, unique, with descriptions of 50 to 160 characters (`src/manifest.test.ts`).
- [x] Every block renders its showcase fixture with its roles and names and no axe violation (`src/blocks/<Block>/<Block>.test.tsx`); the screen's stylesheets live in its blocks, no composition imports one, every block declaration is layout or a ledger row with its kit gap, no ledger row outlives its declaration, and no text is set under 12px (`src/blocks/blocks-policy.test.ts`).
- [x] The theme mapping, the token anchoring and the string loading behave as specified, including a late load never winning and no missing-key warning before the strings load (`src/frame/kitThemeScope.test.ts`, `src/frame/anchorKitThemeOnShadowHost.test.ts`, `src/frame/useScreenTranslations.test.tsx`).
