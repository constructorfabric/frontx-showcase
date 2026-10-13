# Feature: Section Blocks

<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [No Feature-Owned Actor Flow](#no-feature-owned-actor-flow)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Section Frame](#section-frame)
  - [Hero](#hero)
  - [Features](#features)
  - [Architecture Map](#architecture-map)
  - [Change Story](#change-story)
  - [Kit Showcase](#kit-showcase)
  - [Metric Comparison](#metric-comparison)
  - [Logo Strip](#logo-strip)
  - [Get Started Steps](#get-started-steps)
  - [Closing Call to Action](#closing-call-to-action)
- [4. States (CDSL)](#4-states-cdsl)
  - [No Feature-Owned State Machine](#no-feature-owned-state-machine)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Section Frame](#section-frame-1)
  - [Hero](#hero-1)
  - [Features](#features-1)
  - [Architecture Map](#architecture-map-1)
  - [Change Story](#change-story-1)
  - [Kit Showcase](#kit-showcase-1)
  - [Metric Comparison](#metric-comparison-1)
  - [Logo Strip](#logo-strip-1)
  - [Get Started Steps](#get-started-steps-1)
  - [Closing Call to Action](#closing-call-to-action-1)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

- [x] `p1` - **ID**: `cpt-template-site-blocks-featstatus-section-blocks`
## 1. Feature Context

- [x] `p1` - `cpt-template-site-blocks-feature-section-blocks`

### 1.1 Overview

The blocks of the landing page. `SectionFrame` is the frame every landing-page section shares: a full-bleed band held to the page column, with the section's label and title at the start, its note, lead and link at the end aligned to the title's last line, and the section's body under them. The sections are built on it or beside it: `Hero` (the opening band with the page title), `Features`, `ArchitectureMap`, `ChangeStory`, `KitShowcase`, `MetricComparison`, `LogoStrip` (the teams that use the product), `GetStartedSteps` and `ClosingCta` (the closing band). Each section sets its own rhythm and heading-row arrangement through the layout tokens on an ancestor of the frame, takes its art through a slot and its links as the elements they render as.

### 1.2 Purpose

Every landing-page section repeats the same band and header; one frame keeps the column, the rhythm and the title size in one place, and the section blocks compose it with their bodies. Each block draws one arrangement of the design's landing page, so the page is an outline of entries over blocks and carries no CSS.

**Requirements**: `cpt-template-site-blocks-fr-kit-built`, `cpt-template-site-blocks-fr-layout-only`, `cpt-template-site-blocks-fr-content-props`, `cpt-template-site-blocks-fr-block-card`, `cpt-template-site-blocks-nfr-accessible`, `cpt-template-site-blocks-nfr-v2-structure`

**Principles**: `cpt-template-site-blocks-principle-one-arrangement-one-block`, `cpt-template-site-blocks-principle-layout-only`, `cpt-template-site-blocks-principle-ramp-overrides`

**Constraints**: `cpt-template-site-blocks-constraint-exact-pins`

**Components**: `cpt-template-site-blocks-component-blocks-package`, `cpt-template-site-blocks-component-layout-tokens`

**Scope**: the `SectionFrame`, `Hero`, `Features`, `ArchitectureMap`, `ChangeStory`, `KitShowcase`, `MetricComparison`, `LogoStrip`, `GetStartedSteps` and `ClosingCta` block folders.

**Out of scope**: the art the sections take through their slots (template-site-brand's art components); the landing page's content, its outline and its sample registry (template-site).

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-site-blocks-actor-visitor` | Reads the section; reaches it as a region named by its title |
| `cpt-template-site-blocks-actor-template-author` | Composes landing-page sections with the frame |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md)
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.2
- **ADRs**: `cpt-template-site-blocks-adr-one-arrangement-one-block`
- **Interface**: `cpt-template-site-blocks-interface-package-surface`
- **Dependencies**: `cpt-template-site-blocks-feature-blocks-showcase`

## 2. Actor Flows (CDSL)

### No Feature-Owned Actor Flow

Not applicable because the landing-page blocks have no interaction of their own: every link is the caller's element, rendered with its destination, and each section is reached as a region named by its title.

## 3. Processes / Business Logic (CDSL)

### Section Frame

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-section-blocks-section-frame`

**Input**: The heading id, the title, an optional label, note, lead and action, and the body

**Output**: A band that is a region named by its title

**Steps**:
1. [x] - `p1` - Render the band as a section labelled by the title's id, its content held to the page column with the block padding of the section rhythm tokens and the arrangement tokens a composing block may set (column and header display, the action's order, the space under the header) - `inst-band`
2. [x] - `p1` - Render the header: the label on the meta role in the brand's label ink and the title as a level-two kit heading on the display role set to the brand's section size, keeping its line breaks - `inst-header`
3. [x] - `p1` - **IF** a note, a lead or an action is given, render the end column with the note on the meta role, the lead on the brand's lead size and the action under it; **ELSE** render no end column - `inst-aside`
4. [x] - `p1` - Render the body under the header - `inst-body`

### Hero

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-section-blocks-hero`

**Input**: The page title, the lead, the actions (label and link element each) and an optional art node

**Output**: The landing page's opening band, a region named by the page's level-one heading

**Steps**:
1. [x] - `p1` - Render the first action as its link element with the kit's large button classes (never the kit `Button` rendered as the link, which announces it as a button), inverted on the band through the kit's button recolour hooks, with an arrow; render every other action as a kit candidate link in the band's ink with an arrow - `inst-actions`
2. [x] - `p1` - Render the band in the brand blue across the full width, its content held to the page column: the title beside an end column of 340 pixels; one column under 900 pixels - `inst-band`
3. [x] - `p1` - Render the title as the page's level-one kit heading on the display role set to the brand's hero size, keeping its line breaks - `inst-title`
4. [x] - `p1` - Render the end column: the lead in the band's ink over the actions - `inst-aside`
5. [x] - `p1` - **IF** art is given, render it in a row across both columns under the text, running off the band's bottom edge; **ELSE** render no art row - `inst-art`

### Features

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-section-blocks-features`

**Input**: The heading id, the title and the features (optional figure, title, text, link label and element each)

**Output**: A section that lists what a product gives

**Steps**:
1. [x] - `p1` - Render the section frame with the title alone, the groundwork rhythm (52 and 56 pixels; 40 and 40 under 640) and the title across the column, 30 pixels over the list - `inst-frame`
2. [x] - `p1` - Render the features as a list three across, 60 pixels apart; under 640 pixels one per row, 22 pixels apart, the figure beside the text - `inst-items`
3. [x] - `p1` - Render each feature's figure in a decorative box of 220 by 176 pixels, 16 pixels over the copy (132 by 106 under 640, 16 pixels beside it) - `inst-figure`
4. [x] - `p1` - Render each feature's copy: a level-three kit heading on the `heading-1` role, the muted text and a kit candidate link with an arrow, 17 pixels under the text (14 under 640) - `inst-copy`

### Architecture Map

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-section-blocks-architecture-map`

**Input**: The heading id, an optional label, the title, an optional lead and the map node

**Output**: A section with the map of a product's parts

**Steps**:
1. [x] - `p1` - Render the block with the architecture rhythm (52 and 64 pixels; 36 and 40 under 640) - `inst-rhythm`
2. [x] - `p1` - Render a kit separator held to the page column above the band - `inst-rule`
3. [x] - `p1` - Render the section frame with the label, the title and the lead, and the map under its header across the column - `inst-map`

### Change Story

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-section-blocks-change-story`

**Input**: The heading id, the title, an optional lead, an optional link (label and element) and the workbench node

**Output**: A section that tells one change as a workbench

**Steps**:
1. [x] - `p1` - **IF** a link is given, render it as a kit candidate link with an arrow - `inst-link`
2. [x] - `p1` - Render a kit separator held to the page column, then the section frame with the change rhythm (48 and 64 pixels; 32 and 40 under 640) and the title alone in its header - `inst-frame`
3. [x] - `p1` - Render the body in reading order, the lead (at most 620 pixels wide, 16 pixels under the title), the link and the workbench drawing across the column, its parts joining the frame's column grid so the stylesheet never reorders them: on a wide screen the link takes the title row's far end and the drawing comes 32 pixels under the lead; under 640 pixels the parts stack, the link 16 pixels under the lead and the drawing 32 pixels under the link; the block paints no surface, so the drawing's light or dark palette follows the page - `inst-workbench`

### Kit Showcase

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-section-blocks-kit-showcase`

**Input**: The heading id, an optional label, the title, an optional lead, an optional link and the groups of tiles (title, link element and live sample each)

**Output**: A section of live, inert kit samples, each tile one link

**Steps**:
1. [x] - `p1` - Render the section frame with the kit rhythm (58 and 64 pixels; 40 and 40 under 640), the header in two equal columns 96 pixels apart, the label, the title, the lead and the link with an arrow - `inst-frame`
2. [x] - `p1` - Render each group as a level-three kit heading on the `heading-1` role over a list of tiles four across (three under 900 pixels, two under 640) - `inst-groups`
3. [x] - `p1` - Render each tile as a kit candidate card: the sample in an inert slot of fixed height (less padding around a table sample, so the kit table fits a phone's tile), a kit separator and the tile's title as a kit candidate link with an arrow whose pseudo-element covers the tile - `inst-tile`
4. [x] - `p1` - Export the layout pieces a sample is built with, so a sample registry needs no stylesheet - `inst-sample-parts`
5. [x] - `p1` - Lay a sample out as a column at most 225 pixels wide, a wrapping row or a row spread to both ends - `inst-sample-layout`
6. [x] - `p1` - Render a sample's caption on the kit candidate meta role, with an optional value at the far end - `inst-sample-caption`
7. [x] - `p1` - Fill a sample with three placeholder lines of decreasing length, and leave out a part when the sample slot is under 152 pixels wide - `inst-sample-fill`

### Metric Comparison

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-section-blocks-metric-comparison`

**Input**: The heading id, the title, an optional lead, an optional note and the metrics (title, unit, statement, benefit, optional chart node, explanation each)

**Output**: A section that compares two ways of working, metric by metric

**Steps**:
1. [x] - `p1` - Render the section frame with the comparison rhythm (70 and 70 pixels; 42 and 42 under 640), the header in two equal columns 96 pixels apart, the title, the note and the lead, and a kit separator across the band's bottom edge - `inst-frame`
2. [x] - `p1` - Render the metrics as a list of kit candidate cards three across (one column under 900 pixels), each a grid of rows 24 pixels apart, four with a chart and three without; the block adds no figure of its own - `inst-cards`
3. [x] - `p1` - Render the card's title row: a level-three kit card title and, **IF** the metric has a unit, the unit at the far end - `inst-card-head`
4. [x] - `p1` - Render the statement row: the statement in the brand blue beside the benefit - `inst-card-statement`
5. [x] - `p1` - **IF** the metric has a chart, render it in a slot 104 pixels high; without one the card has no slot and no row for it - `inst-card-chart`
6. [x] - `p1` - Render the explanation under a kit separator - `inst-card-explanation`

### Logo Strip

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-section-blocks-logo-strip`

**Input**: The heading id, the title and the logos (company name, image address, width and height in pixels, link element each)

**Output**: A section that names the teams using the product, each logo a link to its company

**Steps**:
1. [x] - `p1` - Render the band as a region named by its title, held to the page column with the block padding of the section rhythm tokens: the title as a level-two kit heading on the kit's display role, centred, 32 pixels over the logos - `inst-band`
2. [x] - `p1` - Render the logos as a list of four equal cells in a 908-pixel measure (two columns 32 pixels apart under 640 pixels), each centring its logo - `inst-logos`
3. [x] - `p1` - Render each logo as a kit candidate link holding the logo file as an image whose alternative text is the company's name, at the given width and height (scaled down to fit a narrower cell, keeping its proportions), in the file's own colours: no card, background, filter or recolouring, on hover too, by the designer's instruction; the site shows the light theme, and a dark theme would need light variants of the logos from their owners - `inst-logo`

### Get Started Steps

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-section-blocks-get-started-steps`

**Input**: The heading id, the title, an optional lead, an optional link and the steps (optional figure, title, text, link element each)

**Output**: A section that lists the way in, in order

**Steps**:
1. [x] - `p1` - Render the band as a region named by its title, held to the page column with the steps rhythm (80 and 80 pixels; 40 and 40 under 640), in two equal columns 100 pixels apart centred on each other (one column under 640 pixels) - `inst-band`
2. [x] - `p1` - Render the start column: the title as a level-two kit heading on the display role at the brand's section size, the lead and the link with an arrow - `inst-header`
3. [x] - `p1` - Render the steps as an ordered list of rows, each with an arrow at its end - `inst-steps`
4. [x] - `p1` - Render the step's figure in a decorative box of 128 pixels (104 under 640) - `inst-step-figure`
5. [x] - `p1` - Render the step's copy: a level-three kit heading holding the step's link, whose pseudo-element covers the row, and the muted text - `inst-step-copy`
6. [x] - `p1` - Render a kit separator under every row - `inst-step-rule`

### Closing Call to Action

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-section-blocks-closing-cta`

**Input**: The heading id, the title, the actions (label and link element each) and an optional visual node

**Output**: The landing page's closing band, a region named by its title

**Steps**:
1. [x] - `p1` - Render the first action as its link element with the kit's large button classes (the brand blue; never the kit `Button` rendered as the link, which announces it as a button), with an arrow; render every other action as a kit candidate link in the band's ink with an arrow - `inst-actions`
2. [x] - `p1` - Render the band in the brand's night colour across the full width, its content held to the page column with 52 and 24 pixels of block padding (36 and 24 under 640): the title beside a 340-pixel actions column; one column under 900 pixels - `inst-band`
3. [x] - `p1` - Render the title as a level-two kit heading on the display role at the brand's closing size - `inst-title`
4. [x] - `p1` - **IF** a visual is given, render it across the column under the title row, `clamp(200px, 27vw, 340px)` high; **ELSE** render none - `inst-visual`

## 4. States (CDSL)

### No Feature-Owned State Machine

Not applicable because the frame renders its content on each render and keeps no state.

## 5. Definitions of Done

### Section Frame

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-section-blocks-section-frame`

The system **MUST** export `SectionFrame` (`id`, `title`, `label?`, `note?`, `lead?`, `action?`, `children`) from `@gears-frontx/site-blocks/SectionFrame`: a region named by its level-two title, the header in two columns (one under 640 pixels), the block padding from `--site-section-pad-top` and `--site-section-pad-bottom` so a composing block sets its own rhythm on an ancestor, the arrangement tokens (`--site-column-display`, `--site-header-display`, `--site-aside-display`, `--site-action-order`, `--site-header-space`) with defaults that keep the two-column header, and no colour literal.

**Implements**:
- `cpt-template-site-blocks-algo-section-blocks-section-frame`

**Constraints**: `cpt-template-site-blocks-constraint-exact-pins`

**Touches**:
- Module: `@gears-frontx/site-blocks`
- Entities: Block folder, Fixture, Layout tokens

### Hero

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-section-blocks-hero`

The system **MUST** export `Hero` (`title`, `lead`, `actions`, `art?`) from `@gears-frontx/site-blocks/Hero`: a region named by the page's only level-one heading, the first action a link with the kit's large button look inverted on the band, the others text links, the art row across the column, and no colour literal.

**Implements**:
- `cpt-template-site-blocks-algo-section-blocks-hero`

**Constraints**: `cpt-template-site-blocks-fr-kit-built`, `cpt-template-site-blocks-fr-layout-only`, `cpt-template-site-blocks-fr-content-props`, `cpt-template-site-blocks-nfr-accessible`, `cpt-template-site-blocks-nfr-v2-structure`

**Touches**:
- Module: `@gears-frontx/site-blocks` (`./Hero`)
- Entities: Block folder, Fixture

### Features

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-section-blocks-features`

The system **MUST** export `Features` (`id`, `title`, `items`) from `@gears-frontx/site-blocks/Features`: a section frame whose body is a list of features, each a level-three title, its text and its link, with the figure in a box hidden from assistive technology; the rhythm on the section tokens and no colour literal.

**Implements**:
- `cpt-template-site-blocks-algo-section-blocks-features`

**Constraints**: `cpt-template-site-blocks-fr-kit-built`, `cpt-template-site-blocks-fr-layout-only`, `cpt-template-site-blocks-fr-content-props`, `cpt-template-site-blocks-nfr-accessible`, `cpt-template-site-blocks-nfr-v2-structure`

**Touches**:
- Module: `@gears-frontx/site-blocks` (`./Features`)
- Entities: Block folder, Fixture

### Architecture Map

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-section-blocks-architecture-map`

The system **MUST** export `ArchitectureMap` (`id`, `label?`, `title`, `lead?`, `map`) from `@gears-frontx/site-blocks/ArchitectureMap`: a kit separator above a section frame with the map under its header, the rhythm on the section tokens and no colour literal.

**Implements**:
- `cpt-template-site-blocks-algo-section-blocks-architecture-map`

**Constraints**: `cpt-template-site-blocks-fr-kit-built`, `cpt-template-site-blocks-fr-layout-only`, `cpt-template-site-blocks-fr-content-props`, `cpt-template-site-blocks-nfr-accessible`, `cpt-template-site-blocks-nfr-v2-structure`

**Touches**:
- Module: `@gears-frontx/site-blocks` (`./ArchitectureMap`)
- Entities: Block folder, Fixture

### Change Story

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-section-blocks-change-story`

The system **MUST** export `ChangeStory` (`id`, `title`, `lead?`, `action?`, `workbench`) from `@gears-frontx/site-blocks/ChangeStory`: a kit separator above a section frame whose markup reads the title, the lead, the link and the workbench in that order at every width (on a wide screen the link sits at the title row's end), and no surface or colour of its own, so the drawing's palette follows the page's theme.

**Implements**:
- `cpt-template-site-blocks-algo-section-blocks-change-story`

**Constraints**: `cpt-template-site-blocks-fr-kit-built`, `cpt-template-site-blocks-fr-layout-only`, `cpt-template-site-blocks-fr-content-props`, `cpt-template-site-blocks-nfr-accessible`, `cpt-template-site-blocks-nfr-v2-structure`

**Touches**:
- Module: `@gears-frontx/site-blocks` (`./ChangeStory`)
- Entities: Block folder, Fixture

### Kit Showcase

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-section-blocks-kit-showcase`

The system **MUST** export `KitShowcase` (`id`, `label?`, `title`, `lead?`, `action?`, `groups`) and the sample layout parts (`SampleStack`, `SampleRow`, `SampleSpread`, `SampleCaption`, `SampleLines`, `SampleOptional`) from `@gears-frontx/site-blocks/KitShowcase`: groups with level-three titles over lists of tiles, each tile one link named by its title with its sample inert, and no colour literal.

**Implements**:
- `cpt-template-site-blocks-algo-section-blocks-kit-showcase`

**Constraints**: `cpt-template-site-blocks-fr-kit-built`, `cpt-template-site-blocks-fr-layout-only`, `cpt-template-site-blocks-fr-content-props`, `cpt-template-site-blocks-nfr-accessible`, `cpt-template-site-blocks-nfr-v2-structure`

**Touches**:
- Module: `@gears-frontx/site-blocks` (`./KitShowcase`)
- Entities: Block folder, Fixture

### Metric Comparison

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-section-blocks-metric-comparison`

The system **MUST** export `MetricComparison` (`id`, `title`, `lead?`, `note?`, `metrics`) from `@gears-frontx/site-blocks/MetricComparison`: a section frame whose body is a list of kit cards, each with a level-three title, an optional unit, statement, benefit, an optional chart slot and explanation, carrying no figure of its own and no colour literal; a metric without a chart reserves no space for one.

**Implements**:
- `cpt-template-site-blocks-algo-section-blocks-metric-comparison`

**Constraints**: `cpt-template-site-blocks-fr-kit-built`, `cpt-template-site-blocks-fr-layout-only`, `cpt-template-site-blocks-fr-content-props`, `cpt-template-site-blocks-nfr-accessible`, `cpt-template-site-blocks-nfr-v2-structure`

**Touches**:
- Module: `@gears-frontx/site-blocks` (`./MetricComparison`)
- Entities: Block folder, Fixture

### Logo Strip

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-section-blocks-logo-strip`

The system **MUST** export `LogoStrip` (`id`, `title`, `logos`) from `@gears-frontx/site-blocks/LogoStrip`: a region named by its level-two title with a list of logos, each one link named by its company through the logo image's alternative text, the logo shown in its file's own colours, the block padding on the section tokens and no colour literal.

**Implements**:
- `cpt-template-site-blocks-algo-section-blocks-logo-strip`

**Constraints**: `cpt-template-site-blocks-fr-kit-built`, `cpt-template-site-blocks-fr-layout-only`, `cpt-template-site-blocks-fr-content-props`, `cpt-template-site-blocks-nfr-accessible`, `cpt-template-site-blocks-nfr-v2-structure`

**Touches**:
- Module: `@gears-frontx/site-blocks` (`./LogoStrip`)
- Entities: Block folder, Fixture

### Get Started Steps

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-section-blocks-get-started-steps`

The system **MUST** export `GetStartedSteps` (`id`, `title`, `lead?`, `action?`, `steps`) from `@gears-frontx/site-blocks/GetStartedSteps`: a region named by its level-two title with an ordered list of steps, each one link named by its title inside a level-three heading, the figure hidden from assistive technology, the rhythm on the section tokens and no colour literal.

**Implements**:
- `cpt-template-site-blocks-algo-section-blocks-get-started-steps`

**Constraints**: `cpt-template-site-blocks-fr-kit-built`, `cpt-template-site-blocks-fr-layout-only`, `cpt-template-site-blocks-fr-content-props`, `cpt-template-site-blocks-nfr-accessible`, `cpt-template-site-blocks-nfr-v2-structure`

**Touches**:
- Module: `@gears-frontx/site-blocks` (`./GetStartedSteps`)
- Entities: Block folder, Fixture

### Closing Call to Action

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-section-blocks-closing-cta`

The system **MUST** export `ClosingCta` (`id`, `title`, `actions`, `visual?`) from `@gears-frontx/site-blocks/ClosingCta`: a region named by its level-two title on the brand's night colour, the first action a link with the kit's large button look, the others text links, the visual across the column, and no colour literal.

**Implements**:
- `cpt-template-site-blocks-algo-section-blocks-closing-cta`

**Constraints**: `cpt-template-site-blocks-fr-kit-built`, `cpt-template-site-blocks-fr-layout-only`, `cpt-template-site-blocks-fr-content-props`, `cpt-template-site-blocks-nfr-accessible`, `cpt-template-site-blocks-nfr-v2-structure`

**Touches**:
- Module: `@gears-frontx/site-blocks` (`./ClosingCta`)
- Entities: Block folder, Fixture

## 6. Acceptance Criteria

- [x] The frame is a region named by its level-two title, and the title's id is the given id.
- [x] The label, note, lead and action render when given; without note, lead and action the header has no end column.
- [x] The block padding comes from the section rhythm tokens and the stylesheet has no colour literal.
- [x] The frame takes its header's columns from the heading-row tokens.
- [x] The fixture passes axe with the WCAG A and AA rules.
- [x] `Hero` is a region named by its level-one heading; its first action is a link with the kit's button classes and its destination, the others are plain links, and no action is announced as a button; the art renders only when given.
- [x] `Features` renders one list item per feature with a level-three title, its text and its link; the figure box is hidden from assistive technology and absent content leaves no figure.
- [x] `ArchitectureMap` and `ChangeStory` open with a separator above the band and render the map or the workbench under the header; `ChangeStory` puts the lead, the link and the workbench after the title in that markup order and declares no surface or colour.
- [x] `KitShowcase` renders a level-three title and a list per group; each tile holds exactly one link named by its title, and its sample sits in an inert slot; the sample parts lay a sample out without the caller's CSS.
- [x] `MetricComparison` renders the note, the lead and one card per metric with a level-three title, statement, benefit, chart and explanation, leaves out the chart slot and the unit where a metric has none, and adds no figure of its own.
- [x] `LogoStrip` renders a region named by its level-two title with one list item per logo; each logo is one link to its company, named by the logo's alternative text, showing the logo file at its size with no paint of the block's own.
- [x] `GetStartedSteps` renders a region named by its level-two title with an ordered list; each step is one link named by its title inside a level-three heading, with a decorative figure.
- [x] `ClosingCta` is a region named by its level-two title on the night colour token; its first action has the kit's button classes, the others do not, and no action is announced as a button.
- [x] Every landing-page block's fixture is full-bleed, passes axe with the WCAG A and AA rules (colour contrast included in the browser, light and dark), and its stylesheet declares no colour literal.
- [x] Every landing-page block's fixture, measured at 1440 and 390 against the designer site's home, keeps the section's arrangement (columns, gaps, figure and art slots, paddings); the remaining differences come from kit components (type ramp, button height and text size, card text) or content.

**Test scenarios** (Vitest, in the package):
- `src/blocks/SectionFrame/SectionFrame.test.tsx`: region and heading, optional parts, token rules, fixture meta, axe.
- `src/blocks/Hero/Hero.test.tsx`: region and level-one heading, button link and text links with their destinations, every action announced as a link and none as a button, art slot present and absent, no colour literal, fixture meta, axe.
- `src/blocks/Features/Features.test.tsx`: region, list items with title, text and link, decorative figure, rhythm token, fixture meta, axe.
- `src/blocks/ArchitectureMap/ArchitectureMap.test.tsx`: region with label, lead and map, separator, rhythm token, fixture meta, axe.
- `src/blocks/ChangeStory/ChangeStory.test.tsx`: region with lead, link and workbench in that markup order, no surface or colour, separator and rhythm token, fixture meta, axe.
- `src/blocks/KitShowcase/KitShowcase.test.tsx`: groups and lists, one link per tile with the sample inert, sample parts, rhythm token, fixture meta, axe.
- `src/blocks/MetricComparison/MetricComparison.test.tsx`: region, note and cards, no chart slot or unit where a metric has none, no figures of its own, rhythm token, fixture meta, axe.
- `src/blocks/LogoStrip/LogoStrip.test.tsx`: region and list, one link per logo named by the company, image source and size from the props, no paint and no colour literal, fixture meta, axe.
- `src/blocks/GetStartedSteps/GetStartedSteps.test.tsx`: region and ordered list, one link per step in a level-three heading, decorative figure, rhythm token, fixture meta, axe.
- `src/blocks/ClosingCta/ClosingCta.test.tsx`: region, button link and text link, every action announced as a link and none as a button, visual, night token and no colour literal, fixture meta, axe.
