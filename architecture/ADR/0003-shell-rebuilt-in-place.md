---
status: accepted
date: 2026-10-12
decision-makers: frontx-site maintainers
---

# Rebuild the Applied Shell in Place on React and the UI Kit, with a Ledger of Changed Files

<!-- toc -->

- [Context and Problem Statement](#context-and-problem-statement)
- [Decision Drivers](#decision-drivers)
- [Considered Options](#considered-options)
- [Decision Outcome](#decision-outcome)
  - [Consequences](#consequences)
  - [Confirmation](#confirmation)
- [Pros and Cons of the Options](#pros-and-cons-of-the-options)
  - [Rebuild the shell in place with a ledger](#rebuild-the-shell-in-place-with-a-ledger)
  - [Keep the shell as it ships and style only the screens](#keep-the-shell-as-it-ships-and-style-only-the-screens)
  - [Fork the shell into a template of this repository](#fork-the-shell-into-a-template-of-this-repository)
  - [Change template-shell upstream first](#change-template-shell-upstream-first)
- [More Information](#more-information)
- [Traceability](#traceability)

<!-- /toc -->

**ID**: `cpt-site-adr-shell-rebuilt-in-place`

## Context and Problem Statement

The site's host is template-shell, applied into `site/` by the FrontX CLI from gears-frontx-templates at a pinned commit and recorded in `site/.frontx/provenance.json`. As it ships, the shell styles its layout with Tailwind utility classes and a Tailwind palette, renders its menu entries as buttons without an `href`, has no navigation landmark, renders a visually hidden heading of its own, has no default screen for the bare address and no state for a screen that fails to load. The site needs one look across the shell and its screens on `@gears-frontx/ui-kit`, real links, a single `<h1>` per page owned by the screen, a home screen at the bare address, and no Tailwind in code it owns. Where do these shell changes live, and how does the repository keep track of how far its shell is from the template it was applied from?

## Decision Drivers

* **Every FrontX mechanic stays as shipped** - the screen domain and its mount strategy, MFE loading and Shadow DOM isolation, the framework router and query addressing, the theme and language shared properties, provenance and the compose step must keep working as template-shell defines them.
* **Styling rule** - code the site owns, the shell files it changed included, styles with ui-kit components first and CSS Modules on the kit's tokens, with no Tailwind anywhere in the shell's build.
* **Semantics** - one `<h1>` per page, headed sections and real links, so pages are crawlable and accessible.
* **Upstream carry** - the changes are a candidate for template-shell itself; whoever carries them upstream needs the exact list of changed, added and removed files against the pinned template.
* **Upgrade stays possible** - a later template-shell release has to be comparable with what the site changed.

## Considered Options

* **Rebuild the shell in place with a ledger** - change the applied files under `site/` directly, keep them template-shaped, and record every file changed, added or removed against template-shell at the pinned commit in a repository script that CI checks against the pristine template.
* **Keep the shell as it ships and style only the screens** - leave every shell file untouched and accept the shell's layout, palette and markup.
* **Fork the shell into a template of this repository** - copy template-shell into a site-owned template and apply that instead of the official one.
* **Change template-shell upstream first** - make the changes in gears-frontx-templates, wait for a release and apply it.

## Decision Outcome

Chosen option: "Rebuild the shell in place with a ledger", because it delivers the site's look, semantics and styling rule now, keeps every FrontX mechanic and the official provenance, and leaves an exact, checked list of changes for the upstream carry.

**The applied shell is rebuilt on React and `@gears-frontx/ui-kit` where it stands, in `site/`.** The layout, navigation, screen container, themes and the host page are changed or added; Tailwind's config, PostCSS config, palettes and the primitives that used them are removed. Every change stays template-shaped, so it can be carried into template-shell file by file. Every other shell file stays as it ships, and the FrontX mechanics listed above are not changed.

**`scripts/shell-changes.mjs` is the ledger.** It lists every file under `site/` the site changed, added or removed against template-shell at the source-spec the provenance records. `npm run shell:changes -- --check` compares the list with the pristine template in the FrontX CLI inventory and fails on any difference, in either direction. The list also scopes the repository policies: a changed or added shell file is site-owned code, so the text and styling policies cover it, while unchanged shell files stay out of their scope as they ship, apart from the long-dash adaptation the ledger holds in every applied text file, so the long-dash rule covers every file.

The scope of this decision is where the shell's changes live and how they are tracked. Which behaviour the rebuilt shell has (header, navigation, home at the bare address, load-failure state) is design and feature detail; the static deploy behaviour is [0005](./0005-static-deploy-layout.md).

### Consequences

* Good, because the site renders one look on the kit's tokens across the shell and every screen, with no Tailwind in its build.
* Good, because every FrontX mechanic and the CLI's provenance record stay intact, so the site remains an ordinary seeded FrontX project.
* Good, because the ledger gives the upstream carry and every upgrade an exact, CI-checked file list.
* Good, because the policies know which shell files the site owns, so unchanged files keep matching the official template byte for byte.
* Bad, because a template-shell upgrade becomes a manual merge over the listed files; `frontx upgrade` cannot do it alone.
* Bad, because the site carries a working shell that differs from the published one until the changes land upstream, and a project seeded from the official template does not get them.
* Bad, because a shell file that carried residue markers from gears-frontx's archived generation must have them removed when it changes, which widens some diffs against the pristine file.

### Confirmation

`npm run shell:changes -- --check` runs in CI and fails when the recorded list and the actual differences against the pristine template disagree. `npm run policy:own-styles` and `npm run policy:text` cover every changed and added file of the list. The layout, navigation and screen container suites in `site/src-app/app/` hold the rebuilt behaviour. Review confirms that no FrontX mechanic is replaced by site code.

## Pros and Cons of the Options

### Rebuild the shell in place with a ledger

* Good, because the change is immediate and keeps the official provenance.
* Good, because the list of changes is exact and checked.
* Bad, because upgrades of template-shell are manual merges over the listed files.

### Keep the shell as it ships and style only the screens

* Good, because the shell stays byte-identical to the official template and upgrades stay automatic.
* Bad, because the header, menu and frame keep Tailwind classes and the shell's palette, so the site has two looks and Tailwind in its build, against the styling rule.
* Bad, because menu entries without `href`, no navigation landmark and the shell's own hidden heading break the semantics requirement and crawlability.
* Bad, because the bare address renders nothing: template-shell has no default-screen setting.

### Fork the shell into a template of this repository

* Good, because the shell's changes would live in a template with a manifest and their own history.
* Bad, because the site would no longer run on the official template-shell: provenance, upgrade and every FrontX mechanic would be this repository's copy to maintain.
* Bad, because the upstream carry would have to diff a whole fork against template-shell instead of reading a list.

### Change template-shell upstream first

* Good, because every FrontX project would get the changes and the site would stay on an unmodified shell.
* Bad, because the site's look and semantics would wait for a review and a release in another repository, with no working version to show.
* Neutral, because the in-place rebuild is the working version that such an upstream change would start from.

## More Information

The decision is revisited when template-shell ships a kit-based layout, link semantics and a default-screen setting: the ledger then shrinks to what remains site-specific, and an empty ledger means the in-place rebuild is retired. The gaps the rebuild works around are listed in the repository's known-gaps list, [GAPS.md](../GAPS.md) (grouping, default screen, studio overlay styling, font registration).

Applicability of the remaining checklist categories: **PERF** - Not applicable, because the rebuild changes markup and styles, not loading. **SEC** - Not applicable. **REL** - addressed: the FrontX mechanics stay as shipped. **DATA** - Not applicable. **INT** - addressed: the integration contract with template-shell is the provenance source-spec plus the ledger. **OPS** - addressed: CI checks the ledger. **MAINT** - addressed: the ledger bounds what an upgrade must merge. **TEST** - addressed: the changed layout files carry their own tests. **COMPL** - Not applicable. **UX** - addressed: one look, real links, a skip link and a load-failure state. **BIZ** - Not applicable.

## Traceability

- **PRD**: [PRD.md](../PRD.md)
- **DESIGN**: [DESIGN.md](../DESIGN.md)

This decision directly addresses the following requirements and design elements:

* `cpt-site-nfr-styling` - The rebuilt shell styles with the kit and CSS Modules and carries no Tailwind.
* `cpt-site-nfr-semantics` - The rebuilt layout renders landmarks and real links and leaves the page's one `<h1>` to the screen.
* `cpt-site-fr-site-navigation` - The rebuilt header builds its navigation from the registered screens and opens the home screen at the bare address.
* `cpt-site-contract-official-templates` - template-shell stays applied by the CLI with its provenance; only the listed files differ.
* `cpt-site-principle-shell-as-is` - Every shell file outside the ledger stays as it ships.
* `cpt-site-component-shell-layout` - The layout and screen container this decision places in `site/`.
* `cpt-site-component-guards` - The ledger and the policies it scopes.
