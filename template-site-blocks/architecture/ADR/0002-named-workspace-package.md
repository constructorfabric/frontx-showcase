---
status: accepted
date: 2026-10-13
---

# Blocks Are Delivered as a Named Workspace Package with One Entry per Block

<!-- toc -->

- [Context and Problem Statement](#context-and-problem-statement)
- [Decision Drivers](#decision-drivers)
- [Considered Options](#considered-options)
- [Decision Outcome](#decision-outcome)
  - [Consequences](#consequences)
  - [Confirmation](#confirmation)
- [Pros and Cons of the Options](#pros-and-cons-of-the-options)
  - [A named workspace package with per-block entries](#a-named-workspace-package-with-per-block-entries)
  - [A shared source folder reached by a path alias](#a-shared-source-folder-reached-by-a-path-alias)
  - [Blocks copied into each page template](#blocks-copied-into-each-page-template)
  - [One package entry listing every block](#one-package-entry-listing-every-block)
- [More Information](#more-information)
- [Traceability](#traceability)

<!-- /toc -->

**ID**: `cpt-template-site-blocks-adr-named-workspace-package`

## Context and Problem Statement

Several templates of the site render blocks: the page templates, and later any template that draws the site's arrangements. A screen package must never import another template's files by path, and the FrontX validation refuses path aliases and file carriers that leave a template. How do blocks reach the screen packages of other templates, and how is a new block added?

## Decision Drivers

* **No cross-template paths** - screen packages import other templates' code by package name only.
* **Released-style pins** - a dependency on a template's package is pinned at that package's version.
* **Adding a block is local** - a new block needs no edit outside its folder.
* **One copy** - no template carries its own copy of a block.

## Considered Options

* **A named workspace package with per-block entries** - `@gears-frontx/site-blocks` in the shell's workspace root for template-delivered packages, with an exports pattern that maps each block folder to its own entry.
* **A shared source folder reached by a path alias** - blocks under a shared folder of the screen packages, imported through an alias.
* **Blocks copied into each page template** - each template keeps the blocks it uses.
* **One package entry listing every block** - the same package with a single index module.

## Decision Outcome

Chosen option: "A named workspace package with per-block entries", because it is the FrontX way for one template to give code to others (template-mfe's packages depend on template-shell's package by name and version), it passes the validation by construction, and the exports pattern lets a block be added without touching a shared file.

Screen packages declare `@gears-frontx/site-blocks` in their dependencies at the exact version the package carries and import `@gears-frontx/site-blocks/<Block>`. The package's document entry carries the layout tokens into the document through the shell's convention. The showcase screen of this template imports the package by name as any consumer does.

### Consequences

* Good, because consumers depend on a name and a version, never on a path.
* Good, because a new block is a new folder.
* Bad, because the package lives in a workspace root named for verification packages until template-shell offers a neutral root for template-delivered packages.
* Bad, because the install must link the package once after the template is applied.

### Confirmation

The repository's pin policy checks every consumer's pin against the package version; the FrontX validation and the template shape check accept the template; the showcase screen's tests import blocks by name.

## Pros and Cons of the Options

### A named workspace package with per-block entries

* Good, because it follows an existing FrontX delivery path.
* Good, because each block is tree-shaken alone.
* Bad, because the workspace root's name does not describe the package.

### A shared source folder reached by a path alias

* Good, because no install step is needed.
* Bad, because the alias crosses template boundaries, which the site's rules and the validation refuse.

### Blocks copied into each page template

* Good, because each template is independent.
* Bad, because copies drift, which is what blocks exist to stop.

### One package entry listing every block

* Good, because there is one import path.
* Bad, because every new block edits the shared index, and consumers import every block.

## More Information

The workspace root for template-delivered packages, the exact pins and the document entry convention are the site repository's decisions, recorded in its root [ADR folder](../../../architecture/ADR/).

Applicability of the remaining checklist categories: **PERF** - addressed: per-block entries. **SEC** - Not applicable. **REL** - Not applicable. **DATA** - Not applicable. **INT** - addressed: pinned package names. **OPS** - addressed: one install step. **MAINT** - addressed: one copy, local additions. **TEST** - addressed by the pin policy and the validation. **COMPL** - Not applicable. **UX** - Not applicable. **BIZ** - Not applicable.

## Traceability

- **PRD**: [PRD.md](../PRD.md)
- **DESIGN**: [DESIGN.md](../DESIGN.md)

This decision directly addresses the following requirements and design elements:

* `cpt-template-site-blocks-fr-self-contained` - The template claims its subtrees and references nothing else.
* `cpt-template-site-blocks-interface-package-exports` - Per-block entries.
* `cpt-template-site-blocks-constraint-host-prerequisites` - The workspace roots the packages need.
