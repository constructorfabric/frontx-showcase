# Feature: Docs Screen

<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Read a Docs Page](#read-a-docs-page)
  - [Open an Unknown Path](#open-an-unknown-path)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Draw the Docs Tab Bar](#draw-the-docs-tab-bar)
  - [Pick a Docs Card Icon](#pick-a-docs-card-icon)
- [4. States (CDSL)](#4-states-cdsl)
  - [Docs Page State Machine](#docs-page-state-machine)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Overview and Guides](#overview-and-guides)
  - [Registration, Page Metadata and Not-Found Page](#registration-page-metadata-and-not-found-page)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

- [x] `p2` - **ID**: `cpt-template-site-featstatus-docs-screen`

## 1. Feature Context

- [x] `p2` - `cpt-template-site-feature-docs-screen`

### 1.1 Overview

The `docs` screen of the `site-docs-mfe` package: the overview, the guide to run a shell with its first MFE and the guide to make a first change, written once as the screen's hand-written outline, with a tab bar across the three pages that ends with a tab to the libraries screen, every command filled from the bundled generated version data; plus the screen's own not-found page for any path that names no page.

### 1.2 Purpose

A guide whose commands fail loses the visitor at the first step, so the screen holds no version of its own: the CLI version, the template source-specs and the toolchain in every command come from the version data the site data tooling generates, and the commands are run as written before publication. The first-change guide offers a task a coding agent can follow, naming the site's plain-text guides by their full address. The screen registers itself and declares a title and a description for each of its pages next to its registration.

**Requirements**: `cpt-template-site-fr-docs`, `cpt-template-site-fr-screen-registration`, `cpt-template-site-fr-not-found`, `cpt-template-site-fr-page-metadata`, `cpt-template-site-nfr-description-length`

**Principles**: None of its own; the screen follows the principles owned by the foundation features of the [DESIGN](../../DESIGN.md).

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-site-actor-visitor` | Opens a docs page, moves between the pages with the tab bar and copies the commands of a guide |
| `cpt-template-site-actor-host` | Registers the `docs` screen from its manifest, lists it in the menu and mounts it at its address |
| `cpt-template-site-actor-data-generator` | Writes the version data the screen bundles |
| `cpt-template-site-actor-metadata-tooling` | Reads the declared title and description of each docs page |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md), component `cpt-template-site-component-docs-screen`
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.7
- **Dependencies**: `cpt-template-site-feature-content-model` (the outline parser, the outline renderer and the twin paths), `cpt-template-site-feature-data-services` (the docs API service that answers with the version data), `cpt-template-site-feature-screen-frame` (the lifecycle, the bridge hook and the strings hook)
- **Code**: `template-site/src-app/mfe_packages/site-docs-mfe/`: `mfe.json`, `src/routes.tsx`, `src/screens/docs/` (the layout with the tab bar, the page, the not-found page and the English strings), `src/content/outline.json` and `src/data/versions.generated.json` (data without markers). The package's tests also cover the content model's command wrapping (`src/content/wrapCommand.test.ts`), the theme helpers (`src/site-theme/`) and the whole `show_guide` chain through the host (`src/showGuide.chain.test.tsx`); those behaviours belong to their own features.

## 2. Actor Flows (CDSL)

Both flows start when the host mounts the `docs` screen at an address of the screen domain and the screen's router reads the path inside the screen from that address.

**Use cases**: `cpt-template-site-usecase-read-guide`

### Read a Docs Page

- [x] `p1` - **ID**: `cpt-template-site-flow-docs-screen-read-page`

**Actor**: `cpt-template-site-actor-visitor`

**Success Scenarios**:
- The visitor opens `/?screen=docs;route=get-started` and sees the guide with its four steps, each command filled from the version data, the side panel of its numbered steps and the link to its plain-text twin.
- The visitor opens the overview at `/?screen=docs` and sees its path cards and guide cards, with the twin link in the line under the content.

**Error Scenarios**:
- The version data cannot be read: the page shows its error state instead of commands with unfilled versions.

**Steps**:
1. [x] - `p1` - When the module loads, parse the hand-written outline through the content model and build one route per outline page under a layout route the pages render in - `inst-build-routes`
2. [x] - `p1` - The page loads the screen's English strings for the host's language - `inst-load-strings`
3. [x] - `p1` - API: GET `/api/site-docs/versions` through the screen's docs service (the generated version data) - `inst-read-versions`
4. [x] - `p1` - **IF** the strings or the version data are still loading - `inst-if-loading`
   1. [x] - `p1` - **RETURN** the page loading state, labelled with the screen's loading text once the strings are loaded - `inst-return-loading`
5. [x] - `p1` - **IF** the read failed or returned no data - `inst-if-error`
   1. [x] - `p1` - **RETURN** the page error state with the screen's error text - `inst-return-error`
6. [x] - `p1` - Label the content model's controls (copy, on this page, expected result, plain text) with the screen's strings - `inst-chrome-labels`
7. [x] - `p1` - **RETURN** the outline page rendered by the content model with the version data and the site's origin as placeholder values, the tab bar of the tab bar algorithm as the docs frame's navigation, the card icons of the card icon algorithm, the start paths named by the screen's strings, a side panel on the two guides and none on the overview, and the link to the page's plain-text twin - `inst-render-page`

### Open an Unknown Path

- [x] `p2` - **ID**: `cpt-template-site-flow-docs-screen-unknown-path`

**Actor**: `cpt-template-site-actor-visitor`

**Success Scenarios**:
- The visitor opens a path inside the docs screen that names no page, such as `/libraries`, and sees the screen's not-found page with a link back to the overview.

**Error Scenarios**:
- None: every path the outline does not name lands on this page.

**Steps**:
1. [x] - `p2` - The screen's root route renders the not-found page for any path no outline page matches - `inst-route-not-found`
2. [x] - `p2` - The not-found page loads the screen's strings and renders nothing while they load - `inst-load-strings`
3. [x] - `p2` - **RETURN** the not-found page: its title, its text and a link to the screen root inside the screen - `inst-return-not-found`

## 3. Processes / Business Logic (CDSL)

### Draw the Docs Tab Bar

- [x] `p1` - **ID**: `cpt-template-site-algo-docs-screen-tab-bar`

**Input**: The current route of the docs screen.

**Output**: The docs frame's navigation: the tab bar across the three docs pages and the libraries screen, each tab the link element the frame's kit navigation menu renders.

**Steps**:
1. [x] - `p1` - Load the screen's strings - `inst-load-strings`
2. [x] - `p1` - Read the route the router matched last as the current page - `inst-current-route`
3. [x] - `p1` - **IF** the strings are still loading: **RETURN** nothing - `inst-if-loading`
4. [x] - `p1` - **FOR EACH** docs page (overview, get started, first change): a tab that is an in-screen link to the page, current when its route is the matched one - `inst-page-tabs`
5. [x] - `p1` - Append the Libraries tab: a site link to the libs screen's extension id that opens it through the screen domain, never current - `inst-libraries-tab`
6. [x] - `p1` - **RETURN** the navigation labelled with the screen's tab bar label - `inst-return-tab-bar`

### Pick a Docs Card Icon

- [x] `p2` - **ID**: `cpt-template-site-algo-docs-screen-card-icon`

**Input**: The target of a card on a docs page.

**Output**: The icon the card shows.

**Steps**:
1. [x] - `p2` - **IF** the card jumps to a heading of the page: **RETURN** the plus icon - `inst-anchor-icon`
2. [x] - `p2` - **IF** the card opens another screen: **RETURN** the braces icon for the libs screen and the blocks icon for any other - `inst-screen-icon`
3. [x] - `p2` - **IF** the card opens a docs page: **RETURN** the file-pen-line icon for the first change and the terminal icon for any other - `inst-route-icon`
4. [x] - `p2` - **RETURN** no icon for any other target - `inst-no-icon`

## 4. States (CDSL)

### Docs Page State Machine

- [x] `p2` - **ID**: `cpt-template-site-state-docs-screen-page`

**States**: Loading, Shown, Failed

**Initial State**: Loading

**Transitions**:
1. [x] - `p2` - **FROM** Loading **TO** Failed **WHEN** the version data read fails or returns no data - `inst-to-failed`
2. [x] - `p2` - **FROM** Loading **TO** Shown **WHEN** the strings and the version data are read - `inst-to-shown`

## 5. Definitions of Done

### Overview and Guides

- [x] `p1` - **ID**: `cpt-template-site-dod-docs-screen-pages`

The system **MUST** render the overview, the get-started guide and the first-change guide from the screen's outline, with every command and version filled from the generated version data read through the screen's API service and no unfilled placeholder, the agent task naming the plain-text guides by their full address and linking its own plain-text copy, a tab bar across the pages that marks the current page and ends with the Libraries tab, and a link to each page's plain-text twin; it **MUST** show the loading state while the data is read and the error state when it cannot be read.

**Implements**:
- `cpt-template-site-flow-docs-screen-read-page`
- `cpt-template-site-algo-docs-screen-tab-bar`
- `cpt-template-site-algo-docs-screen-card-icon`
- `cpt-template-site-state-docs-screen-page`

**Constraints**: None of its own; the DESIGN constraints are owned by the foundation features.

**Touches**:
- API: `GET /api/site-docs/versions`
- Entities: the docs outline, the version data (site data), the screen's English strings

### Registration, Page Metadata and Not-Found Page

- [x] `p1` - **ID**: `cpt-template-site-dod-docs-screen-registration`

The system **MUST** declare in `mfe.json` the `docs` screen extension with its menu label Docs, menu order 40 and its show_guide action on its entry, with a closed schema whose target is the docs screen and whose payload enum names exactly the guides of its route tree, a page title and a description of 50 to 160 characters for the overview and for each guide of its route tree, and **MUST** render the screen's own not-found page for every path that names no page.

**Implements**:
- `cpt-template-site-flow-docs-screen-unknown-path`

**Constraints**: None of its own.

**Touches**:
- API: `/?screen=docs[;route=get-started|first-change]`
- Entities: the screen extension and its page metadata in `mfe.json`

## 6. Acceptance Criteria

- [x] Each of `/`, `/get-started` and `/first-change` renders its page with its title as the one level-one heading, and `/nowhere` and `/libraries` render the not-found page (`routes.test.tsx`: "renders the page at %s", "renders the screen's own not-found page for %s, which is no docs page").
- [x] The get-started steps carry commands filled from the version data, one level-one heading and the twin link; a page without a side panel links its twin from the line under its content (`DocsPage.test.tsx`: "renders the get-started steps with commands filled from the version data, one h1 and a link to its plain-text twin", "links the twin of a page without a side panel from the line under its content").
- [x] Every text key exists in the strings and every placeholder of every text and command is filled from the version data and the page address; the commands use the CLI and the template source-specs the site itself uses (`outline.test.ts`: "names a strings key that exists for every text it reads from the strings", "fills every placeholder of every text and command from the version data and the page address", "runs the commands with the CLI and the template source-specs the site itself uses").
- [x] The tab bar marks the current page, marks only the overview on the screen root and ends with the libraries screen (`DocsPage.test.tsx`: "marks the current page in the tab bar, which ends with the libraries screen", "marks the overview tab on the screen root, and no other tab with it").
- [x] The agent task is collapsed, names the guides by their full address and links its plain-text copy (`DocsPage.test.tsx`: "collapses the agent task, with its full guide addresses and a link to its plain-text copy").
- [x] The side panel lists only the numbered steps with one current, and its items move keyboard focus to their headings (`DocsPage.test.tsx`: "lists only the numbered steps in the side panel, one of them current, under the title the page names", "moves keyboard focus to the heading an \"On this page\" item jumps to").
- [x] The overview adds the UI kit and agent cards, get-started shows the toolchain chips, the two start paths and the closing band, and a link to another screen has no address and opens it through the screen domain on a click or on Enter (`DocsPage.test.tsx`: "adds the UI kit and agent cards to the overview, with the AI tooling kit documentation at the packed commit", "shows the toolchain chips, the two start paths and the closing band on get-started, with a path card that focuses its step", "opens another screen through the screen domain on a click or on Enter, the link carrying no address, and ignores other keys, a held Enter, an input method's Enter and another button"). The `show_guide` action shows a guide with one history entry and no reload, and Back returns to the previous screen (`showGuide.chain.test.tsx`).
- [x] `mfe.json` declares the docs screen with its token, menu entry and page metadata, its show_guide action with its closed schema, and page metadata for exactly the pages of its route tree (`manifest.test.ts`: "declares the docs screen with its token, menu entry and page metadata", "declares its show action on its entry, with a closed schema that names each page of its route tree and targets only this screen", "declares page metadata for exactly the pages of its route tree").
