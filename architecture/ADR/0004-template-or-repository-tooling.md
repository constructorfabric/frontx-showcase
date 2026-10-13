---
status: accepted
date: 2026-10-12
decision-makers: frontx-site maintainers
---

# A Part of the Site Becomes a Template Only When Its Boundary Lies Inside the Project It Applies Into

<!-- toc -->

- [Context and Problem Statement](#context-and-problem-statement)
- [Decision Drivers](#decision-drivers)
- [Considered Options](#considered-options)
- [Decision Outcome](#decision-outcome)
  - [Consequences](#consequences)
  - [Confirmation](#confirmation)
- [Pros and Cons of the Options](#pros-and-cons-of-the-options)
  - [Boundary rule](#boundary-rule)
  - [Everything into templates](#everything-into-templates)
  - [Everything stays repository tooling](#everything-stays-repository-tooling)
- [More Information](#more-information)
- [Traceability](#traceability)

<!-- /toc -->

**ID**: `cpt-site-adr-template-or-repository-tooling`

## Context and Problem Statement

Besides its screens, the site depends on three bodies of tooling: the page metadata pipeline (head tags, discovery files, plain-text twins, the head-sync runtime and its checks), the generated site data (the templates outline, the docs version data and the libraries data that template-site's screens render) and the repository policies (exact pins, own styles, text rules). A FrontX template is a generator of project content: it claims subtrees of the project it is applied into, must be self-contained (`frontx validate` rejects a `file:` specifier, tsconfig path or lockfile entry that resolves outside the template directory) and may deliver a tooling package, its own checks and an AI bundle. Which of these bodies of tooling become templates, and which stay repository tooling in `scripts/`?

## Decision Drivers

* **Predictable generation** - a template brings its boundary through its manifest, its rules through its AI bundle and its checks with its code, so whatever it generates is predictable in any project it is applied into.
* **Self-containment** - a template must not reference anything outside its own directory and the project it applies into; the CLI checks the reference carriers, and review and tests check source imports.
* **The measure is the boundary, not reuse** - FrontX has no rule that only reusable parts become templates; what matters is whether the part can live in a claimed subtree of the receiving project.
* **The repository owns what guards the repository** - checks over this repository's own files are not project content.

## Considered Options

* **Boundary rule** - a part becomes a template when everything it reads and writes lies in the project a template applies into, so it can live in a claimed subtree without referencing anything outside it; otherwise it stays repository tooling.
* **Everything into templates** - the metadata pipeline, the site data and the policies all become templates or parts of templates.
* **Everything stays repository tooling** - the screens are templates, and every tool stays in `scripts/` or a repository tooling folder.

## Decision Outcome

Chosen option: "Boundary rule", because it gives each part the home its inputs and outputs dictate: what can work inside any project becomes a template with a predictable boundary, and what by nature reads this repository stays its tooling.

**The rule.** A part of the site goes into a template when it has a clear boundary inside the project a template applies into: what it reads and writes lies in that project, and it can live in a claimed subtree without referencing anything outside it. Inputs from outside the project that a part needs are passed to it as arguments with defaults inside the project, never read by a path that leaves it.

**Applied to the three bodies of tooling:**

* The page metadata pipeline meets the rule and is template-site-meta: its package `site-meta` lands in the project's `src-app/verify_packages/site-meta/` and reads the composed screen manifests, the screen domain instance, the project's install and its `dist/`; the site configuration and the share-image record are passed with `--config` and `--rasters`.
* The generated site data does not, and stays `scripts/site-data.mjs`: it reads this repository's template directories, the root `package.json` and lockfile, `.nvmrc`, the FrontX CLI inventory and the npm registry, and writes into template-site's sources.
* The repository policies do not, and stay `scripts/policy-pins.mjs`, `policy-own-styles.mjs` and `policy-text.mjs`: they check this repository's files, the templates, the changed shell files and every file git records, so what they guard is the repository, not a project.

The scope of this decision is the measure and its application to the tooling that exists today. It does not decide the shape a template follows, how templates are composed ([0002](./0002-composition-by-copy.md)), or what a template's artifact tree holds ([0001](./0001-template-territory-traceability.md)).

### Consequences

* Good, because template-site-meta can be applied into any FrontX project with a screen domain and delivers its metadata pipeline with its own checks and guideline.
* Good, because no template references this repository's layout, so every template validates and moves on its own.
* Good, because the tools that read this repository stay in one place, next to the CI that runs them, with no fake boundary around them.
* Bad, because the repository keeps two kinds of tooling, template-delivered and repository-owned, and a reader has to know which is which; the DESIGN's component model names each.
* Bad, because a rule that needs two copies on either side of the boundary (the plain-text twin path rule in template-site and in template-site-meta) cannot be shared and needs a repository test that holds the copies to one answer.
* Bad, because template-shell has one workspace root for template-delivered tooling, named for verification, whose application type-check and test lane also sweep the package; site-meta carries small workarounds for that.

### Confirmation

`npm run templates:validate` runs `frontx validate` (manifest contract and reference self-containment) and the uniform-shape rules over every template. `scripts/twin-paths.test.mjs` holds the two copies of the twin path rule to one answer. Review confirms that a template's sources import nothing outside the template and the project, and that a new tool is placed by the rule above.

## Pros and Cons of the Options

### Boundary rule

* Good, because each placement follows from facts about inputs and outputs, so the choice for a new tool is checkable.
* Good, because it matches what a FrontX template is: a generator of project content.
* Bad, because a tool can sit near the boundary and need its outside inputs passed in, which adds arguments.

### Everything into templates

* Good, because every tool would follow one shape and be applied the same way.
* Bad, because the site data generator reads this repository's other template directories, the root lockfile, `.nvmrc`, the CLI inventory and the registry; as a template it would reference paths outside itself and outside the project, which self-containment forbids.
* Bad, because the policies would check a project they are applied into instead of the repository that must pass CI, which is a different job.

### Everything stays repository tooling

* Good, because there is nothing to compose for tooling and no template-shell workspace quirks to work around.
* Bad, because the metadata pipeline, which works on any FrontX project with a screen domain, would be tied to this repository, and a project that copies the site's screens would get no head, sitemap or twins.
* Bad, because the pipeline's rules and checks would not travel with the screens whose metadata they read.

## More Information

Applied to the three candidates, the measure puts the page metadata pipeline in template-site-meta and keeps the site data and the repository policies in `scripts/`; the same measure places the brand check in template-site-brand, since it reads only the project it is applied into: its own package, the installed kit, the project's sources and its site settings. The decision is revisited when template-shell offers a workspace root for template-delivered tooling outside the application's lanes, or when the FrontX CLI checks source imports for self-containment, which would turn part of the review into a check.

Applicability of the remaining checklist categories: **PERF** - Not applicable, because placement adds no runtime path. **SEC** - Not applicable. **REL** - Not applicable, because behaviour is unchanged by placement. **DATA** - Not applicable. **INT** - addressed: the template manifest and the passed-in arguments are the integration surface. **OPS** - addressed: CI runs the template validation and the repository tooling checks. **MAINT** - addressed: each tool lives next to what it reads. **TEST** - addressed: tests move with the code, and the twin path agreement test guards the one rule kept in two places. **COMPL** - Not applicable. **UX** - Not applicable. **BIZ** - Not applicable.

## Traceability

- **PRD**: [PRD.md](../PRD.md)
- **DESIGN**: [DESIGN.md](../DESIGN.md)

This decision directly addresses the following requirements and design elements:

* `cpt-site-fr-uniform-shape` - Every part placed in a template follows the one template shape and passes its validation.
* `cpt-site-interface-template-overlay` - A template is an overlay a project can copy; the rule keeps every template free of references to this repository.
* `cpt-site-actor-template-consumer` - A developer who applies template-site-meta gets the pipeline with its checks and guideline.
* `cpt-site-component-site-data` - Stays repository tooling under this decision.
* `cpt-site-component-guards` - The policies stay repository tooling under this decision.
