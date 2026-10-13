# Feature: Code and Description


<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Copy the Code](#copy-the-code)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Code Frame](#code-frame)
  - [Name and Value Pairs](#name-and-value-pairs)
  - [Render a Kit Part](#render-a-kit-part)
- [4. States (CDSL)](#4-states-cdsl)
  - [Copy Button Label](#copy-button-label)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Code Block](#code-block)
  - [Description List](#description-list)
  - [Render on Kit Parts](#render-on-kit-parts)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

- [x] `p1` - **ID**: `cpt-template-kit-candidates-featstatus-code-and-description`
## 1. Feature Context

- [x] `p1` - `cpt-template-kit-candidates-feature-code-and-description`

### 1.1 Overview

The components of kit pull request B: `CodeBlock` with its header, title and copy button; `DescriptionList` with its item, term and details parts; and `render` on the kit's `Card`, `CardTitle`, `EmptyTitle` and `AlertTitle`, as wrappers under the kit's names.

### 1.2 Purpose

Guides show commands, detail panels show name and value pairs, and catalogue tiles navigate as whole cards; the kit had no part for any of them, so templates built their own. This feature gives them one copy with the API the kit pull request proposes.

**Requirements**: `cpt-template-kit-candidates-fr-code-block`, `cpt-template-kit-candidates-fr-description-list`, `cpt-template-kit-candidates-fr-render-on-parts`, `cpt-template-kit-candidates-fr-proposed-api`, `cpt-template-kit-candidates-nfr-accessible`, `cpt-template-kit-candidates-nfr-tokens-only`

**Principles**: `cpt-template-kit-candidates-principle-proposed-api`, `cpt-template-kit-candidates-principle-kit-conventions`, `cpt-template-kit-candidates-principle-reuse-kit-classes`

**Constraints**: `cpt-template-kit-candidates-constraint-exact-pins`, `cpt-template-kit-candidates-constraint-hook-free-kit-parts`

**Components**: `cpt-template-kit-candidates-component-code-block`, `cpt-template-kit-candidates-component-description-list`, `cpt-template-kit-candidates-component-render-parts`

**Scope**: the `code-block`, `description-list`, `card`, `empty` and `alert` component folders and `src/kit-parts/`.

**Out of scope**: syntax highlighting; every other part of the card, empty and alert families, which the kit provides.

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-kit-candidates-actor-visitor` | Copies code, scrolls it from the keyboard, follows card links, hears pairs and headings |
| `cpt-template-kit-candidates-actor-template-author` | Builds guides, detail panels and card grids with the components |
| `cpt-template-kit-candidates-actor-kit-maintainer` | Reviews the components as the working copy of pull request B |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md)
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.2
- **ADRs**: `cpt-template-kit-candidates-adr-mirror-kit-pull-requests`
- **Interface**: `cpt-template-kit-candidates-interface-package-surface`
- **Sequences**: `cpt-template-kit-candidates-seq-copy-code`, `cpt-template-kit-candidates-seq-release`
- **Dependencies**: `cpt-template-kit-candidates-feature-typography-and-links`

## 2. Actor Flows (CDSL)

User-facing interactions that start with an actor (human or external system) and describe the end-to-end flow of a use case. Each flow has a triggering actor and shows how the system responds to actor actions.

**Use cases**: `cpt-template-kit-candidates-usecase-build-screen`

### Copy the Code

- [x] `p1` - **ID**: `cpt-template-kit-candidates-flow-code-and-description-copy-code`

**Actor**: `cpt-template-kit-candidates-actor-visitor`

**Success Scenarios**:
- The visitor activates the copy button; the code is on the clipboard, the button shows the copied label for the timeout and assistive technology hears it once.

**Error Scenarios**:
- The clipboard is missing or refuses the write: the caller's error callback is called and the button keeps its label.
- The copy button is rendered outside a code block: rendering fails loudly.

**Steps**:
1. [x] - `p1` - Read the code from the enclosing code block; **IF** there is none, fail loudly - `inst-read-code`
2. [x] - `p1` - Write the code to the clipboard; **IF** the clipboard is missing or refuses, call the error callback and **RETURN** - `inst-write`
3. [x] - `p1` - Show the copied label, call the copy callback and restart the timer that restores the copy label after the timeout - `inst-confirm`
4. [x] - `p1` - Put the copied label in the visually hidden status region while it shows, and empty it after - `inst-announce`

## 3. Processes / Business Logic (CDSL)

Internal system functions and procedures that do not interact with actors directly. These are reusable building blocks called by Actor Flows or other processes.

### Code Frame

- [x] `p1` - **ID**: `cpt-template-kit-candidates-algo-code-and-description-code-frame`

**Input**: The code, its label, `wrap`, `size`, an optional language and header children

**Output**: The framed code with its header

**Steps**:
1. [x] - `p1` - Map the size to its class: default sets the mono family on the body size, sm the mono role; the frame paints from the card, border and radius tokens - `inst-size-class`
2. [x] - `p1` - Provide the code to the copy button through context and render the frame with the language as data and the header children above the code - `inst-provide-code`
3. [x] - `p1` - Render the header as a row and its title on the label role, with `render` choosing the title's element - `inst-header`
4. [x] - `p1` - Render `pre > code` with the code verbatim; **IF** not wrapping, make the `pre` a region named by the label with a tab stop, **ELSE** wrap long lines and add neither - `inst-scroll-region`

### Name and Value Pairs

- [x] `p1` - **ID**: `cpt-template-kit-candidates-algo-code-and-description-pairs`

**Input**: Orientation, size, items of terms and details, a details variant

**Output**: A description list

**Steps**:
1. [x] - `p1` - Map orientation and size to classes: vertical stacks term over value, horizontal is a two-column grid sized to the widest term with each item on a subgrid; the size sets the row gap and the value's role - `inst-list-classes`
2. [x] - `p1` - Render the list as `dl`, each item as a `div` and each term as a `dt` on the muted label role - `inst-render-dl`
3. [x] - `p1` - Render each value as a `dd` on the default or the mono variant - `inst-details-variant`

### Render a Kit Part

- [x] `p1` - **ID**: `cpt-template-kit-candidates-algo-code-and-description-render-part`

**Input**: A kit part (Card, CardTitle, EmptyTitle, AlertTitle), its props, an optional `render` element

**Output**: The kit part's markup on the chosen element

**Steps**:
1. [x] - `p1` - Read the class the installed kit part computes for the props by calling the part, which returns one element without rendering it - `inst-kit-class`
2. [x] - `p1` - **IF** `render` is given, add the interactive class to a card and the title-reset class to a title; **ELSE** add nothing - `inst-mark-interactive`
3. [x] - `p1` - **RETURN** the `render` element, or a `div`, carrying the class and the merged props, with no reflected data attribute - `inst-render-element`

## 4. States (CDSL)

Include when entities have explicit lifecycle states.

### Copy Button Label

- [x] `p2` - **ID**: `cpt-template-kit-candidates-state-code-and-description-copy-label`

**States**: idle, copied

**Initial State**: idle

**Transitions**:
1. [x] - `p2` - **FROM** idle **TO** copied **WHEN** the clipboard accepts the code - `inst-to-copied`
2. [x] - `p2` - **FROM** copied **TO** copied **WHEN** the clipboard accepts the code again, restarting the timer - `inst-copy-again`
3. [x] - `p2` - **FROM** copied **TO** idle **WHEN** the timeout passes - `inst-to-idle`

## 5. Definitions of Done

Specific implementation tasks derived from flows and algorithms above.

### Code Block

- [x] `p1` - **ID**: `cpt-template-kit-candidates-dod-code-and-description-code-block`

The system **MUST** export `CodeBlock`, `CodeBlockHeader`, `CodeBlockTitle` (with `render`) and `CodeBlockCopyButton` (a kit ghost `Button`, labels, timeout and callbacks as props), with the code rendered verbatim, a named focusable region unless wrapping, a single announcement per copy, and failures reported to the caller.

**Implements**:
- `cpt-template-kit-candidates-flow-code-and-description-copy-code`
- `cpt-template-kit-candidates-algo-code-and-description-code-frame`
- `cpt-template-kit-candidates-state-code-and-description-copy-label`

**Constraints**: `cpt-template-kit-candidates-constraint-exact-pins`

**Touches**:
- Module: `@gears-frontx/kit-candidates`
- Entities: Component folder, Contract overlay

### Description List

- [x] `p1` - **ID**: `cpt-template-kit-candidates-dod-code-and-description-description-list`

The system **MUST** export `DescriptionList` (orientation vertical or horizontal, size default or sm), `DescriptionItem`, `DescriptionTerm` and `DescriptionDetails` (variant default or mono) on real `dl`, `div`, `dt` and `dd` elements, with horizontal terms aligned in one column.

**Implements**:
- `cpt-template-kit-candidates-algo-code-and-description-pairs`

**Constraints**: `cpt-template-kit-candidates-constraint-exact-pins`

**Touches**:
- Module: `@gears-frontx/kit-candidates`
- Entities: Component folder, Contract overlay

### Render on Kit Parts

- [x] `p1` - **ID**: `cpt-template-kit-candidates-dod-code-and-description-render-on-parts`

The system **MUST** export `Card`, `CardTitle`, `EmptyTitle` and `AlertTitle` that render markup equal to the kit parts' without `render`, put the kit's classes on the `render` element with it, give a card whose root is a link or a button the hover border and the keyboard focus ring, and keep a title rendered as a heading on the kit's look.

**Implements**:
- `cpt-template-kit-candidates-algo-code-and-description-render-part`

**Constraints**: `cpt-template-kit-candidates-constraint-hook-free-kit-parts`

**Touches**:
- Module: `@gears-frontx/kit-candidates`
- Entities: Component folder, Contract overlay

## 6. Acceptance Criteria

- [x] A code block renders the code verbatim; without `wrap` its `pre` is a named region with a tab stop, with `wrap` it is neither.
- [x] The copy button writes the code, shows and announces the copied label once, restores the copy label after the timeout, and reports a missing or refusing clipboard.
- [x] A description list renders `dl > div > dt + dd`, with one class per orientation, size and details variant.
- [x] Without `render`, `Card`, `CardTitle`, `EmptyTitle` and `AlertTitle` render markup equal to the kit parts'; with it, the given element carries the kit's classes and no extra attribute.
- [x] Every component passes axe with the WCAG A and AA rules, and every contract overlay passes its check.

**Test scenarios** (Vitest, in the package):
- `src/components/code-block/code-block.test.tsx`: markup and language, region and tab stop, wrap, size, title `render`, copy with fake timers, rejected and missing clipboard, copy button outside a block, token rules, axe.
- `src/components/description-list/description-list.test.tsx`: elements, defaults, axes, mono details, subgrid and token rules, axe.
- `src/components/card/card.test.tsx`, `src/components/empty/empty.test.tsx`, `src/components/alert/alert.test.tsx`: markup equal to the kit without `render`, kit classes and the added class with it, no extra attribute, interactive and reset rules, axe.
- `*.contract.test.ts` of the five folders: the overlay check.
