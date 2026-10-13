# Feature: Site Data


<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Generate or Check the Site Data](#generate-or-check-the-site-data)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Generate the Outputs](#generate-the-outputs)
  - [Collect the Templates](#collect-the-templates)
  - [Build the Templates Outline](#build-the-templates-outline)
  - [Resolve the Screen Targets](#resolve-the-screen-targets)
  - [Verify a Registry Pin](#verify-a-registry-pin)
  - [Build the Docs Versions](#build-the-docs-versions)
  - [Build the Libraries Data](#build-the-libraries-data)
- [4. States (CDSL)](#4-states-cdsl)
  - [No Lifecycle to Model](#no-lifecycle-to-model)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Site Data Generated From Its Sources](#site-data-generated-from-its-sources)
  - [Inconsistent Sources and Stale Files Fail](#inconsistent-sources-and-stale-files-fail)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

- [x] `p2` - **ID**: `cpt-site-featstatus-site-data`
## 1. Feature Context

- [x] `p2` - `cpt-site-feature-site-data`

### 1.1 Overview

This feature generates the three data files template-site's own screens render: the templates screen's outline, the docs screen's version data and the Libraries screen's data. It reads them from their sources (every template's manifest and key files, template-site's hand-written guide, the provenance of the official templates, the root and site pins and lockfiles, the installed packages, the npm registry's record of each pinned release, `.nvmrc` and the npm pin) and fails on any inconsistency between those sources. A check mode regenerates in memory and fails when a committed file differs.

The code is `scripts/site-data.mjs`. Its outputs are template-site sources (`outline.generated.json`, `versions.generated.json`, `libraries.generated.json`); the screens that render them and the hand-written guide are specified by [template-site DESIGN](../../../template-site/architecture/DESIGN.md).

### 1.2 Purpose

No template description, version, source-spec or published commit is copied by hand into the site's pages, so the pages cannot drift from what the templates and the pinned packages are. This is the root share of the site's own sections: the data the home, templates, docs and Libraries screens show.

**Requirements**: `cpt-site-fr-site-sections`

**Principles**: None: the decision this feature implements is the root ADR on generated site data, not a design principle.

**Components**: `cpt-site-component-site-data`

**ADRs**: `cpt-site-adr-generated-site-data`, `cpt-site-adr-template-or-repository-tooling`

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-site-actor-site-developer` | Regenerates the site data after a template, pin or provenance change, or checks that the committed files match their sources |
| `cpt-site-actor-frontx-cli` | Installs an official template into the repository's CLI inventory at its provenance source-spec when the inventory lacks it |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md), sections 3.2 (site-data), 4.7 (commands), 4.8 (ecosystem dependencies), 4.13 (generated site data)
- **ADR**: [0007 generated site data](../../ADR/0007-generated-site-data.md)
- **Dependencies**: `cpt-site-feature-template-composition` (the shared template discovery and entry check)

## 2. Actor Flows (CDSL)

**Use cases**: None: generating the site data is a maintenance step of the site developer, not one of the PRD's use cases.

### Generate or Check the Site Data

- [x] `p2` - **ID**: `cpt-site-flow-site-data-generate`

**Actor**: `cpt-site-actor-site-developer`

**Success Scenarios**:
- Without a flag, the three files are written where they differ from what the sources generate, and the command reports that it wrote them.
- With `--check`, every file equals what the sources generate, and the command reports that they match.

**Error Scenarios**:
- With `--check`, a file differs from what its sources generate: the command names it and exits with code 1.
- The sources disagree (a guide naming a missing template, a range pin, a lock entry not from the registry, an install that differs from the lock, a release the registry does not hold, a missing provenance record, an oversized key file): the command prints the reason and exits with code 1 without writing.

**Steps**:
1. [x] - `p2` - Developer runs `npm run site:data`, or `npm run site:data -- --check` to check only - `inst-run`
2. [x] - `p2` - Generate the three outputs in memory using `cpt-site-algo-site-data-generate`, and read each output's committed text - `inst-generate`
3. [x] - `p2` - **IF** an output equals its committed text: leave it - `inst-unchanged`
4. [x] - `p2` - **IF** checking: record the output as stale; **ELSE** write it, creating its directory - `inst-write-or-record`
5. [x] - `p2` - **RETURN** the stale outputs - `inst-return-stale`
6. [x] - `p2` - **FOR EACH** stale output: print that it differs from what its sources generate, with the hint to run the generation; **IF** any: exit with code 1 - `inst-report-stale`
7. [x] - `p2` - Print that the generated files match their sources (check) or were written - `inst-report-ok`
8. [x] - `p2` - **CATCH** an inconsistency of the sources: print its message and exit with code 1 - `inst-catch`

## 3. Processes / Business Logic (CDSL)

### Generate the Outputs

- [x] `p2` - **ID**: `cpt-site-algo-site-data-generate`

**Input**: The repository root, the inventory install function, the registry lookup.

**Output**: The three outputs, each with its repository path and its text as written to disk.

**Steps**:
1. [x] - `p2` - Read template-site's hand-written guide of the templates screen - `inst-read-guide`
2. [x] - `p2` - Build the templates outline using `cpt-site-algo-site-data-collect-templates` and `cpt-site-algo-site-data-templates-outline` - `inst-build-outline`
3. [x] - `p2` - **RETURN** the outline, the docs versions (`cpt-site-algo-site-data-docs-versions`) and the libraries data (`cpt-site-algo-site-data-libraries`), each serialised as indented JSON with every long dash of a source text written as an escape that parses back to the same text - `inst-serialise`

### Collect the Templates

- [x] `p2` - **ID**: `cpt-site-algo-site-data-collect-templates`

**Input**: The repository root and the inventory install function.

**Output**: Every template the templates screen presents: the official ones at their provenance source-spec, then this repository's.

**Steps**:
1. [x] - `p2` - Read the provenance of the official templates applied to `site/` - `inst-read-provenance`
2. [x] - `p2` - **FOR EACH** provenance record: parse its source-spec into repository, subtree and commit, and locate the template in the repository's CLI inventory - `inst-official`
3. [x] - `p2` - **IF** the inventory lacks the template or holds it from another source-spec: install it through the FrontX CLI the repository pins, with the inventory root set to the repository's inventory - `inst-inventory-install`
4. [x] - `p2` - **IF** the template is still not in the inventory: fail naming it - `inst-inventory-missing`
5. [x] - `p2` - **IF** the inventory's manifest name or version differs from the provenance record: fail naming both; otherwise keep the template with its slug, source-spec and commit - `inst-check-version`
6. [x] - `p2` - Add this repository's templates, found by the shared template discovery - `inst-own`
7. [x] - `p2` - **RETURN** the official templates followed by this repository's - `inst-return-templates`

### Build the Templates Outline

- [x] `p2` - **ID**: `cpt-site-algo-site-data-templates-outline`

**Input**: The collected templates, the guide and the screen targets (`cpt-site-algo-site-data-screen-targets`).

**Output**: The outline: the index page and one page per template, with the strings namespace the screen reads.

**Steps**:
1. [x] - `p2` - **IF** the guide names a template the site does not have, or a template the site has is in no group of the guide: fail naming it - `inst-guide-coverage`
2. [x] - `p2` - Build the index from the groups the guide marks featured (the first as a labelled pair, the rest as rows) and the band that leads to the getting-started guide - `inst-index`
3. [x] - `p2` - **FOR EACH** template the guide lists: build its page from the guide entry and the manifest: the facts (kind, prerequisite, version, next steps), the file explorer with the key files, the source link and the license and notice of an official template's repository, the examples, the checklist of what it gives, the manifest and source actions of an official template, and the source details with the claimed subtrees; **IF** the guide has no entry for it: fail - `inst-pages`
4. [x] - `p2` - **FOR EACH** key file of a page: **IF** it does not exist in the template's source or is over the per-file size limit: fail naming it; otherwise carry its content in base64 with its line count and source address; **IF** the page's key files together exceed the per-page limit: fail - `inst-key-files`
5. [x] - `p2` - **RETURN** the outline with the index first - `inst-return-outline`

### Resolve the Screen Targets

- [x] `p2` - **ID**: `cpt-site-algo-site-data-screen-targets`

**Input**: The repository root; for a link, the target screen's route token and the page inside it the guide names.

**Output**: The screens of the repository's templates by token, each with its screen extension id and the action that shows one of its pages; a link target of the templates outline.

**Steps**:
1. [x] - `p2` - **FOR EACH** screen extension on the screen domain in the `mfe.json` of every package of the repository's templates: record it by its route token with its extension id; **IF** two screen extensions declare one token, fail naming it - `inst-each-screen`
2. [x] - `p2` - Take as the screen's show action the one action its entry declares whose schema, in the same manifest, has a payload with exactly one required string property, with that property's enum when it has one; **IF** more than one action qualifies, fail naming the screen - `inst-show-action`
3. [x] - `p2` - **IF** the link targets the templates screen itself: **IF** it names a page that is not a template the site has, fail naming it; **ELSE** **RETURN** a route inside it - `inst-own-screen`
4. [x] - `p2` - **IF** the guide names a screen no template declares, a page of a screen with no show action, or a page its show action's enum does not name, fail naming it; **ELSE** **RETURN** the screen's extension id and, for a page, its show action with the page's last path segment as the payload value - `inst-other-screen`

### Verify a Registry Pin

- [x] `p2` - **ID**: `cpt-site-algo-site-data-registry-pin`

**Input**: A `package.json`, its lockfile, the dependency field and the package name; the registry lookup.

**Output**: The pinned version and the commit it was published from.

**Steps**:
1. [x] - `p2` - **IF** the spec is not an exact version: fail naming the file, the field and the spec - `inst-exact-pin`
2. [x] - `p2` - **IF** the lockfile resolves another version, or resolves it from another address than the public npm registry: fail naming both - `inst-lock-match`
3. [x] - `p2` - Ask the npm registry for the release's record (`npm view <name>@<version> version gitHead`); a release the registry does not return is absent - `inst-registry-view`
4. [x] - `p2` - **IF** the registry does not hold the release or its record names no commit: fail; otherwise **RETURN** the commit - `inst-published-commit`

### Build the Docs Versions

- [x] `p2` - **ID**: `cpt-site-algo-site-data-docs-versions`

**Input**: The repository root and the registry lookup.

**Output**: The variables the docs screen's guides are written with.

**Steps**:
1. [x] - `p2` - Read the provenance and the root `package.json` - `inst-docs-read`
2. [x] - `p2` - **IF** the provenance has no record of template-shell or of template-mfe: fail naming it - `inst-docs-records`
3. [x] - `p2` - **IF** template-shell and template-mfe were applied from different commits: fail - `inst-docs-same-commit`
4. [x] - `p2` - Read the FrontX CLI's version from the root pin and lockfile, and its published commit, using `cpt-site-algo-site-data-registry-pin` - `inst-docs-cli`
5. [x] - `p2` - **IF** the root `package.json` has no npm `packageManager` pin: fail - `inst-docs-npm`
6. [x] - `p2` - **RETURN** the Node version of `.nvmrc`, the npm pin, the CLI package and version, the templates repository and commit, the identity, version and source-spec of template-shell and template-mfe, template-mfe's file address at that commit and the AI kit's README at the commit the CLI was published from - `inst-docs-return`

### Build the Libraries Data

- [x] `p2` - **ID**: `cpt-site-algo-site-data-libraries`

**Input**: The repository root and the registry lookup.

**Output**: The libraries the site's application depends on, the shell's workspace packages, and the variables the technical summaries read.

**Steps**:
1. [x] - `p2` - Read the site's `package.json` and lockfile - `inst-libs-read`
2. [x] - `p2` - **FOR EACH** `@gears-frontx/*` dependency of the site that is a library (not a screen package, not template-shell), sorted: verify its pin using `cpt-site-algo-site-data-registry-pin`; **IF** it is not installed or the installed version differs from the lockfile: fail; keep its version, its description with long dashes as hyphens and the vendor-qualified product name as the product's own, and its source address at the published commit - `inst-libs-packages`
3. [x] - `p2` - **FOR EACH** workspace package of template-shell the site lockfile links: **IF** the lockfile's version differs from the package's own: fail; otherwise keep its version and description - `inst-libs-shell-packages`
4. [x] - `p2` - Collect the libraries and the shell's workspace packages, and read the provenance - `inst-libs-collect`
5. [x] - `p2` - **FOR EACH** package the technical summaries are written from: **IF** the site does not depend on it: fail; otherwise keep its source address and short commit - `inst-libs-sources`
6. [x] - `p2` - **IF** the provenance has no record of template-shell: fail; otherwise read its repository, commit and subtree - `inst-libs-shell-source`
7. [x] - `p2` - **RETURN** a version variable per package, the source variables, template-shell's source address and short commit, the libraries with short commits, and the shell's workspace packages - `inst-libs-return`

## 4. States (CDSL)

### No Lifecycle to Model

Not applicable: the generation is a stateless pass over its sources; the generated files are rewritten whole and have no lifecycle.

## 5. Definitions of Done

### Site Data Generated From Its Sources

- [x] `p2` - **ID**: `cpt-site-dod-site-data-generated-from-sources`

The system **MUST** write the templates outline, the docs versions and the libraries data only from the templates' manifests and key files, the guide, the provenance, the pins and lockfiles, the installed packages, the registry's record of each pinned release, `.nvmrc` and the npm pin, **MUST** write only these three files inside template-site, and **MUST** install an official template into the repository's CLI inventory only through the FrontX CLI the repository pins.

**Implements**:
- `cpt-site-flow-site-data-generate`
- `cpt-site-algo-site-data-generate`
- `cpt-site-algo-site-data-collect-templates`
- `cpt-site-algo-site-data-templates-outline`
- `cpt-site-algo-site-data-screen-targets`
- `cpt-site-algo-site-data-docs-versions`
- `cpt-site-algo-site-data-libraries`

**Touches**:
- `scripts/site-data.mjs`
- `template-site/src-app/mfe_packages/site-templates-mfe/src/content/outline.generated.json` (written)
- `template-site/src-app/mfe_packages/site-docs-mfe/src/data/versions.generated.json` (written)
- `template-site/src-app/mfe_packages/site-libs-mfe/src/data/libraries.generated.json` (written)

### Inconsistent Sources and Stale Files Fail

- [x] `p2` - **ID**: `cpt-site-dod-site-data-fails-on-inconsistency`

The system **MUST** fail, without writing, on any inconsistency between the guide, the templates, the inventory, the provenance, the pins, the lockfiles, the installs and the registry, and **MUST** fail the check, naming each file, when a committed output differs from what its sources generate.

**Implements**:
- `cpt-site-flow-site-data-generate`
- `cpt-site-algo-site-data-registry-pin`

**Touches**:
- `scripts/site-data.mjs`

## 6. Acceptance Criteria

- [x] A long dash of a source text is written as a hyphen, and a source-spec is read into repository, subtree and commit (`scripts/site-data.test.mjs`: "writes a long dash of a source text as a hyphen and reads a source-spec").
- [x] A template the inventory holds from another source-spec is installed through the CLI (`scripts/site-data.test.mjs`: "installs a template through the CLI when the inventory holds another source-spec").
- [x] The index is built from the featured groups and each page from the manifests, the sources and the guide; another screen is named by its extension id and a page of it by its show action, never by its route; a page of the templates screen itself is a route inside it; a guide naming a missing key file, leaving a template out, linking a screen no template declares, a page of a screen with no show action, a page its show action's enum does not name or a templates page that is not a template the site has is refused; a screen token two extensions declare and an entry with more than one show action are refused (`scripts/site-data.test.mjs`: "builds the index from the featured groups and a page per template from the manifests, the sources and the guide", "refuses a guide that names a key file the template does not have, or leaves a template out", "refuses a guide link to a screen no template declares, to a page of a screen whose entry declares no action that shows one, to a page its show action does not name, or to a templates page that is not a template", "writes every link of the outline by extension id and show action, and a page of the templates screen as a route inside it", "reads a screen without a show action, refuses a token two extensions declare and an entry with two show actions, and skips extensions off the screen domain").
- [x] An oversized key file fails instead of being bundled, and a long dash in a shown source is written as an escape that parses back to the same text (`scripts/site-data.test.mjs`: "fails loudly on a key file over the size limit instead of bundling it", "writes a long dash of a shown source as an escape that parses back to the same text").
- [x] The docs versions read the toolchain, the CLI and the source-specs, and a CLI the root lockfile does not resolve from the registry at its pin is refused (`scripts/site-data.test.mjs`: the docs versions suite).
- [x] The libraries data lists the FrontX packages the site depends on with their published commits, the version variables and the shell's workspace packages, and refuses a range or `file:` spec, a lock entry that is not the pin or not from the registry, an install that differs from the lockfile, a release the registry does not hold or that names no commit, and a summarized package the site does not depend on (`scripts/site-data.test.mjs`: the libs data suite).
- [x] The check passes right after writing, names an output that no longer matches its sources, and covers the libraries data on its own (`scripts/site-data.test.mjs`: the `runSiteData --check` suite).
- [x] `npm run site:data -- --check` passes on the repository as committed.
