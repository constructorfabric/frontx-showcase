# PRD - template-site

<!-- toc -->

- [1. Overview](#1-overview)
  - [1.1 Purpose](#11-purpose)
  - [1.2 Background / Problem Statement](#12-background--problem-statement)
  - [1.3 Goals (Business Outcomes)](#13-goals-business-outcomes)
  - [1.4 Glossary](#14-glossary)
- [2. Actors](#2-actors)
  - [2.1 Human Actors](#21-human-actors)
  - [2.2 System Actors](#22-system-actors)
- [3. Operational Concept & Environment](#3-operational-concept--environment)
  - [3.1 Module-Specific Environment Constraints](#31-module-specific-environment-constraints)
- [4. Scope](#4-scope)
  - [4.1 In Scope](#41-in-scope)
  - [4.2 Out of Scope](#42-out-of-scope)
- [5. Functional Requirements](#5-functional-requirements)
  - [5.1 Screens and Pages](#51-screens-and-pages)
  - [5.2 Content](#52-content)
  - [5.3 Navigation](#53-navigation)
  - [5.4 Shell Integration](#54-shell-integration)
- [6. Non-Functional Requirements](#6-non-functional-requirements)
  - [6.1 NFR Inclusions](#61-nfr-inclusions)
  - [6.2 NFR Exclusions](#62-nfr-exclusions)
- [7. Public Library Interfaces](#7-public-library-interfaces)
  - [7.1 Public API Surface](#71-public-api-surface)
  - [7.2 External Integration Contracts](#72-external-integration-contracts)
- [8. Use Cases](#8-use-cases)
- [9. Acceptance Criteria](#9-acceptance-criteria)
- [10. Dependencies](#10-dependencies)
- [11. Assumptions](#11-assumptions)
- [12. Risks](#12-risks)

<!-- /toc -->

## 1. Overview

### 1.1 Purpose

template-site is the FrontX template that carries the FrontX site's own sections as four screen microfrontends: home (what FrontX is), templates (an index and a page per template), docs (getting started and a first change) and libraries (the FrontX packages and short technical summaries of routing, microfrontends and the screen domain). It is applied onto a project that already has template-shell applied, and its screens appear in the shell's menu with no further wiring.

The template also carries what its screens share: a content model in which the home, templates, docs and libraries pages are written once and published both as pages and as plain text, and the links between screens. The look of the pages comes from the blocks of template-site-blocks, the kit candidates of template-kit-candidates, the brand of template-site-brand and the FrontX UI kit; the template carries no styling of its own.

### 1.2 Background / Problem Statement

A product site that explains FrontX has to be a FrontX application itself, or it cannot show what it claims. Its sections therefore have to be real screens: registered in the shell's screen domain, addressed by the FrontX URL grammar, isolated in their own shadow roots, themed and translated through the shell's shared properties, reading their data through the FrontX data layer.

Content about a fast-moving product drifts: template descriptions, versions, commands and source-specs copied by hand go stale as soon as a template or a pin moves, and a page and its plain-text copy written separately disagree. Coding agents and crawlers that do not run JavaScript also need the guides as text. The sections have to take their facts from generated data and render one source twice.

Navigation between screens in a FrontX shell goes through the screen domain; a link that reloads the whole page loses the running shell and its state, and a screen that builds the host's addresses or names other screens' routes breaks the isolation of screens. The sections need links that move through FrontX actions, with the pages still reachable by crawlers through the sitemap and the plain-text twins.

### 1.3 Goals (Business Outcomes)

- **A visitor learns FrontX from the site's own sections**: every section page of the FrontX site (home, templates, docs, libraries) is served by this template. Target: all of them.
- **No hand-copied facts**: every template description, version, source-spec and command parameter on a page comes from generated data. Target: zero facts that exist only as hand-written copies.
- **Readable by agents and crawlers**: every templates, docs and libraries page has a plain-text twin linked from the page. Target: 100% of those pages.
- **Navigation without reloads**: a link to another section opens it inside the running shell, while every link stays a real address. Target: every cross-screen link.
- **Reusable in another project**: the template can be copied into any project with template-shell, template-site-brand, template-kit-candidates and template-site-blocks applied and runs there after an install. Target: no reference outside the template's own directories other than the named packages those templates deliver.

### 1.4 Glossary

| Term | Definition |
|------|------------|
| screen | A screen-domain extension of an MFE package with its own route token and its own routes. |
| page | A route inside a screen that renders content. |
| canonical address | The one URL a page is published under, in the FrontX URL grammar (`/?screen=<token>[;route=<path>]`). |
| outline | The typed, data-driven description of a page as an ordered list of entries, from which the page and its plain-text twin are both rendered. |
| entry | One line of an outline, named after the block it renders or the kit part it renders directly, carrying content only. |
| block | A section-level component of template-site-blocks, built from kit components, kit candidates and brand art, with content-only props. |
| plain-text twin | The Markdown rendering of an outline page, published next to the site at a fixed path. |
| site data | The generated files that hold the facts the pages show: the templates outline, the docs version data and the libraries data. |
| host | The application template-shell provides: it registers the screens, owns the address and the menu, and mounts screens into its screen domain. |

## 2. Actors

### 2.1 Human Actors

#### Visitor

**ID**: `cpt-template-site-actor-visitor`

**Role**: Reads the site's sections in a browser to learn what FrontX is, which templates exist, how to start and which packages to install.
**Needs**: Every page at a stable address, true and current facts, commands that work as written, links that open the right page without losing the running site.

#### Site Developer

**ID**: `cpt-template-site-actor-site-developer`

**Role**: Writes and changes the sections' content and screens, alone or with a coding agent.
**Needs**: One place to write a page, checks that fail when a page, its strings, its data, its route and its metadata disagree, generated facts instead of copies.

#### Template Consumer

**ID**: `cpt-template-site-actor-template-consumer`

**Role**: A project developer who copies this template into a project of their own that has template-shell applied.
**Needs**: A self-contained template that installs and runs without the repository it comes from, with a documented way to supply its data.

### 2.2 System Actors

#### FrontX Host

**ID**: `cpt-template-site-actor-host`

**Role**: The application template-shell provides. It registers the template's screens from their manifests, lists them in its menu, owns the page address, mounts and unmounts screens in its screen domain, broadcasts the theme and language, and serves the aggregate of the registered manifests next to its document.

#### Site Data Generator

**ID**: `cpt-template-site-actor-data-generator`

**Role**: The tooling that writes the site data from its sources (template manifests and files, pins, lockfiles, the package registry) and reports when the files are out of date. In the FrontX site repository it is the repository's own tooling; a project without it supplies its own data.

#### Metadata Tooling

**ID**: `cpt-template-site-actor-metadata-tooling`

**Role**: The tooling that reads each screen's declared page metadata and its outlines, strings and data, and publishes the head, the discovery files and the plain-text twins.

#### Search Engine and AI Crawler

**ID**: `cpt-template-site-actor-crawler`

**Role**: Reaches the pages through the sitemap and the shell's links, and reads the plain-text twins and the links between pages they carry.

## 3. Operational Concept & Environment

### 3.1 Module-Specific Environment Constraints

- The template runs only inside a project with template-shell, template-site-brand, template-kit-candidates and template-site-blocks applied: the host, its screen domain, its build plugin for MFE packages and its mock plugin for API services come from template-shell, and the brand, the kit candidates and the blocks from the other three as named packages.
- The site is static: the screens have no backend, and their data ships inside the packages.
- The FrontX ecosystem packages and the UI kit are released versions from the npm registry, and template-shell's own packages (the React bindings and the framework, state, i18n and auth packages) are the applied shell's workspace sources; every one is pinned exactly, at the same version the project's application installs.

## 4. Scope

### 4.1 In Scope

- The home screen: the landing page of the FrontX site.
- The templates screen: an index of the templates grouped by purpose and a page per template, with its key files and their content.
- The docs screen: an overview, a guide to run a shell with its first MFE and a guide to make a first change.
- The libraries screen: the FrontX packages the site's application depends on, with versions, install commands and sources, and technical summaries of routing, the MFE model and the screen domain.
- The content model and its renderer, shared by the home, templates, docs and libraries screens, with the links to each content page's plain-text twin.
- Links between screens, and the show action the docs and templates screens declare to show one of their pages.
- The page metadata each screen declares for its routes.
- The template's AI guidelines: the screens' contract, the site's styling rules and the nav groups the header menu reads.

### 4.2 Out of Scope

- The shell's header, menu, footer and layout (the host and the project own them).
- The brand values and the typeface (template-site-brand owns them and delivers them to the host's document).
- Producing the site data (the Site Data Generator owns it) and publishing the head, discovery files and plain-text twins (the Metadata Tooling owns it).
- The UI kit catalogue, the demos and their screens (other templates own them).
- Translations other than English (the screens ship English strings; the model allows more).
- A backend for the screens' data.

## 5. Functional Requirements

### 5.1 Screens and Pages

#### Four screens registered without wiring

- [x] `p1` - **ID**: `cpt-template-site-fr-screen-registration`

The template **MUST** provide the home, templates, docs and libraries sections as four screens of the host's screen domain, each with its own route token, menu label and menu order, so that applying the template makes them appear in the host's menu with no change to the host.

**Rationale**: A template that needs host edits is not an overlay; the menu, routing and isolation of FrontX apply only to registered screens.

**Actors**: `cpt-template-site-actor-host`, `cpt-template-site-actor-template-consumer`

#### Home page

- [x] `p1` - **ID**: `cpt-template-site-fr-home`

The home screen **MUST** present FrontX as a landing page: what FrontX is with ways in to the docs and the source, the groundwork its templates give, the architecture of a shell holding independent screens, a worked first change, live samples of UI kit components that each lead to their catalogue page, a comparison of working with and without FrontX that states no figures without a source, the teams using FrontX, the steps to a running application and a closing call to action.

**Rationale**: The landing page is where a visitor decides whether FrontX fits; every claim on it must be true for FrontX at the versions the site uses.

**Actors**: `cpt-template-site-actor-visitor`

#### Templates index and template pages

- [x] `p1` - **ID**: `cpt-template-site-fr-templates`

The templates screen **MUST** show an index that features the official templates grouped by what they are for, and a page per template with its identity, version, what it gives, its requirement and next steps, its source-spec and claimed paths, and its key files with their content as the template ships them at the version the site uses. A template whose screens run in the site **MUST** link to them. The templates the index does not feature **MUST** keep their pages, reachable by address.

**Rationale**: A visitor chooses a template from what it really contains; content read from the template's own source cannot drift from it.

**Actors**: `cpt-template-site-actor-visitor`

#### Docs guides

- [x] `p1` - **ID**: `cpt-template-site-fr-docs`

The docs screen **MUST** have an overview, a guide to run a shell with its first MFE and a guide to make a first change, with a tab bar across them that also leads to the libraries screen. Each guide step **MUST** give its command and the expected result; the commands **MUST** carry the versions the site itself uses and **MUST** have been run as written before they are published. The first-change guide **MUST** offer a task a coding agent can follow, also published as plain text.

**Rationale**: A guide whose commands fail loses the visitor at the first step; the versions in a command must be the ones the site proves work.

**Actors**: `cpt-template-site-actor-visitor`

#### Libraries and technical summaries

- [x] `p1` - **ID**: `cpt-template-site-fr-libraries`

The libraries screen **MUST** list every FrontX package the site's application depends on, with its version, a description, its install command and a link to its source at the commit that version was published from, and separately the packages the shell brings with it. It **MUST** have technical summaries of routing, the MFE model and the screen domain, each stating only what the installed packages and their published sources support and linking those sources, and a list of the site's own templates linking their pages.

**Rationale**: A developer adopting FrontX needs the exact packages and what they do, traced to their sources, without reading the whole ecosystem.

**Actors**: `cpt-template-site-actor-visitor`

#### Not-found page per screen

- [x] `p2` - **ID**: `cpt-template-site-fr-not-found`

Each screen **MUST** render its own not-found page, with a link back to the screen's root, for any path inside it that names no page.

**Rationale**: A mistyped or retired address must still land inside the site with a way forward.

**Actors**: `cpt-template-site-actor-visitor`

### 5.2 Content

#### Pages written once as outlines

- [x] `p1` - **ID**: `cpt-template-site-fr-outline-content`

The home, templates, docs and libraries pages **MUST** be written as outlines: ordered, typed, content-only entries, each named after the block or kit part it renders, whose texts are keys of the screen's strings or literals, with named placeholders filled from the screen's data. An outline **MUST** be checked when the screen loads, and the screen's checks **MUST** fail on a text key its strings lack, on a placeholder its data cannot fill and on an entry type or drawing option the model does not know. The routes of these screens **MUST** be the pages of their outlines.

**Rationale**: One source for each page lets the page and its plain-text twin agree, and lets a check catch a missing string or fact before a visitor does.

**Actors**: `cpt-template-site-actor-site-developer`

#### Facts from generated data

- [x] `p1` - **ID**: `cpt-template-site-fr-generated-facts`

Every template description, version, source-spec, package, commit and command parameter the templates, docs and libraries pages show **MUST** come from the site data, never from a hand-written copy, and the screens **MUST** show a loading state while it is read and an error state when it cannot be read.

**Rationale**: Hand-copied facts go stale with every release; generated facts are checked against their sources.

**Actors**: `cpt-template-site-actor-visitor`, `cpt-template-site-actor-data-generator`

#### Links to plain-text twins

- [x] `p2` - **ID**: `cpt-template-site-fr-twin-links`

Every outline page **MUST** link its plain-text twin at the twin's published path, from the foot of the page's side panel or, on a page without one, from a small line under its content; an agent task on a page **MUST** link its own plain-text copy.

**Rationale**: Agents and crawlers find the text version from the page itself.

**Actors**: `cpt-template-site-actor-crawler`, `cpt-template-site-actor-visitor`

### 5.3 Navigation

#### Links between screens without reloads

- [x] `p1` - **ID**: `cpt-template-site-fr-cross-screen-links`

Every link to another screen, at its root or at a page inside it, **MUST** open the target inside the running host without reloading, with one history entry, so that Back returns to the previous page. It **MUST** do so through FrontX actions only: the screen domain's mount action for the target's screen extension and, for a page, the show action the target declares, which names the page in the target's own terms. The link **MUST NOT** carry or build the host's address, **MUST NOT** name the target's routes and **MUST NOT** depend on a list of registered screens. It **MUST** be announced as a link and open on a click or on Enter.

**Rationale**: A screen of a FrontX application is isolated: the address is the host router's byproduct of actions, and a screen knows neither the host's address nor the other screens' routes. Opening in place keeps the shell and its state; crawlers reach every page through the sitemap and the plain-text twins.

**Actors**: `cpt-template-site-actor-visitor`

#### Showing a page on request

- [x] `p1` - **ID**: `cpt-template-site-fr-show-page`

A screen of the template whose pages other screens open (docs and templates) **MUST** declare one show action on its entry, with a closed schema whose target is its own screen extension and whose payload names one of its pages (a guide, a template), **MUST** accept it after the host mounts it, and **MUST** move its own routes there without writing the page address itself. A screen no other screen opens at a page (home and libs) **MUST** declare no action.

**Rationale**: FrontX's mount action opens a screen at its root; reaching a page inside another screen needs the target screen's cooperation, and a typed action keeps the request within the pages the target offers.

**Actors**: `cpt-template-site-actor-host`

#### Links work at any mount point

- [x] `p2` - **ID**: `cpt-template-site-fr-mount-independent-links`

Every link to a plain-text twin **MUST** reach it whether the site is served at the root of an origin or under a sub-path, with no configuration; a link to another screen carries no address and so depends on no mount point.

**Rationale**: The site is deployed as static files to wherever a host serves them.

**Actors**: `cpt-template-site-actor-visitor`

#### In-page jumps move focus

- [x] `p2` - **ID**: `cpt-template-site-fr-in-page-jumps`

A link to a heading of the current page **MUST** bring the heading into view and move keyboard focus to it; a guide's side panel **MUST** mark the step in view.

**Rationale**: Keyboard users continue from the section they jumped to, not from the panel they left.

**Actors**: `cpt-template-site-actor-visitor`

### 5.4 Shell Integration

#### Page metadata declared per route

- [x] `p1` - **ID**: `cpt-template-site-fr-page-metadata`

Each screen **MUST** declare, once and next to its registration, a title and a description for its root and for every other route it has, and its checks **MUST** fail when the declared routes and the screen's routes disagree.

**Rationale**: The Metadata Tooling builds the head and discovery files from this declaration; a page without one is invisible to search.

**Actors**: `cpt-template-site-actor-metadata-tooling`, `cpt-template-site-actor-site-developer`

#### Theme and language from the host

- [x] `p2` - **ID**: `cpt-template-site-fr-theme-language`

Each screen **MUST** follow the host's theme and language as the host broadcasts them, render in a language it ships strings for and fall back to English for any other, and declare the language and direction of the text it renders on its own frame, never on the host's document.

**Rationale**: The shell owns the theme and language; a screen that writes the document's attributes breaks every other screen.

**Actors**: `cpt-template-site-actor-host`, `cpt-template-site-actor-visitor`

#### Data with no backend

- [x] `p1` - **ID**: `cpt-template-site-fr-no-backend-data`

The screens **MUST** read their data through the FrontX data layer as a request to a service, and that service **MUST** answer from data shipped inside the package, so the site runs with no backend while a project with one can answer the same requests.

**Rationale**: The site is static, and the screens still show how a FrontX screen reads data.

**Actors**: `cpt-template-site-actor-template-consumer`

## 6. Non-Functional Requirements

### 6.1 NFR Inclusions

#### Styling on the UI kit

- [x] `p1` - **ID**: `cpt-template-site-nfr-styling`

Every screen **MUST** be composed from FrontX UI kit components first; where the kit has no piece, a block of template-site-blocks or a kit candidate **MUST** fill it, and the template's pages and renderer **MUST NOT** carry styling of their own. No utility CSS framework may be used.

**Threshold**: zero findings of the hosting repository's own-styles check over the template; no page file with its own stylesheet.

**Rationale**: One visual language across the shell and every screen; every missing primitive is a recorded kit candidate.

#### Semantic, accessible pages

- [x] `p1` - **ID**: `cpt-template-site-nfr-semantics`

Every page **MUST** have exactly one top-level heading, headed sections and links that assistive technology announces as links and the keyboard opens; text and controls **MUST** keep the kit's minimum sizes and a contrast of at least 4.5:1, and motion **MUST** stop under the reduced-motion preference.

**Threshold**: one top-level heading on every page in every screen test; the kit's text and control size floors kept on every page.

**Rationale**: Semantic pages serve assistive technology and crawlers alike.

#### Self-contained template

- [x] `p1` - **ID**: `cpt-template-site-nfr-self-contained`

The template **MUST** reference nothing outside its own directories except the named packages of the templates it requires, and its packages **MUST** pin every FrontX package exactly at the versions the project's application installs and those named packages at the versions their templates deliver.

**Threshold**: a copy of the template's directories into a project with template-shell, template-site-brand, template-kit-candidates and template-site-blocks applied installs and builds with no other file from the source repository.

**Rationale**: A template is an overlay that moves; a hidden reference breaks it where it lands.

#### Truthful content

- [x] `p1` - **ID**: `cpt-template-site-nfr-truthful-content`

Every statement on a page **MUST** be true for FrontX at the versions the site uses; a technical summary **MUST** state only what the installed packages and their published sources support, and a comparison **MUST** show no figures without a source.

**Threshold**: every summary links the source it was written from; zero figures without a source.

**Rationale**: The site is the product's public face; one false claim discredits the rest.

#### Description length

- [x] `p2` - **ID**: `cpt-template-site-nfr-description-length`

Every declared page description **MUST** be between 50 and 160 characters.

**Threshold**: 50 to 160 characters per declared description.

**Rationale**: Search results truncate longer descriptions and treat shorter ones as thin.

### 6.2 NFR Exclusions

- Performance budgets: no budget beyond what the host ships; the pages are static and their data is bundled.
- Availability and security: the template runs no service and handles no user data.
- Authentication, authorization, audit and privacy: every page is public and read-only, and no visitor data is collected or stored.
- Monitoring: no telemetry; a refused action is reported by the host's mediator.
- Regulatory and legal: none beyond the licence notices a template page links for the official templates' sources.

## 7. Public Library Interfaces

### 7.1 Public API Surface

#### Screen addresses

- [x] `p1` - **ID**: `cpt-template-site-interface-screen-addresses`

**Type**: URL grammar

**Stability**: stable

**Description**: The route tokens `home`, `templates`, `docs` and `libs` and the routes inside each screen, published under `/?screen=<token>[;route=<path>]`.

**Breaking Change Policy**: a token or route is never reused for other content; a removed page is dropped from the declared metadata.

#### Outline content format

- [x] `p1` - **ID**: `cpt-template-site-interface-outline`

**Type**: Data format (JSON outline: screen token, strings file, data file and pages of typed entries)

**Stability**: experimental

**Description**: The format in which the templates, docs and libraries pages are written, read by the screens and by the Metadata Tooling to render the plain-text twins.

**Breaking Change Policy**: a new entry type or field is additive; renaming or removing one is a template version bump and needs the Metadata Tooling changed with it.

#### Plain-text twin paths

- [x] `p2` - **ID**: `cpt-template-site-interface-twin-paths`

**Type**: Path rule

**Stability**: stable

**Description**: The twin of a page is published at `/<screen token>/<route>.md`, and at `/<screen token>/index.md` for a screen's root; an agent task's copy sits next to it, named after the task.

**Breaking Change Policy**: the rule changes only together with the Metadata Tooling that writes the files.

#### Show actions

- [x] `p1` - **ID**: `cpt-template-site-interface-show-actions`

**Type**: Protocol (FrontX actions with closed JSON schemas: the docs screen's `show_guide` with payload `{ guide }`, the templates screen's `show_template` with payload `{ template }`)

**Stability**: experimental

**Description**: The actions the docs and templates screens declare to show one of their pages after the host has mounted them; any screen of the project may send them as the next step after the mount action. Each schema's target is the declaring screen only and its payload an enum of that screen's pages.

**Breaking Change Policy**: each action's type id carries its version; a changed payload shape is a new version, and a removed page is removed from the enum together with its metadata.

### 7.2 External Integration Contracts

#### Host services

- [x] `p1` - **ID**: `cpt-template-site-contract-host`

**Direction**: required from template-shell

**Protocol/Format**: the FrontX screen domain and its mount action, the theme and language shared properties, the aggregate of registered manifests served next to the host's document, the build plugin for MFE packages and the mock plugin for API services

**Compatibility**: pinned to the template-shell version the project applies.

#### Site data files

- [x] `p1` - **ID**: `cpt-template-site-contract-site-data`

**Direction**: required from the Site Data Generator

**Protocol/Format**: three JSON files inside the template: the templates outline, the docs version data and the libraries data

**Compatibility**: the screens' checks fail on a placeholder the data cannot fill; the generator's own check fails when a file differs from its sources.

#### Page metadata declaration

- [x] `p1` - **ID**: `cpt-template-site-contract-page-metadata`

**Direction**: provided to the Metadata Tooling

**Protocol/Format**: JSON, the `seo` block of each screen extension in the package's manifest: title, description and an entry per route

**Compatibility**: an extra field on the host's open extension schema, passed through by the host unchanged.

## 8. Use Cases

#### Read a guide and follow it

- [x] `p2` - **ID**: `cpt-template-site-usecase-read-guide`

**Actor**: `cpt-template-site-actor-visitor`

**Preconditions**:
- The site is served and the host has registered the template's screens.

**Main Flow**:
1. The visitor opens the docs screen from the menu or by its address.
2. The screen reads its data and renders the overview with the tab bar.
3. The visitor opens the get-started guide and copies each step's command.
4. Each command runs as written and gives the stated result.

**Postconditions**:
- The visitor has a running shell with its first MFE.

**Alternative Flows**:
- **The data cannot be read**: the page shows its error state instead of commands with unfilled versions.
- **An agent reads the guide**: it follows the page's plain-text link and reads the same guide as Markdown.

#### Open a page in another screen

- [x] `p2` - **ID**: `cpt-template-site-usecase-open-other-screen`

**Actor**: `cpt-template-site-actor-visitor`

**Preconditions**:
- The visitor is on a page of one of the template's screens.

**Main Flow**:
1. The visitor clicks a link to a page inside another screen, or presses Enter on it.
2. The host mounts the target screen and records one history entry.
3. The target screen shows the linked page through its show action.
4. The visitor presses Back and returns to the previous page.

**Postconditions**:
- The page was never reloaded.

**Alternative Flows**:
- **Keyboard**: the visitor focuses the link and presses Enter; the page opens as on a click.

#### Change a page

- [x] `p2` - **ID**: `cpt-template-site-usecase-change-page`

**Actor**: `cpt-template-site-actor-site-developer`

**Preconditions**:
- The repository is installed.

**Main Flow**:
1. The developer edits a page's outline and its strings, or the inputs of the site data.
2. The developer regenerates the site data when its inputs changed.
3. The screen's checks confirm that every text key and placeholder resolves and that the routes and the declared metadata agree.

**Postconditions**:
- The page and its plain-text twin show the change.

**Alternative Flows**:
- **A new page**: the developer adds the outline page and its metadata entry; the checks fail until both exist.

#### Reuse the template in another project

- [x] `p3` - **ID**: `cpt-template-site-usecase-reuse`

**Actor**: `cpt-template-site-actor-template-consumer`

**Preconditions**:
- The project has template-shell, template-site-brand, template-kit-candidates and template-site-blocks applied.

**Main Flow**:
1. The consumer copies the template's package directories, its shared folder and its AI bundle into the project.
2. The consumer installs the packages.
3. The host registers the four screens and lists them in its menu.

**Postconditions**:
- The sections run in the project.

**Alternative Flows**:
- **No site data tooling in the project**: the consumer supplies the three data files from its own sources.

## 9. Acceptance Criteria

- [ ] Every address of the four screens renders its page in the site, with exactly one top-level heading, and every other path inside a screen renders that screen's not-found page.
- [ ] A click or Enter on a link to a page inside another screen opens it with one history entry and no reload, and Back returns to the previous page.
- [ ] Every outline page links a plain-text twin that the Metadata Tooling publishes at that path.
- [ ] The screens' checks pass: outlines resolve every text key and placeholder, declared metadata matches the routes, and the docs and templates screens declare and handle their show actions with closed schemas of their pages.
- [ ] The site data generator's check reports the data files current.

## 10. Dependencies

| Dependency | Description | Criticality |
|------------|-------------|-------------|
| template-shell | The host, the screen domain, shared properties, the MFE build plugin and the API mock plugin | p1 |
| template-catalogue and the demo templates | The catalogue screen's id, which the home, docs, libs and templates screens open, and its `show_component` action, which the home page's UI kit tiles send; the demo screens' ids, which the templates pages open; without them those links open nothing | p2 |
| FrontX packages | Routing and routing-tanstack, the MFE runtime, the data layer and the UI kit as npm registry releases, and the React bindings as the applied shell's workspace package, at exact versions | p1 |
| Site Data Generator | Writes and checks the three data files | p1 |
| Metadata Tooling | Publishes the head, the discovery files and the plain-text twins from the declarations and outlines | p2 |

## 11. Assumptions

- The host's screen extension schema keeps accepting the extra `seo` field.
- The host keeps serving the aggregate of registered manifests next to its document.
- FrontX keeps chaining a follow-up action after a mount, delivered once the mounted screen's lifecycle returns.

## 12. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| FrontX standardises a navigation action set for routed entries | The screens' show actions duplicate a platform feature | Each action is versioned, declared once by its screen and handled through one helper in the template's navigation folder, so it can be replaced in one place |
| The MFE loader rewrites import-like text inside bundled data | Key-file content shipped as text breaks a screen when it loads | Key-file content is carried encoded and decoded in the page |
| The site data goes stale after a template or pin changes | Pages show old versions or files | The generator's check fails in CI until the data is regenerated |
| The outline format and the Metadata Tooling drift apart | Twins miss entries or fail to publish | A change to the outline format is a template version bump made together with the Metadata Tooling, which fails on an outline page whose metadata is not declared |
