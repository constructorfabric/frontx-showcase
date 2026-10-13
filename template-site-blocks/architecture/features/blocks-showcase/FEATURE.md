# Feature: Blocks Showcase

<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Open the Showcase](#open-the-showcase)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Collect the Fixtures](#collect-the-fixtures)
- [4. States (CDSL)](#4-states-cdsl)
  - [No Feature-Owned State Machine](#no-feature-owned-state-machine)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Showcase Screen](#showcase-screen)
  - [Fixtures and Packaging](#fixtures-and-packaging)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

- [x] `p1` - **ID**: `cpt-template-site-blocks-featstatus-blocks-showcase`
## 1. Feature Context

- [x] `p1` - `cpt-template-site-blocks-feature-blocks-showcase`

### 1.1 Overview

The showcase of the blocks: the package's collector that reads every block's fixture, and the `blocks` screen that lists the blocks by group and renders each fixture on its own route, kept out of the search index. Also the template's packaging: the manifest, the package entries, the layout tokens and their document entry, the exemptions ledger and the AI bundle.

### 1.2 Purpose

A block is reviewed and measured alone; the showcase gives each one an address without a registry file to keep in step.

**Requirements**: `cpt-template-site-blocks-fr-showcase`, `cpt-template-site-blocks-fr-block-card`, `cpt-template-site-blocks-fr-layout-tokens`, `cpt-template-site-blocks-fr-self-contained`, `cpt-template-site-blocks-nfr-accessible`

**Principles**: `cpt-template-site-blocks-principle-one-arrangement-one-block`

**Constraints**: `cpt-template-site-blocks-constraint-host-prerequisites`, `cpt-template-site-blocks-constraint-exact-pins`

**Components**: `cpt-template-site-blocks-component-showcase-screen`, `cpt-template-site-blocks-component-layout-tokens`, `cpt-template-site-blocks-component-exemptions-ledger`, `cpt-template-site-blocks-component-template-packaging`

**Scope**: `src/showcase.ts`, `src/layout.css`, `src/document.css`, `styles-exemptions.json` and `package.json` of the blocks package; the `site-blocks-mfe` screen package; the manifest and the AI bundle.

**Out of scope**: the blocks themselves and their fixtures' content.

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-site-blocks-actor-template-author` | Opens a block on its route to review and measure it |
| `cpt-template-site-blocks-actor-visitor` | Reaches the showcase from the menu |
| `cpt-template-site-blocks-actor-ai-agent` | Reads the guideline before composing pages or changing blocks |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md)
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.1
- **ADRs**: `cpt-template-site-blocks-adr-named-workspace-package`
- **Interface**: `cpt-template-site-blocks-interface-package-surface`
- **Sequences**: `cpt-template-site-blocks-seq-open-showcase`

## 2. Actor Flows (CDSL)

**Use cases**: `cpt-template-site-blocks-usecase-review-block`

### Open the Showcase

- [x] `p1` - **ID**: `cpt-template-site-blocks-flow-blocks-showcase-open`

**Actor**: `cpt-template-site-blocks-actor-template-author`

**Success Scenarios**:
- The author opens `/?screen=blocks` and sees every block with a fixture, by group; following a link opens `/?screen=blocks;route=<block>` with the block's fixture alone: a full-bleed band edge to edge, any other block in the page column under its name and summary.

**Error Scenarios**:
- The route names no block, or the path has more segments: the screen's not-found page links back to the index.
- The app was built without the microfrontends plugin: rendering fails loudly.

**Steps**:
1. [x] - `p1` - Build the package's own app with the effects, the shared query cache and the microfrontends plugin - `inst-build-app`
2. [x] - `p1` - On every mount, put the kit's tokens, re-anchored on the shadow host, into one style node of the shadow root - `inst-kit-tokens`
3. [x] - `p1` - Render the frame with the shell's theme scope and text direction on the frame and on the shadow host, and the bridge for route components - `inst-frame`
4. [x] - `p1` - Render the route tree through the framework's router over the package's registry; **IF** the registry is missing, fail loudly - `inst-render-router`
5. [x] - `p1` - Route `/` to the index, `/$block` to one block, anything else to the not-found page - `inst-route-tree`
6. [x] - `p1` - Wait for the screen's strings before rendering the index or the not-found page - `inst-wait-strings`
7. [x] - `p1` - Render the index in the docs frame: per group with entries, a section heading and a list of outline items, each linking to the block's route with its summary - `inst-render-index`
8. [x] - `p1` - Find the entry the route's slug names - `inst-find-block`
9. [x] - `p1` - **IF** an entry is found: a page frame renders as it is, with its own title; a full-bleed block renders edge to edge under a visually hidden level-one heading with the block's title; any other block renders inside the page column of the docs frame, under the block's title and summary as the page intro; **ELSE** render the not-found page - `inst-render-block`
10. [x] - `p1` - Render the not-found page in the docs frame with a link back to the index - `inst-render-not-found`

## 3. Processes / Business Logic (CDSL)

### Collect the Fixtures

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-blocks-showcase-collect`

**Input**: The fixture modules of the package, keyed by path

**Output**: The showcase entries, sorted

**Steps**:
1. [x] - `p1` - Read every `src/blocks/*/*.showcase.tsx` module eagerly through one glob - `inst-glob`
2. [x] - `p1` - Turn each module into an entry with the block folder's slug, its meta and its fixture component; **IF** a module has no fixture component or no meta, fail loudly - `inst-read-modules`
3. [x] - `p1` - Make the slug from the folder name in kebab case - `inst-slug`
4. [x] - `p1` - Sort the entries by group (landing page, then inner pages) and by title - `inst-sort`

## 4. States (CDSL)

### No Feature-Owned State Machine

Not applicable because the screen holds no state beyond the route the framework's router keeps and the loaded strings.

## 5. Definitions of Done

### Showcase Screen

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-blocks-showcase-screen`

The system **MUST** ship the `site-blocks-mfe` screen package: route token `blocks`, menu entry "Blocks" at order 31 beside the UI kit, every page not indexed with metadata for `/` and `/$block`, the index of blocks by group, one fixture per route under exactly one level-one heading (a block that is not full-bleed inside the page column), the not-found page for any other path, the kit's tokens in the shadow root and a frame with no stylesheet.

**Implements**:
- `cpt-template-site-blocks-flow-blocks-showcase-open`

**Constraints**: `cpt-template-site-blocks-constraint-host-prerequisites`, `cpt-template-site-blocks-constraint-exact-pins`

**Touches**:
- Module: `@gears-frontx/site-blocks-mfe`
- Entities: Showcase entry

### Fixtures and Packaging

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-blocks-showcase-fixtures`

The system **MUST** export the showcase entries from `@gears-frontx/site-blocks/showcase`, collected from every block's fixture with no registry file; export each block from its own entry and the layout tokens from `@gears-frontx/site-blocks/document.css` and `layout.css`; keep the exemptions ledger at the package root; and ship the manifest claiming the package, the screen package and the AI bundle with the blocks guideline.

**Implements**:
- `cpt-template-site-blocks-algo-blocks-showcase-collect`

**Constraints**: `cpt-template-site-blocks-constraint-exact-pins`

**Touches**:
- Module: `@gears-frontx/site-blocks`
- Entities: Fixture, Showcase entry, Layout tokens, Exemptions ledger, Template manifest, AI bundle

## 6. Acceptance Criteria

- [x] The collector turns block folder names into kebab-case slugs, sorts entries by group then title, and fails on a module that is not a fixture.
- [x] The package's entries include every block folder with a fixture, each slug once.
- [x] No block or fixture source holds a string that reads as a relative import, which the FrontX MFE loader would fetch as a module.
- [x] The index lists every entry by group, each linking to `/<slug>`.
- [x] A block route renders one level-one heading: the hidden title for a full-bleed block, the visible title in the page column for any other block, the frame's own title for a page frame.
- [x] An unknown block and a deeper path render the not-found page with a link to `/`.
- [x] The manifest keeps every page out of the index, describes each in 50 to 160 characters, and declares the shared dependencies the template-mfe way.

**Test scenarios** (Vitest):
- `site-blocks/src/showcase.test.ts`: slugs, sorting, a broken module, the package's entries, no relative-import text in bundled block source.
- `site-blocks-mfe/src/routes.test.tsx`: lookup, index, block routes (page frame, full-bleed block, block in the page column), heading order, not-found.
- `site-blocks-mfe/src/manifest.test.ts`, `site-blocks-mfe/src/lifecycle.test.tsx` and the helper tests under `site-blocks-mfe/src/shared/`.
