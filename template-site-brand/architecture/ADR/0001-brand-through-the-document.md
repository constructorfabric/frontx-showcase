---
status: accepted
date: 2026-10-13
---

# Brand Values Are Overrides of Kit Tokens, Delivered Through the Document Until the Theme Registry Carries Them

<!-- toc -->

- [Context and Problem Statement](#context-and-problem-statement)
- [Decision Drivers](#decision-drivers)
- [Considered Options](#considered-options)
- [Decision Outcome](#decision-outcome)
  - [Consequences](#consequences)
  - [Confirmation](#confirmation)
- [Pros and Cons of the Options](#pros-and-cons-of-the-options)
  - [Theme registry variables](#theme-registry-variables)
  - [A brand copy in every screen package](#a-brand-copy-in-every-screen-package)
  - [A document stylesheet generated from one record](#a-document-stylesheet-generated-from-one-record)
- [More Information](#more-information)
- [Traceability](#traceability)

<!-- /toc -->

**ID**: `cpt-template-site-brand-adr-brand-through-document`

## Context and Problem Statement

The UI kit is branded by overriding its tokens on the consumer side. The design guardrails' theme model registers a brand as a theme's variables, which the shell applies to the document and passes to screens. Measured on the site, those variables are written on the document root only: every element carrying `data-theme` re-declares the kit palette over them, and the screens' shadow roots receive an empty copy. Screens of every template render inside shadow roots and anchor the kit palette on their shadow host. How does the brand reach the document and every screen, from one source?

## Decision Drivers

* **One source** - every brand value written once.
* **Every screen of every template** - the brand reaches screens the site does not own, with no import in them.
* **Outrank the kit per scope** - a themed frame re-declares the kit light palette; the brand must win there.
* **Ready for the registry** - when the registry reaches every scope, the move must not need new authoring.

## Considered Options

* **Theme registry variables** - put the brand in the light theme's variables.
* **A brand copy in every screen package** - each screen appends the brand to its anchored kit sheet.
* **A document stylesheet generated from one record** - generate a stylesheet the shell loads into its document, whose light selector outranks the kit light block, and generate the registry-shaped variables beside it.

## Decision Outcome

Chosen option: "A document stylesheet generated from one record", because it is the only option that reaches every screen from one source today, and it produces the registry form from the same record.

The record holds brand overrides of kit tokens (light only) and brand tokens the kit lacks. The generated stylesheet declares the light values under `:root:not([data-theme='dark'])` and `[data-theme='light']:not([data-theme='dark'])`, two attribute conditions that outrank the kit's single-attribute light block on any themed scope whatever the sheet order, and the brand's dark resets on every dark scope. The shell loads it through its document entry; the shell's style adoption copies it into each screen's shadow root, and the shell's appearance stamp on each shadow host lets the document's light block match the host from the outer tree. The generated theme variables (kit palette with the brand applied, per appearance) wait unregistered until the registry reaches every scope.

### Consequences

* Good, because no screen package carries or imports a brand copy.
* Good, because a brand change is one record edit and one generation.
* Good, because the registry move is a switch, not a rewrite.
* Bad, because the brand depends on the shell's document-entry convention, the style adoption and the host stamp, all site-side today.
* Bad, because the doubled selector is a specificity device, not a contract of the kit.

### Confirmation

The brand check regenerates both files and compares, and holds every override against the installed kit's names. The site's measurements after the move equal the measurements before it.

## Pros and Cons of the Options

### Theme registry variables

* Good, because it is the theme model the design guardrails describe.
* Bad, because the variables lose to the kit palette on every themed scope and do not reach shadow roots today.

### A brand copy in every screen package

* Good, because each screen carries what it renders with.
* Bad, because only the site's own screens would carry it; other templates' screens would not, and copies drift.

### A document stylesheet generated from one record

* Good, because one source reaches every screen.
* Bad, because it relies on three shell behaviours outside this template.

## More Information

The removal condition: when the MFE runtime stamps the appearance on shadow hosts and the registry writes variables that outrank the kit on every scope of that appearance, the light overrides move into the light theme's variables from the theme module and the stylesheet keeps the brand tokens only.

Applicability of the remaining checklist categories: **PERF** - addressed: one small stylesheet in the document. **SEC** - Not applicable. **REL** - addressed: the check holds the names against the kit. **DATA** - Not applicable. **INT** - addressed: the shell's entry convention and adoption. **OPS** - Not applicable. **MAINT** - addressed: one record. **TEST** - addressed by the package tests and the check. **COMPL** - Not applicable. **UX** - addressed: contrast held. **BIZ** - Not applicable.

## Traceability

- **PRD**: [PRD.md](../PRD.md)
- **DESIGN**: [DESIGN.md](../DESIGN.md)

This decision directly addresses the following requirements and design elements:

* `cpt-template-site-brand-fr-one-record` - One source of brand values.
* `cpt-template-site-brand-fr-document-delivery` - Delivery through the document.
* `cpt-template-site-brand-fr-theme-variables` - The registry form beside the stylesheet.
* `cpt-template-site-brand-constraint-registry-reach` - The constraint this decision answers.
* `cpt-template-site-brand-component-token-stylesheet` - The component that carries the selector.
