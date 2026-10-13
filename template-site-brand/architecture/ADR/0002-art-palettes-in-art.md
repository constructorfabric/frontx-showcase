---
status: accepted
date: 2026-10-13
---

# Art Palettes Live in the Art Components That Draw Them, Not in the Brand Record

<!-- toc -->

- [Context and Problem Statement](#context-and-problem-statement)
- [Decision Drivers](#decision-drivers)
- [Considered Options](#considered-options)
- [Decision Outcome](#decision-outcome)
  - [Consequences](#consequences)
  - [Confirmation](#confirmation)
- [Pros and Cons of the Options](#pros-and-cons-of-the-options)
  - [Every art colour in the brand record](#every-art-colour-in-the-brand-record)
  - [Art palettes declared at the top of each art component](#art-palettes-declared-at-the-top-of-each-art-component)
- [More Information](#more-information)
- [Traceability](#traceability)

<!-- /toc -->

**ID**: `cpt-template-site-brand-adr-art-palettes-in-art`

## Context and Problem Statement

The site's illustrations (the hero drawing, the architecture map, the change-story workbench, the template art, the hairline figures) use some sixty colours of their own, many of them near-duplicates inside one drawing. The design reference scopes such palettes to the figure that draws them. Where do these colours live?

## Decision Drivers

* **The record stays about the brand** - tokens other parts of the site read.
* **No hex literal in blocks** - colours come from tokens, a declared palette or nothing.
* **A drawing is edited as a whole** - its palette changes with its shapes.

## Considered Options

* **Every art colour in the brand record** - one row per art colour.
* **Art palettes declared at the top of each art component** - custom properties local to the drawing.

## Decision Outcome

Chosen option: "Art palettes declared at the top of each art component", because an art colour is read by one drawing only, and the design reference scopes it the same way.

Each art component of this package declares its palette as custom properties at the top of its stylesheet, merging near-duplicates; its shapes read only that palette and brand tokens. The brand record holds no art colour, and the repository's style policy allows a hex literal only in the record, an art palette or a mask stop.

### Consequences

* Good, because the record lists what the site shares, and the check's use rule stays meaningful.
* Good, because a drawing changes in one file.
* Bad, because the contrast rule does not cover art palettes; art carries no running text.

### Confirmation

The repository's style policy fails on a hex literal outside the record, an art palette or a mask stop.

## Pros and Cons of the Options

### Every art colour in the brand record

* Good, because every colour is in one file.
* Bad, because sixty single-use rows bury the brand, and every drawing edit touches the record.

### Art palettes declared at the top of each art component

* Good, because a palette sits with the shapes that use it.
* Bad, because palettes are not generated or contrast-checked.

## More Information

Applicability of the remaining checklist categories: **PERF** - Not applicable. **SEC** - Not applicable. **REL** - Not applicable. **DATA** - Not applicable. **INT** - Not applicable. **OPS** - Not applicable. **MAINT** - addressed: one file per drawing. **TEST** - addressed by the style policy. **COMPL** - Not applicable. **UX** - addressed: drawings keep their colours. **BIZ** - Not applicable.

## Traceability

- **PRD**: [PRD.md](../PRD.md)
- **DESIGN**: [DESIGN.md](../DESIGN.md)

This decision directly addresses the following requirements and design elements:

* `cpt-template-site-brand-fr-one-record` - What the record holds and what it leaves to art.
* `cpt-template-site-brand-principle-kit-first` - Art palettes are the last layer.
