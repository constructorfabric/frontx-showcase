---
status: accepted
date: 2026-10-13
---

# The Candidates Mirror UI Kit Pull Requests A and B Exactly and Are Removed When the Kit Releases Them

<!-- toc -->

- [Context and Problem Statement](#context-and-problem-statement)
- [Decision Drivers](#decision-drivers)
- [Considered Options](#considered-options)
- [Decision Outcome](#decision-outcome)
  - [Consequences](#consequences)
  - [Confirmation](#confirmation)
- [Pros and Cons of the Options](#pros-and-cons-of-the-options)
  - [A template package that mirrors the proposed pull requests exactly](#a-template-package-that-mirrors-the-proposed-pull-requests-exactly)
  - [Site-specific components in the site's own library](#site-specific-components-in-the-sites-own-library)
  - [Wait for the kit release](#wait-for-the-kit-release)
  - [Depend on the unreleased kit by source](#depend-on-the-unreleased-kit-by-source)
- [More Information](#more-information)
- [Traceability](#traceability)

<!-- /toc -->

**ID**: `cpt-template-kit-candidates-adr-mirror-kit-pull-requests`

## Context and Problem Statement

The site's templates need primitives the UI kit lacks: headings and text on the type ramp, an inline link, visually hidden text, a code block, a description list, and an element choice on the card and title parts. The generic ones are proposed to the kit as two pull requests, each sent only on the owner's approval, and released on the kit's schedule. The site installs ecosystem code only as released versions. Where do the primitives live until the kit releases them, and what API do they have?

## Decision Drivers

* **Release costs an import change** - consumers must not be migrated when the kit releases the components.
* **One copy** - no template may carry its own version of a primitive.
* **Released versions only** - nothing unreleased is installed.
* **Kit conventions** - the working copy doubles as the reference for the kit reviewers.

## Considered Options

* **A template package that mirrors the proposed pull requests exactly** - one workspace package, delivered by its own template, with the kit's layout and the proposed API, deleted on release.
* **Site-specific components in the site's own library** - keep the primitives as the site's components with whatever API suits the site.
* **Wait for the kit release** - keep each template's local recipes until the kit has the parts.
* **Depend on the unreleased kit by source** - install the kit from the pull request branches.

## Decision Outcome

Chosen option: "A template package that mirrors the proposed pull requests exactly", because it is the only option that gives every template one copy now, installs nothing unreleased, and makes the release an import-specifier change.

The package carries exactly the components and props of the two pull requests, in the kit's folder layout. The four kit parts the second pull request changes are wrappers under the kit's names that reuse the installed part's classes. A need the pull requests do not cover is proposed to the kit, not added here. When the kit releases a pull request, its components are switched and deleted; when both are released, the template and its architecture tree are deleted.

### Consequences

* Good, because templates share one copy with a stable, reviewed API.
* Good, because the kit reviewers get working code in the kit's shape.
* Bad, because a change in review must be mirrored here in the same step, or consumers drift from the release.
* Bad, because the wrappers rest on the kit parts staying hook-free single-element functions until the release.

### Confirmation

The package surface test pins the export list to the two pull requests' names; the wrapper tests compare markup without `render` with the kit parts'; review confirms that every prop matches the pull request texts.

## Pros and Cons of the Options

### A template package that mirrors the proposed pull requests exactly

* Good, because the release is an import change.
* Good, because it follows the FrontX way of delivering code between templates: a named workspace package.
* Bad, because two copies of a proposal (the pull request text and the package) must be kept equal.

### Site-specific components in the site's own library

* Good, because the API can fit the site's needs.
* Bad, because every divergence from the kit proposal becomes a migration on release, and the library grows site-only variants.

### Wait for the kit release

* Good, because nothing is built that will be deleted.
* Bad, because the local copies keep multiplying and drifting until an unknown date.

### Depend on the unreleased kit by source

* Good, because the real kit code is used.
* Bad, because it breaks the exact registry pins and the template's self-containment.

## More Information

The pull request texts are drafts kept outside the repository until the owner approves sending them; the template's guideline names the components and the release step. The exact registry pins are a decision of the site repository, recorded in its root [ADR folder](../../../architecture/ADR/).

Applicability of the remaining checklist categories: **PERF** - Not applicable. **SEC** - Not applicable. **REL** - addressed: nothing unreleased is installed. **DATA** - Not applicable. **INT** - addressed: the kit contract is pinned and tested. **OPS** - Not applicable. **MAINT** - addressed: one copy, removed whole. **TEST** - addressed by the surface and markup tests. **COMPL** - Not applicable. **UX** - addressed: accessible primitives on kit tokens. **BIZ** - addressed: the kit gains reviewed components.

## Traceability

- **PRD**: [PRD.md](../PRD.md)
- **DESIGN**: [DESIGN.md](../DESIGN.md)

This decision directly addresses the following requirements and design elements:

* `cpt-template-kit-candidates-fr-proposed-api` - The candidates equal the proposed API.
* `cpt-template-kit-candidates-fr-self-contained` - The template is removed whole on release.
* `cpt-template-kit-candidates-principle-proposed-api` - The design principle this decision sets.
* `cpt-template-kit-candidates-principle-reuse-kit-classes` - How the changed kit parts are mirrored.
* `cpt-template-kit-candidates-constraint-hook-free-kit-parts` - The assumption the wrappers rest on.
