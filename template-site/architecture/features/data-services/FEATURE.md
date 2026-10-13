# Feature: Data Services

- [x] `p1` - **ID**: `cpt-template-site-featstatus-data-services`

<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Answer a Content Page's Data Query](#answer-a-content-pages-data-query)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Construct a Data Service](#construct-a-data-service)
  - [Set Up a Content Package's App](#set-up-a-content-packages-app)
- [4. States (CDSL)](#4-states-cdsl)
  - [No Feature-Owned State Machine](#no-feature-owned-state-machine)
- [5. Definitions of Done](#5-definitions-of-done)
  - [One Data Service per Content Package](#one-data-service-per-content-package)
  - [Mocks On Before the Shared Cache](#mocks-on-before-the-shared-cache)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

## 1. Feature Context

- [x] `p1` - `cpt-template-site-feature-data-services`

### 1.1 Overview

Each content package reads its facts through the FrontX data layer although the site has no backend. The templates, docs and libraries packages each have one REST API service (`TemplatesApiService` with `GET /api/site-templates/catalogue`, `DocsApiService` with `GET /api/site-docs/versions`, `LibsApiService` with `GET /api/site-libs/libraries`) that registers template-shell's REST mock plugin over a mock map answering from the generated data file the package bundles. Each content package's app setup registers its service before the app is built, switches mocks on by default, adds the mock plugin before the shared query cache, and adds the microfrontends plugin the route tree needs.

### 1.2 Purpose

The pages' facts come from generated data, and a FrontX screen reads data through the FrontX data layer; answering from the bundled file keeps the site static while a project with a backend can answer the same requests. Code: `site-templates-mfe/src/api/`, `site-docs-mfe/src/api/`, `site-libs-mfe/src/api/` and `src/init.ts` of these three packages, paths relative to `template-site/src-app/mfe_packages/`. Generating and checking the data files belongs to the repository's site data tooling ([repository DESIGN](../../../../architecture/DESIGN.md)); the data files themselves belong to the screens that show them.

**Requirements**: `cpt-template-site-fr-no-backend-data`, `cpt-template-site-fr-generated-facts`

**Principles**: `cpt-template-site-principle-facts-are-data`

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-site-actor-visitor` | Opens a content page whose query this feature answers |
| `cpt-template-site-actor-template-consumer` | Copies the template into a project with template-shell; may answer the same requests from a backend instead of the bundled files |
| `cpt-template-site-actor-data-generator` | Writes the bundled data files the mock maps answer from |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md), component "Data services", sequence "Render a content page"
- **Dependencies**: None

## 2. Actor Flows (CDSL)

### Answer a Content Page's Data Query

- [x] `p1` - **ID**: `cpt-template-site-flow-data-services-answer-query`

**Use cases**: `cpt-template-site-usecase-read-guide`

**Actor**: `cpt-template-site-actor-visitor`

**Success Scenarios**:
- The page's query of its service's endpoint is answered by the switched-on mock plugin with the data the package bundles, with no network request.

**Error Scenarios**:
- The bundled templates outline does not fit the content model: the parser throws inside the answer, the query fails and the page shows its error state.

**Steps**:
1. [x] - `p1` - The page's query goes to the service's endpoint descriptor: `GET /catalogue`, `GET /versions` or `GET /libraries` under the service's base URL - `inst-query-endpoint`
2. [x] - `p1` - The service's mock plugin, switched on, answers the request from its mock map: the templates service with the generated outline checked by the content model's parser, the docs service with the version variables, the libraries service with the variables, the libraries and the shell's workspace packages - `inst-answer-from-bundle`

## 3. Processes / Business Logic (CDSL)

### Construct a Data Service

- [x] `p1` - **ID**: `cpt-template-site-algo-data-services-construct-service`

**Input**: The package's mock map over its bundled data file.

**Output**: An API service with a REST protocol, its endpoint protocol, the package's base URL and the mock plugin registered on the REST protocol.

**Steps**:
1. [x] - `p1` - Create a REST protocol with a 30 second timeout and the REST endpoint protocol over it - `inst-create-protocols`
2. [x] - `p1` - Set the service's base URL: `/api/site-templates`, `/api/site-docs` or `/api/site-libs` - `inst-set-base-url`
3. [x] - `p1` - Register template-shell's REST mock plugin with the package's mock map and no delay on the REST protocol; the app's mock plugin switches it on - `inst-register-mock-plugin`

### Set Up a Content Package's App

- [x] `p1` - **ID**: `cpt-template-site-algo-data-services-app-setup`

**Input**: The package's API service class.

**Output**: The package's FrontX app, built once when the entry first loads.

**Steps**:
1. [x] - `p1` - Register the package's API service in the API registry and initialize the registry, before the app is built - `inst-register-service`
2. [x] - `p1` - Start the app with the effects plugin - `inst-add-effects`
3. [x] - `p1` - Add the mock plugin with mocks on by default, which switches on the mock plugins of the services already registered - `inst-enable-mocks`
4. [x] - `p1` - Add the shared query cache after the mock plugin, so the mock plugin's first toggle passes before this runtime's shared cache listens and the page's query cache is not cleared - `inst-join-query-cache`
5. [x] - `p1` - Add the microfrontends plugin with the GTS type system, which gives the app the registry the route tree is built from - `inst-add-microfrontends`
6. [x] - `p1` - **RETURN** the built app - `inst-build-app`

## 4. States (CDSL)

### No Feature-Owned State Machine

Not applicable. The services answer every request from bundled, immutable data; the query state of a page (loading, success, error) is the FrontX data layer's, and its rendering belongs to the screens.

## 5. Definitions of Done

### One Data Service per Content Package

- [x] `p1` - **ID**: `cpt-template-site-dod-data-services-services`

The system **MUST** give the templates, docs and libraries packages one REST API service each whose mock plugin answers the package's endpoint from the generated data file the package bundles, the templates outline passing through the content model's parser, so every fact a content page shows comes from that data.

**Implements**:
- `cpt-template-site-flow-data-services-answer-query`
- `cpt-template-site-algo-data-services-construct-service`

**Constraints**: `cpt-template-site-constraint-no-backend`

**Touches**:
- API: `GET /api/site-templates/catalogue`, `GET /api/site-docs/versions`, `GET /api/site-libs/libraries`
- DB: none
- Entities: `Site data`

**Tests**: `site-templates-mfe/src/api/TemplatesApiService.test.ts` ("answers the catalogue endpoint with the generated outline"); `site-docs-mfe/src/api/DocsApiService.test.ts` ("answers the versions endpoint with the generated data"); `site-libs-mfe/src/api/LibsApiService.test.ts` ("answers the libraries endpoint with the generated data").

### Mocks On Before the Shared Cache

- [x] `p1` - **ID**: `cpt-template-site-dod-data-services-app-setup`

The system **MUST** register each content package's service before its app is built, add the mock plugin with mocks on by default before the shared query cache, and add the microfrontends plugin.

**Implements**:
- `cpt-template-site-algo-data-services-app-setup`

**Constraints**: `cpt-template-site-constraint-no-backend`

**Touches**:
- API: none
- DB: none
- Entities: none

**Tests**: each content package's `lifecycle.test.tsx` ("renders the package's route tree through the framework router over the package's own registry") and its page tests, which render pages over the app this setup builds.

## 6. Acceptance Criteria

- [x] Each content package's service answers its endpoint with the data of its bundled generated file, without a network request.
- [x] The templates service answers with an outline checked by the content model's parser.
- [x] Each content package's app switches mocks on by default and adds the mock plugin before the shared query cache.

Not applicable to this feature, with reasons: security (no backend, no credentials, no visitor data), performance (answers come from bundled files with no delay), operations (no service to deploy or monitor).
