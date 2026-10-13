# Feature: Nested Widgets Domain

- [x] `p1` - **ID**: `cpt-template-mfe-demo-featstatus-widgets-nested-domain`

<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Mount the Nested Widgets Screen](#mount-the-nested-widgets-screen)
  - [Ping a Widget](#ping-a-widget)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Build the Nested App](#build-the-nested-app)
  - [Widgets Domain Implementation](#widgets-domain-implementation)
  - [Bootstrap the Nested Runtime](#bootstrap-the-nested-runtime)
  - [Widgets Host Route Tree](#widgets-host-route-tree)
- [4. States (CDSL)](#4-states-cdsl)
  - [Widgets Host Page](#widgets-host-page)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Nested Runtime](#nested-runtime)
  - [Settled Mount](#settled-mount)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

## 1. Feature Context

- [x] `p1` - `cpt-template-mfe-demo-feature-widgets-nested-domain`

### 1.1 Overview

The nested widgets screen, a screen that is itself a host: it builds a nested FrontX app, discovers the widgets other packages declare from the shell's published manifests aggregate read relative to the shell's document, owns the `widgets` extension domain with concurrent mounting, mounts every widget when its slot attaches, offers a ping per widget that handles one, and settles its mount only once the domain is owned and attached.

### 1.2 Purpose

The nested domains mechanic needs a runtime one level below the shell that owns a domain of its own, so that actions travel two levels of nesting and several widgets mount at once. An actions chain may target the `widgets` domain right after this screen's mount settles, so the mount must not settle before the domain can take it.

**Requirements**: `cpt-template-mfe-demo-fr-nested-widgets`, `cpt-template-mfe-demo-fr-not-found`, `cpt-template-mfe-demo-nfr-mount-independence`

**Principles**: the screen applies `cpt-template-mfe-demo-principle-one-app-per-runtime` and `cpt-template-mfe-demo-principle-handlers-before-settle`, owned by the demo app and screen entries features.

**Constraints**: `cpt-template-mfe-demo-constraint-document-relative-aggregate`

**Components**: `cpt-template-mfe-demo-component-widgets-host`

**Scope**: `demo-mfe/src/lifecycle-widgets-host.tsx` (nested app, domain implementation, bootstrap, page, lifecycle), and `demo-mfe/src/routes-widgets-host.tsx`. The page is composed of the screen entries feature's blocks and kit parts and carries no stylesheet.

**Out of scope**: the widgets themselves (widget packages feature); writing the address for settled mounts, which the nested app's framework router does; the isolation screen's chain that targets this screen (mechanics screens feature).

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-mfe-demo-actor-shell-host` | Mounts the screen, publishes the manifests aggregate next to its document and forwards actions addressed to the `widgets` domain and its widgets |
| `cpt-template-mfe-demo-actor-visitor` | Opens the screen directly or through the isolation screen's chain, and pings a widget |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md)
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.5
- **Interfaces**: `cpt-template-mfe-demo-interface-widgets-domain`, `cpt-template-mfe-demo-contract-manifest-aggregate`
- **Sequences**: `cpt-template-mfe-demo-seq-widgets-bootstrap`, `cpt-template-mfe-demo-seq-ping-across-nesting`
- **Dependencies**: `cpt-template-mfe-demo-feature-screen-entries`

## 2. Actor Flows (CDSL)

User-facing interactions that start with an actor (human or external system) and describe the end-to-end flow of a use case. Each flow has a triggering actor and shows how the system responds to actor actions.

**Use cases**: `cpt-template-mfe-demo-usecase-ping-across-nesting`

### Mount the Nested Widgets Screen

- [x] `p1` - **ID**: `cpt-template-mfe-demo-flow-widgets-nested-domain-mount-host`

**Actor**: `cpt-template-mfe-demo-actor-shell-host`

**Success Scenarios**:
- The shell mounts the screen; the bootstrap registers the published entities and takes ownership of the `widgets` domain; the slot attaches and every widget is mounted with the replace history intent; `mount()` settles and a chained step addressed to the domain or a widget is delivered.
- The screen is mounted again on the same cached nested registry: nothing is registered twice and every widget is mounted again.
- The address names a path inside the screen that is no page: the not-found page renders and settles the mount.

**Error Scenarios**:
- The manifests aggregate cannot be read, or declares no `widgets` domain: `mount()` rejects, the page shows its error state and the chain's later steps are not delivered.

**Steps**:
1. [x] - `p1` - Read the nested app's registry synchronously, inside the mount window, failing loudly when there is none - `inst-read-registry`
2. [x] - `p1` - Start the bootstrap synchronously (algorithm Bootstrap the Nested Runtime) - `inst-start-bootstrap`
3. [x] - `p1` - Create the domain-attached signal the page resolves once its slot has attached and its opening mounts are dispatched - `inst-attach-signal`
4. [x] - `p1` - Render through the base mount of the kit-themed lifecycle, which keeps the kit's tokens in the shadow root: the route tree, through the extension router over the nested registry, places the page at `/` and the not-found page elsewhere, failing loudly when rendered before the bootstrap started - `inst-render-route-tree`
5. [x] - `p1` - The page follows the bootstrap promise: on success it keeps the domain, on failure it logs and keeps the message; a result after unmount is ignored - `inst-follow-bootstrap`
6. [x] - `p1` - **IF** the bootstrap failed, render the error as a destructive alert in the screen frame - `inst-show-error`
7. [x] - `p1` - **IF** the bootstrap is pending, render a labelled spinner in the screen frame - `inst-show-loading`
8. [x] - `p1` - **ELSE** render, in a screen frame that takes the scope its shadow host carries, the page header with the title, the description and one ping button per ping target, and the `widgets` domain slot as a column of widgets - `inst-render-page`
9. [x] - `p1` - When the slot attaches, **FOR EACH** widget registered in the domain send a mount action with the replace history intent without waiting for it, then resolve the domain-attached signal - `inst-mount-all`
10. [x] - `p1` - **RETURN** from `mount()` only after both the bootstrap and the domain-attached signal resolve; a bootstrap failure rejects at once - `inst-await-settle`

### Ping a Widget

- [x] `p1` - **ID**: `cpt-template-mfe-demo-flow-widgets-nested-domain-ping-widget`

**Actor**: `cpt-template-mfe-demo-actor-visitor`

**Success Scenarios**:
- The visitor presses "Ping alpha" or "Ping beta"; the nested registry delivers the ping action to that widget.

**Error Scenarios**:
- The widget is not mounted: the widget rejects the ping (widget packages feature); the page sends and does not wait.

**Steps**:
1. [x] - `p1` - Select as ping targets the widgets of the domain whose entry declares the widget ping action - `inst-ping-targets`
2. [x] - `p1` - Visitor presses a ping button: send one ping chain to that widget through the nested registry, without waiting - `inst-send-ping`

## 3. Processes / Business Logic (CDSL)

Internal system functions and procedures that do not interact with actors directly. These are reusable building blocks called by Actor Flows or other processes.

### Build the Nested App

- [x] `p1` - **ID**: `cpt-template-mfe-demo-algo-widgets-nested-domain-nested-app`

**Input**: None (module evaluation of this entry's loaded copy)

**Output**: The nested app of this runtime

**Steps**:
1. [x] - `p1` - Build one app at module level with the effects plugin, the microfrontends plugin over the GTS type system with the Module Federation handler, the mock plugin, then the plugin that joins the host's shared query cache - `inst-build-app`

### Widgets Domain Implementation

- [x] `p1` - **ID**: `cpt-template-mfe-demo-algo-widgets-nested-domain-domain-implementation`

**Input**: The domain context the registry hands the factory

**Output**: A domain implementation that mounts widgets concurrently

**Steps**:
1. [x] - `p1` - Create a container element per widget, tagged with its extension id, and forget it when the widget's container is destroyed - `inst-containers`
2. [x] - `p1` - Implement the domain with a concurrent mount strategy and register handlers that pass the mount and unmount actions to it - `inst-concurrent-domain`
3. [x] - `p1` - **RETURN** a new implementation with fresh containers from the factory the registry calls - `inst-domain-factory`

### Bootstrap the Nested Runtime

- [x] `p1` - **ID**: `cpt-template-mfe-demo-algo-widgets-nested-domain-bootstrap`

**Input**: The nested app

**Output**: The `widgets` domain declaration, owned by the nested registry

**Steps**:
1. [x] - `p1` - **IF** the app has no registry, fail - `inst-require-registry`
2. [x] - `p1` - Fetch `generated-mfe-manifests.json` resolved against the shell document's base address; **IF** the response is not OK, fail with the address and status - `inst-fetch-aggregate`
3. [x] - `p1` - **FOR EACH** package of the aggregate, register its schemas on the nested type system - `inst-register-schemas`
4. [x] - `p1` - Register the shell's theme, language and screen extension schemas, which the domains reference - `inst-register-shell-schemas`
5. [x] - `p1` - **FOR EACH** package, register its manifest, its domains (keeping the `widgets` domain) and its entries - `inst-register-packages`
6. [x] - `p1` - **IF** no package declares the `widgets` domain, fail - `inst-require-domain`
7. [x] - `p1` - **IF** the realm's shared type store holds no valid screen domain declaration yet (no host registered one), register the framework's screen domain declaration for reference resolution, without taking ownership of it; in the shell the host's own declaration stays - `inst-register-screen-domain`
8. [x] - `p1` - **IF** the registry does not own the `widgets` domain yet, take ownership of it with the domain factory - `inst-own-domain`
9. [x] - `p1` - **FOR EACH** extension of every package, register it on the type system and, **IF** it targets the `widgets` domain and is not registered yet, admit it on the registry - `inst-register-extensions`
10. [x] - `p1` - **RETURN** the `widgets` domain declaration - `inst-return-domain`

### Widgets Host Route Tree

- [x] `p1` - **ID**: `cpt-template-mfe-demo-algo-widgets-nested-domain-route-tree`

**Input**: The page and the settle function the lifecycle provides for the current mount

**Output**: The screen's route tree

**Steps**:
1. [x] - `p1` - Place the page the lifecycle provides at `/` - `inst-index-page`
2. [x] - `p1` - For any other path render the shared not-found page and call the settle function after the first commit, since no slot will attach - `inst-not-found-settles`
3. [x] - `p1` - **RETURN** the root route rendering an outlet, with the not-found route and one child at `/` - `inst-route-tree`

## 4. States (CDSL)

Include when entities have explicit lifecycle states.

### Widgets Host Page

- [x] `p1` - **ID**: `cpt-template-mfe-demo-state-widgets-nested-domain-page`

**States**: LOADING, READY, FAILED

**Initial State**: LOADING

**Transitions**:
1. [x] - `p1` - **FROM** LOADING **TO** READY **WHEN** the bootstrap resolves with the `widgets` domain while the page is mounted - `inst-to-ready`
2. [x] - `p1` - **FROM** LOADING **TO** FAILED **WHEN** the bootstrap rejects while the page is mounted - `inst-to-failed`

READY renders the slot whose attach mounts the widgets; FAILED is final for the mount and a remount starts again in LOADING.

## 5. Definitions of Done

Specific implementation tasks derived from flows and algorithms above.

### Nested Runtime

- [x] `p1` - **ID**: `cpt-template-mfe-demo-dod-widgets-nested-domain-nested-runtime`

The system **MUST** build one nested app per loaded copy, read the manifests aggregate relative to the shell's document, register the published entities in schemas, shell schemas, manifests, domains, entries, screen domain, extensions order, own the `widgets` domain with concurrent mounting, mount every widget with the replace history intent when the slot attaches, offer a ping per widget whose entry handles it, and repeat no registration on remount.

**Implements**:
- `cpt-template-mfe-demo-flow-widgets-nested-domain-ping-widget`
- `cpt-template-mfe-demo-algo-widgets-nested-domain-nested-app`
- `cpt-template-mfe-demo-algo-widgets-nested-domain-domain-implementation`
- `cpt-template-mfe-demo-algo-widgets-nested-domain-bootstrap`
- `cpt-template-mfe-demo-state-widgets-nested-domain-page`

**Constraints**: `cpt-template-mfe-demo-constraint-document-relative-aggregate`, `cpt-template-mfe-demo-constraint-mocks-before-shared-cache`

**Touches**:
- Entities: Widgets domain, Widget extension, Widget ping action

### Settled Mount

- [x] `p1` - **ID**: `cpt-template-mfe-demo-dod-widgets-nested-domain-settled-mount`

The system **MUST** let the screen's `mount()` settle only after the `widgets` domain is owned and its slot has attached with the opening mounts dispatched, or after the not-found page rendered, and **MUST** reject it when the bootstrap fails.

**Implements**:
- `cpt-template-mfe-demo-flow-widgets-nested-domain-mount-host`
- `cpt-template-mfe-demo-algo-widgets-nested-domain-route-tree`

**Touches**:
- Entities: Entry, Screen extension

## 6. Acceptance Criteria

- [x] The screen renders its own `widgets` domain slot and reads the manifests aggregate from the shell document's base, so a shell under a sub-path is followed.
- [x] Every registered widget is mounted with an opening mount chain carrying the replace history intent, dispatched without waiting for any mount to settle and with no timer.
- [x] The manifest is registered before the domain it declares.
- [x] A remount on the same cached registry neither throws nor registers twice, and mounts real widget DOM again.
- [x] On a path that names no page, `mount()` settles and the not-found page renders.
- [x] One nested app is built per module copy and reused across mount, unmount and remount; a ping chain to a widget dispatches without error.

**Test scenarios** (Vitest, in the composed `demo-mfe` package):
- `src/lifecycle-widgets-host.test.tsx`: the entry on the kit-themed lifecycle; the widgets-domain slot; the aggregate read from the document base under a sub-path; opening mounts with history "replace"; no waiting on opening mounts; remount on the cached registry; `mount()` settles on a not-found path; one nested app per module copy; no waiters or timers; the ping chain; every widget mounted again on remount.
- `src/lifecycle-widgets-host.remount.test.tsx`: real widget DOM mounted again after the slot's unmount released the prior occupants.
- `src/lifecycle-widgets-host.gts-order.test.ts`: the manifest registered before the domain it declares.
- `src/routes.test.tsx`: "place the Widgets Host page the lifecycle provides at the root".
