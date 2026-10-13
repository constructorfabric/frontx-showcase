---
status: accepted
date: 2026-10-12
decision-makers: frontx-site maintainers
---

# Template Packages Pin Exact Registry Versions Equal to the Site's Installs

<!-- toc -->

- [Context and Problem Statement](#context-and-problem-statement)
- [Decision Drivers](#decision-drivers)
- [Considered Options](#considered-options)
- [Decision Outcome](#decision-outcome)
  - [Consequences](#consequences)
  - [Confirmation](#confirmation)
- [Pros and Cons of the Options](#pros-and-cons-of-the-options)
  - [Exact pins equal to the site's installs, enforced by a policy](#exact-pins-equal-to-the-sites-installs-enforced-by-a-policy)
  - [Semver ranges](#semver-ranges)
  - [`file:` or workspace links to the site's packages](#file-or-workspace-links-to-the-sites-packages)
  - [Peer dependencies only](#peer-dependencies-only)
- [More Information](#more-information)
- [Traceability](#traceability)

<!-- /toc -->

**ID**: `cpt-site-adr-exact-registry-pins`

## Context and Problem Statement

Every screen package and every tooling package of this repository's templates has its own `package.json`, and it is installed as a workspace of whatever project the template is applied into: here, the site's npm project, seeded from template-shell. The packages depend on the `@gears-frontx/*` ecosystem releases (ui-kit, mfes, gts-plugin, api, routing, routing-tanstack), on template-shell's workspace packages (framework, react, state, i18n, auth) and on the shared toolchain (React, Vite, Vitest, TypeScript, Module Federation). A version that differs between a template package and the site's install makes npm fetch a second copy, and two copies of a context-providing package (React, the FrontX react bindings, the router) break the page at run time. Templates must also install unchanged in any other project. How do template packages declare these dependencies?

## Decision Drivers

* **One copy per package in every install** - a second copy of React or of a FrontX context package breaks the page; the install must deduplicate without overrides.
* **Registry-shaped content** - a template is applied into other projects, so its packages must name published releases, never a path into this repository.
* **Self-containment** - `frontx validate` rejects a `file:` specifier that resolves outside the template.
* **Checkable** - CI must name any pin that differs from the set the site installs.
* **Upgrades move together** - taking a new release must move every pin of that package at once.

## Considered Options

* **Exact pins equal to the site's installs, enforced by a policy** - every template package pins each ecosystem package at the exact version the site's application depends on, each shell workspace package at the applied shell's version, and the shared toolchain at the shell's versions; a repository policy checks the whole set.
* **Semver ranges** - template packages declare caret or tilde ranges and let npm resolve within them.
* **`file:` or workspace links to the site's packages** - template packages point at the site's installed copies or workspace members.
* **Peer dependencies only** - template packages declare the ecosystem as peers and leave the versions to the host project.

## Decision Outcome

Chosen option: "Exact pins equal to the site's installs, enforced by a policy", because it is the only option that guarantees one copy per package in the site's install, keeps each template registry-shaped and self-contained, and lets CI name every pin left behind.

**The pin set has one source.** The ecosystem set is read from the direct `@gears-frontx/*` dependencies of `site/package.json`, each an exact version, never a range or a `file:` spec. The shell workspace versions come from the applied shell, and the kit's own dependencies (its icon set) from the kit's entry in the site's lockfile. A `@gears-frontx/*` package that a template of this repository delivers under `src-app/verify_packages/` is pinned at its own version, which `site/package.json` repeats when the site application depends on it. Every MFE package and every non-screen package of every template pins exactly that set, and the site's copy of the shell's framework and react workspaces pins the same ecosystem versions. Every other dependency of a template package is pinned exactly at the version the site's lockfile resolves for that package's composed copy, so no range reaches a template.

**`npm run policy:pins` enforces it** over every template package and names each pin that differs from the set. A new release is taken by moving every pin of the package at once, then reinstalling and regenerating the site data.

The scope of this decision is how template packages declare their dependency versions. It does not decide which releases the site takes (that follows the ecosystem's releases) or how the site's own `package.json` differs from template-shell's ([0003](./0003-shell-rebuilt-in-place.md)).

### Consequences

* Good, because each install holds one version of every ecosystem and shell package with no override, so React, the FrontX bindings and the router have one context each.
* Good, because a template's packages name only published releases and install unchanged in any project with the same shell and ecosystem versions.
* Good, because `policy:pins` turns a forgotten pin into a CI failure that names the file and the package.
* Bad, because every release update touches every template package, and the repository moves all pins in one change.
* Bad, because a project with other ecosystem versions that applies a template gets a mismatch until it aligns its versions or the template's pins; ranges would hide that, at the cost of a possible second copy.
* Bad, because the shell workspace packages are pinned at prerelease versions that only the applied shell defines, so an upgrade of template-shell moves those pins too.

### Confirmation

`npm run policy:pins` runs in CI over every template package and fails on any pin outside the set; `scripts/policy-pins.test.mjs` covers the rule. `npm ls --prefix site` for the ecosystem packages shows one version of each. `npm run site:data -- --check` refuses a range or a non-registry resolution of an ecosystem pin.

## Pros and Cons of the Options

### Exact pins equal to the site's installs, enforced by a policy

* Good, because the site's install is deterministic and deduplicated.
* Good, because the rule is one sentence and one check.
* Bad, because updates are wide, touching every package.

### Semver ranges

* Good, because packages accept compatible releases without edits, the npm default.
* Bad, because the ecosystem is in prerelease and `0.x`, where a caret range covers only patch releases and a declared version that the applied shell's workspace version does not satisfy makes npm fetch a second copy from the registry, two contexts of one package on one page.
* Bad, because what a template installs then depends on the registry at install time, not on the repository's commit.

### `file:` or workspace links to the site's packages

* Good, because the template would always use exactly the site's copies.
* Bad, because a `file:` specifier that leaves the template fails `frontx validate`'s self-containment check, and the link would point nowhere in another project.

### Peer dependencies only

* Good, because the host project chooses the versions, which is how shared runtime packages are often declared.
* Bad, because a template package that is installed, built and tested on its own (its own Vite build, its own tests) needs the packages installed, so peers alone leave its build without them.
* Bad, because a mismatch between the host's versions and what the template was built and tested with would show up only at run time.

## More Information

The rule mirrors how the site itself depends on the ecosystem: one exact version per package, published from a known commit, which the libraries page states. The decision is revisited if the ecosystem leaves prerelease and the shell's workspace packages are published as releases with stable ranges, or if FrontX defines a dependency contract for templates that the CLI enforces.

Applicability of the remaining checklist categories: **PERF** - addressed: one copy per package keeps bundles free of duplicates. **SEC** - addressed: installs resolve only published registry releases recorded in the lockfile. **REL** - addressed: no second React or router context at run time. **DATA** - Not applicable. **INT** - addressed: the pin set is the dependency contract between templates and the site. **OPS** - addressed: CI runs the policy. **MAINT** - addressed: upgrades are one move of all pins of a package. **TEST** - addressed: the policy has its own tests. **COMPL** - Not applicable. **UX** - Not applicable. **BIZ** - Not applicable.

## Traceability

- **PRD**: [PRD.md](../PRD.md)
- **DESIGN**: [DESIGN.md](../DESIGN.md)

This decision directly addresses the following requirements and design elements:

* `cpt-site-fr-uniform-shape` - Exact pins from one set are part of the shape every template package follows, and CI fails when a package does not.
* `cpt-site-nfr-toolchain` - The shared toolchain is pinned at the shell's versions, so every package builds with the toolchain the site installs.
* `cpt-site-interface-template-overlay` - A template's packages name published releases only, so the overlay installs in another project.
* `cpt-site-principle-registry-shaped` - The principle this decision fixes.
* `cpt-site-component-guards` - `policy:pins` is one of the repository guards.
