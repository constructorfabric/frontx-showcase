---
status: accepted
date: 2026-10-12
decision-makers: frontx-site maintainers
---

# Generate the Site's Template, Version and Library Data from Their Sources and Check It in CI

<!-- toc -->

- [Context and Problem Statement](#context-and-problem-statement)
- [Decision Drivers](#decision-drivers)
- [Considered Options](#considered-options)
- [Decision Outcome](#decision-outcome)
  - [Consequences](#consequences)
  - [Confirmation](#confirmation)
- [Pros and Cons of the Options](#pros-and-cons-of-the-options)
  - [Generate the data at the repository and commit it, with a check mode](#generate-the-data-at-the-repository-and-commit-it-with-a-check-mode)
  - [Write the facts by hand in the screens' strings](#write-the-facts-by-hand-in-the-screens-strings)
  - [Fetch the facts in the browser at page load](#fetch-the-facts-in-the-browser-at-page-load)
  - [Generate the data in every build without committing it](#generate-the-data-in-every-build-without-committing-it)
- [More Information](#more-information)
- [Traceability](#traceability)

<!-- /toc -->

**ID**: `cpt-site-adr-generated-site-data`

## Context and Problem Statement

The templates, docs and libraries screens show facts that belong to other sources: each template's manifest, version, description, claimed paths and key files; the FrontX CLI version, the template source-specs, the Node and npm versions the docs commands carry; each `@gears-frontx/*` package the site depends on, its exact version, its description and the commit it was published from. These sources change with every release the repository takes. The site is a static build with no backend, and its pages are also published as plain-text twins for crawlers and coding agents. How do these facts get onto the pages so that what the site says equals what the repository actually uses?

## Decision Drivers

* **No drift** - a version, description or source-spec copied by hand goes stale with the next release; the site must state what the repository uses at that commit.
* **Static and offline at build** - the site has no backend, and the build must not depend on the network.
* **The same content for every reader** - the screens, their plain-text twins and the generated metadata render the same data.
* **Checkable** - CI must fail when the data and its sources disagree.
* **Commands are true** - the docs' commands carry the versions the site itself uses and are run as written.

## Considered Options

* **Generate the data at the repository and commit it, with a check mode** - a repository script reads every source, writes the data files the screens render, and in check mode regenerates in memory and fails on any difference.
* **Write the facts by hand in the screens' strings** - the content is written and reviewed like any other copy.
* **Fetch the facts in the browser at page load** - the screens read manifests, package metadata and commits from GitHub and the npm registry when the page opens.
* **Generate the data in every build without committing it** - the build step writes the files each time and they are not stored.

## Decision Outcome

Chosen option: "Generate the data at the repository and commit it, with a check mode", because it is the only option in which the pages cannot drift from their sources, the build stays offline and every reader gets the same data.

**`scripts/site-data.mjs` writes three files that template-site's screens render**: the templates screen's page outline (every template's manifest and key files at the version the site uses, the official templates read from the FrontX CLI inventory at the provenance source-spec, plus the screen's hand-written guide), the docs screen's version data (the CLI's exact pin and the commit it was published from, the template source-specs, the Node and npm versions) and the libraries screen's data (each `@gears-frontx/*` dependency of the site, its exact version, its description, the commit it was published from and its source address). The files are committed and bundled with the screens; the templates and docs screens serve theirs through `@gears-frontx/api` services answered by a mock from the bundled file, because the site has no backend, and the route trees are built from the same files.

**The generator refuses inconsistent sources**: a guide that names a template the site does not have or leaves one out, a missing key file, an inventory at another version than the provenance records, an ecosystem pin that is not exact, a lockfile that resolves a package to another version or from anywhere but the registry, an installed package that differs from the lockfile, and a registry that does not hold a pinned release or names no commit for it. `--check` regenerates in memory and fails on any difference.

**It stays repository tooling** ([0004](./0004-template-or-repository-tooling.md)): its inputs lie in this repository, not in a project a template applies into.

The scope of this decision is how template, version and library facts reach the pages. Hand-written prose (the guide's groups, the screens' strings) stays hand-written; the page metadata pipeline is template-site-meta's.

### Consequences

* Good, because every version, description and source-spec on the site equals what the repository uses at that commit, and CI fails when it does not.
* Good, because builds need no network: the data is stored in the repository.
* Good, because the screens, their plain-text twins and the generated metadata read the same files.
* Good, because a release update is one command after the pins move, and the diff of the generated files shows exactly what changed on the site.
* Bad, because generation and the check both ask the npm registry for each release's publishing commit (the published tarballs carry none), so the check needs network.
* Bad, because the generated outline carries the key files' content, bounded in size and encoded, which makes the file large and its diffs noisy.
* Bad, because a developer who edits a generated file by hand gets a failing check, not a merged edit.

### Confirmation

`npm run site:data -- --check` runs in CI and fails on any difference between the committed files and their sources. `scripts/site-data.test.mjs` covers the readers, the refusals and the check mode. Each screen's outline test fails on a missing string key or an unfilled placeholder.

## Pros and Cons of the Options

### Generate the data at the repository and commit it, with a check mode

* Good, because drift becomes a CI failure.
* Good, because the stored output keeps the build offline and reviewable.
* Bad, because the check needs network for the registry's publishing commits.

### Write the facts by hand in the screens' strings

* Good, because it needs no tooling and the text reads naturally.
* Bad, because every release the repository takes leaves stale versions, descriptions and source-specs until someone notices, and the docs' commands stop matching what they claim to run.

### Fetch the facts in the browser at page load

* Good, because the data is always current with the upstream sources.
* Bad, because it shows the latest upstream state, not what this repository uses at its commit.
* Bad, because every visit depends on GitHub and the registry being reachable and not rate-limiting, the plain-text twins and crawlers get no data, and a static site has no server to cache it.

### Generate the data in every build without committing it

* Good, because there are no generated files in the repository.
* Bad, because every build needs the network and the CLI inventory, and a build's content depends on the registry's answers at build time.
* Bad, because changes to what the site states are invisible in review, since no diff exists.

## More Information

The decision is revisited if the published `@gears-frontx/*` tarballs start to record the commit they were published from, which would remove the registry query from the check, or if the site gains a backend that serves the same data from its sources.

Applicability of the remaining checklist categories: **PERF** - addressed: the data is bundled and served by a mock, with no request at page load beyond the screen's own. **SEC** - Not applicable, because only public metadata is read. **REL** - addressed: the build has no network dependency. **DATA** - addressed: the three outputs have a fixed shape the screens and their tests read. **INT** - addressed: the CLI inventory, the lockfiles and the registry are read through their documented interfaces. **OPS** - addressed: CI runs the check mode. **MAINT** - addressed: one command after a release. **TEST** - addressed: generator tests and outline tests. **COMPL** - Not applicable. **UX** - addressed: the facts visitors read are true for the site's own versions. **BIZ** - Not applicable.

## Traceability

- **PRD**: [PRD.md](../PRD.md)
- **DESIGN**: [DESIGN.md](../DESIGN.md)

This decision directly addresses the following requirements and design elements:

* `cpt-site-fr-site-sections` - Template pages are generated from each template's manifest and source, and docs commands carry the versions the site uses.
* `cpt-site-fr-plain-text-twins` - The twins render the same generated data as the pages.
* `cpt-site-nfr-toolchain` - The docs state the Node and npm versions the repository pins, read from those pins.
* `cpt-site-component-site-data` - The generator this decision chooses.
* `cpt-site-principle-registry-shaped` - The libraries data reads the exact registry pins, and the generator refuses a range or a non-registry resolution.
