# Feature: Widget Packages

- [x] `p2` - **ID**: `cpt-template-mfe-demo-featstatus-widget-fixtures`

<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Answer a Ping](#answer-a-ping)
  - [Open the Isolation Screen from a Widget](#open-the-isolation-screen-from-a-widget)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Widget A Mounts](#widget-a-mounts)
  - [Widget A Route Tree](#widget-a-route-tree)
  - [Widget B](#widget-b)
- [4. States (CDSL)](#4-states-cdsl)
  - [Widget A Instance Session](#widget-a-instance-session)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Widget A Instances](#widget-a-instances)
  - [Widget B](#widget-b-1)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

## 1. Feature Context

- [x] `p2` - `cpt-template-mfe-demo-feature-widget-fixtures`

### 1.1 Overview

The two widget packages the nested widgets screen mounts: `widgets-fixture-a`, whose one entry backs the alpha and beta widget instances with separate module state, per-instance ping time kept in the instance's own address and a button that opens the isolation screen two levels up; and `widgets-fixture-b`, a second package that mounts next to them.

### 1.2 Purpose

Several instances of one entry, per-instance routing state, delivery downward to a widget and upward to the shell each need a widget that shows them, and concurrent mounting needs a second package in the same domain.

**Requirements**: `cpt-template-mfe-demo-fr-widget-instances`, `cpt-template-mfe-demo-fr-not-found`

**Principles**: each package applies `cpt-template-mfe-demo-principle-one-app-per-runtime`, owned by the demo app feature.

**Constraints**: both packages follow `cpt-template-mfe-demo-constraint-css-modules` and `cpt-template-mfe-demo-constraint-mocks-before-shared-cache`, owned by the mechanics screens and demo app features.

**Components**: `cpt-template-mfe-demo-component-widget-fixture-a`, `cpt-template-mfe-demo-component-widget-fixture-b`

**Scope**: `widgets-fixture-a/src/lifecycle.tsx`, `src/routes.tsx`; `widgets-fixture-b/src/lifecycle.tsx`. Both packages draw with kit components on the framework's theme-aware lifecycle and read the kit's tokens from the nested widgets screen that hosts them; neither carries a stylesheet.

**Out of scope**: discovering and mounting the widgets (nested widgets feature); page metadata, since widgets are not pages.

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-mfe-demo-actor-shell-host` | Through the nested widgets screen's runtime, mounts and unmounts the widget instances, delivers ping actions to them and receives their upward mount action |
| `cpt-template-mfe-demo-actor-visitor` | Pings a widget (from the nested widgets screen or the isolation screen's chain), reloads the page, and asks a widget to open the isolation screen |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md)
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.6
- **Interfaces**: the widget ping action handled by each widgets-fixture-a instance, within `cpt-template-mfe-demo-interface-widgets-domain`
- **Dependencies**: `cpt-template-mfe-demo-feature-widgets-nested-domain`

## 2. Actor Flows (CDSL)

User-facing interactions that start with an actor (human or external system) and describe the end-to-end flow of a use case. Each flow has a triggering actor and shows how the system responds to actor actions.

**Use cases**: `cpt-template-mfe-demo-usecase-ping-across-nesting`

### Answer a Ping

- [x] `p2` - **ID**: `cpt-template-mfe-demo-flow-widget-fixtures-answer-ping`

**Actor**: `cpt-template-mfe-demo-actor-visitor`

**Success Scenarios**:
- A ping reaches a mounted alpha or beta instance; its last ping time is written into that instance's own address and shown, survives a reload and never appears on the other instance.

**Error Scenarios**:
- The instance has no live container: the ping is rejected.
- The address write fails (for example before the host adopted the instance's link): the failure is logged and the ping rejected, so the sender does not believe it landed.

**Steps**:
1. [x] - `p2` - **IF** the instance has no live container, reject the ping - `inst-reject-unmounted`
2. [x] - `p2` - Take the current time as the ping time and log it with the instance id - `inst-ping-time`
3. [x] - `p2` - **TRY** read the instance's own address through its router's navigation facade, resolved at ping time, set the last ping parameter and replace the address, keeping its other parameters - `inst-write-address`
4. [x] - `p2` - **CATCH** a failed write: log it and reject the ping - `inst-surface-failure`
5. [x] - `p2` - **RETURN** a resolved ping - `inst-return-ping`
6. [x] - `p2` - The instance page reads the last ping time from its own address and shows it - `inst-show-last-ping`

### Open the Isolation Screen from a Widget

- [x] `p2` - **ID**: `cpt-template-mfe-demo-flow-widget-fixtures-open-isolation`

**Actor**: `cpt-template-mfe-demo-actor-visitor`

**Success Scenarios**:
- The visitor presses the widget's button; the mount action travels up through the nested widgets screen to the shell's screen domain, which mounts the isolation screen.

**Error Scenarios**:
- Dispatch is acceptance-only: a failure of the mount is the runtime's; the widget sends and does not wait.

**Steps**:
1. [x] - `p2` - Mirror the isolation screen's extension identifier in the package, since no package imports another - `inst-target-id`
2. [x] - `p2` - Visitor presses the button: send one chain mounting the isolation screen in the shell's screen domain - `inst-send-mount`

## 3. Processes / Business Logic (CDSL)

Internal system functions and procedures that do not interact with actors directly. These are reusable building blocks called by Actor Flows or other processes.

### Widget A Mounts

- [x] `p2` - **ID**: `cpt-template-mfe-demo-algo-widget-fixtures-widget-a-mounts`

**Input**: A container and the instance's bridge, for each mount the nested runtime makes

**Output**: A rendered instance with its ping handler registered

**Steps**:
1. [x] - `p2` - Build one app per loaded copy at module level with the effects plugin, the mock plugin, then the shared query cache plugin and the microfrontends plugin; alpha and beta are separate loaded copies, so each has its own app - `inst-build-app`
2. [x] - `p2` - Draw a random value once per loaded copy, the witness of separate module evaluation - `inst-random-witness`
3. [x] - `p2` - Each container's tree renders the route tree through the extension router over the app's registry, with the bridge in context - `inst-render-tree`
4. [x] - `p2` - An instance counts as mounted while any remembered container belongs to its extension - `inst-is-mounted`
5. [x] - `p2` - On mount, log the witness, create a separate React root for the container, remember the container with its extension and mount the tree - `inst-mount-container`
6. [x] - `p2` - Register the ping handler on the bridge before `mount()` returns - `inst-register-ping`
7. [x] - `p2` - On unmount of a remembered container, forget it before the teardown, then unmount its tree; an unknown container is ignored - `inst-unmount-container`

### Widget A Route Tree

- [x] `p2` - **ID**: `cpt-template-mfe-demo-algo-widget-fixtures-widget-a-routes`

**Input**: The mounted instance's bridge in context

**Output**: The instance page at `/` and a not-found page for any other path

**Steps**:
1. [x] - `p2` - Provide the mounted instance's bridge to route components; a component outside a mount fails loudly - `inst-bridge-context`
2. [x] - `p2` - The root renders the instance as a kit item with an outline, tagged with the instance id and the witness - `inst-instance-frame`
3. [x] - `p2` - The page at `/` shows the witness in the item's title, the instance id and the last ping as a description list, and the button that opens the isolation screen in the item's footer - `inst-home-page`
4. [x] - `p2` - Any other path renders the widget's not-found line - `inst-not-found`
5. [x] - `p2` - **RETURN** the root route with the not-found component and one child at `/` - `inst-route-tree`

### Widget B

- [x] `p2` - **ID**: `cpt-template-mfe-demo-algo-widget-fixtures-widget-b`

**Input**: A container and the widget's bridge

**Output**: A labelled kit item in the `widgets` domain slot

**Steps**:
1. [x] - `p2` - Build one app with the effects plugin, the mock plugin, then the shared query cache plugin - `inst-build-app`
2. [x] - `p2` - On mount, log the mount with the instance id and mount through the theme-aware lifecycle - `inst-log-mount`
3. [x] - `p2` - Render a kit item on the muted surface, titled with the widget's name and saying it is mounted concurrently in the widgets domain - `inst-render-card`

## 4. States (CDSL)

Include when entities have explicit lifecycle states.

### Widget A Instance Session

- [x] `p2` - **ID**: `cpt-template-mfe-demo-state-widget-fixtures-instance-session`

**States**: UNMOUNTED, MOUNTED

**Initial State**: UNMOUNTED

**Transitions**:
1. [x] - `p2` - **FROM** UNMOUNTED **TO** MOUNTED **WHEN** the runtime mounts a container for the instance's extension - `inst-to-mounted`
2. [x] - `p2` - **FROM** MOUNTED **TO** UNMOUNTED **WHEN** the runtime unmounts the last container of the extension; a newer container of the same extension keeps it MOUNTED - `inst-to-unmounted`

Pings are answered only in MOUNTED.

## 5. Definitions of Done

Specific implementation tasks derived from flows and algorithms above.

### Widget A Instances

- [x] `p2` - **ID**: `cpt-template-mfe-demo-dod-widget-fixtures-widget-a`

The system **MUST** back the alpha and beta extensions with one entry whose loaded copies keep separate module state and apps, give every container its own React root, register the ping handler before `mount()` returns, answer a ping only while the instance is mounted by writing the ping time into the instance's own address, render a not-found page for any path but `/`, and offer a button that asks the shell's screen domain to mount the isolation screen.

**Implements**:
- `cpt-template-mfe-demo-flow-widget-fixtures-answer-ping`
- `cpt-template-mfe-demo-flow-widget-fixtures-open-isolation`
- `cpt-template-mfe-demo-algo-widget-fixtures-widget-a-mounts`
- `cpt-template-mfe-demo-algo-widget-fixtures-widget-a-routes`
- `cpt-template-mfe-demo-state-widget-fixtures-instance-session`

**Constraints**: `cpt-template-mfe-demo-constraint-css-modules`, `cpt-template-mfe-demo-constraint-mocks-before-shared-cache`

**Touches**:
- Entities: Widget extension, Widget ping action

### Widget B

- [x] `p2` - **ID**: `cpt-template-mfe-demo-dod-widget-fixtures-widget-b`

The system **MUST** provide a second widget package with its own app that mounts next to widgets-fixture-a's instances in the `widgets` domain, renders a labelled kit item and logs its mount, with no route tree, no action handler and no page metadata.

**Implements**:
- `cpt-template-mfe-demo-algo-widget-fixtures-widget-b`

**Constraints**: `cpt-template-mfe-demo-constraint-css-modules`, `cpt-template-mfe-demo-constraint-mocks-before-shared-cache`

**Touches**:
- Entities: Widget extension

## 6. Acceptance Criteria

- [x] widgets-fixture-a builds one app at module evaluation and reuses it across mount, unmount and remount, and gives each container its own root.
- [x] A ping handler is registered on mount; a ping after the instance's container unmounted, or for an extension with no live session, is rejected.
- [x] The last ping is written through the navigation facade right after mount and later, keeps the entry's other search parameters, and a failed write is logged and rethrown; a ping before the host adopts the link is refused without a write.
- [x] A late unmount of an older container keeps the newer session.
- [x] The instance page shows its own module copy's witness and the last ping its own entry parameter carries; any other path renders the widget's not-found page.
- [x] widgets-fixture-b is the theme-aware lifecycle exported as the module default and renders the widget frame.

**Test scenarios** (Vitest, in the composed packages):
- `widgets-fixture-a/src/lifecycle.test.tsx`: one app across mount, unmount and remount; ping handler registered and rejecting after unmount; last-ping written before and after the router attaches; other search parameters preserved; newer session kept on a late unmount; ping refused for an id with no live session; navigation failure logged and rethrown; a Root per container; facade resolved at ping time.
- `widgets-fixture-a/src/routes.test.tsx`: the instance at the root with its witness and no ping; the last ping from its own entry parameter; the not-found page for any other path.
- `widgets-fixture-b/src/lifecycle.test.tsx`: the theme-aware lifecycle as the module default; the widget frame.
