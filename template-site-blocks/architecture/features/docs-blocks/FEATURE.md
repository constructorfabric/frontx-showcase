# Feature: Docs Blocks

<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Jump to a Section](#jump-to-a-section)
  - [Open an Agent Task](#open-an-agent-task)
  - [Browse a Template's Key Files](#browse-a-templates-key-files)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Page Intro](#page-intro)
  - [Docs Frame](#docs-frame)
  - [Docs Frame with Rail](#docs-frame-with-rail)
  - [Current Section of the Rail](#current-section-of-the-rail)
  - [Template Detail Frame](#template-detail-frame)
  - [Section Heading](#section-heading)
  - [Guide Closing Heading](#guide-closing-heading)
  - [Path Cards](#path-cards)
  - [Start Paths](#start-paths)
  - [Template Pair](#template-pair)
  - [Template Row](#template-row)
  - [Card Tiles](#card-tiles)
  - [Panels](#panels)
  - [CTA Box](#cta-box)
  - [CTA Rule](#cta-rule)
  - [Action Row](#action-row)
  - [Facts](#facts)
  - [Package List](#package-list)
  - [Guide Step](#guide-step)
  - [Guide Step, Unnumbered](#guide-step-unnumbered)
  - [Troubleshooting](#troubleshooting)
- [4. States (CDSL)](#4-states-cdsl)
  - [No Feature-Owned State Machine](#no-feature-owned-state-machine)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Page Intro](#page-intro-1)
  - [Docs Frame](#docs-frame-1)
  - [Docs Frame with Rail](#docs-frame-with-rail-1)
  - [Template Detail Frame](#template-detail-frame-1)
  - [Section Heading](#section-heading-1)
  - [Guide Closing Heading](#guide-closing-heading-1)
  - [Path Cards](#path-cards-1)
  - [Start Paths](#start-paths-1)
  - [Template Pair](#template-pair-1)
  - [Template Row](#template-row-1)
  - [Card Tiles](#card-tiles-1)
  - [Panels](#panels-1)
  - [CTA Box](#cta-box-1)
  - [CTA Rule](#cta-rule-1)
  - [Action Row](#action-row-1)
  - [Facts](#facts-1)
  - [Package List](#package-list-1)
  - [Guide Step](#guide-step-1)
  - [Guide Step, Unnumbered](#guide-step-unnumbered-1)
  - [Agent Task](#agent-task)
  - [Troubleshooting](#troubleshooting-1)
  - [File Explorer](#file-explorer)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

- [x] `p1` - **ID**: `cpt-template-site-blocks-featstatus-docs-blocks`
## 1. Feature Context

- [x] `p1` - `cpt-template-site-blocks-feature-docs-blocks`

### 1.1 Overview

The blocks of the site's inner pages: the page frames (`PageIntro`, `DocsFrame` with the docs tab bar, `DocsFrameWithRail` with the "On this page" rail, `TemplateDetailFrame` with the explorer across and the facts beside the body) and the headings (`SectionHeading`, `GuideClosingHeading` for a guide's ruled closing section); the card and panel blocks (`PathCards`, `StartPaths`, `TemplatePair`, `TemplateRow`, `CardTiles`, `Panels`, `CtaBox`, `CtaRule`, `ActionRow`, `Facts`, `PackageList`); the guide and explorer blocks (`GuideStep`, `GuideStepUnnumbered`, `AgentTask`, `Troubleshooting`, `FileExplorer`).

### 1.2 Purpose

The docs, templates and libraries pages draw a small set of arrangements again and again; each is one block, so a page is its content in order and carries no CSS.

**Requirements**: `cpt-template-site-blocks-fr-kit-built`, `cpt-template-site-blocks-fr-layout-only`, `cpt-template-site-blocks-fr-content-props`, `cpt-template-site-blocks-fr-block-card`, `cpt-template-site-blocks-fr-layout-tokens`, `cpt-template-site-blocks-fr-section-navigation`, `cpt-template-site-blocks-fr-showcase`, `cpt-template-site-blocks-nfr-accessible`, `cpt-template-site-blocks-nfr-v2-structure`

**Principles**: `cpt-template-site-blocks-principle-one-arrangement-one-block`, `cpt-template-site-blocks-principle-layout-only`, `cpt-template-site-blocks-principle-ramp-overrides`

**Constraints**: `cpt-template-site-blocks-constraint-exact-pins`

**Components**: `cpt-template-site-blocks-component-blocks-package`, `cpt-template-site-blocks-component-layout-tokens`, `cpt-template-site-blocks-component-exemptions-ledger`

**Scope**: the block folders listed in the overview.

**Out of scope**: the landing-page blocks; page content and the mapping of outline entries to blocks; art drawings, which the blocks take through slots.

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-site-blocks-actor-visitor` | Reads the pages, follows card links, copies code, opens tasks and answers, browses files, jumps to sections |
| `cpt-template-site-blocks-actor-template-author` | Composes inner pages from the blocks |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md)
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.3
- **ADRs**: `cpt-template-site-blocks-adr-one-arrangement-one-block`, `cpt-template-site-blocks-adr-named-workspace-package`
- **Interface**: `cpt-template-site-blocks-interface-package-surface`
- **Sequences**: `cpt-template-site-blocks-seq-jump-to-section`
- **Dependencies**: `cpt-template-site-blocks-feature-blocks-showcase`

## 2. Actor Flows (CDSL)

**Use cases**: `cpt-template-site-blocks-usecase-build-page`

### Jump to a Section

- [x] `p2` - **ID**: `cpt-template-site-blocks-flow-docs-blocks-jump-to-section`

**Actor**: `cpt-template-site-blocks-actor-visitor`

**Success Scenarios**:
- The visitor activates a rail entry; the view scrolls to the section's heading and the keyboard focus lands on it, so the next Tab continues from that section.

**Error Scenarios**:
- The heading is not on the page: nothing moves.

**Steps**:
1. [x] - `p2` - The visitor activates the entry's button, numbered in page order - `inst-activate`
2. [x] - `p2` - Find the heading by id in the root of the page the rail is in (the document or the screen's shadow root); **IF** none, **RETURN** - `inst-find-heading`
3. [x] - `p2` - Scroll the heading into view when the browser can, and move the focus to it without a second scroll - `inst-scroll-focus`

### Open an Agent Task

- [x] `p1` - **ID**: `cpt-template-site-blocks-flow-docs-blocks-open-agent-task`

**Actor**: `cpt-template-site-blocks-actor-visitor`

**Success Scenarios**:
- The visitor activates the summary of a closed agent task; the card opens on the lead, the task's text with its copy button and the link to the plain-text task, and the chevron points down. Activating the summary again closes it.

**Error Scenarios**:
- None: the task is static content and opening it needs nothing outside the block.

**Steps**:
1. [x] - `p1` - Hold the open state, closed at start, and pick the chevron that shows it - `inst-hold-state`
2. [x] - `p1` - Render the card with the summary inside the kit Collapsible trigger, which reports the state as `aria-expanded` - `inst-summary`
3. [x] - `p1` - **IF** open, render the lead, the task in a wrapped kit candidates code block with its copy button, and the plain-text link the caller passes - `inst-open`

### Browse a Template's Key Files

- [x] `p1` - **ID**: `cpt-template-site-blocks-flow-docs-blocks-browse-files`

**Actor**: `cpt-template-site-blocks-actor-visitor`

**Success Scenarios**:
- The visitor types in the find box; the rail keeps the files whose path contains the text.
- The visitor chooses a file; its row is marked pressed and the viewer shows its description, path, code with Copy, line count and link.
- The visitor chooses the Example tab when the page has one; the example replaces the files panel.

**Error Scenarios**:
- No path contains the text: the rail shows the no-files text in place of the list, and the viewer keeps the chosen file.

**Steps**:
1. [x] - `p1` - Hold the chosen tab (Files at start), the find query (empty) and the chosen file (the first) - `inst-hold-state`
2. [x] - `p1` - Keep the files whose path contains the trimmed query, ignoring case; an empty query keeps them all - `inst-filter-files`
3. [x] - `p1` - Resolve the chosen file, falling back to the first - `inst-pick-file`
4. [x] - `p1` - **FOR EACH** kept file render a row: the last path segment as the name, the rest as the folder or the template-root label, pressed when it is the chosen file - `inst-list-rows`
5. [x] - `p1` - Render the tabs with the source line, the rail (heading with the count, find box, rows or the no-files text, scope line), the rule and the viewer of the chosen file; render the Example tab and panel only when an example is given - `inst-render-explorer`

## 3. Processes / Business Logic (CDSL)

### Page Intro

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-docs-blocks-page-intro`

**Input**: The title, the lead, an optional back link and optional facts with icons

**Output**: The opening of an inner page

**Steps**:
1. [x] - `p1` - Keep the facts only when there is at least one - `inst-facts`
2. [x] - `p1` - Render the back link above the title, the title as the page's level-one kit heading on the display role set to the brand's page size, the lead (muted, or in the page's ink when facts follow) and the facts as a list of icon and meta text, with the intro's block padding from the layout tokens - `inst-render`

### Docs Frame

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-docs-blocks-docs-frame`

**Input**: The intro's content, an optional tab bar (label and items with their link elements), optional wide content, the body, an optional footer line

**Output**: An inner page in the page column

**Steps**:
1. [x] - `p1` - Render the tab bar as the kit's navigation menu named by its label, one plain link per item rendered as the item's element, the current one active - `inst-tabs`
2. [x] - `p1` - Render the page as an article in the page column: the page intro, then the tab bar, the wide content, the body and the footer line 32 pixels apart, and the page's bottom padding from the layout tokens - `inst-column`

### Docs Frame with Rail

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-docs-blocks-docs-frame-with-rail`

**Input**: The docs frame's content without its footer, the rail (label, section items, optional footer), optional side content

**Output**: A guide page with a sticky side column

**Steps**:
1. [x] - `p1` - Render the docs frame with the body beside a side column of the rail's width; the side column sticks under the header, and moves above the body, full width, under 900 pixels - `inst-columns`
2. [x] - `p1` - Render the rail as a navigation landmark named by its label, a kit card with the label as a level-two title, an ordered list of numbered jump buttons and the footer line - `inst-rail`

### Current Section of the Rail

- [x] `p2` - **ID**: `cpt-template-site-blocks-algo-docs-blocks-rail-current`

**Input**: The tops of the page's section headings, the reading line under the sticky header

**Output**: The index of the current entry

**Steps**:
1. [x] - `p2` - Read the heading tops on mount, on scroll and on resize, from the root the rail is in - `inst-track-scroll`
2. [x] - `p2` - Pick the last heading whose top reached the reading line, or the first while none has, and mark its entry as the current location - `inst-pick-current`

### Template Detail Frame

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-docs-blocks-template-detail-frame`

**Input**: The intro's content, an optional tab bar, the explorer node, the body, an optional facts node and an optional footer line

**Output**: A template's page in the page column

**Steps**:
1. [x] - `p1` - Render the docs frame with the explorer as its wide content and, as its body, the body and the facts in two columns (1.4 to 1, 55 pixels apart, aligned to their tops; one column under 760 pixels, the facts after the body); without facts the body takes the column - `inst-columns`
2. [x] - `p1` - **IF** facts are given, render them in an `aside` beside the body - `inst-facts`

### Section Heading

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-docs-blocks-section-heading`

**Input**: The heading id, the title, an optional lead or label

**Output**: The heading row of a section of an inner page

**Steps**:
1. [x] - `p1` - Pick the kit's display role, or the heading-1 role when a label names the section's group - `inst-role`
2. [x] - `p1` - Render the level-two heading with the id as a script-focusable jump target clear of the sticky header, the label at the row's end and the lead under it - `inst-render`

### Guide Closing Heading

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-docs-blocks-guide-closing-heading`

**Input**: The heading id, the title and an optional lead

**Output**: The heading of a guide's closing section

**Steps**:
1. [x] - `p1` - Render the heading block 8 pixels under the content above (32 with the column's gap) - `inst-render`
2. [x] - `p1` - Render a kit separator, 38 pixels above the title - `inst-rule`
3. [x] - `p1` - Render the title as a level-two kit heading on the display role with its id, focusable by script and clear of the sticky header - `inst-heading`
4. [x] - `p1` - **IF** a lead is given, render it muted under the title - `inst-lead`

### Path Cards

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-docs-blocks-path-cards`

**Input**: Path items, each a title, a sentence, a link element, an optional eyebrow and an optional figure

**Output**: A list of whole-card links

**Steps**:
1. [x] - `p1` - Render the items as a list, three to a row, one column under 900px - `inst-list`
2. [x] - `p1` - Render each item as a kit-candidates `Card` rendered as the item's link element, so the whole card is one link - `inst-card-link`
3. [x] - `p1` - Put the figure in a decorative slot beside the copy, hidden from assistive technology - `inst-figure-slot`
4. [x] - `p1` - Render the copy: the eyebrow when given, the title as an `h2` through `CardTitle`, the sentence through `CardDescription`, and a decorative arrow - `inst-copy`

### Start Paths

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-docs-blocks-start-paths`

**Input**: A landmark label and starting points, each a title, a sentence, a link element, an optional icon and a current flag

**Output**: A named navigation of whole-row links

**Steps**:
1. [x] - `p1` - Render a navigation landmark named by the label, holding a list two to a row, one column under 640px - `inst-landmark`
2. [x] - `p1` - Render each starting point as a kit `Item` rendered as its link element, `muted` with `aria-current="true"` when it is the current path, else `outline` - `inst-row-link`
3. [x] - `p1` - Render the icon when given as decorative `ItemMedia`, the title and sentence as `ItemTitle` and `ItemDescription`, and a decorative arrow in `ItemActions` - `inst-row-content`

### Template Pair

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-docs-blocks-template-pair`

**Input**: Exactly two template items, each a title, a sentence, a link element and an optional figure

**Output**: Two whole-card links joined by a sign

**Steps**:
1. [x] - `p1` - Render the two items as a list of kit-candidates `Card`s rendered as their link elements, each a decorative figure slot beside an `h3` title closed by a decorative arrow and the sentence; one column under 640px - `inst-cards`
2. [x] - `p1` - Render a decorative "+" outside the list, centred between the two cards - `inst-join`

### Template Row

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-docs-blocks-template-row`

**Input**: One template item: a title, a sentence, a link element and an optional figure

**Output**: One full-width whole-card link

**Steps**:
1. [x] - `p1` - Render a kit-candidates `Card` rendered as the link element, a decorative figure slot beside an `h2` title and the sentence, and a decorative arrow at the far end - `inst-card-link`

### Card Tiles

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-docs-blocks-card-tiles`

**Input**: Tile items, each a title, a sentence, a link element and an optional eyebrow

**Output**: A grid of small whole-card links

**Steps**:
1. [x] - `p1` - Render the items as a list in a grid that fits as many 16rem columns as the width allows - `inst-grid`
2. [x] - `p1` - Render each item as a kit-candidates `Card` rendered as its link element, with the eyebrow when given, an `h3` title in `CardHeader` and the sentence in `CardContent` - `inst-tile`

### Panels

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-docs-blocks-panels`

**Input**: Panel items, each a title, a sentence, optional actions and an optional label

**Output**: A grid of kit cards

**Steps**:
1. [x] - `p1` - Render the items as a list, two to a row, one column under 760px - `inst-grid`
2. [x] - `p1` - Render each item as a kit `Card` with the label when given (as `code`), an `h3` title and the sentence - `inst-panel`
3. [x] - `p1` - **IF** the item has actions, render them in `CardFooter`, one per line - `inst-actions`

### CTA Box

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-docs-blocks-cta-box`

**Input**: A title, a sentence and an action

**Output**: A complementary region closing a guide

**Steps**:
1. [x] - `p1` - Render an `aside` named by its heading, holding a kit `Card` on the brand's tint - `inst-region`
2. [x] - `p1` - Render the title as an `h2` through the kit-candidates `Heading` (`display`), the sentence through `Text` (muted) and the action in `CardFooter` - `inst-copy`

### CTA Rule

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-docs-blocks-cta-rule`

**Input**: A title, a sentence and an action

**Output**: A complementary region closing an index

**Steps**:
1. [x] - `p1` - Render an `aside` named by its heading, opening with a kit `Separator` - `inst-rule`
2. [x] - `p1` - Render a row of the title (`h2`, `display`) and sentence on the left and the action at its end; the action drops under the text under 640px - `inst-row`

### Action Row

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-docs-blocks-action-row`

**Input**: Actions, usually links drawn as buttons

**Output**: A row of the actions in a page's body

**Steps**:
1. [x] - `p1` - Render the actions as the direct children of one row with a `--space-4` gap that wraps when the column is short of room; under 640px one action per line at its own width - `inst-row`

### Facts

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-docs-blocks-facts`

**Input**: A title, name and value pairs and optional actions

**Output**: A complementary region with a description list

**Steps**:
1. [x] - `p1` - Render an `aside` named by its heading, holding a kit `Card` whose title is an `h2` through `CardTitle` - `inst-region`
2. [x] - `p1` - Render the pairs as a kit-candidates `DescriptionList`, one `DescriptionItem` per pair - `inst-pairs`
3. [x] - `p1` - **IF** actions are given, render them in `CardFooter`, one per line - `inst-actions`

### Package List

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-docs-blocks-package-list`

**Input**: Packages, each a name, a title, a sentence, an optional install command, optional actions and an optional figure; the copy button's labels

**Output**: A grid of package cards

**Steps**:
1. [x] - `p1` - Render each package's heading row: the package name (`Text` label as `code`) and an `h2` title through `CardTitle`, beside a decorative figure slot **IF** the package has a figure; without one no slot or space is kept - `inst-heading`
2. [x] - `p1` - **IF** the package has an install command, render it as a kit-candidates `CodeBlock` with a header title and a copy button carrying the given labels - `inst-install`
3. [x] - `p1` - **IF** the package has actions, render them in `CardFooter` as a wrapping row - `inst-actions`

### Guide Step

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-docs-blocks-guide-step`

**Input**: id, number, title, optional lead, code, files, result drawing, expected result, note, links; the copy labels

**Output**: A ruled section named by its heading

**Steps**:
1. [x] - `p1` - Render the heading row: the number in a kit Badge hidden from assistive technology, apart from the title (an `h2` on the kit's `heading-1` role with the id, a jump target); the lead under it - `inst-heading`
2. [x] - `p1` - **IF** the step has code, render it in a kit candidates code block titled by the code's title, with the copy button, its long lines wrapped instead of scrolled, so a narrow screen shows the whole command - `inst-code`
3. [x] - `p1` - **IF** the step has files, render a kit ItemGroup with one outlined Item per file (icon, name, text, path), each a list item - `inst-files`
4. [x] - `p1` - Place the result drawing the caller passes; **IF** the step has an expected result, render it as a muted line with a check icon and the label visually hidden before the text - `inst-result`
5. [x] - `p1` - **IF** the note is a sentence render it as muted text, **ELSE** render a small kit Card with the note's title as an `h3` and its sentences - `inst-note`
6. [x] - `p1` - **IF** the step has links, render them in one wrapping row - `inst-links`

### Guide Step, Unnumbered

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-docs-blocks-guide-step-unnumbered`

**Input**: id, title, lead, optional links

**Output**: A ruled section named by its heading

**Steps**:
1. [x] - `p1` - Render the title as an `h2` on the kit's `heading-1` role with the id, a jump target, and the lead under it - `inst-heading`
2. [x] - `p1` - **IF** links are given, render them in one wrapping row - `inst-links`

### Troubleshooting

- [x] `p1` - **ID**: `cpt-template-site-blocks-algo-docs-blocks-troubleshooting`

**Input**: id, title, items of a summary and a text

**Output**: A section named by its heading with one closed row per item

**Steps**:
1. [x] - `p1` - Render the title as an `h2` on the kit's `display` role with the id, a jump target - `inst-heading`
2. [x] - `p1` - **FOR EACH** item render a kit Accordion row whose trigger is the summary and whose panel is the muted text; the accordion lets several rows stay open - `inst-items`

## 4. States (CDSL)

### No Feature-Owned State Machine

Not applicable because the blocks keep only the open, chosen and current states their flows and processes describe, each local to one rendered block.

## 5. Definitions of Done

### Page Intro

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-docs-blocks-page-intro`

The system **MUST** export `PageIntro` (`title`, `lead`, `back?`, `meta?`) from `@gears-frontx/site-blocks/PageIntro`, rendering the page's only level-one heading with the intro's padding from `--site-intro-pad-top` and `--site-intro-pad-bottom`.

**Implements**:
- `cpt-template-site-blocks-algo-docs-blocks-page-intro`

**Touches**:
- Module: `@gears-frontx/site-blocks`
- Entities: Block folder, Layout tokens

### Docs Frame

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-docs-blocks-docs-frame`

The system **MUST** export `DocsFrame` (`intro`, `nav?`, `wide?`, `children`, `footer?`) and `DocsTabs` from `@gears-frontx/site-blocks/DocsFrame`: an article in the page column with the intro, a tab bar on the kit's navigation menu whose current link carries `aria-current="page"`, and the page's bottom padding from `--site-page-pad-bottom`.

**Implements**:
- `cpt-template-site-blocks-algo-docs-blocks-docs-frame`

**Touches**:
- Module: `@gears-frontx/site-blocks`
- Entities: Block folder, Layout tokens

### Docs Frame with Rail

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-docs-blocks-docs-frame-with-rail`

The system **MUST** export `DocsFrameWithRail` (the docs frame's props without `footer`, plus `rail` and `aside?`) from `@gears-frontx/site-blocks/DocsFrameWithRail`: the body beside a sticky side column with the side content above an "On this page" rail that marks the section in view and moves focus to the section it names.

**Implements**:
- `cpt-template-site-blocks-algo-docs-blocks-docs-frame-with-rail`
- `cpt-template-site-blocks-algo-docs-blocks-rail-current`
- `cpt-template-site-blocks-flow-docs-blocks-jump-to-section`

**Touches**:
- Module: `@gears-frontx/site-blocks`
- Entities: Block folder, Layout tokens

### Template Detail Frame

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-docs-blocks-template-detail-frame`

The system **MUST** export `TemplateDetailFrame` (`intro`, `nav?`, `explorer`, `children`, `facts?`, `footer?`) from `@gears-frontx/site-blocks/TemplateDetailFrame`: the docs frame with the explorer across the column, then the body beside the facts in an `aside`, one column under 760 pixels with the facts after the body, and layout declarations only.

**Implements**:
- `cpt-template-site-blocks-algo-docs-blocks-template-detail-frame`

**Constraints**: `cpt-template-site-blocks-fr-kit-built`, `cpt-template-site-blocks-fr-layout-only`, `cpt-template-site-blocks-fr-content-props`, `cpt-template-site-blocks-nfr-accessible`, `cpt-template-site-blocks-nfr-v2-structure`

**Touches**:
- Module: `@gears-frontx/site-blocks` (`./TemplateDetailFrame`)
- Entities: Block folder, Layout tokens

### Section Heading

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-docs-blocks-section-heading`

The system **MUST** export `SectionHeading` (`id`, `title`, `lead?`, `label?`) from `@gears-frontx/site-blocks/SectionHeading`: a level-two heading on the kit's ramp that is a jump target, with its lead or its label.

**Implements**:
- `cpt-template-site-blocks-algo-docs-blocks-section-heading`

**Touches**:
- Module: `@gears-frontx/site-blocks`
- Entities: Block folder

### Guide Closing Heading

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-docs-blocks-guide-closing-heading`

The system **MUST** export `GuideClosingHeading` (`id`, `title`, `lead?`) from `@gears-frontx/site-blocks/GuideClosingHeading`: a kit separator above a level-two heading with its id and `tabindex="-1"` on the kit display role, the lead when given, and no colour or border declaration of its own.

**Implements**:
- `cpt-template-site-blocks-algo-docs-blocks-guide-closing-heading`

**Constraints**: `cpt-template-site-blocks-fr-kit-built`, `cpt-template-site-blocks-fr-layout-only`, `cpt-template-site-blocks-fr-content-props`, `cpt-template-site-blocks-nfr-accessible`, `cpt-template-site-blocks-nfr-v2-structure`

**Touches**:
- Module: `@gears-frontx/site-blocks` (`./GuideClosingHeading`)
- Entities: Block folder

### Path Cards

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-docs-blocks-path-cards`

The system **MUST** export `PathCards` taking only `items` (figure, eyebrow, title, text, link) and render each path as one whole-card link holding an `h2`, with the figure out of the accessibility tree and layout-only CSS.

**Implements**:
- `cpt-template-site-blocks-algo-docs-blocks-path-cards`

**Touches**:
- Module: `@gears-frontx/site-blocks`
- Entities: Block folder

### Start Paths

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-docs-blocks-start-paths`

The system **MUST** export `StartPaths` taking only `label` and `items` (icon, title, text, link, current) and render a named navigation of whole-row kit `Item` links, the current one marked with `aria-current` and the kit's muted tint.

**Implements**:
- `cpt-template-site-blocks-algo-docs-blocks-start-paths`

**Touches**:
- Module: `@gears-frontx/site-blocks`
- Entities: Block folder

### Template Pair

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-docs-blocks-template-pair`

The system **MUST** export `TemplatePair` taking exactly two items (figure, title, text, link) and render two whole-card links with `h3` titles, each closed by a decorative arrow, joined by a decorative sign outside the list.

**Implements**:
- `cpt-template-site-blocks-algo-docs-blocks-template-pair`

**Touches**:
- Module: `@gears-frontx/site-blocks`
- Entities: Block folder

### Template Row

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-docs-blocks-template-row`

The system **MUST** export `TemplateRow` taking one item (figure, title, text, link) and render one full-width whole-card link holding an `h2` and ending in a decorative arrow.

**Implements**:
- `cpt-template-site-blocks-algo-docs-blocks-template-row`

**Touches**:
- Module: `@gears-frontx/site-blocks`
- Entities: Block folder

### Card Tiles

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-docs-blocks-card-tiles`

The system **MUST** export `CardTiles` taking only `items` (eyebrow, title, text, link) and render a fitting grid of whole-card links with `h3` titles.

**Implements**:
- `cpt-template-site-blocks-algo-docs-blocks-card-tiles`

**Touches**:
- Module: `@gears-frontx/site-blocks`
- Entities: Block folder

### Panels

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-docs-blocks-panels`

The system **MUST** export `Panels` taking only `items` (label, title, text, actions) and render kit cards two to a row with `h3` titles and actions one per line.

**Implements**:
- `cpt-template-site-blocks-algo-docs-blocks-panels`

**Touches**:
- Module: `@gears-frontx/site-blocks`
- Entities: Block folder

### CTA Box

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-docs-blocks-cta-box`

The system **MUST** export `CtaBox` taking `title`, `text` and `action` and render a complementary region named by its `h2`, a kit card on the brand tint, with the tint the block's only visual declaration and recorded in the exemption ledger.

**Implements**:
- `cpt-template-site-blocks-algo-docs-blocks-cta-box`

**Touches**:
- Module: `@gears-frontx/site-blocks`
- Entities: Block folder, Exemption ledger

### CTA Rule

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-docs-blocks-cta-rule`

The system **MUST** export `CtaRule` taking `title`, `text` and `action` and render a complementary region named by its `h2`, the rule drawn by the kit `Separator`, with layout-only CSS.

**Implements**:
- `cpt-template-site-blocks-algo-docs-blocks-cta-rule`

**Touches**:
- Module: `@gears-frontx/site-blocks`
- Entities: Block folder

### Action Row

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-docs-blocks-action-row`

The system **MUST** export `ActionRow` taking its actions as children and render them in order as the direct children of one row, each keeping its own role, with layout-only CSS.

**Implements**:
- `cpt-template-site-blocks-algo-docs-blocks-action-row`

**Touches**:
- Module: `@gears-frontx/site-blocks`
- Entities: Block folder

### Facts

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-docs-blocks-facts`

The system **MUST** export `Facts` taking `title`, `facts` and optional `actions` and render a complementary region named by its `h2` with the pairs on real `dl`, `dt` and `dd` elements through the kit-candidates description list.

**Implements**:
- `cpt-template-site-blocks-algo-docs-blocks-facts`

**Touches**:
- Module: `@gears-frontx/site-blocks`
- Entities: Block folder

### Package List

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-docs-blocks-package-list`

The system **MUST** export `PackageList` taking `packages` (optional figure, name, title, text, install, actions) and the copy labels, and render package cards with an `h2` title, the name as `code`, a decorative figure slot only where a package has a figure, and the install command as a kit-candidates code block with a copy button only where a package has one.

**Implements**:
- `cpt-template-site-blocks-algo-docs-blocks-package-list`

**Touches**:
- Module: `@gears-frontx/site-blocks`
- Entities: Block folder

### Guide Step

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-docs-blocks-guide-step`

The system **MUST** render a numbered guide step from kit parts and kit candidates only, with the number marker apart from the title and outside the heading's accessible name, the command with Copy, the files as a list, the result drawing slot, the expected result with a hidden label, a plain or titled note and a row of links, all from content props.

**Implements**:
- `cpt-template-site-blocks-algo-docs-blocks-guide-step`

**Constraints**: `cpt-template-site-blocks-fr-kit-built`, `cpt-template-site-blocks-fr-layout-only`, `cpt-template-site-blocks-fr-content-props`, `cpt-template-site-blocks-nfr-accessible`, `cpt-template-site-blocks-nfr-v2-structure`

**Touches**:
- Module: `@gears-frontx/site-blocks` (`./GuideStep`)
- Entities: Block folder

### Guide Step, Unnumbered

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-docs-blocks-guide-step-unnumbered`

The system **MUST** render a guide's closing section as a ruled step without a number: the title as a jump target, the lead and the links, from content props.

**Implements**:
- `cpt-template-site-blocks-algo-docs-blocks-guide-step-unnumbered`

**Constraints**: `cpt-template-site-blocks-fr-kit-built`, `cpt-template-site-blocks-fr-layout-only`, `cpt-template-site-blocks-fr-content-props`, `cpt-template-site-blocks-principle-one-arrangement-one-block`

**Touches**:
- Module: `@gears-frontx/site-blocks` (`./GuideStepUnnumbered`)
- Entities: Block folder

### Agent Task

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-docs-blocks-agent-task`

The system **MUST** render a task for a coding agent as a kit card that starts closed, opens from its summary through the kit Collapsible, and shows the lead, the task's wrapped text with Copy and the plain-text link; the card carries the id as its jump target.

**Implements**:
- `cpt-template-site-blocks-flow-docs-blocks-open-agent-task`

**Constraints**: `cpt-template-site-blocks-fr-kit-built`, `cpt-template-site-blocks-fr-layout-only`, `cpt-template-site-blocks-fr-content-props`, `cpt-template-site-blocks-nfr-accessible`

**Touches**:
- Module: `@gears-frontx/site-blocks` (`./AgentTask`)
- Entities: Block folder

### Troubleshooting

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-docs-blocks-troubleshooting`

The system **MUST** render a titled list of symptoms on the kit Accordion, every row closed at start and several open at once, the title a jump target.

**Implements**:
- `cpt-template-site-blocks-algo-docs-blocks-troubleshooting`

**Constraints**: `cpt-template-site-blocks-fr-kit-built`, `cpt-template-site-blocks-fr-layout-only`, `cpt-template-site-blocks-fr-content-props`, `cpt-template-site-blocks-nfr-accessible`

**Touches**:
- Module: `@gears-frontx/site-blocks` (`./Troubleshooting`)
- Entities: Block folder

### File Explorer

- [x] `p1` - **ID**: `cpt-template-site-blocks-dod-docs-blocks-file-explorer`

The system **MUST** render a template's key files with the kit Tabs, a kit card frame split into a rail of kit Buttons in a named navigation landmark with a find box and a viewer headed by the chosen file's description with its path, code with Copy, line count and links; the Example tab exists only when an example is given; every string comes from the caller.

**Implements**:
- `cpt-template-site-blocks-flow-docs-blocks-browse-files`

**Constraints**: `cpt-template-site-blocks-fr-kit-built`, `cpt-template-site-blocks-fr-layout-only`, `cpt-template-site-blocks-fr-content-props`, `cpt-template-site-blocks-nfr-accessible`, `cpt-template-site-blocks-nfr-v2-structure`

**Touches**:
- Module: `@gears-frontx/site-blocks` (`./FileExplorer`)
- Entities: Block folder

## 6. Acceptance Criteria

- [x] `PageIntro` renders one level-one heading and the lead, the back link above the title and the facts as list items under the lead.
- [x] `DocsFrame` renders an article with the intro, then the wide content, the body and the footer in order; its tab bar is a navigation named by its label whose current link has `aria-current="page"` and whose links keep their own addresses.
- [x] `DocsFrameWithRail` renders the rail as a navigation named by its label with one numbered button per section, the first current while the page is above every section; activating a button moves focus to the section's heading; the side content comes before the rail.
- [x] `SectionHeading` renders a level-two heading with its id and `tabindex="-1"`, a smaller role with a label, and the lead when given.
- [x] `TemplateDetailFrame` renders the intro, then the explorer, the body and the facts in that order, the facts in an `aside` and the footer line; without facts it renders no `aside`.
- [x] `GuideClosingHeading` renders a separator before a level-two heading with its id and `tabindex="-1"`, and the lead only when given.
- [x] Every frame and heading block passes axe on its fixture, and its stylesheet takes its column and paddings from the layout tokens.
- [x] `PathCards`, `TemplatePair`, `TemplateRow` and `CardTiles` render each item as exactly one link (no nested links) holding its heading (`h2`, `h3`, `h2`, `h3`), with figures in slots hidden from assistive technology.
- [x] `StartPaths` renders a navigation landmark named by `label`, one link per starting point, and only the current one carries `aria-current="true"`.
- [x] `Panels` renders one kit card per item with an `h3`, its label when given, and its actions only when given.
- [x] `ActionRow` renders its actions in the given order as the direct children of one row, each still a link.
- [x] `CtaBox`, `CtaRule` and `Facts` render an `aside` named by its `h2`; `CtaRule` opens with a separator; `Facts` renders `dl > div > dt + dd` in the given order and its actions only when given.
- [x] `PackageList` renders one card per package with the name as `code` and an `h2` title, a decorative figure slot only where the package has a figure, and an install command with a copy button and a named scroll region only where the package has one.
- [x] Every block passes axe with the WCAG A and AA rules, takes content and behaviour props only, and its CSS declares layout only apart from the rows in the exemption ledger.
- [x] Every block's showcase fixture, measured at 1440 and 390 against the designer site's counterpart, keeps the counterpart's arrangement (columns, gaps, figure slots, paddings); the remaining differences come from kit components (type ramp, radius, button height) or content.
- [x] A guide step is a region named by its title alone; the number marker is hidden from assistive technology and sits outside the heading.
- [x] A step's code is a region named by its title with a copy button; its files are list items with name, text and path; its expected result carries the hidden label before the text; a titled note has its own `h3`.
- [x] An unnumbered step renders the title, lead and links with no marker.
- [x] An agent task starts closed with `aria-expanded="false"`; activating the summary shows the lead, the task with Copy and the plain-text link, and sets `aria-expanded="true"`.
- [x] A troubleshooting list starts with every row closed and keeps two rows open at once.
- [x] The file explorer starts on the Files tab with the first file pressed and shown; choosing another file moves the pressed state and the viewer; the find box filters by path and shows the no-files text when nothing matches; the Example tab appears only with an example.
- [x] Every block has no axe violations in its test, open states included.

**Test scenarios** (Vitest, in the package):
- `src/blocks/PageIntro/PageIntro.test.tsx`: heading, lead, back link order, facts, token rules, axe.
- `src/blocks/DocsFrame/DocsFrame.test.tsx`: article, tab bar and current link, wide, body and footer order, token rules, axe.
- `src/blocks/DocsFrameWithRail/DocsFrameWithRail.test.tsx`: `activeAnchor`, `jumpToHeading`, rail entries and current entry, focus on activation, side content order, axe.
- `src/blocks/SectionHeading/SectionHeading.test.tsx`: heading and jump target, labelled role, lead, axe.
- `src/blocks/TemplateDetailFrame/TemplateDetailFrame.test.tsx`: intro, explorer, body and facts order, `aside`, no facts, layout-only stylesheet, fixture meta, axe.
- `src/blocks/GuideClosingHeading/GuideClosingHeading.test.tsx`: separator before the jump-target heading, lead present and absent, layout-only stylesheet, fixture meta, axe.
- `src/blocks/PathCards/PathCards.test.tsx`: list and links, `h2` inside each link, no nested links, decorative figure, eyebrow, axe.
- `src/blocks/StartPaths/StartPaths.test.tsx`: named navigation, links, `aria-current` on the current path only, axe.
- `src/blocks/TemplatePair/TemplatePair.test.tsx`: two links with `h3`, decorative arrow inside each title, decorative figure and sign outside the list, axe.
- `src/blocks/TemplateRow/TemplateRow.test.tsx`: one link with `h2` and text, decorative figure, decorative closing arrow, axe.
- `src/blocks/CardTiles/CardTiles.test.tsx`: list, links with `h3` and eyebrow, axe.
- `src/blocks/Panels/Panels.test.tsx`: panels with `h3`, label, actions present and absent, axe.
- `src/blocks/CtaBox/CtaBox.test.tsx`, `src/blocks/CtaRule/CtaRule.test.tsx`: named complementary region, heading, action, separator, axe.
- `src/blocks/ActionRow/ActionRow.test.tsx`: actions in order as the row's direct children, links kept, axe.
- `src/blocks/Facts/Facts.test.tsx`: named region, `dl > div > dt + dd` order, with and without actions, axe.
- `src/blocks/PackageList/PackageList.test.tsx`: cards, `code` name, `h2`, links, no figure slot without a figure, install command with copy button and named region only where given, axe.
- `src/blocks/GuideStep/GuideStep.test.tsx`: heading name and marker, wrapped code block and copy button, file list items, expected label, plain and titled notes, result and links slots, axe.
- `src/blocks/GuideStepUnnumbered/GuideStepUnnumbered.test.tsx`: region, heading, lead and links, axe.
- `src/blocks/AgentTask/AgentTask.test.tsx`: closed at start, open on the summary, the id on the card, axe closed and open.
- `src/blocks/Troubleshooting/Troubleshooting.test.tsx`: closed rows, two open at once, axe.
- `src/blocks/FileExplorer/FileExplorer.test.tsx`: `splitPath` and `filterFiles`, start state, choosing a file, filtering and the empty result, the Example tab, scope and legal slots, axe.
