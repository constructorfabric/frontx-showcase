# PRD - template-catalogue

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
  - [5.1 Pages and Addresses](#51-pages-and-addresses)
  - [5.2 Cross-Screen Navigation](#52-cross-screen-navigation)
  - [5.3 Fidelity to the Kit](#53-fidelity-to-the-kit)
  - [5.4 Presentation in the Host](#54-presentation-in-the-host)
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

template-catalogue is a FrontX template that turns the `@gears-frontx/ui-kit` catalogue into one screen of a FrontX application: an index of the kit's components grouped by family, a page per component example, and a page per design-token foundation, each page at its own address. Applied onto a project that already carries template-shell, template-mfe and template-kit-candidates, the screen appears in the shell's menu without further wiring.

The catalogue shows the kit's own examples, not a rewrite of them: the example files, the foundation pages and the helper they share are taken from the kit's demo at the release the template pins, and every difference from that demo is recorded with its kind and its reason. Around them the template adds what a reader of an application needs: the source of each example, how to install and connect the component for the installed kit version, and the `show_component` action through which the application's other screens open a component's page.

### 1.2 Background / Problem Statement

The kit's demo lives inside the gears-frontx repository as a standalone application with hash routing: it is not a FrontX screen, its pages have no stable public address, and it carries no page metadata. The published kit package carries no demo sources and no component manifest, and records no source commit, so an application that installs the kit has no way to show the kit's examples for the version it installed.

A catalogue copied by hand from that demo freezes at the copied commit and drifts from the installed kit without notice, and every hand edit made to fit the application's rules (accessibility, links that stay on the page, the repository's text rules) is lost or silently repeated when the copy is refreshed. The catalogue therefore has to be produced from the kit's demo at the pinned release, reproducibly, with every deviation named.

### 1.3 Goals (Business Outcomes)

- **Every kit example has an address**: each component example and each design-token foundation of the pinned kit release is a page a visitor or a crawler reaches directly. Target: 64 of 64 component pages and 3 of 3 foundation pages.
- **The catalogue equals the kit**: the catalogue's example files are the kit's demo at the commit the pinned release was published from, plus recorded adaptations only. Target: zero unrecorded differences, confirmed by the generation check on every change.
- **A visitor can use what they see**: every component page shows the example's source and how to get the component for the installed kit version. Target: 100% of component pages.
- **Drop-in for a FrontX project**: a project with template-shell, template-mfe and template-kit-candidates applied gets the screen by copying the template, with no change outside it. Target: zero edits outside the template's claimed paths.

### 1.4 Glossary

| Term | Definition |
|------|------------|
| catalogue | The screen this template contributes, with route token `catalogue`. |
| component page | The page of one example file of the kit's demo, named by the file's slug. |
| foundation page | One of the kit demo's design-token pages: semantic colors, typography, layout and elevation. |
| family | The group a component belongs to on the index and in the navigation (actions, forms, data display, feedback, navigation, disclosure, overlay, layout, chat). |
| kit demo | The demo application of `@gears-frontx/ui-kit` in the gears-frontx repository. |
| demo files | The files the catalogue takes from the kit demo: the example files, the foundation pages and the helper module the examples share. |
| adaptation | A recorded per-file change to a demo file beyond the content rules, with its kind (mechanical or substantive) and its reason. |
| content rules | Text replacements applied to every demo file so it passes the repository's text rules. |
| host application | The FrontX application the catalogue screen is mounted in, built from template-shell. |

## 2. Actors

### 2.1 Human Actors

#### Visitor

**ID**: `cpt-template-catalogue-actor-visitor`

**Role**: Browses the kit's components, their examples and sources in a browser.
**Needs**: A page per component and foundation at a stable address, the example working in place, its source, and how to install and connect the component.

#### Template Developer

**ID**: `cpt-template-catalogue-actor-template-developer`

**Role**: Maintains the catalogue: moves it to a new kit release, records a deliberate change to a demo file, adds the metadata of a new component.
**Needs**: One command that reproduces the demo files, a check that refuses any unrecorded difference, and a list of what to port when the kit changes.

#### Template Consumer

**ID**: `cpt-template-catalogue-actor-template-consumer`

**Role**: A developer of another FrontX project who copies the template into that project.
**Needs**: A self-contained screen package that works once copied next to template-shell, template-mfe and template-kit-candidates, with its prerequisites and pins documented.

### 2.2 System Actors

#### Host Application

**ID**: `cpt-template-catalogue-actor-host-application`

**Role**: The FrontX application built from template-shell that registers the catalogue screen, mounts it, supplies the theme and the language, lists its screens in its own menu, and carries actions between screens.

#### Kit Demo Source

**ID**: `cpt-template-catalogue-actor-kit-demo-source`

**Role**: The gears-frontx repository, which serves the kit demo's files at the commit a kit release was published from.

#### Search Engine and AI Crawler

**ID**: `cpt-template-catalogue-actor-crawler`

**Role**: Reads the catalogue's pages at their canonical addresses and their declared titles and descriptions.

## 3. Operational Concept & Environment

### 3.1 Module-Specific Environment Constraints

- The screen runs only inside a host application that has template-shell, template-mfe and template-kit-candidates applied; it has no standalone mode.
- Producing or checking the demo files needs the kit demo source over the network, or a local checkout of gears-frontx; building and running the screen need neither.
- The template pins the kit release and the libraries the kit's examples use to exact versions.

## 4. Scope

### 4.1 In Scope

- One screen with an index, a page per component example (64), a page per foundation (3) and a not-found page.
- The index: the components grouped by family with a count per family and a search over names and descriptions.
- A component page: the example working in place, its source, the install line for the installed kit version, the theme import, the example file to download and the type definitions of the installed version.
- Navigation inside the screen: a section bar (Components, Foundations), a navigation panel with every page, and a page select on narrow screens.
- Showing a component's page when another screen asks for it, through the catalogue's own typed action.
- Page metadata for every page, declared once.
- The production of the demo files from the kit demo at the pinned release, with content rules, recorded adaptations and a check.

### 4.2 Out of Scope

- A component contracts page and a States tab: the kit publishes no component contracts.
- An evaluation lab page: it is not part of the kit demo.
- A theme switch of its own: the theme belongs to the host application.
- The reference showcase's extra pages (charts and widgets, compositions, sizing and density, developer handoff, color themes): the kit does not ship that content.
- Fixing the kit's components: a defect the catalogue shows is reported to the kit, and a fix the kit adopts reaches the catalogue through a new release.
- Creating the metadata of a new component (family, name, description, page metadata) automatically: it is added by the developer, and the checks name what is missing.

## 5. Functional Requirements

### 5.1 Pages and Addresses

#### Component pages

- [x] `p1` - **ID**: `cpt-template-catalogue-fr-component-pages`

The catalogue **MUST** give every example file of the pinned kit demo its own page at its own address inside the screen, named by the file's slug, and **MUST** render the not-found page for a slug or path that names no page.

**Rationale**: Each kit component is a page a visitor or crawler reaches directly, and a slug is a public address that must keep meaning the same component.

**Actors**: `cpt-template-catalogue-actor-visitor`, `cpt-template-catalogue-actor-crawler`

#### Foundation pages

- [x] `p1` - **ID**: `cpt-template-catalogue-fr-foundation-pages`

The catalogue **MUST** give each design-token foundation of the kit demo (semantic colors, typography, layout and elevation) its own page, and **MUST** show on it the token values in effect for the host application's current theme, updated when the theme changes.

**Rationale**: The foundations are the kit's tokens as a reader sees them; values read from anywhere other than the screen itself show the wrong theme or nothing.

**Actors**: `cpt-template-catalogue-actor-visitor`

#### Catalogue index

- [x] `p1` - **ID**: `cpt-template-catalogue-fr-index`

The catalogue **MUST** list every component on its index grouped by family, in one fixed family order, with the number of components of each family, **MUST** filter the list by a search over the components' names and descriptions, saying so when nothing matches.

**Rationale**: Sixty-four components need an order a reader can scan and a way to find one by name or purpose.

**Actors**: `cpt-template-catalogue-actor-visitor`

#### Component page content

- [x] `p1` - **ID**: `cpt-template-catalogue-fr-component-page-content`

A component page **MUST** show the component's name, family and one-line description, the example working in place and the example's source, and **MUST** show how to use the component: the install line for the installed kit version, where the theme is loaded, the example file to download and the link to the type definitions the installed version publishes.

**Rationale**: A visitor needs to know how to get and connect a component, not only what it looks like; the version shown must be the one the application actually installed.

**Actors**: `cpt-template-catalogue-actor-visitor`

#### Navigation inside the screen

- [x] `p1` - **ID**: `cpt-template-catalogue-fr-screen-navigation`

The catalogue **MUST** offer a section bar (Components, Foundations) and a navigation panel listing every page, **MUST** mark the current section and page, **MUST** keep the current page's row in sight in the panel without moving the page, and **MUST** replace the panel with a page select on a narrow screen; every navigation entry **MUST** be a real link to the page's address.

**Rationale**: A visitor moves between seventy pages without returning to the index, and real links are crawlable and open in a new tab.

**Actors**: `cpt-template-catalogue-actor-visitor`, `cpt-template-catalogue-actor-crawler`

### 5.2 Cross-Screen Navigation

#### No knowledge of other screens

- [x] `p2` - **ID**: `cpt-template-catalogue-fr-links-to-screens`

The catalogue **MUST NOT** list, link or read the application's other screens: it **MUST NOT** read the host's manifest aggregate or any list of registered screens, **MUST NOT** build the host's addresses with the routing grammar and **MUST NOT** name another screen. Listing the application's screens, the example screens among them, is the host application's.

**Rationale**: A FrontX screen is isolated in its container and has no need to know which screens exist; the host, which registers them, is the one place that lists them, so a new example screen appears in the host's menu without a change to the catalogue.

**Actors**: `cpt-template-catalogue-actor-visitor`, `cpt-template-catalogue-actor-host-application`

#### Opened at a page from another screen

- [x] `p1` - **ID**: `cpt-template-catalogue-fr-show-component`

The catalogue **MUST** declare on its entry its own `show_component` action, with a closed schema whose target is the catalogue's screen and whose payload names one of its components by slug, and **MUST** show that component's page when another screen sends it after mounting the catalogue, with one history entry for the move, Back returning to the previous screen, and no page reload. A sender **MUST** need no knowledge of the catalogue's routes.

**Rationale**: Other screens of the application lead straight to a component page (a home tile naming a component, a template page); a typed action with the catalogue's own vocabulary keeps the catalogue's routes private and lets the type system refuse anything else.

**Actors**: `cpt-template-catalogue-actor-visitor`, `cpt-template-catalogue-actor-host-application`

### 5.3 Fidelity to the Kit

#### Demo files from the pinned kit release

- [x] `p1` - **ID**: `cpt-template-catalogue-fr-demo-files-from-kit`

The catalogue's demo files **MUST** be the kit demo's files at the commit the pinned kit release was published from, passed through the content rules, and **MUST** differ from them only by recorded adaptations, each naming its file, its kind (mechanical: the kit's behaviour kept, a repository rule met; substantive: the page does or shows something else) and its reason; the same template with the same kit version **MUST** always produce the same files.

**Rationale**: The catalogue shows the kit as released; an unrecorded difference is a silent fork of the kit, and a deviation without a reason cannot be ported or upstreamed.

**Actors**: `cpt-template-catalogue-actor-template-developer`, `cpt-template-catalogue-actor-kit-demo-source`

#### Generation check

- [x] `p1` - **ID**: `cpt-template-catalogue-fr-generation-check`

A check **MUST** reproduce the demo files and fail, naming the cause, on a hand edit, an extra or missing file, a pinned kit version that differs from the recorded source, a source file whose content differs from what was recorded, and an adaptation that no longer applies or lacks its kind or reason.

**Rationale**: A deviation is caught at the change that introduces it, not when a visitor notices the catalogue disagreeing with the kit.

**Actors**: `cpt-template-catalogue-actor-template-developer`

#### Recording a deliberate change

- [x] `p2` - **ID**: `cpt-template-catalogue-fr-record-adaptation`

The developer **MUST** be able to turn a deliberate edit of a demo file into that file's recorded adaptation, and generation **MUST** refuse an adaptation that does not state its kind and reason.

**Rationale**: A deliberate change is kept only as a recorded adaptation, so every change has a stated reason and survives regeneration.

**Actors**: `cpt-template-catalogue-actor-template-developer`

#### Moving to a new kit release

- [x] `p1` - **ID**: `cpt-template-catalogue-fr-kit-release-move`

When the pinned kit version changes, the developer **MUST** be able to move the recorded source to the commit the new version was published from, the move **MUST** refuse a commit that declares another kit version, and it **MUST** write every demo file and list each file whose adaptation no longer applies, so the developer redoes that edit and records it against the new commit.

**Rationale**: A kit release changes examples the site adapted; the move has to name exactly what needs porting and never guess.

**Actors**: `cpt-template-catalogue-actor-template-developer`, `cpt-template-catalogue-actor-kit-demo-source`

### 5.4 Presentation in the Host

#### Theme and language from the host

- [x] `p1` - **ID**: `cpt-template-catalogue-fr-host-theme-language`

The catalogue **MUST** render in the host application's current theme and text direction and follow their changes while mounted, **MUST** show its strings in the host's language with English as the fallback, and **MUST NOT** offer a theme switch or keep a theme of its own.

**Rationale**: The theme and the language are the application's; a screen that keeps its own shows a light page in a dark application.

**Actors**: `cpt-template-catalogue-actor-visitor`, `cpt-template-catalogue-actor-host-application`

#### Page metadata

- [x] `p1` - **ID**: `cpt-template-catalogue-fr-page-metadata`

The catalogue **MUST** declare a title and a description for each of its pages once, with each page's title equal to its navigation label and unique among the catalogue's titles, and the declared pages **MUST** equal the pages the screen renders.

**Rationale**: Every page is search-ready from one declaration, and a page added or removed cannot leave its metadata behind.

**Actors**: `cpt-template-catalogue-actor-crawler`, `cpt-template-catalogue-actor-template-developer`

## 6. Non-Functional Requirements

### 6.1 NFR Inclusions

#### Builds need no network

- [x] `p1` - **ID**: `cpt-template-catalogue-nfr-offline-build`

Building, testing and running the catalogue **MUST NOT** need the network or the kit demo source; only producing or checking the demo files may.

**Threshold**: Zero requests to the kit demo source during a build, a test run or a page load.

**Rationale**: A build must be reproducible on any machine and in any CI run from the repository alone.

#### Failure containment

- [x] `p1` - **ID**: `cpt-template-catalogue-nfr-failure-containment`

A failing example, foundation page or example source **MUST** affect only its own page: the page says what failed, and the navigation and every other page keep working.

**Threshold**: One failing example breaks at most one page; zero failures spread to the frame or to another page.

**Rationale**: Sixty-seven pages come from another repository's demo; one defect there must not take the catalogue down.

#### Self-contained template

- [x] `p1` - **ID**: `cpt-template-catalogue-nfr-self-contained`

The template **MUST** reference no file outside its own directory, including the files of the other templates of the repository, taking a package another template delivers only by name, and **MUST** pin the kit, the FrontX packages, the kit candidates and the libraries the kit's examples use to exact versions.

**Threshold**: The FrontX CLI's template validation passes; zero references outside the template's claimed paths; zero version ranges on `@gears-frontx/*` packages and on the libraries the kit's examples import.

**Rationale**: A consumer copies the template into another project, and the same template must give the same result there.

#### Page semantics

- [x] `p2` - **ID**: `cpt-template-catalogue-nfr-page-semantics`

Each catalogue page **MUST** have one top-level heading, headed sections, real links and no second main landmark, and its navigation groups **MUST NOT** become landmarks of their own.

**Threshold**: One `h1` per page; zero `main` landmarks added by the screen; zero region landmarks named like an index section.

**Rationale**: Visitors with assistive technology and crawlers read the page's structure, and the host already provides the document's main landmark.

### 6.2 NFR Exclusions

- Performance budgets beyond the application's own: the examples load lazily, one page at a time, and no stricter target applies.
- Authentication and authorization: the catalogue has no user data and no protected operation.
- Accessibility defects inside the kit's own components shown by the examples: they are the kit's, reported to it and listed by the site, not fixed in the catalogue.
- Languages other than English: the catalogue ships English strings only; another language falls back to English.

## 7. Public Library Interfaces

### 7.1 Public API Surface

#### Catalogue addresses

- [x] `p1` - **ID**: `cpt-template-catalogue-interface-catalogue-addresses`

**Type**: URL grammar

**Stability**: stable

**Description**: The screen's route token `catalogue` and its pages: the index, `/components/<slug>` per example file and `/foundations/<slug>` per foundation, addressed as the host's URL grammar addresses a route inside a screen.

**Breaking Change Policy**: A slug is never reused for other content; removing a page follows a kit release that removes the example.

#### Show a component

- [x] `p2` - **ID**: `cpt-template-catalogue-interface-show-component`

**Type**: Protocol (FrontX action `gts.frontx.mfes.comm.action.v1~frontx.catalogue.action.show_component.v1~` with a closed JSON schema, payload `{ component }`)

**Stability**: unstable

**Description**: The catalogue's own action that shows one component's page; another screen sends it as the next step after the screen domain's mount action. The schema's target is the catalogue's screen only and its payload an enum of the component slugs.

**Breaking Change Policy**: The action's type id carries its version; a changed payload shape is a new version, and a component removed by a kit release leaves the enum with its page.

#### Generation commands

- [x] `p2` - **ID**: `cpt-template-catalogue-interface-generation-commands`

**Type**: CLI

**Stability**: unstable

**Description**: The package's commands that produce the demo files, check them, record an adaptation and move to a new kit release.

**Breaking Change Policy**: A changed command is changed in the template's README and AI guidelines in the same change.

### 7.2 External Integration Contracts

#### Kit demo source

- [x] `p1` - **ID**: `cpt-template-catalogue-contract-kit-demo-source`

**Direction**: required from client

**Protocol/Format**: The kit demo's files read over HTTPS from the gears-frontx repository at a commit, or from a local checkout

**Compatibility**: The recorded source names the kit version, the commit and the content hash of each file; a file whose content differs from the record is refused.

#### Host application

- [x] `p1` - **ID**: `cpt-template-catalogue-contract-host-application`

**Direction**: required from client

**Protocol/Format**: FrontX screen domain, shared properties for theme and language, the registration of the catalogue's `show_component` schema from its manifest and the validation of every chain against it

**Compatibility**: The template pins the shell's packages it builds against exactly; a host on other versions is not supported.

## 8. Use Cases

#### Browse a component

- [x] `p1` - **ID**: `cpt-template-catalogue-usecase-browse-component`

**Actor**: `cpt-template-catalogue-actor-visitor`

**Preconditions**:
- The host application has the catalogue screen registered.

**Main Flow**:
1. The visitor opens the catalogue's index, from the menu or at its address.
2. The visitor searches or scans the families and picks a component.
3. The catalogue shows the component's page with the example working in place.
4. The visitor opens the source and copies it or downloads the example file, and reads the install line and the type definitions link.

**Postconditions**:
- The visitor knows how to install the component for the installed kit version and has the example's source.

**Alternative Flows**:
- **The example fails**: the page says the example crashed; navigation and other pages keep working.
- **The source does not load**: the source tab says so instead of loading forever.
- **The slug names no page**: the not-found page links back to the index.

#### Open a catalogue page from another screen

- [x] `p1` - **ID**: `cpt-template-catalogue-usecase-open-from-another-screen`

**Actor**: `cpt-template-catalogue-actor-host-application`

**Preconditions**:
- Another screen of the application links to a component page of the catalogue (the index and the foundation pages open only at the catalogue's own address).

**Main Flow**:
1. The visitor follows the link.
2. The application mounts the catalogue screen, and the link's chain sends it `show_component` with the component's slug.
3. The catalogue shows the component's page.

**Postconditions**:
- One history entry names the catalogue at the component's page; Back returns to the previous screen; the page did not reload.

#### Move to a new kit release

- [x] `p1` - **ID**: `cpt-template-catalogue-usecase-move-kit-release`

**Actor**: `cpt-template-catalogue-actor-template-developer`

**Preconditions**:
- A new kit version is pinned in the package.

**Main Flow**:
1. The developer moves the recorded source to the commit the new version was published from.
2. The catalogue's demo files are written from that commit.
3. The developer redoes each listed adaptation on the new source and records it.
4. The developer adds the metadata of any new component and runs the generation check and the screen's tests.

**Postconditions**:
- The demo files equal the new release's demo plus recorded adaptations; the check passes.

**Alternative Flows**:
- **The commit declares another kit version**: the move is refused and names the version found.
- **The source answers other content than expected**: nothing is cached, and the failing address is named.

## 9. Acceptance Criteria

- [ ] Every example file of the pinned kit demo and every foundation page is reachable at its own address, and an unknown slug shows the not-found page.
- [ ] The generation check passes on the stored demo files and fails on a hand edit, a pin that differs from the recorded source and an adaptation that no longer applies.
- [ ] Every component page shows the example, its source, the install line for the installed kit version and the type definitions link.
- [ ] The catalogue names, lists and reads no other screen of the application.
- [ ] Another screen opens a component page of the catalogue with one history entry, a working Back and no reload.
- [ ] The declared page metadata equals the pages the screen renders, with unique titles equal to the navigation labels.
- [ ] The template passes the FrontX CLI's template validation and builds without the network.

## 10. Dependencies

| Dependency | Description | Criticality |
|------------|-------------|-------------|
| template-shell and template-mfe | The host application, the screen domain, the shared theme and language, the build plugin and the test base | p1 |
| `@gears-frontx/ui-kit` | The components, tokens and type definitions the catalogue shows, pinned exactly | p1 |
| template-kit-candidates (`@gears-frontx/kit-candidates`) | The headings, text roles, links and code block the kit does not ship yet, pinned exactly; replaced by the kit's own components when it releases them | p1 |
| gears-frontx repository | The kit demo at the commit the pinned release was published from | p1 |
| `@gears-frontx/routing` and `@gears-frontx/routing-tanstack` | The address grammar and the routes inside the screen | p1 |

## 11. Assumptions

- The kit release the template pins was published from a commit of the gears-frontx repository that is publicly readable and whose kit package declares that version.
- The host application registers the action schemas a screen's manifest declares and validates every actions chain against them.
- The kit's examples render inside a shadow root once the kit's tokens are made available there.

## 12. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| A kit release changes examples the catalogue adapted | The generation check fails until each adaptation is ported | The move lists every adaptation to redo; fixes that belong to every kit consumer are proposed to the kit, which removes the adaptation |
| The kit's overlay components open outside the screen's shadow root | Dialogs, menus and toasts take the document's theme and type size instead of the screen's | Recorded as a kit gap in the site's design; the toast region is mounted inside the screen |
| The published kit carries no demo sources and no source commit | Producing or checking the demo files needs the network or a local checkout | The demo files are stored, so builds need no network; a per-commit cache keeps checks offline after the first fetch |
| A new kit example arrives without its metadata | The page has no family, name, description or page metadata | The screen's tests name each missing entry |
