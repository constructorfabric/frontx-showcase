---
status: accepted
date: 2026-10-12
---

# The Demo Is an Adapted Copy of template-mfe's Demo Packages That Keeps Their Names and Identifiers

<!-- toc -->

- [Context and Problem Statement](#context-and-problem-statement)
- [Decision Drivers](#decision-drivers)
- [Considered Options](#considered-options)
- [Decision Outcome](#decision-outcome)
  - [Consequences](#consequences)
  - [Confirmation](#confirmation)
- [Pros and Cons of the Options](#pros-and-cons-of-the-options)
  - [Use template-mfe's demo packages through the examples opt-in](#use-template-mfes-demo-packages-through-the-examples-opt-in)
  - [Keep an adapted copy under template-mfe's package names and identifiers](#keep-an-adapted-copy-under-template-mfes-package-names-and-identifiers)
  - [Keep an adapted copy under new package names and identifiers](#keep-an-adapted-copy-under-new-package-names-and-identifiers)
- [More Information](#more-information)
- [Traceability](#traceability)

<!-- /toc -->

**ID**: `cpt-template-mfe-demo-adr-adapted-copy-under-upstream-identity`

## Context and Problem Statement

The MFE mechanics demo and its two widget fixtures are packages of template-mfe, an official FrontX template that the site applies from gears-frontx-templates. There they are flagged as template examples: the shell's scanners skip them unless a project sets the examples opt-in, which also registers template-mfe's blank scaffold. Their screens are placed (route token, menu order, label, group, page metadata) only by their own manifests, they paint with utility classes the site's shell does not compile, they have no route trees, and they carry three behaviour defects and three accessibility defects. The site needs the demos as pages. Where do the demo's packages come from, and under which package names and identifiers do they live?

## Decision Drivers

* **The demos must be pages** - each needs a stable address, a menu group, page metadata, a route tree and a look the site's shell renders, none of which template-mfe's packages provide as shipped.
* **Placement lives in the manifest** - FrontX has no project-level overlay that re-places a template's screens, so changing a screen's token, order, group or metadata means changing its package's manifest.
* **The copy should be retirable** - once template-mfe takes the functional fixes, the site's remaining difference should be placement only, and replacing the copy by the upstream packages should be a deletion, not a migration.
* **One demo per project** - a project that showed the same demo twice, under two sets of identifiers, would register duplicate screens and duplicate widgets in one domain.
* **Re-sync stays mechanical** - a later upstream change should be comparable file by file with the copy.

## Considered Options

* **Use template-mfe's demo packages through the examples opt-in** - set the opt-in in the site and accept the packages as shipped.
* **Keep an adapted copy under template-mfe's package names and identifiers** - copy the three packages into this template at the same paths, adapt only what the site needs, and claim the same directories as exclusive subtrees.
* **Keep an adapted copy under new package names and identifiers** - copy and adapt the packages, renamed so they can coexist with template-mfe's own demo.

## Decision Outcome

Chosen option: "Keep an adapted copy under template-mfe's package names and identifiers", because it is the only option that gives the site working pages while leaving the upstream packages the single identity of the demo, so the copy can be retired by deletion.

The template owns `demo-mfe`, `widgets-fixture-a` and `widgets-fixture-b` at template-mfe's paths, with template-mfe's package names, manifest, entry, domain, action, screen and widget identifiers. The adaptations are limited to what the site needs, and each is listed with its reason in the template's README: no template-example flag; the site's placement (tokens, orders, labels, a `presentation.group` naming the host's demos nav group, page metadata); route trees per screen; screens built from the package's blocks, kit components and kit candidates instead of utility classes; the site's exact pins; and the behaviour and accessibility fixes. template-mfe's blank scaffold is not copied, and neither is its UI Kit Elements screen: the site's catalogue shows every kit component with its examples, so a second, partial kit showcase among the mechanics demos would duplicate it and fall behind the kit, while every remaining screen still shows kit components inside Shadow DOM. That omission is a difference of the site, and the template's README records it with the change it proposes upstream: the same removal in template-mfe's demo.

### Consequences

* Good, because the demos are working pages in the site, built and tested like every other site package.
* Good, because the identifiers a reader meets in the demo are the ones template-mfe documents, so its documentation applies.
* Good, because the classified difference doubles as the upstream change list: once template-mfe takes the fixes and the UI Kit Elements removal, the site's remaining difference is placement and the site's blocks.
* Bad, because the template cannot be applied next to template-mfe's own demo packages: the template's manifest claims the same directories, and the site's composition removes template-mfe's demo packages before it copies these.
* Bad, because a project that applies this template shows no UI Kit Elements screen; the kit's components are shown by a catalogue, which the site has and another project may not.
* Bad, because the copy drifts from its source with every upstream change until the upstream change lands, and a re-sync is a manual merge.

### Confirmation

Review confirms that every file that differs from template-mfe's source at the recorded commit is listed in the template's README with its reason, and that package names, manifest, entry, domain, action, screen and widget identifiers match the source. Each package's manifest test holds the placement: tokens, orders, labels, the demos nav group's id and page metadata. The template's manifest declares the three package directories and the AI bundle as exclusive subtrees, and the template-shape check of the site validates the manifest.

## Pros and Cons of the Options

### Use template-mfe's demo packages through the examples opt-in

* Good, because the site carries no copy and takes upstream changes as they ship.
* Bad, because the opt-in also registers template-mfe's blank scaffold as a screen.
* Bad, because the screens cannot be placed in the `demos` group, given page metadata or given route trees without editing the upstream manifests and code, which the site does not own.
* Bad, because the screens paint unstyled in a shell that compiles no utility classes, and the six defects stay.

### Keep an adapted copy under template-mfe's package names and identifiers

* Good, because the demo has one identity, the upstream one, and the copy is retired by deleting it once upstream carries the fixes.
* Good, because every adapted file can be compared with its source at the same path.
* Neutral, because placement still lives in the copied manifests until FrontX offers a project-level overlay.
* Bad, because the template and template-mfe's demo packages exclude each other in one project.

### Keep an adapted copy under new package names and identifiers

* Good, because the template can be applied next to template-mfe's demo packages.
* Bad, because a project that does so shows the same demo twice and registers two sets of widgets for the same purpose.
* Bad, because every identifier differs from the source, so a re-sync compares renamed files and a retirement is a migration of links and actions.
* Bad, because a reader can no longer use template-mfe's documentation to find the identifiers in this copy.

## More Information

The source is template-mfe's `src-app/mfe_packages/demo-mfe/`, `widgets-fixture-a/` and `widgets-fixture-b/` at gears-frontx-templates commit `3b6cddb`; the template's README carries the file-by-file difference. The site records the gap that makes the copy necessary and the upstream change that would retire it (the examples flag, no project-level placement overlay, utility classes, no route trees, the six defects) in its known gaps list: [GAPS.md](../../../architecture/GAPS.md). How the site composes this template and removes template-mfe's demo packages is the site's decision, recorded in its own artifact tree: [architecture/ADR/](../../../architecture/ADR/).

Applicability of the remaining checklist categories: **PERF** - Not applicable, because no runtime path changes with where the packages come from. **SEC** - Not applicable, because the demo handles no credentials and its data is mocked. **REL** - addressed: the copy carries the behaviour fixes its source lacks. **DATA** - Not applicable. **INT** - addressed: the kept identifiers are the integration surface other packages and links use. **OPS** - Not applicable, because the packages build and deploy as every site package does. **MAINT** - addressed: the classified difference bounds the upkeep and names the retirement path. **TEST** - addressed: the manifest tests hold the placement. **COMPL** - Not applicable. **UX** - addressed: the demos render in the site's look. **BIZ** - addressed: the demos are reachable pages of the site.

## Traceability

- **PRD**: [PRD.md](../PRD.md)
- **DESIGN**: [DESIGN.md](../DESIGN.md)

This decision directly addresses the following requirements and design elements:

* `cpt-template-mfe-demo-fr-demo-screens` - The copy is what lets the screens carry the site's placement.
* `cpt-template-mfe-demo-fr-self-contained-overlay` - The template claims template-mfe's directories as exclusive subtrees and states the incompatibility.
* `cpt-template-mfe-demo-contract-demos-nav-group` - The screens keep template-mfe's identifiers and join the host's demos nav group through `presentation.group`.
* `cpt-template-mfe-demo-principle-upstream-identity` - The design principle this decision sets.
* `cpt-template-mfe-demo-constraint-exclusive-with-upstream-demo` - The constraint this decision imposes on any project that applies the template.
