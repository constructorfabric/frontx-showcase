# Feature: Cross-Screen Navigation

- [x] `p1` - **ID**: `cpt-template-catalogue-featstatus-cross-screen-navigation`

<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Show a Component Another Screen Asks For](#show-a-component-another-screen-asks-for)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [No Process of Its Own](#no-process-of-its-own)
- [4. States (CDSL)](#4-states-cdsl)
  - [No Lifecycle to Model](#no-lifecycle-to-model)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Showing a Component on Request](#showing-a-component-on-request)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

## 1. Feature Context

- [x] `p1` - `cpt-template-catalogue-feature-cross-screen-navigation`

### 1.1 Overview

What crosses the boundary of the catalogue's screen: another screen of the host application opens the catalogue at a component's page by sending the catalogue's own `show_component` action after the screen domain's mount action, and the catalogue moves its own router there. The catalogue itself opens no other screen, links to none and reads no list of the host's screens; the host lists its screens in its own menu. The code is `src/frame/showComponent.ts` of `catalogue-mfe`; the manifest declares the action and its schema.

### 1.2 Purpose

A link from another screen must reach a component page with one history entry and no reload, without the sender knowing the catalogue's routes and without the catalogue accepting anything but its own pages. A typed action the catalogue declares, with a closed schema whose target is the catalogue's screen and whose payload is an enum of the component slugs, gives exactly that: the host's mediator refuses any other request, and the address is the host router's byproduct of the move.

**Requirements**: `cpt-template-catalogue-fr-links-to-screens`, `cpt-template-catalogue-fr-show-component`, `cpt-template-catalogue-nfr-self-contained`

**Principles**: `cpt-template-catalogue-principle-host-lists-screens`

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-catalogue-actor-visitor` | Follows a link on another screen to a component page and returns with Back |
| `cpt-template-catalogue-actor-host-application` | Mounts the catalogue in its screen domain, validates the `show_component` action against the catalogue's schema and delivers it to the catalogue |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md), component `cpt-template-catalogue-component-cross-screen-navigation`, sequence `cpt-template-catalogue-seq-show-component`
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.2
- **Dependencies**: None. The Catalogue Screen feature ([FEATURE](../catalogue-screen/FEATURE.md)) declares the action in the manifest and registers this feature's handler in the lifecycle.

## 2. Actor Flows (CDSL)

### Show a Component Another Screen Asks For

- [x] `p1` - **ID**: `cpt-template-catalogue-flow-cross-screen-navigation-show-component`

**Use cases**: `cpt-template-catalogue-usecase-open-from-another-screen`

**Actor**: `cpt-template-catalogue-actor-host-application`

**Success Scenarios**:
- Another screen sends `mount_ext` for the catalogue followed by `show_component` with a component's slug; the host mounts the catalogue, the handler registered in `mount()` replaces the entry `mount_ext` wrote with the component's page, and Back returns to the previous screen.

**Error Scenarios**:
- The host's mediator refuses a `show_component` whose target is not the catalogue or whose component is not one of the catalogue's slugs: the catalogue stays where `mount_ext` left it, its index on a fresh mount.
- The payload carries no string component, which the schema forbids: the handler throws, naming the action.
- The package app has no router: the handler throws.

**Steps**:
1. [x] - `p1` - Read the component's slug from the action's payload; **IF** it is not a string, throw - `inst-read-component`
2. [x] - `p1` - **IF** the package app has no MFE router, throw - `inst-require-router`
3. [x] - `p1` - Replace the current history entry with `/components/<slug>` through the app's navigation facade, read when the action arrives - `inst-replace-entry`
4. [x] - `p1` - **RETURN** a settled promise - `inst-return-settled`

## 3. Processes / Business Logic (CDSL)

### No Process of Its Own

The feature has no process beyond its flow: the catalogue builds no address, reads no list of screens and opens no other screen.

## 4. States (CDSL)

### No Lifecycle to Model

The handler keeps nothing between actions; the catalogue's current page is its router's.

## 5. Definitions of Done

### Showing a Component on Request

- [x] `p1` - **ID**: `cpt-template-catalogue-dod-cross-screen-navigation-show-component`

The system **MUST** declare `gts.frontx.mfes.comm.action.v1~frontx.catalogue.action.show_component.v1~` on the catalogue's entry with a closed schema whose target is the catalogue's screen extension and whose payload `{ component }` is an enum of the component slugs, **MUST** register its handler before `mount()` returns, **MUST** move the catalogue's own router to `/components/<slug>` by replacing the current entry, and **MUST NOT** open, link or read any other screen of the host.

**Implements**:
- `cpt-template-catalogue-flow-cross-screen-navigation-show-component`

**Constraints**: `cpt-template-catalogue-constraint-query-addressing`

**Touches**:
- API: `gts.frontx.mfes.comm.action.v1~frontx.catalogue.action.show_component.v1~`, payload `{ component }`
- DB: none
- Entities: Catalogue entry

## 6. Acceptance Criteria

- [x] The manifest declares `show_component` on the entry with a closed schema whose target is the catalogue's screen and whose payload enum equals the component slugs (`src/manifest.test.ts`, "declares its show_component action on its entry, with a closed schema that names every component by its slug and targets only the catalogue screen").
- [x] The lifecycle registers the `show_component` handler on the bridge when the screen mounts (`src/lifecycle.test.tsx`, "registers its show_component handler on the bridge when it mounts, passing the mount context on to the base mount").
- [x] The handler replaces the catalogue's entry with the named component's page and refuses a payload without a string component and an app without a router (`src/frame/showComponent.test.ts`).
- [x] The section bar and the panel list only the catalogue's own pages (`src/routes.test.tsx`, "underlines the section of the current page in the tab bar", "lists the families on the index and in the navigation panel in the same order, after the panel section groups"); review confirms that the package holds no reader of the host's screen list, no routing grammar and no link to another screen.
- [x] Not applicable, with reasons: performance (one action per move), data (no stored state), operations (no diagnostics beyond the host mediator's refusal).
