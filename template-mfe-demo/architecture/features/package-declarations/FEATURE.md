# Feature: Package Declarations and Overlay

- [x] `p1` - **ID**: `cpt-template-mfe-demo-featstatus-package-declarations`

<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [No Feature-Owned Actor Flow](#no-feature-owned-actor-flow)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Mirror Declared Identifiers](#mirror-declared-identifiers)
- [4. States (CDSL)](#4-states-cdsl)
  - [No Feature-Owned State Machine](#no-feature-owned-state-machine)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Declared Entities](#declared-entities)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

## 1. Feature Context

- [x] `p1` - `cpt-template-mfe-demo-feature-package-declarations`

### 1.1 Overview

Everything the runtime and the shell learn about `demo-mfe`, `widgets-fixture-a` and `widgets-fixture-b` from their declarations: the three package manifests, the identifiers the code mirrors from them once, the template manifest that makes the template a self-contained overlay, and each package's build and test setup against the shell's shared dependencies at exact pins.

### 1.2 Purpose

The shell registers screens, the nested widgets screen discovers widgets and the site generates pages only from declarations. This feature makes those declarations the single source of every GTS entity of the template, keeps template-mfe's identity for the packages, and lets the template move between projects as a unit.

**Requirements**: `cpt-template-mfe-demo-fr-demo-screens`, `cpt-template-mfe-demo-fr-screen-metadata`, `cpt-template-mfe-demo-fr-self-contained-overlay`

**Principles**: `cpt-template-mfe-demo-principle-declared-entities`, `cpt-template-mfe-demo-principle-upstream-identity`

**Constraints**: `cpt-template-mfe-demo-constraint-shell-prerequisite`, `cpt-template-mfe-demo-constraint-exclusive-with-upstream-demo`, `cpt-template-mfe-demo-constraint-shared-dependencies`, `cpt-template-mfe-demo-constraint-exact-pins`

**Components**: `cpt-template-mfe-demo-component-package-manifests`

**Scope**:
- `demo-mfe/mfe.json`: the refresh profile action schema, the remote manifest on preview port 3001, the `widgets` domain (route key `widgets`, load, mount and unmount actions, 5000 ms default action timeout), four entries, and four screen extensions of the shell's screen extension type, under template-mfe's identifiers, with route tokens `mfe-hello-world`, `mfe-profile`, `mfe-theme`, `mfe-widgets`, menu orders 65, 66, 67 and 69, the host's demos nav group's id as `presentation.group` and a `seo` block each.
- `widgets-fixture-a/mfe.json` and `widgets-fixture-b/mfe.json`: the widget ping action schema, the remote manifests, one entry each, and the three widget extensions in the `widgets` domain (alpha and beta share fixture-a's entry), with no `seo` block.
- `demo-mfe/src/shared/extension-ids.ts`: the identifiers the code uses, mirrored once from the manifests.
- `frontx-template.json` with its four exclusive subtrees and no shared file; the AI bundle with the demo contract guideline; the READMEs; per-package `package.json`, `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`, `index.html` and `src/test-support/`.

**Out of scope**: lifecycles, screens and the nested app (later features); generating pages from the `seo` blocks and listing the screens of a nav group in the header, which the site does.

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-mfe-demo-actor-shell-host` | Reads the manifests through its build, registers the screens in its screen domain and publishes the manifests aggregate the nested widgets screen reads |
| `cpt-template-mfe-demo-actor-metadata-reader` | Reads each screen's `seo` block to generate the page's head, sitemap entry and crawler files |
| `cpt-template-mfe-demo-actor-project-developer` | Copies the template's subtrees into a project with template-shell applied, without template-mfe's demo packages |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md)
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.1
- **ADRs**: `cpt-template-mfe-demo-adr-adapted-copy-under-upstream-identity`
- **Interfaces**: `cpt-template-mfe-demo-interface-screen-addresses`, `cpt-template-mfe-demo-contract-demos-nav-group`, `cpt-template-mfe-demo-contract-shell-host`
- **Dependencies**: None

## 2. Actor Flows (CDSL)

User-facing interactions that start with an actor (human or external system) and describe the end-to-end flow of a use case. Each flow has a triggering actor and shows how the system responds to actor actions.

**Use cases**: `cpt-template-mfe-demo-usecase-apply-template`

### No Feature-Owned Actor Flow

Not applicable. The declarations are data: the shell's build and runtime read them and the site's generator turns them into pages, so the actors' journeys run through the shell and the later features. The template application use case is a file copy followed by an install, checked by the repository's template validation, and runs no code of this feature.

## 3. Processes / Business Logic (CDSL)

Internal system functions and procedures that do not interact with actors directly. These are reusable building blocks called by Actor Flows or other processes.

### Mirror Declared Identifiers

- [x] `p1` - **ID**: `cpt-template-mfe-demo-algo-package-declarations-mirror-identifiers`

**Input**: The identifiers authored in `demo-mfe/mfe.json`, `widgets-fixture-a/mfe.json` and the shell's screen domain

**Output**: String constants the code addresses entities by, so no package imports another package's manifest and no code builds an entity

**Steps**:
1. [x] - `p1` - Mirror the hello world, data loading and theme screen extension identifiers, template-mfe's own, each chained directly onto the shell's screen type, and the id of the host's demos nav group the screens name (`DEMOS_NAV_GROUP_ID`) - `inst-screen-ids`
2. [x] - `p1` - Mirror the refresh profile action type the data loading entry handles - `inst-refresh-action-id`
3. [x] - `p1` - Mirror the nested widgets screen extension identifier and the `widgets` domain instance identifier the nested app takes ownership of; the widgets host module declares its own copy of the domain identifier - `inst-widgets-host-ids`
4. [x] - `p1` - Mirror widgets-fixture-a's alpha extension identifier and the widget ping action type, the targets of the isolation screen's third actions chain; the widgets host module declares its own copy of the ping action type - `inst-widget-ids`

## 4. States (CDSL)

Include when entities have explicit lifecycle states.

### No Feature-Owned State Machine

Not applicable. Declarations have no lifecycle in this template: they are read as they are authored, and the registration states of the entities belong to the shell's runtime and to the nested app of the widgets feature.

## 5. Definitions of Done

Specific implementation tasks derived from flows and algorithms above.

### Declared Entities

- [x] `p1` - **ID**: `cpt-template-mfe-demo-dod-package-declarations-declared-entities`

The system **MUST** author every GTS entity of the three packages (schemas, remote manifests, the `widgets` domain, entries, four screen extensions with route token, presentation, the demos nav group's id and `seo` block, three widget extensions without `seo`) in the package manifests, under template-mfe's package names and identifiers, the four screen extension identifiers included, and the code **MUST** refer to these entities only through mirrored identifiers: the package's identifier module mirrors each once, and the widgets host module declares its own copies of the `widgets` domain identifier and the ping action type; never by importing another package or by constructing, spreading or overriding an entity.

**Implements**:
- `cpt-template-mfe-demo-algo-package-declarations-mirror-identifiers`

**Constraints**: `cpt-template-mfe-demo-constraint-shell-prerequisite`, `cpt-template-mfe-demo-constraint-exclusive-with-upstream-demo`, `cpt-template-mfe-demo-constraint-shared-dependencies`, `cpt-template-mfe-demo-constraint-exact-pins`

**Touches**:
- Entities: Remote manifest, Entry, Screen extension, Widgets domain, Widget extension, Refresh profile action, Widget ping action, Demos nav group

## 6. Acceptance Criteria

- [x] `demo-mfe` declares the four screens with `mfe-*` route tokens and menu orders 65, 66, 67 and 69, each naming the host's demos nav group's id, as extensions of the shell's screen extension type under template-mfe's identifiers, and carries no screen type schema.
- [x] Every screen declares a title and a description of 50 to 160 characters covering its route tree; neither widget package declares page metadata.
- [x] The `widgets` domain is routed under its own key `widgets`, and widgets-fixture-a contributes two widget instances of one entry.
- [x] The refresh profile action schema admits the well-formed action aimed at the data loading screen and refuses an undeclared top-level or payload field.
- [x] No manifest declares shared dependencies; each package externalizes the shared set (React, the FrontX packages, both routing packages, the query and state libraries) in its `vite.config.ts`, and widgets-fixture-a declares every directly imported package a shared dependency also depends on.
- [x] Each remote is served from the port its package previews on, and no package is marked as a template example.
- [x] The template manifest claims exactly the three package directories and the AI bundle, with no shared file; every dependency is an exact pin equal to the site's install. These are checked by the hosting repository's template and pin checks, and the pages from the `seo` blocks by its metadata check.

**Test scenarios** (Vitest, in each composed package):
- `demo-mfe/src/manifest.test.ts`: shared dependencies externalized; GTS ids parse and entries name the manifest; one `./lifecycle-<entry>` module per entry; product content, not a template example; preview port; four screens with `mfe-*` tokens and orders 65, 66, 67 and 69 in the demos nav group; every screen directly on the shell's screen type, its id one of the four mirrored constants, and no screen type schema; registration against the shell screen schema after the nav group type and the demos instance; page metadata covering the route tree; the `widgets` domain routed under its own key.
- `demo-mfe/src/refresh-profile-action-schema.test.ts`: admits the well-formed action; refuses an undeclared top-level field; refuses an undeclared payload field.
- `widgets-fixture-a/src/manifest.test.ts`, `widgets-fixture-b/src/manifest.test.ts`: shared dependencies, not a template example, preview port, widget instances in the `widgets` domain with no page metadata.
- `widgets-fixture-a/src/shared-deps.vite-config.test.ts`: every directly imported package that a shared dependency also depends on is declared.
