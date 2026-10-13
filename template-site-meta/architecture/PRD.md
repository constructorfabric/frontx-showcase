# PRD - template-site-meta

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
  - [5.1 Metadata Declaration](#51-metadata-declaration)
  - [5.2 Generated Outputs](#52-generated-outputs)
  - [5.3 Runtime Head](#53-runtime-head)
  - [5.4 Checks](#54-checks)
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

template-site-meta is the page metadata pipeline of a FrontX site, delivered as a FrontX template. It adds one tooling package to a project that already has template-shell applied. From the metadata each screen declares about its own pages and from one site-level configuration, it produces everything a search engine, a link preview, an AI crawler or a coding agent reads about the site: the document head, the discovery files, the web manifest and a plain-text twin of every outline page. In the browser it keeps the document head equal to the page the address shows. It checks the declared metadata against a set of rules and checks that the published outputs still equal what the sources produce.

The template contributes no screen and no route. It reads the screens other templates contribute, and it writes only into the project's build output.

### 1.2 Background / Problem Statement

A FrontX application is one document whose screens are microfrontends addressed in the query string. template-shell ships a static head (one title and an icon) and no head management: nothing gives a page of a FrontX site its own title, description, canonical address or share data, and nothing produces a sitemap, a robots file or an `llms.txt`. A site that wants to be found has to add all of it, and the obvious ways to add it (a hand-kept list of pages, or each screen writing the head itself) let the metadata drift from the screens or depend on screen code having run.

Static hosting serves the same document for every address, so the per-page head can only be applied in the browser, and the head that a crawler which runs no script sees is the site-level head. The pipeline therefore has two halves that must agree: what the build writes and what the browser applies. Both are derived from the same declarations, and the checks keep the published outputs from going stale when a declaration changes.

The FrontX site needs this for its own pages, and any other FrontX project that publishes pages needs the same thing, so the pipeline lives in a template a project can copy rather than in the site's repository tooling.

### 1.3 Goals (Business Outcomes)

- **Every page is search-ready from one declaration** - each page of a project's site has a canonical address, a title, a description, an indexability flag and share data declared once, and every generated output and the runtime head derive from that declaration. Target: 100% of the screens and declared static routes of the project; the check fails the build otherwise.
- **Discovery files ship with every build** - a sitemap, a robots file, an `llms.txt`, a page map manifest and a web manifest are produced by the same build that produces the site. Target: all five on every production build, with zero hand-edited outputs.
- **Agents read the guides in full** - every outline page of the site has a plain-text twin, listed in `llms.txt` and reachable at the same path in development and in a build. Target: 100% of outline pages.
- **Published metadata never goes stale silently** - a change to a declaration, the site configuration or a twin's source that was not followed by a new generation is reported, naming each drifted output. Target: zero undetected differences between the sources and the outputs in the build output.
- **Portable to any template-shell project** - a project with template-shell applied gains the pipeline by copying the template and adding a site configuration. Target: no reference from the template to anything outside its own directories.

### 1.4 Glossary

| Term | Definition |
|------|------------|
| Screen | A screen microfrontend of the project: a screen extension registered on the shell's screen domain, addressed by its token in the query string. |
| Page | A screen's root, or a route inside a screen that the screen declares in its metadata. A page whose route has a parameter segment is a pattern page. |
| Metadata block | The `seo` block of a screen extension: the title, description, indexability and share image of the screen's root and of each route inside it. |
| Site configuration | The project's one set of site-level values: origin, site name, short name, title template, default description, language, home screen, share image and its alternative text, card type and colours. |
| Origin | The address the site is served from, optionally with the sub-path it is mounted at. |
| Canonical address | The one absolute address of a page, built on the origin with the same grammar the FrontX router writes the URL with. |
| Page map | The resolved metadata of every page of the site, with the site-level fields and the fallback head for an address that names no page. |
| Head-sync | The browser runtime that keeps the document head equal to the page the current address shows. |
| Plain-text twin | A Markdown rendering of an outline page, produced from the same outline, strings and data as the page, served as plain text. |
| Outline | The data a screen declares to describe its content pages, in the content model of template-site, which twins are rendered from. |
| Raster record | A file that pins each hand-rendered raster image (icons, share image) to the hash of the vector source it was drawn from. |
| Drift | A difference between an output in the build output and what the current sources generate. |

## 2. Actors

### 2.1 Human Actors

#### Project Developer

**ID**: `cpt-template-site-meta-actor-project-developer`

**Role**: Applies the template to a FrontX project with template-shell, writes the site configuration, declares the metadata block of each screen and route, and runs generation after the build and the check in the project's checks.
**Needs**: One place per page to declare its metadata; outputs that need no hand editing; failures that name the screen, route or output at fault.

#### Site Visitor

**ID**: `cpt-template-site-meta-actor-visitor`

**Role**: Opens pages of the site in a browser, moves between them, bookmarks and shares their addresses, and installs the site from the browser.
**Needs**: A tab title and a shared link preview that match the page shown; an address that stays as the router wrote it.

### 2.2 System Actors

#### Crawler

**ID**: `cpt-template-site-meta-actor-crawler`

**Role**: Search engines, link-preview scrapers, AI crawlers and coding agents that read the robots file, the sitemap, `llms.txt`, the page head and the plain-text twins to find and describe the site's pages. Some run scripts and see the per-page head; others do not and see the site-level head.

#### Project Build

**ID**: `cpt-template-site-meta-actor-project-build`

**Role**: The project's production build and its continuous integration. The build produces the built document and the assets in the build output, after which generation runs; the checks run the metadata rules and the drift comparison.

#### FrontX Router

**ID**: `cpt-template-site-meta-actor-frontx-router`

**Role**: The project's router, which writes every address change through the realm's navigation history and owns the URL grammar that canonical addresses are written in.

## 3. Operational Concept & Environment

A project developer copies the template into a project that has template-shell applied, installs, and adds the site configuration. Each screen declares its pages in its metadata block next to its registration. After the production build, generation reads the composed screens, the site configuration and the built document, and writes the outputs into the build output. The checks run in the project's checks with or without a build. In the browser, the inline head-sync runs before the application boots and follows every navigation. In development, the project's dev server renders each twin from the current sources on request.

### 3.1 Module-Specific Environment Constraints

- Requires a project with template-shell applied: its workspace root for packages a template delivers that are not screens, its screen domain, its composed screen packages and the build output its build writes.
- Requires the project to run `@gears-frontx/routing` at the same version as the package, because head-sync reads the realm's navigation history, which is shared only within one version.
- Requires the project to supply the icon set the head and the web manifest link, in its public assets.
- Serving twins in development requires the project's dev server to route twin requests to the package; template-shell has no convention for a template-contributed dev-server plugin, so the project adds that middleware itself.
- A static host must serve the twins as plain text, since a browser downloads a Markdown or unknown media type instead of showing it.

## 4. Scope

### 4.1 In Scope

- Page metadata declared once per screen and per route inside a screen, plus one site configuration.
- Canonical addresses for every page, on a configured origin with an optional sub-path.
- Generation of the site-level head of the built document, the sitemap, the robots file, `llms.txt`, the page map manifest, the web manifest and a plain-text twin of every outline page, with a plain-text copy of each agent task that offers one.
- The browser runtime that keeps the head equal to the page the address shows.
- Rules over the declared metadata and the site configuration, a drift check of the outputs, a check that head-sync and the project share one routing version, and a check of the raster record when the project keeps one.
- Rendering a twin for the project's dev server.

### 4.2 Out of Scope

- Server-side rendering or prerendering a document per address.
- Injecting the per-page head at the edge or on a server at deploy time; the page map manifest is the input such a step would read.
- Rendering raster images from their vector sources; the raster record only pins hand-rendered files to their sources.
- Hosting, the production origin's value and the media types the host serves.
- The semantic markup of each page (headings, landmarks, links), which the screens own.
- Any screen, route or menu entry.

## 5. Functional Requirements

### 5.1 Metadata Declaration

#### Metadata Declared Once

- [x] `p1` - **ID**: `cpt-template-site-meta-fr-metadata-once`

The system **MUST** take each page's title, description, indexability and share image from the metadata block of its screen, declared next to the screen's registration, and the site-level values from the site configuration, and **MUST** derive every generated output and the runtime head from those two sources only. A route inside a screen that declares no share image **MUST** take its screen's; a page without a title **MUST** take its screen's menu label, and a page without a description the site's default description.

**Rationale**: Metadata kept in more than one place drifts from the screens it describes.

**Actors**: `cpt-template-site-meta-actor-project-developer`

#### Canonical Page Addresses

- [x] `p1` - **ID**: `cpt-template-site-meta-fr-canonical-addresses`

The system **MUST** give every page one canonical address, written with the same grammar and the same function the router writes the address with, on the configured origin and the sub-path the site is mounted at. A pattern page **MUST** take the concrete address it is shown at as its canonical address and **MUST** be non-indexable unless it declares otherwise. Two screens that declare the same token **MUST** fail generation.

**Rationale**: A canonical address that differs from the live address splits a page's ranking and breaks shared links.

**Actors**: `cpt-template-site-meta-actor-crawler`, `cpt-template-site-meta-actor-frontx-router`

#### Required Origin

- [x] `p1` - **ID**: `cpt-template-site-meta-fr-required-origin`

Generation **MUST** refuse to run without an origin, with a message that names the setting to provide, **MUST** accept an override of the origin for a local preview, and **MUST** refuse an origin that is not an http or https address or that carries a query or a fragment.

**Rationale**: A default origin publishes canonical addresses and a sitemap that point at a host the site is not served from.

**Actors**: `cpt-template-site-meta-actor-project-developer`, `cpt-template-site-meta-actor-project-build`

### 5.2 Generated Outputs

#### Site-Level Head

- [x] `p1` - **ID**: `cpt-template-site-meta-fr-site-head`

Generation **MUST** write into the built document the page language, the site name as title, the site summary as description, a canonical link to the home page, robots directives, Open Graph and Twitter card data with the share image and its alternative text, the theme colour, the icon links and the web manifest link, together with the page map and the head-sync runtime. Generating again **MUST** replace this block, never add a second one, and **MUST** never change the project's source document.

**Rationale**: The site-level head is what a crawler that runs no script sees for every address, and the base head-sync updates.

**Actors**: `cpt-template-site-meta-actor-crawler`, `cpt-template-site-meta-actor-project-build`

#### Discovery Files

- [x] `p1` - **ID**: `cpt-template-site-meta-fr-discovery-files`

Generation **MUST** produce a sitemap of the canonical address of every indexable static page, screens in menu order; a robots file that allows crawling and names the sitemap; an `llms.txt` with the site name and summary, a section per screen in menu order listing each indexable page with its description, pages under a common first path segment grouped, then the plain-text twins, then the published `llms.txt` of the documented FrontX packages at the versions the project installs; and a page map manifest with every page keyed by its canonical address and the pattern pages apart.

**Rationale**: Search engines and AI crawlers find pages through these files, and an edge step can apply the per-page head from the page map manifest.

**Actors**: `cpt-template-site-meta-actor-crawler`

#### Web Manifest

- [x] `p2` - **ID**: `cpt-template-site-meta-fr-web-manifest`

Generation **MUST** produce a web manifest with the site name, the short name, the description, the language, the home page as start address relative to the manifest, the theme and background colours and the icon set, so the installed site opens at its home page wherever it is mounted.

**Rationale**: Browsers read the web manifest to install the site and to pick its icons and colours.

**Actors**: `cpt-template-site-meta-actor-visitor`

#### Linked Assets Present

- [x] `p2` - **ID**: `cpt-template-site-meta-fr-linked-assets`

Generation **MUST** fail, naming each missing file, when the build output lacks an icon the head or the web manifest links, an icon the built document itself links, or a share image on the site's own origin.

**Rationale**: A head that links missing files publishes broken previews and icons.

**Actors**: `cpt-template-site-meta-actor-project-build`

#### Plain-Text Twins

- [x] `p1` - **ID**: `cpt-template-site-meta-fr-plain-text-twins`

Generation **MUST** publish a plain-text twin of every page a screen declares in its outline, rendered from the same outline, strings and data the screen renders, with links written as canonical addresses, at a path derived from the screen token and the route. An agent task that offers a plain-text copy **MUST** be published on its own, next to its page's twin. Each twin **MUST** be listed in `llms.txt`. An outline page that the screen's metadata block does not declare, or an outline that names a screen the site does not have, **MUST** fail generation.

**Rationale**: Coding agents and crawlers that run no script read the guides in full only through a text rendering.

**Actors**: `cpt-template-site-meta-actor-crawler`

#### Twins in Development

- [x] `p2` - **ID**: `cpt-template-site-meta-fr-dev-twins`

The system **MUST** render, for the project's dev server, the twin at a requested path from the current sources on every request, on the dev server's origin, and **MUST** name the media type to serve it with, plain text in UTF-8, which is also the type a static host serves the generated twins with.

**Rationale**: A page's link to its twin must work in development as it does in a build, and open in the browser rather than download.

**Actors**: `cpt-template-site-meta-actor-project-developer`

### 5.3 Runtime Head

#### Head Follows the Address

- [x] `p1` - **ID**: `cpt-template-site-meta-fr-head-follows-address`

In the browser the system **MUST** set the document title, description, robots directives, canonical link and Open Graph and Twitter data of the page the current address shows, before the application boots and again on every navigation the router makes. The share title **MUST** be the document title. The bare mount address **MUST** take the home page's head. An address that names no screen, an unknown screen or an unknown route inside a screen **MUST** take the fallback head: the site name and summary, non-indexable, canonical to the home page. A share image tag the page does not have **MUST** be removed.

**Rationale**: A tab title, a bookmark and a link preview that match the page shown, for visitors and for crawlers that run scripts.

**Actors**: `cpt-template-site-meta-actor-visitor`, `cpt-template-site-meta-actor-crawler`, `cpt-template-site-meta-actor-frontx-router`

#### Head Only, Never the Address

- [x] `p1` - **ID**: `cpt-template-site-meta-fr-head-only`

The runtime **MUST** write the document head only and **MUST** never change the address or the navigation history.

**Rationale**: The router is the only writer of the address; a second writer breaks Back and deep links.

**Actors**: `cpt-template-site-meta-actor-frontx-router`, `cpt-template-site-meta-actor-visitor`

### 5.4 Checks

#### Metadata Rules

- [x] `p1` - **ID**: `cpt-template-site-meta-fr-metadata-rules`

The check and generation **MUST** fail, naming the screen and route, when a screen has no metadata block, a screen or a declared route has no title, a screen or an indexable static route has no description, a description is shorter than 50 or longer than 160 characters, a route key is not a path inside the screen or is the screen root, two pages share a document title or a canonical address, the site configuration sets a share image without its alternative text, or the configured home screen names no screen of the site.

**Rationale**: These are the defects that make search results and link previews wrong or ambiguous.

**Actors**: `cpt-template-site-meta-actor-project-developer`, `cpt-template-site-meta-actor-project-build`

#### Output Drift

- [x] `p1` - **ID**: `cpt-template-site-meta-fr-output-drift`

When the build output holds generated outputs, the check **MUST** generate every output again from the current sources on the origin the outputs were generated for and **MUST** fail naming each output that differs or is missing. Without generated outputs the check **MUST** still apply the metadata rules and say that no outputs were compared.

**Rationale**: A changed declaration that was not followed by a new generation publishes stale metadata.

**Actors**: `cpt-template-site-meta-actor-project-build`

#### Shared Routing Version

- [x] `p1` - **ID**: `cpt-template-site-meta-fr-routing-version`

The check and generation **MUST** fail when the routing package head-sync is bundled with differs in version from the one the project runs.

**Rationale**: Two routing versions do not share the realm's navigation history, and head-sync would then miss every navigation without any visible error.

**Actors**: `cpt-template-site-meta-actor-project-build`

#### Raster Record

- [x] `p2` - **ID**: `cpt-template-site-meta-fr-raster-record`

When the project names a raster record, the check and generation **MUST** fail when a recorded raster or its source is missing, when a source changed since its raster was drawn, when a raster is not the recorded one, or when a recorded copy differs from its source, and **MUST** fail on a malformed record rather than check nothing. Without a record no raster is checked.

**Rationale**: Hand-rendered icons and share images otherwise go stale silently when their vector source changes.

**Actors**: `cpt-template-site-meta-actor-project-developer`

## 6. Non-Functional Requirements

### 6.1 NFR Inclusions

#### Deterministic Outputs

- [x] `p1` - **ID**: `cpt-template-site-meta-nfr-deterministic-outputs`

The system **MUST** produce byte-identical outputs, the bundled head-sync runtime included, from the same sources, the same built document and the same origin.

**Threshold**: zero differing bytes between two generations from the same inputs.

**Rationale**: The drift check compares bytes; any non-determinism would report drift on unchanged sources.

#### Self-Contained Template

- [x] `p1` - **ID**: `cpt-template-site-meta-nfr-self-contained`

The template **MUST** reference nothing outside its own directories and **MUST** read a project only through the paths it is given or the project it sits in, so a project with template-shell applied gains the pipeline by copying the template.

**Threshold**: zero imports or file references from the template's code to another template or to the repository that hosts it.

**Rationale**: A template is a separately versioned overlay that may move to another repository or project.

#### Checks Within the Project's Lanes

- [x] `p2` - **ID**: `cpt-template-site-meta-nfr-project-lanes`

The template's code **MUST** be installed, type-checked, linted and unit-tested by the project's existing commands once applied, without a change to a shell file, and **MUST** need no build step of its own.

**Threshold**: zero shell files changed to get install, type-check, lint and unit tests; the dev-server twin middleware is the one project addition.

**Rationale**: A template that needs project wiring to be checked is checked by nobody.

#### Head Before Boot

- [x] `p2` - **ID**: `cpt-template-site-meta-nfr-head-before-boot`

The runtime head **MUST** be applied before the application's own scripts run, with no network request of its own.

**Threshold**: the head-sync script and the page map are inline in the built document; zero extra requests.

**Rationale**: A crawler that runs scripts reads the head soon after load, and a visitor should not see the site-level title flash before the page's.

### 6.2 NFR Exclusions

- **Authentication and authorization (SEC)**: Not applicable, because the template publishes public metadata of public pages and has no user, session or protected resource.
- **Data classification and privacy (SEC, DATA)**: Not applicable, because every value it handles is public page metadata declared by the project; it stores nothing and collects nothing from visitors.
- **Availability and recovery (REL)**: Not applicable, because it runs at build time and as an inline script with no service of its own; a failed generation fails the build.
- **Throughput and capacity (PERF)**: Not applicable beyond the head-before-boot requirement, because it runs once per build and once per navigation over an in-memory map.
- **Accessibility and internationalization (UX)**: Not applicable beyond the language the head declares, because the template renders no interface; page language comes from the site configuration.
- **Regulatory compliance (COMPL)**: Not applicable, because no regulated data is processed.
- **Monitoring (OPS)**: Not applicable, because there is no running service; failures surface as failing commands.

## 7. Public Library Interfaces

### 7.1 Public API Surface

#### Command Line

- [x] `p1` - **ID**: `cpt-template-site-meta-interface-command-line`

**Type**: CLI

**Stability**: unstable

**Description**: Two commands, generate and check, with options for the project, the site configuration and the raster record; paths resolve against the working directory, the project defaults to the one the package sits in and the configuration to the site configuration file in the project. Exit code 0 on success, 1 on a failed rule or drift, 2 on a usage error.

**Breaking Change Policy**: template version bump on any change to a command, an option or an exit code.

#### Dev Twin Function

- [x] `p2` - **ID**: `cpt-template-site-meta-interface-dev-twin`

**Type**: Module function for the project's dev server

**Stability**: unstable

**Description**: Given the project paths, the dev server's origin and a request path, returns the twin at that path with the media type to serve it with, or nothing when no outline page has that path.

**Breaking Change Policy**: template version bump on any change to its arguments or result.

#### Generated Outputs

- [x] `p1` - **ID**: `cpt-template-site-meta-interface-generated-outputs`

**Type**: Data format (files in the build output)

**Stability**: unstable

**Description**: The delimited head block of the built document, the sitemap, the robots file, `llms.txt`, the page map manifest, the web manifest and the twins, at fixed paths in the build output.

**Breaking Change Policy**: template version bump on any change to a path, the head block's delimiters or the page map manifest's shape.

### 7.2 External Integration Contracts

#### Screen Metadata Block

- [x] `p1` - **ID**: `cpt-template-site-meta-contract-metadata-block`

**Direction**: required from client (each screen package of the project)

**Protocol/Format**: JSON, an extra field on the screen extension in the package's manifest, with per-route entries keyed by the path inside the screen.

**Compatibility**: an extra field on the shell's open screen extension schema, passed through registration unchanged; new optional fields are backward compatible.

#### Site Configuration

- [x] `p1` - **ID**: `cpt-template-site-meta-contract-site-configuration`

**Direction**: required from client (the project)

**Protocol/Format**: JSON file, by default in the project root.

**Compatibility**: new optional fields are backward compatible; the origin is required for generation only.

#### Shell Project Layout

- [x] `p1` - **ID**: `cpt-template-site-meta-contract-shell-layout`

**Direction**: required from template-shell

**Protocol/Format**: the shell's screen domain instance, its composed screen packages directory, its workspace root for template-delivered packages, its build output and its public icon set.

**Compatibility**: follows template-shell's layout; a change there requires a template update.

#### Routing Grammar and Navigation History

- [x] `p1` - **ID**: `cpt-template-site-meta-contract-routing`

**Direction**: required from `@gears-frontx/routing`

**Protocol/Format**: the URL grammar's parse and serialize functions and the realm's navigation history.

**Compatibility**: pinned to the project's exact version; the routing version check enforces it.

#### Outline

- [x] `p2` - **ID**: `cpt-template-site-meta-contract-outline`

**Direction**: required from client (screens that publish twins)

**Protocol/Format**: JSON outline in the content model of template-site, with its strings file and an optional data file.

**Compatibility**: entry types this template does not know render nothing; the outline model (pages with their entries) is owned by template-site.

#### Raster Record

- [x] `p3` - **ID**: `cpt-template-site-meta-contract-raster-record`

**Direction**: required from client (optional)

**Protocol/Format**: JSON record of rasters with sizes, sources and SHA-256 hashes, and of copies with their sources, paths relative to the record.

**Compatibility**: a malformed record fails the check.

## 8. Use Cases

#### Publish a Build With Metadata

- [x] `p1` - **ID**: `cpt-template-site-meta-usecase-generate`

**Actor**: `cpt-template-site-meta-actor-project-build`

**Preconditions**:
- The project is built and the build output holds the built document and the icon set.
- The site configuration has an origin, or a preview origin is given.

**Main Flow**:
1. The build runs generation.
2. The system reads the site configuration, the screen domain and every composed screen's metadata block, and resolves the page map.
3. The system applies the metadata rules, the routing version check and the raster record check.
4. The system checks that every linked asset exists.
5. The system writes the head block, the discovery files, the web manifest and the twins, and lists them.

**Postconditions**:
- The build output carries every output, equal to what the sources produce.

**Alternative Flows**:
- **No origin**: generation stops with a message naming the setting.
- **A rule fails or an asset is missing**: generation stops and lists every failure; nothing is written.

#### Check Metadata in the Project's Checks

- [x] `p1` - **ID**: `cpt-template-site-meta-usecase-check`

**Actor**: `cpt-template-site-meta-actor-project-developer`

**Preconditions**:
- The template is applied and the screens are composed.

**Main Flow**:
1. The developer or continuous integration runs the check.
2. The system applies the metadata rules, the routing version check and the raster record check.
3. When the build output holds generated outputs, the system generates them again on the recorded origin and compares.
4. The system reports that the rules hold and whether outputs were compared.

**Postconditions**:
- Every rule failure and every drifted output is named.

**Alternative Flows**:
- **No generated outputs**: only the rules are applied, and the report says so.

#### Visit a Page

- [x] `p1` - **ID**: `cpt-template-site-meta-usecase-visit-page`

**Actor**: `cpt-template-site-meta-actor-visitor`

**Preconditions**:
- The site is served from its build output.

**Main Flow**:
1. The visitor opens an address of the site.
2. Before the application boots, the system resolves the page the address shows and applies its head.
3. The visitor follows a link or uses Back; the router changes the address.
4. The system applies the head of the new page.

**Postconditions**:
- The head matches the page shown; the address is the router's.

**Alternative Flows**:
- **Bare mount address**: the home page's head is applied while the shell opens the home screen.
- **Unknown page**: the fallback head is applied.

#### Crawl the Site

- [x] `p2` - **ID**: `cpt-template-site-meta-usecase-crawl`

**Actor**: `cpt-template-site-meta-actor-crawler`

**Preconditions**:
- The site is served with its generated outputs.

**Main Flow**:
1. The crawler reads the robots file and the sitemap.
2. The crawler reads each canonical address and its head.
3. The crawler reads `llms.txt` and the twins it lists.

**Postconditions**:
- Every indexable page is found with its title and description; every outline page is readable as text.

**Alternative Flows**:
- **The crawler runs no script**: it sees the site-level head for every address and reads the per-page content through the twins.

#### Read a Twin in Development

- [x] `p3` - **ID**: `cpt-template-site-meta-usecase-dev-twin`

**Actor**: `cpt-template-site-meta-actor-project-developer`

**Preconditions**:
- The project's dev server routes twin requests to the package.

**Main Flow**:
1. The developer follows a page's plain-text link in development.
2. The system renders that twin from the current sources and names its media type.
3. The dev server answers with the twin as plain text.

**Postconditions**:
- The twin shows in the browser tab.

**Alternative Flows**:
- **No outline page at that path**: nothing is returned and the dev server answers as it would without the package.

## 9. Acceptance Criteria

- [ ] On the FrontX site, generation after the production build writes the head block, the five discovery and manifest files and a twin of every outline page, and the check run right after reports the outputs in sync.
- [ ] Changing one screen's description without generating again makes the check fail naming the drifted outputs.
- [ ] A screen without a metadata block, a description outside 50 to 160 characters, or two pages with one title each fail the check with the screen and route named.
- [ ] Opening a page's address in a browser shows that page's title and canonical link; navigating to another page through the router updates both, and the address is the router's.
- [ ] Copying the template's two directories into another project with template-shell applied, adding a site configuration and running generation after its build produces the outputs with no other change than the dev-server twin middleware.

## 10. Dependencies

| Dependency | Description | Criticality |
|------------|-------------|-------------|
| template-shell | The project layout, the screen domain, the workspace root the package lands in, the build output and the public icon set | p1 |
| `@gears-frontx/routing` | The URL grammar and the realm's navigation history, at the project's exact version | p1 |
| `@gears-frontx/routing-tanstack` | The convention that a screen's inner path travels in the `route` entry parameter, held by a test | p2 |
| esbuild | Bundles the head-sync runtime into one inline browser script at generation time | p1 |
| template-site's content model | The outline shape twins are rendered from | p2 |
| Published `llms.txt` of `@gears-frontx/ui-kit` and `@gears-frontx/api` | Linked from the site's `llms.txt` at the installed versions | p3 |

## 11. Assumptions

- The shell's screen extension schema stays open, so registration passes the metadata block through unchanged.
- routing-tanstack keeps carrying a screen's inner path in the `route` entry parameter; it keeps the name internal, and a test fails if it changes.
- The project is served by a static host that answers every address with the one built document and serves the twins as plain text.
- Crawlers that matter for per-page previews run scripts; those that do not see the site-level head and the twins.

## 12. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Crawlers and link-preview scrapers that run no script see only the site-level head | Weaker per-page search snippets and previews | The page map manifest is the input for edge head injection once hosting exists; twins carry full content as text |
| The `route` parameter convention changes in routing-tanstack | Head-sync picks the wrong page | A test builds a screen router through the public API and fails on a change |
| A second routing version is installed for the package | Head-sync misses every navigation | The routing version check fails generation and the check |
| The template-shell layout changes | Generation reads the wrong paths | The paths are resolved in one place; a template update follows the shell |
| Template-shell sweeps the package's workspace root with the application type-check and the browser test lane | False type or test failures | The package declares what the application lib lacks and names each test file's environment |
