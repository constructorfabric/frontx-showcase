# Feature: Typography and Links


<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [No Feature-Owned Actor Flow](#no-feature-owned-actor-flow)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Ramp Role](#ramp-role)
  - [Inline Link](#inline-link)
  - [Visually Hidden Box](#visually-hidden-box)
- [4. States (CDSL)](#4-states-cdsl)
  - [No Feature-Owned State Machine](#no-feature-owned-state-machine)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Text Roles](#text-roles)
  - [Inline Link](#inline-link-1)
  - [Visually Hidden Text](#visually-hidden-text)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

- [x] `p1` - **ID**: `cpt-template-kit-candidates-featstatus-typography-and-links`
## 1. Feature Context

- [x] `p1` - `cpt-template-kit-candidates-feature-typography-and-links`

### 1.1 Overview

The components of kit pull request A: `Heading` and `Text` on the kit's type ramp, `Link` for links inside text, `VisuallyHidden` and the `sr-only` class; with the template's packaging (manifest, package entry, AI bundle).

### 1.2 Purpose

Every template of the site wrote its own heading, text and link recipes and its own visually hidden rule. This feature gives them one copy, with exactly the API the kit pull request proposes, so the kit release is an import change.

**Requirements**: `cpt-template-kit-candidates-fr-ramp-text`, `cpt-template-kit-candidates-fr-inline-link`, `cpt-template-kit-candidates-fr-visually-hidden`, `cpt-template-kit-candidates-fr-proposed-api`, `cpt-template-kit-candidates-fr-self-contained`, `cpt-template-kit-candidates-nfr-accessible`, `cpt-template-kit-candidates-nfr-tokens-only`

**Principles**: `cpt-template-kit-candidates-principle-proposed-api`, `cpt-template-kit-candidates-principle-kit-conventions`

**Constraints**: `cpt-template-kit-candidates-constraint-host-prerequisites`, `cpt-template-kit-candidates-constraint-exact-pins`

**Components**: `cpt-template-kit-candidates-component-typography`, `cpt-template-kit-candidates-component-link`, `cpt-template-kit-candidates-component-visually-hidden`, `cpt-template-kit-candidates-component-template-packaging`

**Scope**: the `heading`, `text`, `link` and `visually-hidden` component folders, `src/utilities.css`, the package entry and `package.json`, the template manifest and the AI bundle.

**Out of scope**: layout primitives, a skip link, brand display sizes (brand overrides of the ramp tokens), the components of pull request B.

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-kit-candidates-actor-template-author` | Imports the components into screens and blocks |
| `cpt-template-kit-candidates-actor-visitor` | Reads headings in a correct outline, follows links, hears hidden names |
| `cpt-template-kit-candidates-actor-kit-maintainer` | Reviews the components as the working copy of pull request A |
| `cpt-template-kit-candidates-actor-ai-agent` | Follows the template's guideline when using or changing the components |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md)
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.1
- **ADRs**: `cpt-template-kit-candidates-adr-mirror-kit-pull-requests`
- **Interface**: `cpt-template-kit-candidates-interface-package-surface`
- **Sequences**: `cpt-template-kit-candidates-seq-release`
- **Dependencies**: None

## 2. Actor Flows (CDSL)

User-facing interactions that start with an actor (human or external system) and describe the end-to-end flow of a use case. Each flow has a triggering actor and shows how the system responds to actor actions.

**Use cases**: `cpt-template-kit-candidates-usecase-build-screen`, `cpt-template-kit-candidates-usecase-release`

### No Feature-Owned Actor Flow

Not applicable. The components render inside a consumer's page and respond to no actor action of their own beyond the browser's native link and focus behaviour; building a screen with them and switching to the kit release are a template author's edits, described by the use cases and the release sequence.

## 3. Processes / Business Logic (CDSL)

Internal system functions and procedures that do not interact with actors directly. These are reusable building blocks called by Actor Flows or other processes.

### Ramp Role

- [x] `p1` - **ID**: `cpt-template-kit-candidates-algo-typography-and-links-ramp-role`

**Input**: A `Heading` size or a `Text` variant and tone, an optional `render` element, a class name and native props

**Output**: The element with the role's class

**Steps**:
1. [x] - `p1` - Map each ramp role to a class that reads the role's size, line height, weight and tracking tokens (and the heading or mono family), with zero margin, and each tone to a colour token - `inst-role-class`
2. [x] - `p1` - Resolve an explicit `null` on an axis to its default (heading-1; body and default) - `inst-resolve-null`
3. [x] - `p1` - **RETURN** the `render` element, or the default element (`h2` for Heading, `p` for Text), carrying the role class merged with the caller's class and props - `inst-render-element`

### Inline Link

- [x] `p1` - **ID**: `cpt-template-kit-candidates-algo-typography-and-links-inline-link`

**Input**: A variant, the `external` flag, an optional `render` element, `target`, `rel`, children and native props

**Output**: An anchor, or the caller's router link, styled as an inline link

**Steps**:
1. [x] - `p1` - Map the variant to its class: default paints the link token, muted the muted token with the link token on hover, inherit the current colour with an underline; the base class inherits the line's font, underlines on hover, draws the focus outline on the ring token and gives an icon placed directly in the link a 1em square on the baseline with a gap on the text side, at no specificity so a caller's own icon size and spacing win - `inst-variant-class`
2. [x] - `p1` - **IF** `external`, set `target` to `_blank` and `rel` to `noopener noreferrer` unless the caller passed them, and append an arrow icon hidden from assistive technology after the children - `inst-external`
3. [x] - `p1` - **RETURN** the `render` element or an `a` carrying the class, the children and the merged props - `inst-render-anchor`

### Visually Hidden Box

- [x] `p1` - **ID**: `cpt-template-kit-candidates-algo-typography-and-links-visually-hidden`

**Input**: Children, an optional `render` element, a class name and native props

**Output**: An element whose text is read and not shown

**Steps**:
1. [x] - `p1` - **RETURN** the `render` element or a `span` carrying the class of the one-pixel, absolutely positioned, clipped box without padding, border or wrapping - `inst-hide-box`

## 4. States (CDSL)

Include when entities have explicit lifecycle states.

### No Feature-Owned State Machine

Not applicable. The components hold no state; each render derives its classes from its props.

## 5. Definitions of Done

Specific implementation tasks derived from flows and algorithms above.

### Text Roles

- [x] `p1` - **ID**: `cpt-template-kit-candidates-dod-typography-and-links-text-roles`

The system **MUST** export `Heading` (sizes display, heading-1, heading-2; default `h2`) and `Text` (variants body, label, meta, mono, micro; tones default, muted; default `p`) with their recipe builders `headingVariants` and `textVariants`, each role taken only from the ramp tokens, with zero margin, an explicit `null` resolving to the default, and `render` choosing the element apart from the role.

**Implements**:
- `cpt-template-kit-candidates-algo-typography-and-links-ramp-role`

**Constraints**: `cpt-template-kit-candidates-constraint-exact-pins`

**Touches**:
- Module: `@gears-frontx/kit-candidates`
- Entities: Component folder, Contract overlay

### Inline Link

- [x] `p1` - **ID**: `cpt-template-kit-candidates-dod-typography-and-links-inline-link`

The system **MUST** export `Link` and `linkVariants`: an anchor that inherits the line's font and adds no height or padding, with the variants default, muted and inherit, an icon placed directly in it sized to 1em on the text baseline with a gap on the text side, unless the caller sizes or spaces it, a hover underline, a focus outline on the ring token (Highlight in forced colours), `render` for the router link, and `external` adding a safe new-tab target and a hidden arrow without overriding the caller's `target` or `rel`.

**Implements**:
- `cpt-template-kit-candidates-algo-typography-and-links-inline-link`

**Constraints**: `cpt-template-kit-candidates-constraint-exact-pins`

**Touches**:
- Module: `@gears-frontx/kit-candidates`
- Entities: Component folder, Contract overlay

### Visually Hidden Text

- [x] `p1` - **ID**: `cpt-template-kit-candidates-dod-typography-and-links-visually-hidden`

The system **MUST** export `VisuallyHidden` (default `span`, `render`) and the global `sr-only` class in `utilities.css`, both with the same one-pixel clipped box, keeping the text in the accessibility tree; the template **MUST** claim only its package and AI bundle and ship the guideline.

**Implements**:
- `cpt-template-kit-candidates-algo-typography-and-links-visually-hidden`

**Constraints**: `cpt-template-kit-candidates-constraint-host-prerequisites`

**Touches**:
- Module: `@gears-frontx/kit-candidates`, `@gears-frontx/kit-candidates/utilities.css`
- Entities: Utility stylesheet, Template manifest, AI bundle

## 6. Acceptance Criteria

- [x] Each Heading size and Text variant emits its class, an explicit `null` lands on the default, and `render` changes the element and keeps the class.
- [x] Each role class reads the four ramp tokens of its role; no stylesheet carries a colour literal.
- [x] A Link inherits the line's font, its focus outline is on the ring token, and `external` sets target, rel and a hidden arrow without overriding the caller's values.
- [x] VisuallyHidden text names its container and the `sr-only` class carries the same declarations.
- [x] Every component passes axe with the WCAG A and AA rules.
- [x] The package exports exactly the names of pull requests A and B, and every contract overlay passes its check.

**Test scenarios** (Vitest, in the package; run with `npm run test:unit` in the composed package):
- `src/components/heading/heading.test.tsx`, `src/components/text/text.test.tsx`: default element, class per axis value, null resolution, `render`, recipe builder, ramp tokens, axe.
- `src/components/link/link.test.tsx`: default anchor, variants, router link through `render`, external target, rel and icon, caller's target and rel kept, inherited font and focus rule, axe.
- `src/components/visually-hidden/visually-hidden.test.tsx`: name of an icon-only link, `render` as a caption, declarations equal to `sr-only`, axe.
- `src/index.test.ts`: the export list.
- `*.contract.test.ts` of the four folders: the overlay check.
