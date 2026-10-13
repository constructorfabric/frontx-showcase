---
status: accepted
date: 2026-10-13
---

# Site Pages Are Outlines of Content-Only Entries Rendered Both as Pages and as Plain Text

<!-- toc -->

- [Context and Problem Statement](#context-and-problem-statement)
- [Decision Drivers](#decision-drivers)
- [Considered Options](#considered-options)
- [Decision Outcome](#decision-outcome)
  - [Consequences](#consequences)
  - [Confirmation](#confirmation)
- [Pros and Cons of the Options](#pros-and-cons-of-the-options)
  - [Outlines of content-only entries](#outlines-of-content-only-entries)
  - [Outlines of entries with drawing options](#outlines-of-entries-with-drawing-options)
  - [Hand-written page components with a separate Markdown copy](#hand-written-page-components-with-a-separate-markdown-copy)
  - [Markdown as the source](#markdown-as-the-source)
- [More Information](#more-information)
- [Traceability](#traceability)

<!-- /toc -->

**ID**: `cpt-template-site-adr-outline-content-model`

## Context and Problem Statement

The home, templates, docs and libraries screens of template-site are the site's pages: a landing page, guides with numbered steps and commands, template pages with key files, a list of packages, technical summaries. Each page has to be published twice: as a page inside the FrontX shell, composed from the section-level blocks of template-site-blocks, the kit candidates and UI kit components, and as a plain-text twin that coding agents and crawlers without JavaScript read in full. Their facts (versions, source-specs, commands, template contents) come from generated data, and their texts from the screen's strings. A block takes content only, never a layout or a variant switch, so every arrangement the design draws is a block of its own. In what form is such a page written, so that the page and its twin cannot disagree, a missing string or fact is caught before publication, and the page names the blocks it is made of without configuring them?

## Decision Drivers

* **One source per page** - a page and its plain-text twin written separately drift apart, and the twin is the copy no one looks at.
* **Facts come from data** - versions, source-specs and template contents are generated; the page source must refer to them, not repeat them.
* **Checkable content** - a text key with no string, a placeholder with no value or an unknown entry must fail a check, not reach a visitor.
* **Blocks with content-only props** - the page is configuration over blocks; how a section is drawn is decided by which block it is, not by options on it.
* **No styling in pages** - pages and their renderer carry no CSS; blocks, kit candidates and kit components carry the look.
* **Readable outside the browser** - the twin is produced at build time by tooling that does not run the screens.

## Considered Options

* **Outlines of content-only entries** - each page is a JSON outline: an ordered list of typed entries, each entry type named after the block it renders or the kit part it renders directly, carrying content only; texts are string keys or literals with named placeholders; the screen renders it with a shared renderer, and the metadata tooling renders the same outline, strings and data as Markdown.
* **Outlines of entries with drawing options** - the same outlines, with fewer entry types that take options such as a layout, a variant, a tone or a numbering switch.
* **Hand-written page components with a separate Markdown copy** - each page is a React component; its twin is a Markdown file written and kept current by hand.
* **Markdown as the source** - each page is a Markdown (or MDX) document; the twin is the document itself, and the screen renders it to the page.

## Decision Outcome

Chosen option: "Outlines of content-only entries", because it is the only option in which one source produces both renderings, every text and fact is checked, and the page names its blocks without configuring them.

Terms: a block is a component of template-site-blocks; an entry is one line of an outline. The content model lives in the template's shared folder and defines the outline: a screen token, the screen's strings file, an optional data file and a list of pages, each with a route, a title, a lead and entries of a fixed set of types. Each entry type is named after the block it renders (section heading, guide closing heading, step and unnumbered step, path cards, start paths, template pair, template row, card tiles, panels, the box and rule calls to action, facts, file explorer, agent task, troubleshooting, package list, and the home entries hero, features, architecture map, change story, kit showcase, metric comparison, get-started steps and closing call to action), or after the kit part or kit candidate it renders directly (paragraph, fine print, status, links, actions, code, checklist, list, callout, details). An entry carries no drawing option: an arrangement that differs is its own entry type, and the parser refuses an entry that carries one. A text is a key of the screen's strings or a literal, and `{name}` placeholders are filled from the screen's data. The screen builds its routes from the outline's pages and renders each page with the shared renderer, which picks the frame from the page's shape (landing, template detail, docs with or without the side panel); the home page is an outline too, one landing page of home entries, with its live UI kit samples supplied by the screen. The metadata tooling reads the same outline, strings and data and writes each page's twin at the path the twin rule fixes.

### Consequences

* Good, because a page and its twin come from one outline, strings and data, so they cannot disagree.
* Good, because a missing string key, an unfilled placeholder, an unknown entry or a drawing option fails when the outline is parsed and in the screen's checks, before publication.
* Good, because the routes of a screen are its outline's pages, so adding a page adds its route.
* Good, because the pages carry no styling: the renderer composes blocks, kit candidates and kit components only, and each entry names the one block that draws it.
* Bad, because an arrangement the blocks do not draw needs a new block and a new entry type, added to the blocks, the model, the renderer and the metadata tooling together.
* Bad, because the outline format is a contract with tooling in another template that reads it as data, so a change to it is a coordinated change across two templates.

### Confirmation

The content model checks every outline when its module loads. Each screen's outline test fails on a text key its strings lack and on a placeholder its data cannot fill, the docs outline test fails on an unknown entry type, a drawing option and a figure the brand does not draw, and each manifest test fails when the outline's pages and the declared page metadata disagree. Review confirms that no page of the home, templates, docs or libraries screens is written outside its outline and that the renderer imports no stylesheet.

## Pros and Cons of the Options

### Outlines of content-only entries

The page source is data in a closed model; two renderers read it; each entry type names one block.

* Good, because one source yields the page and the twin.
* Good, because strings and data are referenced by key and checked.
* Good, because blocks keep content-only props and a page cannot ask a block for a look it does not have.
* Neutral, because each entry type needs a rendering in both renderers.
* Bad, because there are more entry types, one per drawn arrangement.

### Outlines of entries with drawing options

Fewer entry types, each switching its look with options.

* Good, because fewer entry types to render in each renderer.
* Bad, because the options become configuration props on the blocks, which the blocks' content-only rule forbids.
* Bad, because a combination of options that the design never draws is still accepted by the model.

### Hand-written page components with a separate Markdown copy

Each page is a React component in the screen; the twin is a second, hand-written file.

* Good, because any layout can be written directly in the component.
* Bad, because the twin repeats every text and fact of the page and drifts from it with every change.
* Bad, because no check can tell that the twin and the page say the same thing.

### Markdown as the source

The page is written in Markdown or MDX, published as the twin, and rendered into the screen.

* Good, because the twin is the source itself.
* Bad, because the site's arrangements (card pairs, path cards, the key-files explorer, side panels, the home bands) are not Markdown constructs and would need custom components embedded in the source, which the plain-text twin then cannot carry.
* Bad, because texts written inline bypass the screen's strings, so the page loses the translation path every FrontX screen uses.

## More Information

The outline model and its renderer live in `src-app/mfe_packages/shared/site/content/` of this template; the blocks they render come from the named package `@gears-frontx/site-blocks` delivered by template-site-blocks, the kit candidates from `@gears-frontx/kit-candidates` and the brand art from `@gears-frontx/site-brand`. The twin path rule is part of the same folder. The repository's metadata tooling, delivered by template-site-meta, renders the twins; it is cited here by name only, as this tree cites no other tree's ids.

## Traceability

- **PRD**: [PRD.md](../PRD.md)
- **DESIGN**: [DESIGN.md](../DESIGN.md)

This decision directly addresses the following requirements or design elements:

* `cpt-template-site-fr-outline-content` - the site's pages are outlines checked on load and in tests.
* `cpt-template-site-fr-twin-links` - each outline page has a twin at a fixed path, rendered from the same source.
* `cpt-template-site-interface-outline` - the outline format is the template's published content format.
* `cpt-template-site-component-content-model` - the component that owns the model and its renderer.
