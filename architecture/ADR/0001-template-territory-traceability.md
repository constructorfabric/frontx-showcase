---
status: accepted
date: 2026-10-12
---

# Each Template Carries Its Own Artifact Tree, and Its Markers Bind Only to That Tree

<!-- toc -->

- [Context and Problem Statement](#context-and-problem-statement)
- [Decision Drivers](#decision-drivers)
- [Considered Options](#considered-options)
- [Decision Outcome](#decision-outcome)
  - [Consequences](#consequences)
  - [Confirmation](#confirmation)
- [Pros and Cons of the Options](#pros-and-cons-of-the-options)
  - [Keep the "binds nothing" reading with documentation-only template systems](#keep-the-binds-nothing-reading-with-documentation-only-template-systems)
  - [Each template carries its own self-contained artifact tree](#each-template-carries-its-own-self-contained-artifact-tree)
  - [Templates as members of the root system](#templates-as-members-of-the-root-system)
- [More Information](#more-information)
- [Traceability](#traceability)

<!-- /toc -->

**ID**: `cpt-site-adr-template-territory-traceability`

## Context and Problem Statement

This repository owns nine templates, each a top-level directory carrying a `frontx-template.json` manifest: template-site, template-catalogue, template-inbox, template-mfe-demo, template-calendar-demo, template-site-meta, template-site-brand, template-kit-candidates and template-site-blocks. Almost all of the site's behaviour lives in them: every screen, the page metadata pipeline, the catalogue, the inbox data layer. Next to them, `site/` holds the official templates the FrontX CLI applies (template-shell, template-mfe, template-design-guardrails), whose files still carry `@cpt-` markers that name gears-frontx ids no artifact here or upstream defines, residue of an archived gears-frontx generation. The repository adopts Constructor Studio with full traceability, in which a marker in a registered code path must name a numbered instruction of a FEATURE, and markers are checked only in the code paths the registry lists. Which artifact tree specifies the code inside this repository's templates, what may a marker found there point at, and what standing does the residue under `site/` have?

## Decision Drivers

* **Traceability must reach the code that carries the behaviour** - full adoption means the behaviour the site depends on is specified by numbered instructions and its code points back to them; that behaviour sits in the templates, not in `scripts/` or the shell layout.
* **A template moves as a unit** - a template is a separately versioned overlay that may be copied into a project, move to gears-frontx-templates or become a project repository of its own; its specification has to move with it and validate where it lands.
* **No shared id namespace with gears-frontx** - gears-frontx ids are internal to that repository and may change; a document or marker here that carries one breaks silently, because cfs does not report a reference outside the prefixes registered here.
* **A marker is a claim** - a `@cpt-` marker asserts that a numbered instruction specifies the marked code; a marker that names nothing defined here misleads every reader.
* **The rule must be checkable** - cfs v1.6.2 keeps all ids in one set: it neither ties a marker or a reference to the system that defines the id nor rejects a `cpt-frontx-*` id in a document, so whatever cfs does not check has to be stated plainly enough for review to check it.

## Considered Options

* **Keep the "binds nothing" reading with documentation-only template systems** - every template system stays DOCS-ONLY with at most a PRD and a DESIGN, no template code path is registered, and markers in template code stay prohibited; full traceability covers only the code the root system owns.
* **Each template carries its own self-contained artifact tree** - every template has a FULL system over `<template>/architecture` with its own PRD, DESIGN, DECOMPOSITION, FEATUREs and ADRs, registers its own code, and its markers bind only to its own ids.
* **Templates as members of the root system** - every template owns a PRD, a DESIGN and FEATUREs, as gears-frontx packages do, while its features are decomposed in the root DECOMPOSITION and its FEATUREs cite root feature ids.

## Decision Outcome

Chosen option: "Each template carries its own self-contained artifact tree", because it is the only option that gives full traceability to the code that carries the site's behaviour while keeping every specification inside the template it describes.

**Each template of this repository has its own artifact tree**, under `<template>/architecture`, registered as its own system with slug `template-<name>` and ids `cpt-template-<name>-*`, every kind in full traceability. The tree is complete for that template: a PRD with the requirements its consumers rely on, a DESIGN, a DECOMPOSITION, a FEATURE per feature, and an ADR wherever the template itself decides something. The template registers its own code as its own codebase. The imported templates, template-inbox and template-mfe-demo, are site-owned and get full trees like the others.

**A tree is self-contained.** The documents of a template's tree carry only that tree's ids, and the code of a template carries markers that name only that template's own instructions. Another tree, the root one included, is cited by a link to its document, never by its ids, so that a template validates unchanged wherever it moves.

**The root system `site` (ids `cpt-site-*`) specifies what the repository itself owns**: the site-level intent, the repository tooling in `scripts/`, the shell layout and the shell files the site has changed. Nothing else under `site/` is registered for traceability: the composed copies of the templates there are products of composition and the applied official templates are not this repository's code.

**No document of this repository carries a `cpt-frontx-*` id, and no `cpt-frontx-*` marker is added to its code.** A gears-frontx decision is cited as plain text, for example "FrontX ADR-0033", or as a link to its file. The `cpt-frontx-*` markers under `site/` are residue: they bind nothing, their paths stay unregistered, and when the site changes a file that carries them, every residue marker in that file is removed in the same change and the change is recorded in the shell change ledger.

The scope of this decision is which tree specifies template code and what a marker in this repository may mean. It does not decide the shape a template follows, how templates are composed into the site, or which features each template has.

### Consequences

* Good, because every screen and every template-delivered tool can be specified by numbered instructions, and the code that implements them is checked against them by `cfs validate`.
* Good, because a template's specification travels with it: copying the template directory copies its tree, and no reference in it points outside.
* Good, because no id here depends on gears-frontx internals, so a renamed or removed gears-frontx id never breaks a document here.
* Good, because the residue under `site/` is stated as residue in the artifacts, so a reader of a marked shell file finds a decision instead of a missing contract.
* Bad, because the repository carries ten artifact trees instead of one, each with its own PRD, DESIGN and DECOMPOSITION to keep current.
* Bad, because the imported templates diverge from their upstream sources once their code carries markers, which makes a later re-sync from upstream a manual merge.
* Bad, because cfs does not enforce self-containment: a template id cited from the root tree, or a root id cited from a template tree, still validates, and a template's checked requirement can be satisfied by a reference in another tree; review carries that check.

### Confirmation

`cfs validate` (as `python3 .cf-studio/.core/skills/studio/scripts/studio.py validate`, run by CI) confirms the mechanical part: every marker in a registered code path names a defined id, every checked instruction has its marker and every unchecked one has none, and each template system finds its own documents. Review confirms the rest, which cfs does not check: each system's documents carry only ids with that system's prefix and cite other trees by link; a template's markers name only that template's ids; no document carries a `cpt-frontx-*` id and no change adds a `cpt-frontx-*` marker; no path under `site/` other than the site-owned code is registered; and a change to a shell file that carried residue removes those markers and is listed by `npm run shell:changes -- --check`.

## Pros and Cons of the Options

### Keep the "binds nothing" reading with documentation-only template systems

This is the literal reading of FrontX ADR-0033's sentences "No new markers are added to template territory" and "a marker found in template payload binds nothing", which this repository applied until now.

* Good, because it needs no template documents beyond a PRD and a DESIGN, and no markers in template code.
* Good, because the imported templates stay identical to their upstream sources.
* Bad, because full traceability then covers only `scripts/` and the shell layout, while the behaviour the site exists for stays unspecified.
* Bad, because it extends a decision beyond its scope: FrontX ADR-0033 decides only which gears-frontx tree specifies template code, and leaves to the repository that owns a template whether to author a tree over it.

### Each template carries its own self-contained artifact tree

* Good, because full traceability reaches the templates, where the behaviour is.
* Good, because each template's tree moves with it and validates on its own.
* Good, because it matches the reading the templates repository adopted for official templates: a template's system registers its own code, and its markers trace to its own documents (the gears-frontx-templates registry, `.cf-studio/config/artifacts.toml`).
* Bad, because it is the largest authoring commitment: ten trees and their upkeep.
* Bad, because self-containment is a review rule, not a cfs check.

### Templates as members of the root system

gears-frontx packages own a PRD, a DESIGN and FEATUREs, and their FEATUREs cite feature ids the root DECOMPOSITION defines.

* Good, because one DECOMPOSITION orders all features of the repository in one place.
* Neutral, because it is the model the ecosystem repository already uses for its packages.
* Bad, because a template's FEATUREs then cite ids from a tree the template does not carry; once the template moves, every such reference fails with `ref-no-definition`, the failure the templates repository met when a template FEATURE cited feature ids its own system did not define.
* Bad, because a template could not be validated, versioned or reviewed on its own.

## More Information

FrontX ADR-0033 ([architecture/ADR/0033-template-territory-traceability.md](https://github.com/constructorfabric/gears-frontx/blob/main/architecture/ADR/0033-template-territory-traceability.md) in gears-frontx) decides that the gears-frontx artifact tree does not specify template code and that a marker in template payload binds nothing to gears-frontx artifacts. It states that whether the repository owning a template authors a tree over it is that repository's decision, and rates the option "Give template territory its own artifact tree" as "the natural destination if template internals ever need specified contracts". Its only objection, specifying code the repository does not own, does not apply here: this repository owns its templates. Its two invariants are kept: no marker binds to a gears-frontx id, and residue is removed from a file when the file changes.

The gears-frontx-templates registry ([.cf-studio/config/artifacts.toml](https://github.com/constructorfabric/gears-frontx-templates/blob/main/.cf-studio/config/artifacts.toml)) applies the same reading to the official templates: a template's system may register its own code paths so that its markers trace to its own documents, and a document there never carries a gears-frontx id.

Applicability of the remaining checklist categories: **PERF** - Not applicable, because the decision fixes what the artifacts specify and adds no runtime path. **SEC** - Not applicable, because no secret material or authentication surface is introduced. **REL** - Not applicable, because no runtime behaviour changes; markers are comments. **DATA** - Not applicable, because no schema is fixed. **INT** - addressed: the integration surface between trees is a link to a document, never a shared id. **OPS** - addressed: CI runs `cfs validate` over every registered tree and code path. **MAINT** - addressed: a template's specification changes with the template, and residue retirement is tied to the change that touches the file. **TEST** - Not applicable, because test files carry no markers and the decision adds no test. **COMPL** - Not applicable. **UX** - addressed for the developer as reader: a marker in this repository always resolves to an instruction in the tree of the code that carries it. **BIZ** - Not applicable, because the product requirements stay in the PRDs.

## Traceability

- **PRD**: [PRD.md](../PRD.md)
- **DESIGN**: [DESIGN.md](../DESIGN.md)

This decision directly addresses the following requirements and design elements:

* `cpt-site-fr-uniform-shape` - Every template follows one documented shape; this decision adds to that shape a self-contained artifact tree per template.
* `cpt-site-interface-template-overlay` - A template is an overlay a project can copy; its specification is part of what is copied and resolves without the rest of this repository.
* `cpt-site-actor-template-consumer` - A developer who copies a template into a project of their own gets its requirements and design with it.
* `cpt-site-principle-uniform-shape` - This decision extends the shape every template follows with its own `architecture/` tree.
* `cpt-site-component-shell-change-ledger` - The shell change ledger (`shell-changes.mjs`) records every shell file the site changes, so a file whose residue markers were removed is listed with that change.
