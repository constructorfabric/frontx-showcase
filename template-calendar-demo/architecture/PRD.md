# PRD - template-calendar-demo

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
  - [5.1 Screen and Navigation](#51-screen-and-navigation)
  - [5.2 Presentation](#52-presentation)
  - [5.3 Page Metadata](#53-page-metadata)
  - [5.4 Template Portability](#54-template-portability)
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

template-calendar-demo is the template that delivers the calendar demo screen of the FrontX site. The calendar kit the screen is to demonstrate is in development and has no release, so the screen is a placeholder: one page, built from UI kit components, that tells the visitor the calendar demo is coming and where the calendar components the UI kit already has can be seen today. The page is kept out of search indexes.

The template is an overlay a project copies: one screen package and one AI guideline. A project that has the official template-shell and template-mfe applied gets the screen in its menu with no further wiring.

### 1.2 Background / Problem Statement

The FrontX site shows what FrontX builds through demo screens: the inbox app, the MFE mechanics demo and the UI kit catalogue. A calendar demo belongs in that set, but its calendar kit is not released, and the site consumes ecosystem code only as released versions. Without a screen, the demos group has a hole and visitors who follow a link to the calendar find nothing.

The placeholder keeps the address and the menu entry stable, so the real demo replaces the page content later without changing how the site addresses it. Because the page says only that the demo is coming, it must not be offered to search engines as content.

### 1.3 Goals (Business Outcomes)

- The calendar demo has a stable address and a menu entry in the demos group from the first release of the site, with zero broken links to it.
- The placeholder page is never indexed: it is absent from the sitemap and the AI crawler summary, and served with a no-index directive.
- A project developer can move the template into another project by copying two directories, with no edit outside them.
- Replacing the placeholder with the real calendar demo later changes no address and no other template.

### 1.4 Glossary

| Term | Definition |
|------|------------|
| Screen | A top-level page area the host shell mounts at an address of the form `/?screen=<token>`, with its own routes inside |
| Screen token | The short name of a screen in its address, here `calendar` |
| Host shell | The application template-shell provides: header, menu, screen container, theme and language |
| Demos group | The menu group of the site's demo screens; the site's header lists its screens under one entry |
| Placeholder page | The one page of this screen: a notice that the calendar demo is in development |
| Page metadata | Title, description and indexability of a page, declared once by the screen and applied by the project's metadata pipeline |
| AI bundle | A template's guidelines for AI coding agents, shipped beside its code |
| Calendar kit | The planned FrontX calendar package whose demo this screen is to become; not released |

## 2. Actors

### 2.1 Human Actors

#### Visitor

**ID**: `cpt-template-calendar-demo-actor-visitor`

**Role**: Opens the calendar screen from the demos list or a direct link in a browser.
**Needs**: A clear statement that the demo is coming, a pointer to what can be seen today, and a way back when an address inside the screen does not exist.

#### Site Developer

**ID**: `cpt-template-calendar-demo-actor-site-developer`

**Role**: Maintains this template in the FrontX site repository and composes it into the site.
**Needs**: One place to edit the screen, checks that hold its address, menu entry and metadata.

#### Template Consumer

**ID**: `cpt-template-calendar-demo-actor-template-consumer`

**Role**: A project developer elsewhere who copies this template into a project of their own.
**Needs**: A self-contained template with documented prerequisites that works after a copy and an install.

### 2.2 System Actors

#### Host Shell

**ID**: `cpt-template-calendar-demo-actor-host-shell`

**Role**: The template-shell application of the project: registers the screen from its manifest, lists it in the menu, mounts it at its address, and broadcasts the current theme and language to it.

#### Metadata Pipeline

**ID**: `cpt-template-calendar-demo-actor-metadata-pipeline`

**Role**: The project's page metadata tooling (in the FrontX site, template-site-meta): reads the screen's declared metadata, writes the generated head, sitemap and crawler summary, and keeps the document head equal to the open page at run time.

#### AI Coding Agent

**ID**: `cpt-template-calendar-demo-actor-ai-agent`

**Role**: An AI agent working in a project that carries this template; reads the template's guideline before changing the screen.

## 3. Operational Concept & Environment

### 3.1 Module-Specific Environment Constraints

- The screen runs only inside a project with template-shell and template-mfe applied: the shell supplies the host, the screen domain, the shared theme and language properties, the build plugin and the test harness.
- The screen package is a separately served module of the project; in development it answers on its own local port (3070), which a consumer changes when the port is taken.
- The package installs the FrontX ecosystem packages at exact released versions, the same versions the hosting project installs.

## 4. Scope

### 4.1 In Scope

- One screen with one placeholder page and a not-found page for any other address inside the screen.
- The screen's menu entry in the demos group.
- The page's metadata, declared once and marked not indexable.
- Following the host's theme and the text direction of the host's language.
- The page text in English, loaded per language with English as the fallback.
- One AI guideline that states the screen's contract.

### 4.2 Out of Scope

- A working calendar, events, dates or any calendar data: they come with the calendar kit's release.
- Any calendar package as a dependency, released or not.
- Inner routes beyond the placeholder.
- Languages other than English.
- Showing the UI kit's existing calendar components (`Calendar`, `Date Picker`): the UI kit catalogue screen shows them on their own pages.
- Writing the document title or head tags from the screen.

## 5. Functional Requirements

### 5.1 Screen and Navigation

#### The calendar screen is registered with the host

- [x] `p1` - **ID**: `cpt-template-calendar-demo-fr-screen-registration`

The template **MUST** register exactly one screen with the host shell, at the screen token `calendar`, with the menu label "Calendar: coming soon", a calendar icon, menu order 60 and membership of the demos group, so that the screen appears in the host's navigation with no wiring outside the template.

**Rationale**: The calendar demo needs a stable address and a place among the site's demos before its content exists.

**Actors**: `cpt-template-calendar-demo-actor-host-shell`, `cpt-template-calendar-demo-actor-visitor`

#### The placeholder page

- [x] `p1` - **ID**: `cpt-template-calendar-demo-fr-placeholder-page`

The screen **MUST** render, at its root address, one page that states the calendar demo is in development and names the UI kit catalogue as the place to see the calendar components available today, with exactly one top-level heading whose text equals the page title.

**Rationale**: A visitor who reaches the calendar screen learns why there is no demo yet and where to look meanwhile.

**Actors**: `cpt-template-calendar-demo-actor-visitor`

#### Not-found page inside the screen

- [x] `p2` - **ID**: `cpt-template-calendar-demo-fr-not-found`

The screen **MUST** render, for any address inside it other than its root, a not-found page with exactly one top-level heading and a link back to the placeholder page.

**Rationale**: A stale or mistyped link inside the screen ends on a page the visitor can leave, never on an empty area.

**Actors**: `cpt-template-calendar-demo-actor-visitor`

### 5.2 Presentation

#### Theme and text direction follow the host

- [x] `p1` - **ID**: `cpt-template-calendar-demo-fr-host-theme-direction`

The screen **MUST** paint in the light or dark variant matching the host's current theme, and lay out right to left when the host's language is written right to left, and **MUST** follow a change of either without a reload, including for the UI kit's overlays that open outside the page's own area.

**Rationale**: The screen is part of the host's page; a light screen inside a dark shell, or a left-to-right screen in a right-to-left language, breaks the page.

**Actors**: `cpt-template-calendar-demo-actor-host-shell`, `cpt-template-calendar-demo-actor-visitor`

#### Page text per language

- [x] `p2` - **ID**: `cpt-template-calendar-demo-fr-page-text-per-language`

The screen **MUST** take its text from per-language string sets selected by the host's current language, fall back to English when the language has no set, and show the text of the latest selected language only, also when an earlier language's text arrives later.

**Rationale**: Adding a language is adding one string set, and a quick language switch never leaves stale text on the page.

**Actors**: `cpt-template-calendar-demo-actor-host-shell`, `cpt-template-calendar-demo-actor-visitor`

### 5.3 Page Metadata

#### Metadata declared once, page kept out of indexes

- [x] `p1` - **ID**: `cpt-template-calendar-demo-fr-page-metadata`

The screen **MUST** declare its page metadata (title, description and "not indexable") in one place, readable by the project's metadata pipeline, and **MUST NOT** set the document title or head tags itself; as a result the page is served with a no-index directive and is absent from the sitemap and the crawler summary.

**Rationale**: A placeholder is not content for search engines, and one declaration keeps the generated head, the run-time head and the page in agreement.

**Actors**: `cpt-template-calendar-demo-actor-metadata-pipeline`

### 5.4 Template Portability

#### Self-contained template

- [x] `p1` - **ID**: `cpt-template-calendar-demo-fr-self-contained`

The template **MUST** consist only of its screen package and its AI bundle, claim exactly those two subtrees, and reference nothing outside them, so that copying the two directories into a project with template-shell and template-mfe applied, followed by an install, yields a working screen.

**Rationale**: The template is moved between projects as an overlay; any reference outside it breaks the copy.

**Actors**: `cpt-template-calendar-demo-actor-template-consumer`, `cpt-template-calendar-demo-actor-site-developer`

#### AI guideline for the screen

- [x] `p2` - **ID**: `cpt-template-calendar-demo-fr-ai-guideline`

The template **MUST** ship a guideline for AI coding agents that states what the screen guarantees (address, menu entry, pages, metadata, theme and direction, styling, build form) and how to change it without breaking the site.

**Rationale**: Agents change templates in the projects that carry them; the guideline keeps their changes inside the screen's contract.

**Actors**: `cpt-template-calendar-demo-actor-ai-agent`

## 6. Non-Functional Requirements

### 6.1 NFR Inclusions

#### Metadata quality

- [x] `p2` - **ID**: `cpt-template-calendar-demo-nfr-metadata-quality`

The page **MUST** carry a title identical to its visible heading and a description of 50 to 160 characters.

**Threshold**: title equals heading text exactly; description length between 50 and 160 characters inclusive.

**Rationale**: Previews and the browser tab show what the page shows, at a length previews do not cut.

#### Semantic page structure

- [x] `p2` - **ID**: `cpt-template-calendar-demo-nfr-semantics`

Each page of the screen **MUST** have exactly one top-level heading, and its decorative icon **MUST** be hidden from assistive technology.

**Threshold**: one top-level heading per page; zero decorative images announced by a screen reader.

**Rationale**: Screen reader users get the page's subject once and no noise from decoration.

#### Kit-consistent look

- [x] `p2` - **ID**: `cpt-template-calendar-demo-nfr-kit-consistent-look`

The screen **MUST** look like the rest of the site in both theme variants, using only UI kit components and the kit's semantic design tokens for its visual style, with no utility-class styling framework.

**Threshold**: zero hard-coded colours; zero utility-class framework imports or classes in the package.

**Rationale**: A theme or token change in the kit reaches the screen without editing it.

### 6.2 NFR Exclusions

- Performance budgets: the screen renders one static page with no data loading; the project's defaults apply.
- Security and privacy: the screen collects, stores and sends no data.
- Availability and recovery: the screen has no server side; when it cannot load, the host's load-failure state applies.

## 7. Public Library Interfaces

### 7.1 Public API Surface

#### Calendar screen extension

- [x] `p1` - **ID**: `cpt-template-calendar-demo-interface-screen-extension`

**Type**: Data format (the screen extension in the package's MFE manifest)

**Stability**: stable

**Description**: The screen's address token `calendar`, its menu entry (label, icon, order 60, demos group) and its page metadata, as the host shell and the metadata pipeline read them. The address `/?screen=calendar` is what links to the screen use.

**Breaking Change Policy**: the token is never reused for other content and never renamed; a change to the menu entry or metadata is a template version bump.

#### Template overlay

- [x] `p2` - **ID**: `cpt-template-calendar-demo-interface-template-overlay`

**Type**: Data format (the template manifest and the two subtrees it claims)

**Stability**: experimental

**Description**: The template's manifest names the package and the AI bundle as its exclusive subtrees and claims no shared file, so a project can copy or remove the template as a unit.

**Breaking Change Policy**: template version bump on any change to a claimed subtree.

### 7.2 External Integration Contracts

#### Host shell screen contract

- [x] `p1` - **ID**: `cpt-template-calendar-demo-contract-host-shell`

**Direction**: required from the host shell

**Protocol/Format**: template-shell's screen domain and screen extension type with its optional nav group, the host's demos nav group, the shared theme and language properties, and the module federation entry contract (a lifecycle with mount and unmount)

**Compatibility**: pinned to the template-shell version the project applies; the screen names the demos nav group by its id; the package carries no screen type schema.

#### Page metadata block

- [x] `p2` - **ID**: `cpt-template-calendar-demo-contract-page-metadata`

**Direction**: provided to the project's metadata pipeline

**Protocol/Format**: the metadata block of the screen extension (title, description, indexability), as the FrontX site's metadata contract defines it

**Compatibility**: an extra field on an open extension schema; the shell passes it through unchanged.

#### UI kit tokens and components

- [x] `p2` - **ID**: `cpt-template-calendar-demo-contract-ui-kit`

**Direction**: required from `@gears-frontx/ui-kit`

**Protocol/Format**: the kit's components and its token stylesheet with a light and a dark scope

**Compatibility**: pinned to an exact kit release; a kit upgrade is checked against the token stylesheet's shape before it lands.

## 8. Use Cases

#### Open the calendar screen

- [x] `p2` - **ID**: `cpt-template-calendar-demo-usecase-open-screen`

**Actor**: `cpt-template-calendar-demo-actor-visitor`

**Preconditions**:
- The project is built and served with this template composed in.

**Main Flow**:
1. The visitor follows the calendar entry from the demos list or opens `/?screen=calendar`.
2. The host mounts the screen and passes it the current theme and language.
3. The screen shows the placeholder page in the host's theme and text direction.
4. The document head shows the page's title and a no-index directive.

**Postconditions**:
- The visitor knows the demo is coming and where to see the kit's calendar components.

**Alternative Flows**:
- **Address inside the screen that does not exist**: the screen shows its not-found page; its link returns the visitor to the placeholder.
- **Host theme or language changes while the screen is open**: the screen repaints in the new theme and direction and reloads its text without a page reload.

#### Apply the template to a project

- [x] `p2` - **ID**: `cpt-template-calendar-demo-usecase-apply-template`

**Actor**: `cpt-template-calendar-demo-actor-template-consumer`

**Preconditions**:
- The project has template-shell and template-mfe applied.

**Main Flow**:
1. The consumer copies the screen package and the AI bundle into the project.
2. The consumer installs the project's dependencies.
3. The consumer runs the project; the calendar screen is in the menu and opens at its address.

**Postconditions**:
- The project serves the calendar screen with no edit outside the two copied directories.

**Alternative Flows**:
- **Port 3070 is taken in the project**: the consumer picks another port in the package's scripts and manifest entry address.

## 9. Acceptance Criteria

- [ ] In the assembled FrontX site, `/?screen=calendar` shows the placeholder page in light and dark at 1440 and 390 pixels wide with no console error.
- [ ] Any other address inside the screen shows the not-found page, and its link returns to the placeholder.
- [ ] The built site lists no calendar address in its sitemap or crawler summary, and the calendar page's head carries a no-index directive and the page's title.
- [ ] The host's menu data lists the calendar screen once, in the demos group, at order 60.
- [ ] The package's unit tests, type check and build pass, and the site's template shape check accepts the template.

## 10. Dependencies

| Dependency | Description | Criticality |
|------------|-------------|-------------|
| template-shell (applied in the project) | Host, screen domain and screen extension type, shared theme and language, build plugin, test harness | p1 |
| template-mfe (applied in the project) | The screen package form this package follows | p1 |
| `@gears-frontx/ui-kit` `0.4.0` | Components and the token stylesheet | p1 |
| `@gears-frontx/routing` and `@gears-frontx/routing-tanstack` `0.3.0` | The screen's route tree and its router | p1 |
| `@gears-frontx/react` (the shell's workspace version) | Lifecycle base, bridge, the screen's app | p1 |
| The project's metadata pipeline (template-site-meta in the FrontX site) | Applies the declared metadata to the head and the generated files | p2 |
| The calendar kit (not released) | The future content of the screen | p3 |

## 11. Assumptions

- The host's screen extension schema keeps accepting the metadata block as an extra field.
- The host keeps broadcasting theme and language as shared properties under their current identifiers.
- The calendar kit, once released, is demonstrated under the same screen token.

## 12. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| A UI kit upgrade changes the shape of its token stylesheet | The screen loses its tokens or its dark variant inside its isolated area, without an error | The package's tests count and check every place the kit stylesheet declares its root tokens and pin that count to the kit version |
| The host registers a new dark theme | The screen paints light inside dark host chrome | The dark themes are listed in one place in the package, covered by tests; adding a host theme includes adding it there |
| The calendar kit release changes what the demo needs | The placeholder package is rewritten rather than extended | The address, menu entry and metadata contract stay; only the page content changes |
