# Feature: Demo App and Accounts API

- [x] `p1` - **ID**: `cpt-template-mfe-demo-featstatus-demo-app`

<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [No Feature-Owned Actor Flow](#no-feature-owned-actor-flow)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Build the Package App](#build-the-package-app)
  - [Accounts API Service](#accounts-api-service)
  - [Mocked Accounts Responses](#mocked-accounts-responses)
  - [Refresh the Current User](#refresh-the-current-user)
- [4. States (CDSL)](#4-states-cdsl)
  - [No Feature-Owned State Machine](#no-feature-owned-state-machine)
- [5. Definitions of Done](#5-definitions-of-done)
  - [One App per Runtime, Mocks before the Shared Cache](#one-app-per-runtime-mocks-before-the-shared-cache)
  - [Mocked Accounts API and Refresh](#mocked-accounts-api-and-refresh)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

## 1. Feature Context

- [x] `p1` - `cpt-template-mfe-demo-feature-demo-app`

### 1.1 Overview

`demo-mfe`'s one FrontX app per loaded runtime, joined to the host's query cache without clearing it, with a mocked accounts API whose current user query and profile mutation the data loading screen uses, and the refresh function the profile refresh action calls.

### 1.2 Purpose

Every `demo-mfe` screen renders through the registry of one package app, and the data loading screen needs an API service with mocks in the browser. The order in which the app adds its plugins decides whether loading the package clears the page's cached data.

**Requirements**: `cpt-template-mfe-demo-nfr-cache-continuity`

**Principles**: `cpt-template-mfe-demo-principle-one-app-per-runtime`

**Constraints**: `cpt-template-mfe-demo-constraint-mocks-before-shared-cache`

**Components**: `cpt-template-mfe-demo-component-demo-app`

**Scope**: the package app built once at module level with the effects, mock, shared query cache and microfrontends plugins, in that order, and the accessor for its registry; the accounts API service with its types, mock map and in-browser mock user store; the refresh function that invalidates the current user query. The widgets host and both widget packages build their own apps by the same rule in their own features.

**Out of scope**: the data loading screen's states and optimistic edit (mechanics screens feature); registering the refresh handler on the data loading entry (screen entries feature); the nested app of the widgets host and the widget apps.

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-mfe-demo-actor-shell-host` | Owns the query cache the app joins and links the app's registry during the first mount |
| `cpt-template-mfe-demo-actor-visitor` | Sees the mocked profile on the data loading screen; the profile edits persist in the browser for the page's lifetime |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md)
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.2
- **Dependencies**: `cpt-template-mfe-demo-feature-package-declarations`

## 2. Actor Flows (CDSL)

User-facing interactions that start with an actor (human or external system) and describe the end-to-end flow of a use case. Each flow has a triggering actor and shows how the system responds to actor actions.

**Use cases**: `cpt-template-mfe-demo-usecase-edit-profile`

### No Feature-Owned Actor Flow

Not applicable. No actor calls this feature directly: the data loading screen (mechanics screens feature) issues the query and the mutation, and the data loading entry's refresh handler (screen entries feature) calls the refresh function. Their flows reference the processes below.

## 3. Processes / Business Logic (CDSL)

Internal system functions and procedures that do not interact with actors directly. These are reusable building blocks called by Actor Flows or other processes.

### Build the Package App

- [x] `p1` - **ID**: `cpt-template-mfe-demo-algo-demo-app-build-app`

**Input**: None (module evaluation of the package's entry modules)

**Output**: The package app and the accessor of its registry

**Steps**:
1. [x] - `p1` - Register the accounts API service and initialize the API registry before the build, so the mock plugin finds the service when it syncs during the build - `inst-register-services`
2. [x] - `p1` - Build the app once with the effects plugin, the mock plugin, then the plugin that joins the host's shared query cache, then the microfrontends plugin over the GTS type system; the mock plugin's initial toggle passes before the shared cache listens, so the page's cached data is not cleared - `inst-build-app`
3. [x] - `p1` - **RETURN** the app's registry from the accessor read at render time, failing loudly when the app was built without the microfrontends plugin - `inst-return-registry`

### Accounts API Service

- [x] `p1` - **ID**: `cpt-template-mfe-demo-algo-demo-app-accounts-api`

**Input**: None (constructed by the API registry)

**Output**: A service with the current user query and the profile mutation

**Steps**:
1. [x] - `p1` - Create a REST protocol with a 30 second timeout and the endpoint protocol over it, under the base address `/api/accounts` - `inst-create-protocol`
2. [x] - `p1` - Register the shell's REST mock plugin with the accounts mock map and a 100 ms delay; the framework's mock toggle decides when it answers - `inst-register-mock`
3. [x] - `p1` - Declare the current user query `GET /user/current` and the profile mutation `PUT /user/profile` with first name, last name and an optional department - `inst-declare-endpoints`
4. [x] - `p1` - Type the user as the API returns it: identifier, email, names, role, language, optional avatar, timestamps and open extra fields such as the department - `inst-user-types`

### Mocked Accounts Responses

- [x] `p1` - **ID**: `cpt-template-mfe-demo-algo-demo-app-mock-responses`

**Input**: A mocked request: the current user read, or a profile update body

**Output**: The current user response

**Steps**:
1. [x] - `p1` - Start the in-browser store with a default user (Alex Rivera, administrator, English, department Engineering) - `inst-default-user`
2. [x] - `p1` - **RETURN** the stored user for `GET /api/accounts/user/current` - `inst-mock-get`
3. [x] - `p1` - For `PUT /api/accounts/user/profile` merge the patched names and department onto the stored user, keep a field the patch omits, and stamp the update time - `inst-mock-merge`
4. [x] - `p1` - Replace the stored user with the merged one and **RETURN** it - `inst-mock-store`

### Refresh the Current User

- [x] `p1` - **ID**: `cpt-template-mfe-demo-algo-demo-app-refresh-user`

**Input**: None (called by the refresh profile action handler)

**Output**: The current user query invalidated in the shared cache, so the data loading screen refetches

**Steps**:
1. [x] - `p1` - **TRY** on the next microtask, take the accounts service from the API registry and invalidate its current user query for the package app - `inst-invalidate`
2. [x] - `p1` - **CATCH** any failure: log it and never throw to the caller - `inst-log-failure`

## 4. States (CDSL)

Include when entities have explicit lifecycle states.

### No Feature-Owned State Machine

Not applicable. The mock user store holds one value that each update replaces; it has no named states. The query and mutation states (pending, error, success) belong to the query library and are rendered by the mechanics screens feature.

## 5. Definitions of Done

Specific implementation tasks derived from flows and algorithms above.

### One App per Runtime, Mocks before the Shared Cache

- [x] `p1` - **ID**: `cpt-template-mfe-demo-dod-demo-app-package-app`

The system **MUST** build exactly one FrontX app per loaded copy of `demo-mfe`, at module level, with the API services registered before the build and the mock plugin added before the shared query cache plugin, and **MUST** expose the registry the screens' extension routers build from.

**Implements**:
- `cpt-template-mfe-demo-algo-demo-app-build-app`

**Constraints**: `cpt-template-mfe-demo-constraint-mocks-before-shared-cache`

**Touches**:
- Entities: Entry

### Mocked Accounts API and Refresh

- [x] `p1` - **ID**: `cpt-template-mfe-demo-dod-demo-app-accounts-api`

The system **MUST** provide the accounts API service with the current user query and the profile mutation, answered in the browser by mocks that persist profile updates for the page's lifetime, and a refresh function that invalidates the current user query without throwing.

**Implements**:
- `cpt-template-mfe-demo-algo-demo-app-accounts-api`
- `cpt-template-mfe-demo-algo-demo-app-mock-responses`
- `cpt-template-mfe-demo-algo-demo-app-refresh-user`

**Constraints**: `cpt-template-mfe-demo-constraint-shell-prerequisite`

**Touches**:
- API: `GET /api/accounts/user/current`, `PUT /api/accounts/user/profile` (mocked)
- Entities: User

## 6. Acceptance Criteria

- [x] The accounts service is registered before the app is built, and the module exports the built app.
- [x] The package app adds the mock plugin before the shared query cache plugin.
- [x] The mocked current user read returns the stored user, and a profile update persists for the next read.
- [x] The refresh function invalidates the current user query on the package app and logs a failure instead of throwing.

**Test scenarios** (Vitest, in the composed `demo-mfe` package):
- `src/init.test.ts`: "registers services before building the MFE app and exports the built app"; "adds the mock plugin before the shared query cache plugin".
- `src/api/mocks.test.ts`: "returns the current user and persists profile updates".
- `src/api/AccountsApiService.test.ts`: the shell's shared accounts service contract suite run against this service.
- `src/actions/profileActions.test.ts`: "invalidates the current-user descriptor on the shared MFE app"; "logs failures instead of throwing synchronously".
