# Feature: Template Shape Guard


<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Validate the Templates](#validate-the-templates)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Check One Template's Shape](#check-one-templates-shape)
  - [Check the AI Bundle List](#check-the-ai-bundle-list)
  - [Check the Non-Screen Package List](#check-the-non-screen-package-list)
- [4. States (CDSL)](#4-states-cdsl)
  - [No Lifecycle to Model](#no-lifecycle-to-model)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Every Template Follows the Template Shape](#every-template-follows-the-template-shape)
  - [The Root Ignore Lists Match the Templates](#the-root-ignore-lists-match-the-templates)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

- [x] `p2` - **ID**: `cpt-site-featstatus-template-shape-guard`
## 1. Feature Context

- [x] `p2` - `cpt-site-feature-template-shape-guard`

### 1.1 Overview

This feature checks every template of the repository: first with the FrontX CLI's own template validation (the manifest contract and the self-containment of the template's content), then against the template shape of DESIGN section 4.2.1 (overlay only, the identity prefix, claims limited to screen packages, non-screen packages (tooling, brand, components) and the template's own AI bundle, no harness inside the template, nothing outside the shape at its top level, the README sections in their order), and finally checks that the root `.gitignore` lists exactly the AI bundles of the existing templates and the site copies of their non-screen packages.

The code is `scripts/validate-templates.mjs`. The package shape rules of DESIGN section 4.2.2 that each package's own manifest test holds are specified in each template's own tree; the pin, styling and text rules belong to the repository policies.

### 1.2 Purpose

Template consumers and site developers rely on one documented template shape; the repository's checks fail when a template does not follow it.

The template territory rule is part of the shape: each template's documents and markers carry only its own ids and no gears-frontx id. The validator keeps all ids in one set, so this check holds what a script can read (the template's self-contained content, its overlay-only ownership and its own claims), and review holds the id rules.

**Requirements**: `cpt-site-fr-uniform-shape`

**Principles**: `cpt-site-principle-uniform-shape`

**Constraints**: `cpt-site-constraint-template-territory`

**Components**: `cpt-site-component-guards` (its template shape check; the policies of the same component belong to the repository policies feature)

**ADRs**: `cpt-site-adr-template-territory-traceability`, `cpt-site-adr-template-or-repository-tooling`

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-site-actor-site-developer` | Runs the check after changing a template, and in CI it runs on every change |
| `cpt-site-actor-frontx-cli` | Provides the manifest filename and the template validation the check runs first |
| `cpt-site-actor-template-consumer` | Relies on every template following the shape the check holds |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md), sections 3.2 (repository guards), 4.2 (the uniform shape), 4.7 (commands)
- **ADR**: [0001 template territory traceability](../../ADR/0001-template-territory-traceability.md), [0004 template or repository tooling](../../ADR/0004-template-or-repository-tooling.md)
- **Dependencies**: `cpt-site-feature-template-composition` (the shared template discovery and entry check)

## 2. Actor Flows (CDSL)

**Use cases**: `cpt-site-usecase-change-screen` (the checks the developer runs after a change)

### Validate the Templates

- [x] `p2` - **ID**: `cpt-site-flow-template-shape-guard-validate`

**Actor**: `cpt-site-actor-site-developer`

**Success Scenarios**:
- Every template passes the CLI's validation and the shape check, the `.gitignore` lists match: each template is reported as passing and the command reports OK with the template count. With no template, it reports OK for zero templates.

**Error Scenarios**:
- The FrontX CLI is not installed: the command fails with the hint to run `npm ci` at the repository root.
- A `.gitignore` list and the templates differ, a template fails the CLI's validation, or a template breaks the shape: each failure is printed, and the command fails with the template count and exits with code 1.

**Steps**:
1. [x] - `p2` - Developer runs `npm run templates:validate` from the repository root - `inst-run`
2. [x] - `p2` - Load the installed FrontX CLI; **IF** it is not installed: print the failure with the hint to run `npm ci` and **RETURN** exit code 1 - `inst-load-cli`
3. [x] - `p2` - Find the templates with the shared template discovery, using the manifest filename the CLI exports - `inst-discover`
4. [x] - `p2` - Read the root `.gitignore` and check its lists using `cpt-site-algo-template-shape-guard-gitignore-bundles` and `cpt-site-algo-template-shape-guard-gitignore-tooling`; print each error as a failure - `inst-gitignore`
5. [x] - `p2` - **FOR EACH** template: run the CLI's template validation and `cpt-site-algo-template-shape-guard-shape`; **IF** both pass: print that the template passes - `inst-validate-each`
6. [x] - `p2` - **ELSE** print the CLI's message when its validation failed, and each shape error - `inst-report-template`
7. [x] - `p2` - **IF** anything failed: print the failure with the template count and **RETURN** exit code 1 - `inst-fail`
8. [x] - `p2` - **RETURN** OK with the template count, exit code 0 - `inst-pass`

## 3. Processes / Business Logic (CDSL)

### Check One Template's Shape

- [x] `p2` - **ID**: `cpt-site-algo-template-shape-guard-shape`

**Input**: A template directory.

**Output**: The shape errors of the template.

**Steps**:
1. [x] - `p2` - **IF** the directory name is not `template-<name>`: **RETURN** that error alone - `inst-name`
2. [x] - `p2` - Read the manifest; **IF** its identity is not `@gears-frontx/frontx-template-<name>`: report it - `inst-identity`
3. [x] - `p2` - **IF** the manifest declares referenced templates: report it, as the prerequisite belongs in the description and the README - `inst-no-referenced`
4. [x] - `p2` - **IF** the manifest declares shared files: report it, as a template is an overlay only - `inst-overlay`
5. [x] - `p2` - **IF** the template does not claim its own AI bundle: report it - `inst-own-bundle`
6. [x] - `p2` - **FOR EACH** claimed subtree: **IF** it is not a screen package directory, the template's shared folder, a non-screen package directory under `src-app/verify_packages/` or its own AI bundle, or it is a shared folder named for another template, or it does not exist: report it - `inst-subtrees`
7. [x] - `p2` - **FOR EACH** harness path (`package.json`, `package-lock.json`, the MFE test base, the test utilities): **IF** the template holds it: report it, as the site is the harness - `inst-forbidden`
8. [x] - `p2` - **FOR EACH** top-level entry git would record: **IF** it is not the manifest, the README, `architecture`, `src-app` or `.frontx`: report it as outside the shape - `inst-top-level`
9. [x] - `p2` - **IF** the README is missing: report it; otherwise **FOR EACH** required section (What it contributes, Prerequisites, Screens and routes, SEO metadata, Develop, Moving into another project): **IF** it is missing or out of order: report it - `inst-readme`
10. [x] - `p2` - **RETURN** the errors - `inst-return-shape`

### Check the AI Bundle List

- [x] `p2` - **ID**: `cpt-site-algo-template-shape-guard-gitignore-bundles`

**Input**: The root `.gitignore` text and the template directories.

**Output**: One error per missing or stale line.

**Steps**:
1. [x] - `p2` - Collect the AI bundle lines of `site/.frontx/ai/@gears-frontx/` the `.gitignore` lists - `inst-bundles-listed`
2. [x] - `p2` - Derive the expected bundle of every template from its directory name - `inst-bundles-expected`
3. [x] - `p2` - Report every expected bundle the file does not list, and every listed bundle no template has - `inst-bundles-compare`
4. [x] - `p2` - **RETURN** the errors - `inst-bundles-return`

### Check the Non-Screen Package List

- [x] `p2` - **ID**: `cpt-site-algo-template-shape-guard-gitignore-tooling`

**Input**: The root `.gitignore` text and the template directories.

**Output**: One error per missing or stale line.

**Steps**:
1. [x] - `p2` - Collect the site copies of non-screen packages (`site/src-app/verify_packages/<package>/`) the `.gitignore` lists - `inst-tooling-listed`
2. [x] - `p2` - Collect the non-screen packages every template's manifest claims - `inst-tooling-claimed`
3. [x] - `p2` - Report every claimed package the file does not list, and every listed package no template claims - `inst-tooling-compare`
4. [x] - `p2` - **RETURN** the errors - `inst-tooling-return`

## 4. States (CDSL)

### No Lifecycle to Model

Not applicable: the check is a stateless pass over the templates and the root `.gitignore`.

## 5. Definitions of Done

### Every Template Follows the Template Shape

- [x] `p2` - **ID**: `cpt-site-dod-template-shape-guard-uniform-shape`

The system **MUST** fail the repository's checks, naming the template and the rule, when a template fails the FrontX CLI's template validation or breaks a rule of the template shape.

**Implements**:
- `cpt-site-flow-template-shape-guard-validate`
- `cpt-site-algo-template-shape-guard-shape`

**Constraints**: `cpt-site-constraint-template-territory` (the template's boundary: self-contained content, overlay only, its own claims; review holds the id rules)

**Touches**:
- `scripts/validate-templates.mjs`

### The Root Ignore Lists Match the Templates

- [x] `p2` - **ID**: `cpt-site-dod-template-shape-guard-gitignore-lists`

The system **MUST** fail the repository's checks when the root `.gitignore` does not list exactly the AI bundles of the existing templates and the site copies of the non-screen packages they claim.

**Implements**:
- `cpt-site-flow-template-shape-guard-validate`
- `cpt-site-algo-template-shape-guard-gitignore-bundles`
- `cpt-site-algo-template-shape-guard-gitignore-tooling`

**Touches**:
- `scripts/validate-templates.mjs`
- `.gitignore` (read)

## 6. Acceptance Criteria

- [x] A template in the uniform shape passes; a missing identity prefix, shared files, referenced templates, claims outside the allowed paths, a missing own AI bundle claim, a harness inside the template and files outside the shape are reported, while entries git never records are ignored (`scripts/validate-templates.test.mjs`: the `checkTemplateShape` suite).
- [x] A second path segment under `src-app/mfe_packages/` is allowed only for the shared folder, and a non-screen package only one segment deep under `src-app/verify_packages/`; a template that delivers a brand or component package there, alone or beside a screen package, passes the shape and the ignore lists (`scripts/validate-templates.test.mjs`: "allows a second path segment under src-app/mfe_packages/ only for the shared folder", "allows a tooling package under src-app/verify_packages/, one path segment deep", "accepts the brand, kit candidate and block templates: non-screen packages under src-app/verify_packages/, one beside a screen package").
- [x] The README sections are required in order, and a missing README is reported (`scripts/validate-templates.test.mjs`: "requires the README sections in order", "reports a missing README").
- [x] The AI bundle and non-screen package lists pass when they equal the templates and report missing and stale lines (`scripts/validate-templates.test.mjs`: the `checkGitignoreBundles` and `checkGitignoreVerifyPackages` suites).
- [x] The command passes with zero templates and with a valid listed template, fails when the CLI's validation fails or the shape is broken, and fails clearly when the CLI is not installed (`scripts/validate-templates.test.mjs`: the `runCli` and `loadCliModule` suites).
- [x] `npm run templates:validate` passes on the repository as committed.
