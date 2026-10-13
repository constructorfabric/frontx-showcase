# Feature: Brand Art


<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [No Actor Flow of Its Own](#no-actor-flow-of-its-own)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Draw a Hairline Figure](#draw-a-hairline-figure)
  - [Draw a Template Figure](#draw-a-template-figure)
  - [Draw the Application Slab](#draw-the-application-slab)
  - [Draw the Architecture Figure](#draw-the-architecture-figure)
  - [Draw the Workbench](#draw-the-workbench)
  - [Draw the Chart Art](#draw-the-chart-art)
- [4. States (CDSL)](#4-states-cdsl)
  - [No Feature-Owned State Machine](#no-feature-owned-state-machine)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Art Components](#art-components)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

- [x] `p1` - **ID**: `cpt-template-site-brand-featstatus-brand-art`
## 1. Feature Context

- [x] `p1` - `cpt-template-site-brand-feature-brand-art`

### 1.1 Overview

The brand's drawings as React components under `src/art/`, one entry each (`@gears-frontx/site-brand/art/<Name>`): `HairlineFigure` (the line-art family with the stocks `hub`, `riffle`, `turntable`, `rebuild`, `loupe` and `rest`), `TemplateFigure`, `HeroArt` and `ClosingVisual` (both drawing the application slab), `ArchitectureFigure`, `WorkbenchFigure`, `ChartThumb` and `MetricBars`. Each declares its palette at the top of its stylesheet and draws with no outer layout of its own; blocks take them through their content slots.

### 1.2 Purpose

Blocks stay layout-only and content-only: every picture with its own colours, shapes and motion lives here, drawn by the site with the structure of the design reference's figures, never with its assets or script.

**Requirements**: `cpt-template-site-brand-fr-brand-art`, `cpt-template-site-brand-nfr-art-accessibility`

**Principles**: `cpt-template-site-brand-principle-kit-first`

**Constraints**: `cpt-template-site-brand-constraint-exact-pins`

**Components**: `cpt-template-site-brand-component-brand-art`

**Scope**: `src/art/*.tsx`, `src/art/iso.ts`, `src/art/*.module.css`, the `./art/*` export, `tsconfig.art.json` and the art lane of `vitest.config.ts`.

**Out of scope**: where a block puts a drawing and how large its slot is (the site's blocks); brand tokens (the brand record); head assets.

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-site-brand-actor-visitor` | Sees the drawings; reads the map's links and the workbench's text |
| `cpt-template-site-brand-actor-site-developer` | Changes a drawing or its palette in one file |
| `cpt-template-site-brand-actor-ui-kit` | Supplies the chart container the chart art draws in, and the tokens the art reads |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md)
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.3
- **ADRs**: `cpt-template-site-brand-adr-art-palettes-in-art`
- **Dependencies**: `cpt-template-site-brand-feature-brand-source-and-generation`

## 2. Actor Flows (CDSL)

### No Actor Flow of Its Own

Not applicable. The art is rendered by the blocks and screens that place it; it has no interaction beyond the links the architecture figure carries and the hover motion of the figures.

## 3. Processes / Business Logic (CDSL)

### Draw a Hairline Figure

- [x] `p1` - **ID**: `cpt-template-site-brand-algo-brand-art-hairline-figure`

**Input**: A stock and an optional label

**Output**: An SVG of 400 by 320 that fills its slot's width

**Steps**:
1. [x] - `p1` - Project a grid point (x and y on the floor, z up) onto the 400 by 320 drawing with one isometric projection, and build the path data of planes, boxes, rings, cylinders and segments from it - `inst-projection`
2. [x] - `p1` - Draw a box with its two visible sides on the low colour and its top on the plate colour, a cylinder the same way and a line in a palette tone, all outlined with a stroke that keeps its width at every size - `inst-shapes`
3. [x] - `p1` - **IF** the stock is `hub`, draw a floor grid, eight tiles wired to a host tile in the middle with dashed lines, the tiles and the host lifting on hover - `inst-hub`
4. [x] - `p1` - **IF** the stock is `riffle`, draw a tray holding eight upright tabbed cards from the back to the front, the front card ruled and in the accent, the cards lifting in turn on hover - `inst-riffle`
5. [x] - `p1` - **IF** the stock is `turntable`, draw a dial with a ticked rim and an inner ring carrying stacked blocks and a column - `inst-turntable`
6. [x] - `p1` - **IF** the stock is `rebuild`, draw a tree of tiles: one in the accent at the top, two below it, five along the bottom lifting in turn on hover - `inst-rebuild`
7. [x] - `p1` - **IF** the stock is `loupe`, draw a ruled sheet with a lens on a stem over it and the lens's shadow on the sheet - `inst-loupe`
8. [x] - `p1` - **IF** the stock is `rest`, draw three plates stacked on posts, the top one in the accent, the upper plates parting on hover - `inst-rest`
9. [x] - `p1` - **IF** a label is given, name the drawing as an image with it; **ELSE** hide it from assistive technology - `inst-name`

### Draw a Template Figure

- [x] `p2` - **ID**: `cpt-template-site-brand-algo-brand-art-template-figure`

**Input**: A template role (`shell`, `screens`, `guardrails`) and an optional label

**Output**: The hairline figure of the role

**Steps**:
1. [x] - `p2` - Map the role to its stock (shell to `hub`, screens to `riffle`, guardrails to `loupe`) and draw that figure with the label - `inst-role-stock`

### Draw the Application Slab

- [x] `p1` - **ID**: `cpt-template-site-brand-algo-brand-art-slab`

**Input**: An optional label

**Output**: The slab in the hero's window or in the closing frame

**Steps**:
1. [x] - `p1` - Name the slab's gradients with ids unique to the drawing, and name the drawing as an image only when a label is given - `inst-slab-ids`
2. [x] - `p1` - Draw the chassis (edge, clay slab, well, divider) and the navigation rail (title bar, the raised indigo entry, four rows) on 1200 by 540 - `inst-slab-frame`
3. [x] - `p1` - Draw the cards: the search bar, the raised module with its tile, bars and pill over a lilac glow, the side cards and the content rows; each part arrives in turn unless the visitor asked for reduced motion - `inst-slab-cards`
4. [x] - `p1` - For the hero, show the slab tilted from above in a window of fixed height that crops its top and fades its bottom into the band colour, over a soft aura, as a light island - `inst-hero-window`
5. [x] - `p1` - For the closing visual, stand the slab at the bottom of a wide frame, tilted back a little under a soft light, the frame 164px high on a phone and 340px on a wide screen unless the slot sets a height, as a light island - `inst-closing-frame`

### Draw the Architecture Figure

- [x] `p1` - **ID**: `cpt-template-site-brand-algo-brand-art-architecture-figure`

**Input**: A label, the kit and rules sources, the shell with its templates link, two screens and the wire labels

**Output**: A named figure with six links

**Steps**:
1. [x] - `p1` - Render a figure named by the label as a light island over a canvas of fixed proportions (1120 by 480, a phone's 360 by 630) - `inst-named-figure`
2. [x] - `p1` - Place the shell with its title link and its templates link along its bottom edge - `inst-shell`
3. [x] - `p1` - Draw the wires for both canvases, hidden from assistive technology: the kit's wire forking to both screens and the rules' wire into the shell - `inst-wires`
4. [x] - `p1` - Place the kit and the rules as blocks whose title is the block's one link covering the block, under a plain note - `inst-source-blocks`
5. [x] - `p1` - Place the two screens inside the shell as whole-block links; a screen's hint extends its link's name after its visible title - `inst-screens`

### Draw the Workbench

- [x] `p1` - **ID**: `cpt-template-site-brand-algo-brand-art-workbench-figure`

**Input**: A task, a diff (path, removed line, added line) and a result (label, navigation label, title, text)

**Output**: The workbench, its surfaces and texts from its light or dark palette

**Steps**:
1. [x] - `p1` - Draw the workbench's line icons in the text colour: a branch, a file, a window - `inst-icons`
2. [x] - `p1` - Show the task on a tinted bar across the top, with a branch icon - `inst-task`
3. [x] - `p1` - Show the diff panel under its file path: the removed line, then the added line marked - `inst-diff`
4. [x] - `p1` - Show the preview panel under its label: a small window with a rail holding the navigation label and a screen with the title, the text and two placeholder lines - `inst-preview`

### Draw the Chart Art

- [x] `p2` - **ID**: `cpt-template-site-brand-algo-brand-art-chart-art`

**Input**: A thumbnail name (`area`, `bar`, `distribution`, `trends`) with an optional centre label or caption; or a list of metric bars

**Output**: A chart in the kit's chart container at a fixed height, the full width of its slot

**Steps**:
1. [x] - `p2` - Use one fixed synthetic series of eight points on a 0 to 80 scale and a three-part distribution - `inst-series`
2. [x] - `p2` - The area thumbnail: both series as flat filled lines - `inst-area`
3. [x] - `p2` - The bar thumbnail: both series as pairs of bars at most 12px wide, rounded on top - `inst-bar`
4. [x] - `p2` - The distribution thumbnail: the three parts as a donut, with the centre label in its hole when given - `inst-distribution`
5. [x] - `p2` - The trends thumbnail: one smooth filled line under its caption when given - `inst-trends`
6. [x] - `p2` - Draw the named thumbnail with no axes, labels or tooltips - `inst-thumb`
7. [x] - `p2` - Draw each metric bar's label right-aligned and centred on its bar, a newline breaking it - `inst-bar-label`
8. [x] - `p2` - Draw the metric bars horizontally by their share of the full width, the reference bar in purple and the featured bar in the brand blue, with no figure on them - `inst-bars`

## 4. States (CDSL)

### No Feature-Owned State Machine

Not applicable. The art keeps no state; the slab's arrival and the figures' lift are CSS motion.

## 5. Definitions of Done

### Art Components

- [x] `p1` - **ID**: `cpt-template-site-brand-dod-brand-art-figures`

The system **MUST** provide the art components under `@gears-frontx/site-brand/art/<Name>`, each filling its slot with no outer layout, hidden from assistive technology unless it is given a name (the architecture figure always named, its blocks real links), drawing every colour from the palette at the top of its stylesheet or from a token, and switching every palette colour in the dark appearance where the drawing follows the page's theme.

**Implements**:
- `cpt-template-site-brand-algo-brand-art-hairline-figure`
- `cpt-template-site-brand-algo-brand-art-template-figure`
- `cpt-template-site-brand-algo-brand-art-slab`
- `cpt-template-site-brand-algo-brand-art-architecture-figure`
- `cpt-template-site-brand-algo-brand-art-workbench-figure`
- `cpt-template-site-brand-algo-brand-art-chart-art`

**Constraints**: `cpt-template-site-brand-constraint-exact-pins`

**Touches**:
- Files: `src/art/`, `package.json`, `tsconfig.art.json`, `vitest.config.ts`
- Entities: Art palette

## 6. Acceptance Criteria

- [x] Every stock of the hairline family, the template figures, the hero art, the closing visual, the architecture figure, the workbench and the chart art render without error and pass axe (WCAG A and AA, contrast left to the browser).
- [x] An unlabelled drawing is hidden from assistive technology; a labelled one is an image with that name; the architecture figure is a named figure with six links.
- [x] No art stylesheet has a colour literal outside the palettes at its top, every later palette switches every colour of the first, and no art script writes a colour literal.
- [x] At 1440 and 390 pixels wide the drawings take the design reference's boxes in a slot of the reference's size: hairline figure 220 by 176 and 132 by 106, hero art 1304 by 403 and 350 by 168, map 1304 by 559 and 350 by 613, closing visual 1304 by 340 and 350 by 164.

**Test scenarios** (Vitest, in the package's art lane, jsdom):
- `src/art/HairlineFigure.test.tsx`: each stock on its grid, hidden or named, no NaN in path data, axe; the template roles' stocks.
- `src/art/SlabArt.test.tsx`: hero art and closing visual as light islands, their six slab parts, hidden or named, unique gradient ids, axe.
- `src/art/ArchitectureFigure.test.tsx`: the named figure, its six links with text and destination, the screen hint in the link's name, the wires hidden, axe.
- `src/art/WorkbenchFigure.test.tsx`: task, diff and preview texts, icons hidden, axe in light and dark.
- `src/art/ChartArt.test.tsx`: each thumbnail in the kit container, centre and caption, metric bars without figures, axe.
- `src/art/palettes.test.ts` (check lane, Node): the palette rule over every art stylesheet and script, and its negative fixtures.
