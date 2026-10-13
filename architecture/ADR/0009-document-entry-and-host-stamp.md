---
status: accepted
date: 2026-10-13
decision-makers: frontx-site maintainers
---

# Template-Delivered Document Stylesheets and the Host Theme Stamp

<!-- toc -->

- [Context and Problem Statement](#context-and-problem-statement)
- [Decision Drivers](#decision-drivers)
- [Considered Options](#considered-options)
- [Decision Outcome](#decision-outcome)
  - [Consequences](#consequences)
  - [Confirmation](#confirmation)
- [Pros and Cons of the Options](#pros-and-cons-of-the-options)
  - [A glob convention the shell owns](#a-glob-convention-the-shell-owns)
  - [A named import of the brand package](#a-named-import-of-the-brand-package)
  - [A shared file region the brand template writes into the shell](#a-shared-file-region-the-brand-template-writes-into-the-shell)
  - [Each screen guesses the appearance from the theme id](#each-screen-guesses-the-appearance-from-the-theme-id)
- [More Information](#more-information)
- [Traceability](#traceability)

<!-- /toc -->

**ID**: `cpt-site-adr-document-entry-and-host-stamp`

## Context and Problem Statement

The site's brand (token overrides on the UI kit, the brand tokens the kit lacks and the typeface) is delivered by a template package, template-site-brand's `@gears-frontx/site-brand`, and must reach the shell document and every screen. template-shell offers a template-agnostic convention only for development code (`src-app/verify_packages/*/src/dev-entry.ts`), and none for production document stylesheets. Separately, the mount manager gives a screen's shadow host no theme (its `setTheme` does nothing, G33): every screen anchors the kit's token sets on its own host from inside its shadow root, and the kit's dark fallback there follows the operating system, so a light site on a dark operating system shows dark popups and an unbranded host. How does a template's stylesheet reach the document without the shell naming the template, and how do a screen's host and the content it renders outside its themed frame take the site's theme?

## Decision Drivers

* **The shell stays template-shaped** - it names no template and no package, so it can be carried back into template-shell.
* **One copy of every brand value** - no screen imports the brand, and no value is copied into a screen or the shell.
* **Removable workaround** - the host fix copies no value and goes away as a whole when the upstream fix ships.
* **FrontX mechanics stay** - theme selection stays a shared property of the framework registry; mounting stays the screen domain's.

## Considered Options

* **A glob convention the shell owns** - every installed verify package may ship `src/document.css`, which the shell loads into the document in production and development; the shell stamps the active appearance on every screen host in its screen slot.
* **A named import of the brand package** - `main.tsx` imports `@gears-frontx/site-brand/document.css`.
* **A shared file region the brand template writes into the shell** - the brand template claims a region of a shell file through the manifest's shared files.
* **Each screen guesses the appearance from the theme id** - for the host theme, every screen keeps reading the theme id and decides its host's appearance itself.

## Decision Outcome

Chosen option: "A glob convention the shell owns", because it mirrors template-shell's existing development-entry convention, names no template, and a project without such a package loads nothing.

**The document entry.** `site/src-app/app/documentEntries.ts` holds one eager glob over `../verify_packages/*/src/document.css`; `main.tsx` imports it between the kit's `theme.css` and the document styles, so a delivered stylesheet keeps its place in the cascade. The document's sheets reach every shadow root through the head styles the React lifecycle adopts.

**The host theme stamp.** `site/src-app/app/mfe/hostTheme.ts` sets the theme registry's current appearance as `data-theme` on every child of the screen slot that has a shadow root, on start, on each host added and on every theme change, and returns a disposer. `MfeScreenContainer.tsx` starts it through `ExtensionDomainSlot`'s `onAttached` and releases it on `onDetached` and before a new attach. The document's own `[data-theme]` rules then match the host from the outer tree and outrank the host's `:host(...)` rules, so the host and everything a screen renders outside its themed frame take the site's appearance and brand.

### Consequences

* Good, because the shell names no template, and the brand exists once, in template-site-brand.
* Good, because the operating system's colour scheme does not reach the light screens of any template.
* Good, because other templates deliver document stylesheets the same way: template-site-blocks' entry carries the page layout tokens the blocks and the shell chrome share.
* Bad, because the convention and the stamp are site changes to template-shell, recorded in the shell change ledger, and template-shell has no such convention for production stylesheets (G52).
* Bad, because the kit's paint rule for `[data-theme]` also paints the host: its background equals the page under it and its font is `--font-sans`.
* Bad, because only the hosts in the screen slot are stamped: a widget host nested inside a screen keeps its lifecycle's base resets, so those resets read the theme's `--font-sans` in the site's copy of `@gears-frontx/react` (G54).
* The stamp is deleted with its `onAttached` wiring when the mfes release the site pins stamps the appearance on the host itself; the brand overrides move into the light theme's variables when the framework's theme variables outrank the kit's per-scope blocks (G33).

### Confirmation

`site/src-app/app/mfe/hostTheme.test.ts` and `site/src-app/app/mfe/MfeScreenContainer.test.tsx` cover the stamp and its wiring; `npm run shell:changes -- --check` lists both files; the browser check measures the host's and the themed frame's `--background`, `--foreground` and `--primary` and one popup per screen in the light and dark site under the light and dark operating-system colour scheme.

## Pros and Cons of the Options

### A glob convention the shell owns

* Good, because it names no template and follows the shape of template-shell's development-entry convention.
* Good, because a project without a delivered stylesheet loads nothing.
* Bad, because the cascade place of every delivered stylesheet is the same; a package cannot choose another.

### A named import of the brand package

* Good, because it is one explicit line.
* Bad, because the shell then names a template package and cannot be carried back into template-shell unchanged.

### A shared file region the brand template writes into the shell

* Good, because the manifest declares the change.
* Bad, because the site's templates claim no shared files (section 4.2.1 of the DESIGN), and a region in a shell file couples the template to that file's shape.

### Each screen guesses the appearance from the theme id

* Good, because the shell stays as it is.
* Bad, because every template repeats the guess, and the host's own `:host` fallback still follows the operating system wherever a screen does not.

## More Information

The decision is revisited when template-shell gains a convention for template-delivered document stylesheets, or when the mount manager passes the theme to a screen's host.

Applicability of the remaining checklist categories: **PERF** - addressed: one stylesheet per delivered package, loaded once. **SEC** - Not applicable. **REL** - addressed: the stamp follows every theme change and is released on detach. **DATA** - Not applicable. **INT** - addressed: the convention is the contract between the shell and a template's non-screen package. **OPS** - Not applicable. **MAINT** - addressed: one workaround file, removable as a whole. **TEST** - addressed: unit tests and a browser check. **COMPL** - Not applicable. **UX** - addressed: popups and hosts follow the site's theme. **BIZ** - Not applicable.

## Traceability

- **PRD**: [PRD.md](../PRD.md)
- **DESIGN**: [DESIGN.md](../DESIGN.md)

This decision directly addresses the following requirements and design elements:

* `cpt-site-fr-screen-pages` - Every screen renders in the site's brand and theme, the host and its popups included.
* `cpt-site-nfr-styling` - Brand values live once, as kit token overrides, delivered to the document.
* `cpt-site-principle-shell-as-is` - The shell names no template, and its changes stay template-shaped and listed in the ledger.
* `cpt-site-component-shell-layout` - The document entry and the host stamp belong to the shell layout.
