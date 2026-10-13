---
status: accepted
date: 2026-10-13
---

# Every Screen Carries the Kit's Tokens in Its Own Shadow Root; Widgets Inherit Them from Their Host Screen

<!-- toc -->

- [Context and Problem Statement](#context-and-problem-statement)
- [Decision Drivers](#decision-drivers)
- [Considered Options](#considered-options)
- [Decision Outcome](#decision-outcome)
  - [Consequences](#consequences)
  - [Confirmation](#confirmation)
- [Pros and Cons of the Options](#pros-and-cons-of-the-options)
  - [Load the kit's tokens into the host document](#load-the-kits-tokens-into-the-host-document)
  - [Rely on the shell's palette for every screen](#rely-on-the-shells-palette-for-every-screen)
  - [Anchor the kit's tokens only on the screens that once drew from the kit](#anchor-the-kits-tokens-only-on-the-screens-that-once-drew-from-the-kit)
  - [Anchor the kit's tokens on every screen entry; widgets inherit them](#anchor-the-kits-tokens-on-every-screen-entry-widgets-inherit-them)
- [More Information](#more-information)
- [Traceability](#traceability)

<!-- /toc -->

**ID**: `cpt-template-mfe-demo-adr-kit-tokens-in-shadow-root`

## Context and Problem Statement

Every screen of the demo renders inside a Shadow DOM, and every screen and widget is built from the FrontX UI kit, the kit candidates and the package's blocks. The kit declares its design tokens on the document's `:root`, which matches nothing inside a shadow tree, so a kit component there paints from unresolved token references unless the tokens reach its shadow root. The shell declares its own palette under the same token names on its document, and a shadow host inherits those values. The widgets render inside the nested widgets screen's shadow tree, and the `widgets` domain shares no theme property with them. How do the kit's tokens reach every screen and widget, in the scope that matches the shell's theme?

## Decision Drivers

* **Kit components need the kit's values** - a kit component inside a shadow root must resolve every token it reads, in the kit's light or dark scope.
* **The shell owns its document** - the shell decides which stylesheets and token values its document carries, and a screen cannot assume which shell build hosts it.
* **The theme reaches screens, not widgets** - the screen domain shares the theme with every screen entry that requires it; the `widgets` domain shares none, so a widget cannot select a scope of its own.
* **Isolation across remounts** - the shell keeps a screen's shadow root across mounts, so whatever a screen adds must not accumulate.
* **No shared code between packages** - an MFE package never imports from a sibling package, so the mechanism lives in the package that uses it.

## Considered Options

* **Load the kit's tokens into the host document** - each screen adds the kit's stylesheet to the shell's document.
* **Rely on the shell's palette for every screen** - no screen carries the kit's tokens; kit components read the shell's values for the same names.
* **Anchor the kit's tokens only on the screens that once drew from the kit** - a lifecycle base anchors the tokens for the isolation and data loading screens, while the shared state and nested widgets screens paint from their own stylesheets on the shell's token names.
* **Anchor the kit's tokens on every screen entry; widgets inherit them** - every screen entry extends a lifecycle base that rewrites the kit's `:root` selectors to the shadow host and adds them to the shadow root in one style node; the widgets read the tokens the nested widgets screen's tree carries.

## Decision Outcome

Chosen option: "Anchor the kit's tokens on every screen entry; widgets inherit them", because every screen and widget is now drawn from kit components, and it is the only option that resolves their tokens in any host without a widget needing a theme it never receives.

Every screen entry extends a lifecycle base that adds the kit's tokens, rewritten so that `:root` names the shadow host (with a functional `:host(...)` form wherever the kit's selector carries a compound tail, so the kit's dark-scheme block still matches), into one style node in the shadow root, replacing that node's text on every mount. A screen that receives the shell's theme passes it to its screen frame, which sets the kit's `data-theme` scope, mapping the shell's dark themes to the dark scope and every other theme to the light one; the kit's rule for that scope also paints the frame's surface, text colour and typeface. The nested widgets screen receives no theme, so its frame takes the scope its shadow host carries. The widget packages extend the framework's theme-aware lifecycle directly and inherit the tokens declared on the nested widgets screen's host.

### Consequences

* Good, because kit components inside every screen and widget resolve every token in any shell, whatever the shell's own stylesheet carries.
* Good, because the shell's document stays the shell's, and a document stylesheet that overrides the kit's tokens for a scope (in the site, the brand) still reaches each shadow root through the framework's style adoption, so the shared state screen shows the palette the page's kit components are drawn in.
* Good, because a remount leaves exactly one token node in the shadow root.
* Bad, because the shared state screen shows the kit's palette with the document's overrides, not a shell theme's own values for tokens the kit declares: a shell theme that sets only its `ThemeConfig` variables is not shown unless its host also stamps the theme's appearance on the shadow host.
* Bad, because the nested widgets screen and the widgets follow the host's appearance only where the host sets it on the shadow host (in the site, the shell's host theme stamp); elsewhere they take the kit's default light scope or the visitor's dark colour-scheme preference.
* Bad, because the selector rewrite is textual, not a parse: a `:root` inside a quoted value of the kit's stylesheet would be rewritten too, which the kit's stylesheet does not contain today.
* Bad, because the kit has two scopes and the shell has more themes: a dark shell theme renders kit components in the kit's dark greys, and a new dark shell theme must be added to the package's list of dark themes.
* Bad, because template-mfe's blank scaffold carries a copy of the same modules, so a fix must be made in both places.

### Confirmation

The package's tests hold the rewrite (the bare `:root`, the compound-tail form and the dark-scheme block), the one token node after repeated mounts, the light or dark scope chosen for each shell theme, and that every screen entry extends the kit-themed lifecycle base (`lifecycle.test.tsx`, `lifecycle-widgets-host.test.tsx`). The site's browser check reads the token values on every host and frame of the demo screens in the light and dark themes. The template's AI guideline states the rule for later changes.

## Pros and Cons of the Options

### Load the kit's tokens into the host document

* Good, because no selector rewrite is needed.
* Bad, because the screen changes the shell's document, whose token declarations belong to the shell.
* Bad, because the stylesheet still would not reach inside a shadow root through `:root`.

### Rely on the shell's palette for every screen

* Good, because the screens carry no token node of their own.
* Bad, because a token the kit reads and the shell does not declare stays unresolved, and the result depends on which shell build hosts the screen.

### Anchor the kit's tokens only on the screens that once drew from the kit

* Good, because the shared state screen reads the shell's own values for every token name.
* Bad, because the shared state and nested widgets screens then need stylesheets of their own that repaint what kit components already draw, and their kit components would depend on the host for their tokens.

### Anchor the kit's tokens on every screen entry; widgets inherit them

* Good, because each screen carries exactly what it renders with, and the widgets need no theme.
* Neutral, because the nested widgets screen depends on its host for the appearance, as the widgets depend on it for their tokens.
* Bad, because it needs a selector rewrite and a list of the shell's dark themes.

## More Information

The modules are the package's kit-themed lifecycle base, the shadow-host anchoring of the kit's stylesheet and the theme-to-scope mapping, under `demo-mfe/src/shared/`, and the screen frame block under `demo-mfe/src/blocks/ScreenFrame/`; template-mfe carries the same anchoring, and this template adds the single token node per shadow root across remounts. The rule for later changes is stated in the template's AI guideline (`mfe-demo-contract`, section Styling).

Applicability of the remaining checklist categories: **PERF** - addressed: the rewrite runs once per module load, and a remount replaces one node's text. **SEC** - Not applicable. **REL** - addressed: no token stays unresolved in a screen or a widget. **DATA** - Not applicable. **INT** - addressed: the shell's shared theme selects the kit's scope; the shell's document is not changed. **OPS** - Not applicable. **MAINT** - addressed: the list of dark themes is one place, and the duplicated modules in template-mfe's scaffold are named in the code. **TEST** - addressed by the tests above. **COMPL** - Not applicable. **UX** - addressed: every screen follows the shell's light or dark theme. **BIZ** - Not applicable.

## Traceability

- **PRD**: [PRD.md](../PRD.md)
- **DESIGN**: [DESIGN.md](../DESIGN.md)

This decision directly addresses the following requirements and design elements:

* `cpt-template-mfe-demo-fr-kit-built-screens` - Kit components render styled with the kit's tokens inside every screen and widget.
* `cpt-template-mfe-demo-fr-shared-state-screen` - The shared state screen shows the palette its kit components are drawn in.
* `cpt-template-mfe-demo-nfr-runtime-isolation` - One token node per shadow root, and the shell's document is not changed.
* `cpt-template-mfe-demo-principle-kit-tokens-in-shadow-root` - The design principle this decision sets.
