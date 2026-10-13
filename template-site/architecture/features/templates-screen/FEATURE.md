# Feature: Templates Screen

<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Open a Templates Page](#open-a-templates-page)
  - [Open an Unknown Path](#open-an-unknown-path)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Pick a Template Card's Picture](#pick-a-template-cards-picture)
- [4. States (CDSL)](#4-states-cdsl)
  - [Templates Page State Machine](#templates-page-state-machine)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Index and Template Pages](#index-and-template-pages)
  - [Registration, Page Metadata and Not-Found Page](#registration-page-metadata-and-not-found-page)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

- [x] `p2` - **ID**: `cpt-template-site-featstatus-templates-screen`

## 1. Feature Context

- [x] `p2` - `cpt-template-site-feature-templates-screen`

### 1.1 Overview

The `templates` screen of the `site-templates-mfe` package: an index that features the official templates in the groups the hand-written guide marks, and a page per template with its key files as the template ships them, all built from the bundled generated templates outline; plus the screen's own not-found page for any path that names no template.

### 1.2 Purpose

A visitor chooses a template from what it really contains, so every page is rendered from the outline the site data tooling generates from the templates' own manifests and sources at the pinned versions, never from a hand-written copy. The routes are static by design: the set of templates is fixed when the outline is generated, and the screen's service answers with the same outline the routes are built from. The screen registers itself and declares a title and a description for its index and for every template page next to its registration.

**Requirements**: `cpt-template-site-fr-templates`, `cpt-template-site-fr-screen-registration`, `cpt-template-site-fr-not-found`, `cpt-template-site-fr-page-metadata`, `cpt-template-site-nfr-description-length`

**Principles**: None of its own; the screen follows the principles owned by the foundation features of the [DESIGN](../../DESIGN.md).

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-site-actor-visitor` | Opens the index or a template page, reads the key files and follows the links to the source and to the live screens |
| `cpt-template-site-actor-host` | Registers the `templates` screen from its manifest, lists it in the menu and mounts it at its address |
| `cpt-template-site-actor-data-generator` | Writes the templates outline the screen bundles, from the guide and the templates' sources |
| `cpt-template-site-actor-metadata-tooling` | Reads the declared title and description of the index and of every template page |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md), component `cpt-template-site-component-templates-screen`
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.6
- **Dependencies**: `cpt-template-site-feature-content-model` (the outline parser, the page lookup, the outline renderer with its key-files explorer and Base64 decoding, the twin paths), `cpt-template-site-feature-data-services` (the templates API service that answers with the outline), `cpt-template-site-feature-screen-frame` (the lifecycle, the bridge hook and the strings hook)
- **Code**: `template-site/src-app/mfe_packages/site-templates-mfe/`: `mfe.json`, `src/routes.tsx`, `src/screens/templates/` (the page, the not-found page and the English strings), `src/content/` (the hand-written `guide.json` and the generated `outline.generated.json`, data without markers)

## 2. Actor Flows (CDSL)

Both flows start when the host mounts the `templates` screen at an address of the screen domain and the screen's router reads the path inside the screen from that address.

**Use cases**: `cpt-template-site-usecase-open-other-screen`, `cpt-template-site-usecase-change-page`

### Open a Templates Page

- [x] `p1` - **ID**: `cpt-template-site-flow-templates-screen-open-page`

**Actor**: `cpt-template-site-actor-visitor`

**Success Scenarios**:
- The visitor opens `/?screen=templates` and sees the index: the "Start an application" pair of template-shell and template-mfe, Design Guardrails as a row card and the band that links the quickstart, with no site template and no side panel.
- The visitor opens `/?screen=templates;route=template-shell` and sees the template's page with its key-files explorer, what it gives, its source links, its facts and the link to its plain-text twin.

**Error Scenarios**:
- The outline cannot be read, or its answer has no page for the route: the page shows its error state.

**Steps**:
1. [x] - `p1` - When the module loads, parse the bundled generated outline through the content model and build one route per outline page, the index and one route per template, each rendering the templates page for its route - `inst-build-routes`
2. [x] - `p1` - The page loads the screen's English strings for the host's language - `inst-load-strings`
3. [x] - `p1` - API: GET `/api/site-templates/catalogue` through the screen's templates service (the generated outline) - `inst-read-outline`
4. [x] - `p1` - **IF** the strings or the outline are still loading - `inst-if-loading`
   1. [x] - `p1` - **RETURN** the page loading state - `inst-return-loading`
5. [x] - `p1` - Find the outline page of the route in the answer - `inst-find-page`
6. [x] - `p1` - **IF** the read failed or the answer has no page for the route - `inst-if-error`
   1. [x] - `p1` - **RETURN** the page error state with the screen's error text - `inst-return-error`
7. [x] - `p1` - Label the content model's controls (copy, files, example, key files, find, source links) with the screen's strings - `inst-chrome-labels`
8. [x] - `p1` - **RETURN** the outline page rendered by the content model, with the card pictures of the card art algorithm, the link to the page's plain-text twin under the content and no side panel - `inst-render-page`

### Open an Unknown Path

- [x] `p2` - **ID**: `cpt-template-site-flow-templates-screen-unknown-path`

**Actor**: `cpt-template-site-actor-visitor`

**Success Scenarios**:
- The visitor opens a path that names no template and sees the screen's not-found page with a link back to the index.

**Error Scenarios**:
- None: every path the outline does not name lands on this page.

**Steps**:
1. [x] - `p2` - The screen's root route renders the not-found page for any path no outline page matches - `inst-route-not-found`
2. [x] - `p2` - The not-found page loads the screen's strings and renders nothing while they load - `inst-load-strings`
3. [x] - `p2` - **RETURN** the not-found page: its title, its text and a link to the screen root inside the screen - `inst-return-not-found`

## 3. Processes / Business Logic (CDSL)

### Pick a Template Card's Picture

- [x] `p2` - **ID**: `cpt-template-site-algo-templates-screen-card-art`

**Input**: The target of a card on a templates page.

**Output**: The picture the card shows, or none.

**Steps**:
1. [x] - `p2` - **IF** the card links no template route: **RETURN** no picture - `inst-no-route`
2. [x] - `p2` - **IF** the card links template-shell, template-mfe or template-design-guardrails: **RETURN** the brand's template figure of the shell, of the screens or of the guardrails, picked through the content model's brand art - `inst-drawn`
3. [x] - `p2` - **RETURN** the lucide icon of the template (the site, the catalogue, the inbox, the MFE demo, the calendar demo), or no picture for any other template - `inst-icon`

## 4. States (CDSL)

### Templates Page State Machine

- [x] `p2` - **ID**: `cpt-template-site-state-templates-screen-page`

**States**: Loading, Shown, Failed

**Initial State**: Loading

**Transitions**:
1. [x] - `p2` - **FROM** Loading **TO** Failed **WHEN** the outline read fails or its answer has no page for the route - `inst-to-failed`
2. [x] - `p2` - **FROM** Loading **TO** Shown **WHEN** the strings and the outline are read and the answer has the route's page - `inst-to-shown`

## 5. Definitions of Done

### Index and Template Pages

- [x] `p1` - **ID**: `cpt-template-site-dod-templates-screen-pages`

The system **MUST** render, from the generated templates outline read through the screen's API service, the index that features only the guide's featured groups and a page per template the guide lists, in the guide's order, with the template's manifest description and version, its key files with their content at the pinned source commit, an Example tab only where the site runs a screen built from the template, and a link to the page's plain-text twin; it **MUST** show the loading state while the outline is read and the error state when it cannot be read.

**Implements**:
- `cpt-template-site-flow-templates-screen-open-page`
- `cpt-template-site-algo-templates-screen-card-art`
- `cpt-template-site-state-templates-screen-page`

**Constraints**: None of its own; the DESIGN constraints are owned by the foundation features.

**Touches**:
- API: `GET /api/site-templates/catalogue`
- Entities: the templates outline (site data), the screen's English strings

### Registration, Page Metadata and Not-Found Page

- [x] `p1` - **ID**: `cpt-template-site-dod-templates-screen-registration`

The system **MUST** declare in `mfe.json` the `templates` screen extension with its menu label Templates, menu order 20 and its show_template action on its entry, with a closed schema whose target is the templates screen and whose payload enum names exactly the templates of its route tree, a page title and a description of 50 to 160 characters for the index and for every template page of its route tree, and **MUST** render the screen's own not-found page for every path that names no page.

**Implements**:
- `cpt-template-site-flow-templates-screen-unknown-path`

**Constraints**: None of its own.

**Touches**:
- API: `/?screen=templates[;route=<template>]`
- Entities: the screen extension and its page metadata in `mfe.json`

## 6. Acceptance Criteria

- [x] The index leads with the shell and the MFE workspace, adds Design Guardrails and points to the guide that runs them, with no site template and no "On this page" panel (`TemplatesPage.test.tsx`: "leads the index with the shell and the MFE workspace, adds Design Guardrails, then points to the guide that runs them, with no site template and no \"On this page\" panel"; `outline.test.ts`: "features only the groups the guide marks, so the pages of the other templates stay off the index").
- [x] A template's page puts its file explorer first, then what it gives and its source buttons beside the facts, with its manifest description and the twin link (`TemplatesPage.test.tsx`: "puts a template's file explorer first, then what it gives as a list of items and its source buttons beside the facts", "renders a template's page with its manifest description, facts, key files and the twin link").
- [x] The key files show their content, the pinned source commit and a link to the file at that commit; Copy copies the chosen file and the find box filters by path (`TemplatesPage.test.tsx`: "shows the key files with their content, the pinned source commit and a GitHub link to the file at that commit", "copies the text of the chosen file, finds files by path and shows a file the list is switched to").
- [x] The Example tab lists this site's screens as links that open them through the screen domain, and a template without a live screen has no Example tab (`TemplatesPage.test.tsx`: "opens the example tab with the screens of this site as links that open them through the screen domain", "has no example tab for a template without a live screen").
- [x] The site's own templates name this repository as their source, and template-mfe-demo states its manifest-true requirement (`TemplatesPage.test.tsx`: "names this repository as the source of the site's own templates, with no file link", "states the manifest-true requirement of template-mfe-demo").
- [x] The outline has the index and a page for every template the guide lists, in the guide order, with each version as its manifest declares it and a strings key for every text (`outline.test.ts`: "has the index and a page for every template the guide lists, in the guide order", "states each template's version as its manifest declares it", "names a strings key that exists for every text it reads from the strings").
- [x] An unknown template renders the screen's not-found page (`TemplatesPage.test.tsx`: "renders the screen's not-found page for an unknown template").
- [x] `mfe.json` declares the templates screen with its token, menu entry and page metadata, its show_template action with its closed schema, and page metadata for exactly the pages of its route tree (`manifest.test.ts`: "declares the templates screen with its token, menu entry and page metadata", "declares its show action on its entry, with a closed schema that names each page of its route tree and targets only this screen", "declares page metadata for exactly the pages of its route tree").
