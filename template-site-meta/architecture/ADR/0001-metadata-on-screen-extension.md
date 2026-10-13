---
status: accepted
date: 2026-10-12
---

# Page Metadata Is Declared on the Screen Extension's seo Block

<!-- toc -->

- [Context and Problem Statement](#context-and-problem-statement)
- [Decision Drivers](#decision-drivers)
- [Considered Options](#considered-options)
- [Decision Outcome](#decision-outcome)
  - [Consequences](#consequences)
  - [Confirmation](#confirmation)
- [Pros and Cons of the Options](#pros-and-cons-of-the-options)
  - [A seo block on the screen extension in the package manifest](#a-seo-block-on-the-screen-extension-in-the-package-manifest)
  - [A central page list in the site configuration](#a-central-page-list-in-the-site-configuration)
  - [Screens write the head at run time](#screens-write-the-head-at-run-time)
  - [Metadata exported from each screen's route tree code](#metadata-exported-from-each-screens-route-tree-code)
- [More Information](#more-information)
- [Traceability](#traceability)

<!-- /toc -->

**ID**: `cpt-template-site-meta-adr-metadata-on-screen-extension`

## Context and Problem Statement

Every page of a FrontX site needs a title, a description, an indexability flag and share data, and several consumers read them: the generator writes them into the built document, the sitemap, `llms.txt`, the page map manifest and the twins at build time, and head-sync applies them in the browser on every navigation. A page is either a screen's root or a route inside a screen, and screens are microfrontends contributed by independent templates, registered on the shell's screen domain from their package manifests. Where does a page's metadata live, so that every consumer reads one declaration and the declaration moves with the screen it describes?

## Decision Drivers

* **One declaration per page** - the head, the discovery files and the twins must not disagree, so all of them derive from one value per page.
* **Readable at build time without running screen code** - the generator runs in Node after the build and must read every page's metadata without loading, bundling or executing a screen.
* **Moves with the screen** - a screen comes from a template that a project copies; its pages' metadata must arrive with it and leave with it, with no central list to edit.
* **No new registration channel** - the shell already reads each screen's package manifest to register it; a second file per screen or a second registry is another thing to keep in step.
* **Checkable** - the rules (a title and a description on every screen, unique titles and canonical addresses) need every page's metadata in one readable form.

## Considered Options

* **A seo block on the screen extension in the package manifest** - each screen extension carries an extra `seo` field with its root's metadata and a map of routes inside the screen with theirs; site-level values live in one site configuration.
* **A central page list in the site configuration** - one site-level file lists every page with its metadata, keyed by screen token and route.
* **Screens write the head at run time** - each screen sets the document title and head tags when it mounts or changes route, as React head libraries do.
* **Metadata exported from each screen's route tree code** - each route in the screen's TypeScript route tree carries its metadata, and the generator imports the route trees.

## Decision Outcome

Chosen option: "A seo block on the screen extension in the package manifest", because it is the only option that keeps one declaration per page next to the screen's registration, readable as data at build time, and moving with the screen's template.

**A page's metadata is declared once, in the `seo` block of its screen extension** in the screen package's manifest: `title`, `description`, `indexable` and `ogImage` for the screen's root, and `routes` keyed by the path inside the screen for each further page, where a path with a parameter segment declares a pattern page. A route without a share image takes its screen's, a page without a title takes its screen's menu label and one without a description the site's default description, from the site configuration, which holds the site-level values (origin, site name, title template, default description, language, home screen, share image and its alternative text, card type, colours). **A screen never writes the document title or a head tag.** The generator, the checks and the page map head-sync reads are all derived from these two sources.

### Consequences

* Good, because a screen template that is copied into a project brings its pages' metadata with it, and removing the screen removes them; no central list goes stale.
* Good, because the generator reads plain JSON from the composed packages with the shell's own scanner rules, without running a screen.
* Good, because every rule is a check over one data set, and drift between outputs and declarations is detectable.
* Bad, because the block is an extra field on the shell's screen extension schema; it relies on that schema staying open and passing the field through registration unchanged.
* Bad, because a screen's route tree in code and the `routes` keys in its manifest are two lists of the same paths; each screen package's own manifest test holds them equal, outside this template.

### Confirmation

The check fails when a composed screen extension has no `seo` block, when a screen or an indexable static route lacks a title or a description, when a route key is not a path inside the screen, or when two pages share a title or a canonical address. Review confirms that no screen sets the document title or a head tag, and that the generator reads metadata only from the screen manifests and the site configuration.

## Pros and Cons of the Options

### A seo block on the screen extension in the package manifest

* Good, because the declaration sits beside the screen's registration (route token, label, order) that the shell already reads.
* Good, because it is data, readable at build time in Node.
* Good, because it moves with the screen's template.
* Neutral, because a site-level configuration is still needed for values no screen owns.
* Bad, because it depends on the shell's open screen extension schema.

### A central page list in the site configuration

* Good, because all metadata is in one file, easy to review.
* Bad, because the list names screens and routes the site configuration does not own; adding, removing or moving a screen template requires editing it, and a forgotten edit leaves pages without metadata or metadata for pages that do not exist.
* Bad, because a template copied into another project arrives without its pages' metadata.

### Screens write the head at run time

* Good, because a screen can compute metadata from its own state.
* Bad, because nothing exists at build time: the sitemap, `llms.txt`, the page map manifest and the twins would need every screen to be run.
* Bad, because several writers share one document head: every screen and the shell, with no owner of the fallback for an address that names no page.
* Bad, because a screen's head writes happen only after its bundle loaded and mounted, later than an inline script in the built document.

### Metadata exported from each screen's route tree code

* Good, because the route tree and the metadata cannot list different paths.
* Bad, because the generator would have to import or bundle every screen's TypeScript and its dependencies to read data.
* Bad, because route trees are internal to each screen, while the manifest is the screen's published contract with the shell.

## More Information

The screen extension, its domain and the package manifest are defined by template-shell and the FrontX runtime; the URL grammar the canonical addresses are written in is defined by `@gears-frontx/routing`. The rules and outputs derived from the block are described in this template's [DESIGN](../DESIGN.md).

Applicability of the remaining checklist categories: **PERF** - Not applicable, because the decision fixes where data lives, not how fast it is read. **SEC** - Not applicable, because the metadata is public by purpose. **REL** - Not applicable, because no runtime service is involved. **DATA** - addressed: the block's fields and inheritance are fixed here; their schema is in DESIGN. **INT** - addressed: the block is the integration contract between screens and this template. **OPS** - Not applicable. **MAINT** - addressed: one declaration per page, moving with its screen. **TEST** - addressed through the check in Confirmation. **COMPL** - Not applicable. **UX** - addressed for the developer: one place to edit a page's title. **BIZ** - addressed through the search-ready goal of the PRD.

## Traceability

- **PRD**: [PRD.md](../PRD.md)
- **DESIGN**: [DESIGN.md](../DESIGN.md)

This decision directly addresses the following requirements and design elements:

* `cpt-template-site-meta-fr-metadata-once` - every output and the runtime head derive from the seo block and the site configuration.
* `cpt-template-site-meta-fr-metadata-rules` - the rules are checks over the declared blocks.
* `cpt-template-site-meta-contract-metadata-block` - the seo block is the contract screens provide.
* `cpt-template-site-meta-contract-site-configuration` - site-level values live in the site configuration.
* `cpt-template-site-meta-principle-metadata-once` - the design principle this decision fixes.
