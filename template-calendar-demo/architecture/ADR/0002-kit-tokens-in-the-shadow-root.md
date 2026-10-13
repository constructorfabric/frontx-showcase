---
status: accepted
date: 2026-10-12
---

# The Calendar Screen Carries the UI Kit's Tokens in Its Own Shadow Root, Anchored on the Shadow Host

<!-- toc -->

- [Context and Problem Statement](#context-and-problem-statement)
- [Decision Drivers](#decision-drivers)
- [Considered Options](#considered-options)
- [Decision Outcome](#decision-outcome)
  - [Consequences](#consequences)
  - [Confirmation](#confirmation)
- [Pros and Cons of the Options](#pros-and-cons-of-the-options)
  - [Load the kit's tokens into the host document](#load-the-kits-tokens-into-the-host-document)
  - [Rely on the shell's palette](#rely-on-the-shells-palette)
  - [Anchor the kit's tokens on the shadow host](#anchor-the-kits-tokens-on-the-shadow-host)
- [More Information](#more-information)
- [Traceability](#traceability)

<!-- /toc -->

**ID**: `cpt-template-calendar-demo-adr-kit-tokens-in-shadow-root`

## Context and Problem Statement

The host shell mounts the calendar screen inside a shadow root it keeps across mounts. The screen's pages are built from the UI kit, whose design tokens are declared on the document's `:root`; `:root` matches nothing inside a shadow tree, so a kit component there paints from unresolved token references. The shell declares its own palette under some of the same token names on its document, and the shadow host inherits those values. How do the kit's tokens reach the calendar screen's kit components?

## Decision Drivers

* **Kit components need the kit's values** - every token a kit component reads must resolve inside the shadow root, in the kit's light or dark scope.
* **The shell owns its document** - the screen cannot change which stylesheets the shell's document carries, and cannot assume which shell build hosts it.
* **Isolation across remounts** - the shell keeps the shadow root across mounts, so what the screen adds must not accumulate.
* **The package moves alone** - the mechanism has to live inside the package; it imports nothing from a sibling package or another template.

## Considered Options

* **Load the kit's tokens into the host document** - the screen adds the kit's stylesheet to the shell's document.
* **Rely on the shell's palette** - the screen carries no kit tokens; kit components read the shell's values for the same names.
* **Anchor the kit's tokens on the shadow host** - the lifecycle rewrites the kit's `:root` selectors to the shadow host and puts them into the screen's shadow root in one style node.

## Decision Outcome

Chosen option: "Anchor the kit's tokens on the shadow host", because it is the only option that gives the kit components the kit's values in any shell while leaving the shell's document untouched.

The lifecycle adds the kit's token stylesheet, rewritten so that `:root` names the shadow host (with the functional `:host(...)` form wherever the kit's selector carries a compound tail, so the kit's dark-scheme block still matches), into one marked style node, replacing that node's text on every mount instead of adding another. The screen frame selects the kit's light or dark scope from the shell's shared theme, mapping an enumerated set of dark shell themes to the dark scope and every other theme to the light one, and sets the scope and the text direction on the shadow host too, so the kit's overlays that open at the shadow root's top level resolve the same tokens.

### Consequences

* Good, because the kit components resolve every token in any shell, whatever the shell's own stylesheet carries.
* Good, because the shell's document and palette stay the shell's.
* Good, because a remount leaves exactly one token node in the shadow root.
* Bad, because the selector rewrite is textual, not a parse: a `:root` inside a quoted value or a feature query of the kit's stylesheet would be rewritten too; the pinned kit stylesheet contains neither, and a kit that does needs a CSS parser here.
* Bad, because the kit has two scopes and the shell has more themes: a dark shell theme renders the screen in the kit's dark greys, and a new dark shell theme must be added to the package's list of dark themes.
* Bad, because the same modules are copies in other kit-styled screen packages, so a fix is made in each copy.

### Confirmation

The package's tests hold the rewrite (bare `:root`, the compound-tail form, the pseudo-element case, idempotence), check that every `:root` of the pinned kit stylesheet stands in selector position and pin their count, and hold the light or dark scope chosen for each shell theme, including the light fallback for an unknown identifier. The lifecycle test holds the single token node across mounts.

## Pros and Cons of the Options

### Load the kit's tokens into the host document

* Good, because no selector rewrite is needed.
* Bad, because the screen changes the shell's document, and the kit's values would override the shell's palette for the whole page.
* Bad, because the stylesheet still does not reach inside the shadow root through `:root`.

### Rely on the shell's palette

* Good, because the screen carries no style beyond its screen frame's CSS Module.
* Bad, because a token the kit reads and the shell does not declare stays unresolved, and the look depends on which shell build hosts the screen.

### Anchor the kit's tokens on the shadow host

* Good, because the screen carries exactly what it renders with.
* Bad, because it needs a selector rewrite and a list of the shell's dark themes.

## More Information

The modules are the lifecycle, the shadow-host anchoring of the kit's stylesheet, the theme-to-scope mapping and the screen frame, all inside the package. template-mfe's packages carry the same approach.

Applicability of the remaining checklist categories: **PERF** - addressed: the rewrite runs once per module load, and a remount replaces one node's text. **SEC** - Not applicable. **REL** - addressed: no token stays unresolved. **DATA** - Not applicable. **INT** - addressed: the shell's shared theme selects the kit's scope; the shell's document is not changed. **OPS** - Not applicable. **MAINT** - addressed: the dark themes are listed in one place. **TEST** - addressed by the tests above. **COMPL** - Not applicable. **UX** - addressed: the screen follows the shell's light or dark theme. **BIZ** - Not applicable.

## Traceability

- **PRD**: [PRD.md](../PRD.md)
- **DESIGN**: [DESIGN.md](../DESIGN.md)

This decision directly addresses the following requirements and design elements:

* `cpt-template-calendar-demo-fr-host-theme-direction` - The screen follows the shell's theme, its overlays included.
* `cpt-template-calendar-demo-nfr-kit-consistent-look` - The kit's tokens govern the screen's look.
* `cpt-template-calendar-demo-constraint-shadow-root` - The constraint this decision answers.
* `cpt-template-calendar-demo-component-kit-token-anchoring` - The component that carries the rewrite.
