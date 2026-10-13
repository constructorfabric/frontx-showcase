# PRD - template-site-blocks

<!-- toc -->

- [1. Overview](#1-overview)
  - [1.1 Purpose](#11-purpose)
  - [1.2 Background / Problem Statement](#12-background--problem-statement)
  - [1.3 Goals (Business Outcomes)](#13-goals-business-outcomes)
  - [1.4 Glossary](#14-glossary)
- [2. Actors](#2-actors)
  - [2.1 Human Actors](#21-human-actors)
  - [2.2 System Actors](#22-system-actors)
- [3. Operational Concept & Environment](#3-operational-concept--environment)
  - [3.1 Module-Specific Environment Constraints](#31-module-specific-environment-constraints)
- [4. Scope](#4-scope)
  - [4.1 In Scope](#41-in-scope)
  - [4.2 Out of Scope](#42-out-of-scope)
- [5. Functional Requirements](#5-functional-requirements)
  - [5.1 Blocks](#51-blocks)
  - [5.2 Showcase](#52-showcase)
  - [5.3 Template Portability](#53-template-portability)
- [6. Non-Functional Requirements](#6-non-functional-requirements)
  - [6.1 NFR Inclusions](#61-nfr-inclusions)
  - [6.2 NFR Exclusions](#62-nfr-exclusions)
- [7. Public Library Interfaces](#7-public-library-interfaces)
  - [7.1 Public API Surface](#71-public-api-surface)
  - [7.2 External Integration Contracts](#72-external-integration-contracts)
- [8. Use Cases](#8-use-cases)
- [9. Acceptance Criteria](#9-acceptance-criteria)
- [10. Dependencies](#10-dependencies)
- [11. Assumptions](#11-assumptions)
- [12. Risks](#12-risks)

<!-- /toc -->

## 1. Overview

### 1.1 Purpose

template-site-blocks delivers the blocks of the FrontX site: the section-level compositions its pages are built from, such as a landing-page band, the frame of an inner page, a row of path cards or a guide step. Every block is built only from UI kit components, kit candidates, brand art and tokens; its stylesheet lays out and nothing else; its props carry content and behaviour, never a variant or a layout switch. A page is then configuration over blocks and carries no CSS.

The template also ships a showcase screen that renders every block with sample content on its own route, kept out of the search index, as the place where a block is reviewed and measured against the design.

### 1.2 Background / Problem Statement

The site's pages were composed from a library of about fifty site components with their own type scale, colours and spacing, many of them configured by variant props into several arrangements. The library copied what the kit and the brand already define, drifted from the design, and let a page change its look through a prop instead of through a reviewed block.

The FrontX approach separates three layers: the kit and its candidates for generic parts, the brand for values, and blocks for the arrangements a site draws. Blocks are the tier the kit's own product rules leave to applications (the kit holds no composition above one component). They need one home that every page template of the site can depend on by name, with the rules held by tests.

### 1.3 Goals (Business Outcomes)

- Every arrangement a page of the site draws is one block, built from kit parts, candidates, brand art and tokens, so pages carry no CSS.
- A block's stylesheet declares layout only; every other declaration names the kit gap or defect it waits for.
- Each block has a card, a fixture, a test with an accessibility check, and a measured comparison against its design target at 1440 and 390 pixels.
- Every block can be opened on its own route of the showcase screen.

### 1.4 Glossary

| Term | Definition |
|------|------------|
| Block | A React component of this package that draws one section-level arrangement of the site from kit parts, candidates, brand art and tokens |
| Kit | `@gears-frontx/ui-kit`, the FrontX UI kit |
| Kit candidate | A component of `@gears-frontx/kit-candidates`, delivered by template-kit-candidates until the kit releases it |
| Brand | `@gears-frontx/site-brand`: the site's token values on top of the kit, its typeface and its art, delivered by template-site-brand |
| Layout token | A custom property of this package's layout stylesheet: the page column, the header column and height, section and page rhythms, the section heading row, rail and lead columns |
| Arrangement | One way the design places content in a section; a different arrangement is a different block |
| Fixture | A block's `<Block>.showcase.tsx`: the block rendered with sample content, and its showcase name, group and summary |
| Showcase | The screen of this template that lists the blocks and renders each fixture on its own route |
| Exemptions ledger | `styles-exemptions.json`: every declaration in a block stylesheet that is not layout, with the kit gap or defect it waits for |

## 2. Actors

### 2.1 Human Actors

#### Visitor

**ID**: `cpt-template-site-blocks-actor-visitor`

**Role**: Reads and operates the site's pages built from blocks, with a mouse, a keyboard or assistive technology.
**Needs**: Landmarks and headings in a correct outline, sections that can be reached from an "On this page" rail, content that reads the same at every width.

#### Template Author

**ID**: `cpt-template-site-blocks-actor-template-author`

**Role**: Builds the site's pages from blocks, and adds or changes blocks.
**Needs**: One block per arrangement with content props, a card that says when to use it, a fixture to review it, and rules that a test holds.

### 2.2 System Actors

#### AI Coding Agent

**ID**: `cpt-template-site-blocks-actor-ai-agent`

**Role**: An AI agent working in a project that carries this template; reads the blocks guideline and the block cards before composing a page or changing a block.

## 3. Operational Concept & Environment

### 3.1 Module-Specific Environment Constraints

- The package runs only in a project with template-shell applied: the shell's `src-app/verify_packages/*` workspace root installs, type-checks and tests it, and each consuming screen package's build bundles its source.
- The showcase screen is a screen package of the shell's `src-app/mfe_packages/*` workspace root, built and served like every screen package of template-mfe.
- The shell loads every template package's `src/document.css` into the document; the brand and the layout tokens reach every screen's shadow root from there.

## 4. Scope

### 4.1 In Scope

- The blocks package, one folder per block with the block, its layout stylesheet, its card, its fixture, its test and its entry.
- The layout tokens and their document entry.
- The exemptions ledger of the package.
- The showcase screen: an index of the blocks by group and one route per block.
- One AI guideline with the block rules.

### 4.2 Out of Scope

- Generic parts the kit lacks: they are kit candidates, proposed to the kit.
- Brand values and brand art: they belong to template-site-brand.
- Page content and the outline model that maps entries to blocks: they belong to the page templates.
- The site header and footer: they are shell chrome.
- A logo strip of adopters, until the adopters may be named.

## 5. Functional Requirements

### 5.1 Blocks

#### Built from the kit, candidates, brand art and tokens

- [x] `p1` - **ID**: `cpt-template-site-blocks-fr-kit-built`

Every block **MUST** render only kit components, kit candidates, brand art components and plain structural elements, and **MUST** take every colour, type value, radius and shadow from a kit part, a candidate, brand art or a token.

**Rationale**: The kit and the brand already define the parts and the values; a block that draws its own copies drifts from both.

**Actors**: `cpt-template-site-blocks-actor-template-author`, `cpt-template-site-blocks-actor-visitor`

#### Layout-only stylesheets

- [x] `p1` - **ID**: `cpt-template-site-blocks-fr-layout-only`

A block's stylesheet **MUST** declare layout properties only (display, flex and grid, gaps, sizing, spacing, position, overflow, alignment), with values on tokens, keywords, zero, percentages, fractions or `auto`, and no colour literal; any other declaration **MUST** have a row in the exemptions ledger naming the kit gap or defect it waits for.

**Rationale**: Visual values belong to the kit and the brand; a ledger row makes every exception visible and removable when its gap closes.

**Actors**: `cpt-template-site-blocks-actor-template-author`

#### Content props, one arrangement per block

- [x] `p1` - **ID**: `cpt-template-site-blocks-fr-content-props`

A block's props **MUST** carry content and behaviour only (texts, links, items, slots for art and children, callbacks) and **MUST NOT** switch variants, tones, layouts or sizes; a different arrangement **MUST** be a different block.

**Rationale**: A page that picks a look through a prop is configuration nobody reviews; a block per arrangement keeps every drawn arrangement reviewed and measured.

**Actors**: `cpt-template-site-blocks-actor-template-author`, `cpt-template-site-blocks-actor-ai-agent`

#### A card, a fixture and a test per block

- [x] `p1` - **ID**: `cpt-template-site-blocks-fr-block-card`

Every block **MUST** ship a card (`<Block>.md`: purpose, when to use, the kit parts it uses, states, the design section it reproduces), a fixture with sample content, a test that renders it and checks its landmarks, headings and accessibility, and an entry file.

**Rationale**: Authors and agents choose blocks from their cards and review them from their fixtures.

**Actors**: `cpt-template-site-blocks-actor-template-author`, `cpt-template-site-blocks-actor-ai-agent`

#### Shared layout tokens

- [x] `p1` - **ID**: `cpt-template-site-blocks-fr-layout-tokens`

The template **MUST** declare the page column, the header column, the header height, the section and page rhythms, the section heading row and the rail and lead columns as layout tokens with their breakpoints, in a stylesheet the shell loads into the document.

**Rationale**: Blocks and the shell chrome share one column and one rhythm; layout values are not brand values.

**Actors**: `cpt-template-site-blocks-actor-template-author`, `cpt-template-site-blocks-actor-visitor`

#### Section navigation on guide pages

- [x] `p2` - **ID**: `cpt-template-site-blocks-fr-section-navigation`

The guide page frame **MUST** offer an "On this page" rail that lists the page's sections in order, marks the section in view as current, and on activation moves the view and the keyboard focus to the section's heading.

**Rationale**: Long guides need a way to reach a section and continue from it with the keyboard.

**Actors**: `cpt-template-site-blocks-actor-visitor`

### 5.2 Showcase

#### Every block on its own route

- [x] `p1` - **ID**: `cpt-template-site-blocks-fr-showcase`

The template **MUST** provide a screen that lists every block with a fixture by group, each linking to a route that renders the block's fixture alone under one level-one heading, with every page of the screen kept out of the search index.

**Rationale**: A block is reviewed and measured on its own, with no page around it.

**Actors**: `cpt-template-site-blocks-actor-template-author`, `cpt-template-site-blocks-actor-visitor`

### 5.3 Template Portability

#### Self-contained template

- [x] `p1` - **ID**: `cpt-template-site-blocks-fr-self-contained`

The template **MUST** consist of its package, its showcase screen package and its AI bundle, claim exactly those subtrees, reference nothing outside them except its declared dependencies, and ship a guideline with the block rules.

**Rationale**: The template moves between projects as an overlay, and page templates depend on its package by name.

**Actors**: `cpt-template-site-blocks-actor-template-author`, `cpt-template-site-blocks-actor-ai-agent`

## 6. Non-Functional Requirements

### 6.1 NFR Inclusions

#### Accessible by construction

- [x] `p1` - **ID**: `cpt-template-site-blocks-nfr-accessible`

Every block **MUST** render its fixture with no axe violation of the WCAG A and AA rules in its test, and every page of the showcase **MUST** have exactly one level-one heading.

**Threshold**: zero axe violations per block test; one level-one heading per showcase route.

**Rationale**: A block repeats on many pages; a defect in one repeats everywhere.

#### Design structure at two widths

- [x] `p1` - **ID**: `cpt-template-site-blocks-nfr-v2-structure`

Every block **MUST** be measured on its showcase route against its design target at 1440 and 390 pixels (DOM boxes and computed styles), and every remaining difference **MUST** be classified as coming from a kit part (accepted), from content, or as a recorded defect.

**Threshold**: one measured comparison per block and width; zero unclassified differences.

**Rationale**: The site follows the design without being pixel-perfect; differences from kit parts are accepted, others are not silent.

### 6.2 NFR Exclusions

- Performance budgets: blocks render static markup; the rail listens to scroll and resize with passive listeners.
- Security and privacy: blocks render the content they are given and send nothing.
- Search: the showcase is kept out of the index; the pages that use blocks carry their own metadata.

## 7. Public Library Interfaces

### 7.1 Public API Surface

#### Package exports

- [x] `p1` - **ID**: `cpt-template-site-blocks-interface-package-exports`

**Type**: TypeScript modules, one per block (`@gears-frontx/site-blocks/<Block>`), the showcase module (`@gears-frontx/site-blocks/showcase`) and two stylesheets (`@gears-frontx/site-blocks/document.css`, `@gears-frontx/site-blocks/layout.css`)

**Stability**: experimental

**Description**: Each block and its prop types from its own entry, so a block is added without editing a shared index; the showcase entries; the layout tokens.

**Breaking Change Policy**: package version bump on any change of a block's props.

#### Template overlay

- [x] `p2` - **ID**: `cpt-template-site-blocks-interface-template-overlay`

**Type**: Data format (the template manifest and the subtrees it claims)

**Stability**: experimental

**Description**: The manifest claims the package, the showcase screen package and the AI bundle and no shared file.

**Breaking Change Policy**: template version bump on any change to a claimed subtree.

### 7.2 External Integration Contracts

#### UI kit, kit candidates and brand

- [x] `p1` - **ID**: `cpt-template-site-blocks-contract-kit-and-brand`

**Direction**: required from `@gears-frontx/ui-kit`, `@gears-frontx/kit-candidates` and `@gears-frontx/site-brand`

**Protocol/Format**: kit and candidate components, the kit's token names, the brand's token names and art components

**Compatibility**: pinned to exact versions; the block tests render through the installed packages and fail when a part changes shape.

## 8. Use Cases

#### Build a page from blocks

- [x] `p1` - **ID**: `cpt-template-site-blocks-usecase-build-page`

**Actor**: `cpt-template-site-blocks-actor-template-author`

**Preconditions**:
- The project has template-shell, template-site-brand, template-kit-candidates and this template applied, and the screen package depends on `@gears-frontx/site-blocks`.

**Main Flow**:
1. The author picks the block of each section from the block cards.
2. The page renders the blocks with its content and imports no stylesheet.
3. The page passes its accessibility checks and matches the design at both widths within the accepted kit differences.

**Postconditions**:
- The page holds content and the order of its blocks only.

**Alternative Flows**:
- **No block draws the arrangement**: the author adds a block to this package with its card, fixture, test and measurement, then uses it.

#### Review a block

- [x] `p2` - **ID**: `cpt-template-site-blocks-usecase-review-block`

**Actor**: `cpt-template-site-blocks-actor-template-author`

**Preconditions**:
- The site runs with the showcase screen.

**Main Flow**:
1. The author opens the showcase index and follows a block's link.
2. The block's fixture renders alone on its route.
3. The author measures it against its design target at 1440 and 390 pixels.

**Postconditions**:
- The block's comparison row is current.

**Alternative Flows**:
- **The route names no block**: the screen's not-found page links back to the index.

## 9. Acceptance Criteria

- [ ] Every block's test, axe run included, passes in the composed package.
- [ ] Every block stylesheet passes the layout-only rule, with every exception in the ledger.
- [ ] The showcase lists every block with a fixture and renders each on its own route under one level-one heading.
- [ ] The repository's template shape check accepts the template.

## 10. Dependencies

| Dependency | Description | Criticality |
|------------|-------------|-------------|
| template-shell (applied in the project) with the document-entry convention | Workspace roots, document entry, screen domain | p1 |
| template-mfe (applied in the project) | The screen package shape the showcase follows | p1 |
| `@gears-frontx/ui-kit` `0.4.0` | Kit components and tokens | p1 |
| `@gears-frontx/kit-candidates` `0.1.0-alpha.0` | Heading, Text, Link, VisuallyHidden, the card and title parts with `render`, code and description parts | p1 |
| `@gears-frontx/site-brand` `0.1.0-alpha.0` | Brand tokens and art | p1 |
| `lucide-react` `1.33.0` | Icons in blocks and fixtures | p3 |

## 11. Assumptions

- The kit's and the brand's token names stay stable within a pinned release.
- The shell keeps loading every template package's `src/document.css` and adopting the document's sheets into shadow roots.

## 12. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| A block grows a variant prop | Pages pick looks by configuration again | The guideline forbids it; review checks each block's props against its card |
| The ledger grows instead of the kit | Visual values stay in blocks | Each row names its kit gap or defect, and the upstream proposals carry them |
| A kit release changes a part's size | Measured comparisons drift | Kit differences are accepted and re-measured on each kit upgrade |
