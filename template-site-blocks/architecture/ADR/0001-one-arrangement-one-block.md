---
status: accepted
date: 2026-10-13
---

# One Block per Drawn Arrangement, with Content-Only Props and Layout-Only Styles

<!-- toc -->

- [Context and Problem Statement](#context-and-problem-statement)
- [Decision Drivers](#decision-drivers)
- [Considered Options](#considered-options)
- [Decision Outcome](#decision-outcome)
  - [Consequences](#consequences)
  - [Confirmation](#confirmation)
- [Pros and Cons of the Options](#pros-and-cons-of-the-options)
  - [One block per arrangement, content-only props, layout-only styles](#one-block-per-arrangement-content-only-props-layout-only-styles)
  - [Configurable section components](#configurable-section-components)
  - [Pages styled directly](#pages-styled-directly)
  - [Section compositions in the kit](#section-compositions-in-the-kit)
- [More Information](#more-information)
- [Traceability](#traceability)

<!-- /toc -->

**ID**: `cpt-template-site-blocks-adr-one-arrangement-one-block`

## Context and Problem Statement

The site's pages were built from a component library whose section components took variant, tone, layout and size props, so one component drew several arrangements and a page chose a look by configuration. The library also carried its own type scale, colours and spacing beside the kit's and the brand's. The FrontX visual model splits the work three ways: the kit and its candidates hold generic parts, the brand holds values and art, and blocks arrange parts on a page. What is a block allowed to take as props and to declare in its stylesheet?

## Decision Drivers

* **Pages without CSS** - a page is configuration over blocks.
* **Reviewed arrangements** - every arrangement the design draws is reviewed and measured once.
* **One source of values** - colour and type come from the kit and the brand, never from a block.
* **Visible exceptions** - where the kit has no part yet, the exception is listed and removable.

## Considered Options

* **One block per arrangement, content-only props, layout-only styles** - each drawn arrangement is its own block; props are content, slots and callbacks; stylesheets lay out on tokens; every other declaration is a ledger row naming a kit gap.
* **Configurable section components** - keep one component per section family with variant and layout props.
* **Pages styled directly** - pages compose kit parts with their own stylesheets.
* **Section compositions in the kit** - propose the site's sections to the kit.

## Decision Outcome

Chosen option: "One block per arrangement, content-only props, layout-only styles", because it is the only option that keeps pages free of CSS and every arrangement reviewed, while visual values stay with the kit and the brand.

A block's markup is kit parts, kit candidates and brand art in structural elements. Its stylesheet declares display, grid and flex, gaps, sizes, spacing, position, overflow and alignment on layout and kit tokens. A title larger than the kit's ramp is the kit heading on its display role with the role's tokens set to a brand display token, and the site has at most two such sizes. Any other non-layout declaration is a row of the exemptions ledger with the kit gap or defect it waits for.

### Consequences

* Good, because a page holds content and the order of its blocks only.
* Good, because each arrangement has a card, a fixture and a measurement.
* Bad, because a design change that redraws a section adds a block rather than a prop.
* Bad, because the ledger carries visual declarations until the kit closes its gaps.

### Confirmation

Each block's test checks its stylesheet's token rules and runs axe on its fixture; the repository's style policy checks block stylesheets against the layout allow-list and the ledger; review checks each block's props against its card.

## Pros and Cons of the Options

### One block per arrangement, content-only props, layout-only styles

* Good, because configuration cannot change a look.
* Good, because the rules are mechanical and testable.
* Bad, because there are more blocks than section families.

### Configurable section components

* Good, because there are fewer components.
* Bad, because every combination of props is an arrangement nobody reviewed or measured.

### Pages styled directly

* Good, because there is no extra layer.
* Bad, because every page repeats layout and visual values, and drifts.

### Section compositions in the kit

* Good, because other applications could reuse them.
* Bad, because the kit's own product rules hold no composition above one component, and the arrangements are the site's.

## More Information

The kit candidates' guideline sets the brand display size rule (a brand override of the ramp, never a new heading size). The visual model of the site and the brand's delivery are recorded in the site repository's root [ADR folder](../../../architecture/ADR/).

Applicability of the remaining checklist categories: **PERF** - Not applicable. **SEC** - Not applicable. **REL** - Not applicable. **DATA** - Not applicable. **INT** - addressed: blocks depend on the kit, the candidates and the brand by name. **OPS** - Not applicable. **MAINT** - addressed: one block per arrangement, exceptions listed. **TEST** - addressed by the block tests and the style policy. **COMPL** - Not applicable. **UX** - addressed: arrangements measured against the design. **BIZ** - Not applicable.

## Traceability

- **PRD**: [PRD.md](../PRD.md)
- **DESIGN**: [DESIGN.md](../DESIGN.md)

This decision directly addresses the following requirements and design elements:

* `cpt-template-site-blocks-fr-content-props` - Props carry content only.
* `cpt-template-site-blocks-fr-layout-only` - Stylesheets lay out only, exceptions listed.
* `cpt-template-site-blocks-fr-kit-built` - Parts come from the kit, the candidates and the brand.
* `cpt-template-site-blocks-principle-one-arrangement-one-block` - The design principle this decision sets.
* `cpt-template-site-blocks-principle-layout-only` - The stylesheet rule.
* `cpt-template-site-blocks-principle-ramp-overrides` - The display size rule.
