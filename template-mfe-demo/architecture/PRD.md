# PRD - template-mfe-demo


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
  - [5.1 Screens and Addresses](#51-screens-and-addresses)
  - [5.2 Mechanics Shown](#52-mechanics-shown)
  - [5.3 Page Metadata and Overlay](#53-page-metadata-and-overlay)
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

template-mfe-demo is the FrontX MFE mechanics demo as a template: four screens of one MFE package and two widget packages that, applied onto a FrontX project, show the microfrontend runtime at work. Each screen demonstrates one mechanic: isolation in Shadow DOM with the shell's shared theme and language, data loading through an API service with optimistic edits, shared state read from the shell, and a nested FrontX app that owns an extension domain of its own and mounts widgets from other packages concurrently. Every screen and widget is built from the FrontX UI kit inside its Shadow DOM.

The template is site content: in the FrontX site its screens are reached from the header's demos entry, each at its own address with its own page metadata. A project developer can copy the template into a project of their own to see the same mechanics there.

### 1.2 Background / Problem Statement

The MFE mechanics demo and its widget fixtures originate in template-mfe, an official FrontX template in gears-frontx-templates, where they are flagged as template examples. A project sees them only through an opt-in that also registers template-mfe's blank scaffold; their screens cannot be placed in a project's navigation without editing their manifests; they paint with utility classes that a shell without that styling framework does not compile; they have no route trees, so an address inside a screen names nothing; and they carry three behaviour defects and three accessibility defects.

The FrontX site needs these demos as working pages at stable addresses, with page metadata, in the site's look, built the way every other site package is built. This template is the site-owned copy that meets that need while keeping template-mfe's package names and identifiers, so the upstream change that removes the differences can retire it.

### 1.3 Goals (Business Outcomes)

- **Every mechanic shown live**: isolation, data loading, shared state and nested extension domains each have a working screen, built from the UI kit inside a microfrontend. Target: four screens, each reachable at its own address.
- **Demos are pages**: each screen carries a title and a description that crawlers and the site's metadata pipeline read. Target: 100% of the screens.
- **Copyable**: a project developer can move the template into another project with a shell applied and run it without touching anything outside the template. Target: no reference outside the template's own directories.
- **Retirable**: the difference from template-mfe's demo stays classified and limited to what the site needs, so an upstream change can replace the copy. Target: every difference recorded with its reason in the template's README.

### 1.4 Glossary

| Term | Definition |
|------|------------|
| screen | A screen-domain extension, shown in the shell and reachable at its own address. |
| widget | An extension in the `widgets` extension domain; not a page and not addressable on its own. |
| entry | One exposed lifecycle module of an MFE package; one package can expose several. |
| extension instance | One registration of an entry in a domain; one entry can back several instances. |
| nested app | A FrontX app built inside a screen that owns an extension domain of its own. |
| shared property | A value the shell publishes to every mounted microfrontend, such as the theme or the language. |
| actions chain | A sequence of actions sent as one request, where each step runs after the previous one succeeds. |
| nav group | A navigation group the host defines as an instance of the shell's nav group type; a screen joins it by naming its id in `presentation.group`. |

## 2. Actors

### 2.1 Human Actors

#### Visitor

**ID**: `cpt-template-mfe-demo-actor-visitor`

**Role**: Opens the demo screens in a browser, follows their buttons and changes the shell's theme and language to see the screens respond.
**Needs**: Working demos at stable addresses, visible state for each mechanic, screens that follow the shell's theme and language.

#### Project Developer

**ID**: `cpt-template-mfe-demo-actor-project-developer`

**Role**: Applies or copies the template into a FrontX project, or changes the demo in the site, and reads its code as a worked example of the MFE runtime.
**Needs**: A self-contained template with documented prerequisites, packages that build and test on their own, code that shows each mechanic plainly.

### 2.2 System Actors

#### Shell Host

**ID**: `cpt-template-mfe-demo-actor-shell-host`

**Role**: The FrontX application the template is applied onto: it registers the packages, owns the screen domain, mounts screens, publishes the theme and language, writes the address and publishes the aggregate of package manifests.

#### Metadata Reader

**ID**: `cpt-template-mfe-demo-actor-metadata-reader`

**Role**: Any reader of the screens' declared page metadata: the site's metadata generator, search engines and AI crawlers through the pages it generates.

## 3. Operational Concept & Environment

### 3.1 Module-Specific Environment Constraints

- The template applies only onto a project that already has template-shell applied; the shell supplies the host, the screen domain, the shared theme and language, the build plugin and the test base.
- The template claims the same package directories as template-mfe's own demo packages, so a project carries one or the other, never both.
- Every package runs in the browser as a Module Federation remote loaded by the shell; there is no server and the data the screens show is mocked in the browser.

## 4. Scope

### 4.1 In Scope

- Four screens in one package: isolation, data loading, shared state, nested widgets.
- Screens and widgets built from the UI kit, the kit candidates and the package's own blocks.
- Two widget packages contributing three widget instances to the `widgets` extension domain the nested widgets screen owns.
- Cross-screen and cross-nesting actions sent from the screens and widgets: open another screen, refresh the profile after opening it, mount and ping a widget two levels down, open a screen in the shell from a widget.
- A mocked accounts API with a current user that the profile screen reads and edits.
- Translations of the screens' strings for the languages the shell offers, with English as the fallback.
- Page metadata per screen and a route tree per screen with a not-found page.
- The template's AI bundle: one guideline stating the demo's contract.

### 4.2 Out of Scope

- template-mfe's blank scaffold package, which stays in template-mfe.
- template-mfe's UI Kit Elements screen: the site's catalogue is the kit's showcase, and the remaining screens show the kit inside a microfrontend.
- A real backend for the accounts API.
- Header navigation entries for the demo screens: the shell layout decides where the screens of a nav group appear.
- Placement of the screens without editing their declarations, which needs a project-level manifest overlay FrontX does not offer.
- Internal pages inside the screens beyond the screen's root page.

## 5. Functional Requirements

### 5.1 Screens and Addresses

#### Four demo screens at stable addresses

- [x] `p1` - **ID**: `cpt-template-mfe-demo-fr-demo-screens`

The template **MUST** contribute four screens, isolation, data loading, shared state and nested widgets, each registered in the shell's screen domain at its own stable address, labelled for the shell's navigation, ordered after the site's own sections and declared in the `demos` navigation group.

**Rationale**: A stable address per demo makes it reachable from other pages and indexable by crawlers; the group lets the shell list the demos under one header entry.

**Actors**: `cpt-template-mfe-demo-actor-visitor`, `cpt-template-mfe-demo-actor-shell-host`

#### A not-found page inside every screen and widget

- [x] `p2` - **ID**: `cpt-template-mfe-demo-fr-not-found`

Each screen and each routed widget **MUST** render its page at its root and a not-found page for any other path inside it, and the nested widgets screen **MUST** finish mounting when it renders its not-found page.

**Rationale**: An address that names no page must say so instead of rendering a blank area, and a screen that never finishes mounting would block the actions chained after it.

**Actors**: `cpt-template-mfe-demo-actor-visitor`, `cpt-template-mfe-demo-actor-shell-host`

### 5.2 Mechanics Shown

#### Isolation with shared theme and language

- [x] `p1` - **ID**: `cpt-template-mfe-demo-fr-isolation-screen`

The isolation screen **MUST** render inside its own Shadow DOM, show the domain and instance it is mounted as and the current theme and language the shell shares, and follow every change of those two values without a reload.

**Rationale**: It demonstrates that a microfrontend is isolated from the page yet stays in step with the shell's shared state.

**Actors**: `cpt-template-mfe-demo-actor-visitor`

#### Translated screens with a right-to-left direction

- [x] `p2` - **ID**: `cpt-template-mfe-demo-fr-screen-translations`

Each screen except the nested widgets screen **MUST** load its own strings for the language the shell shares, fall back to English when the language has no strings, show a loading state while strings load, apply only the latest language when loads overlap, and set its text direction to right-to-left for the right-to-left languages.

**Rationale**: It shows microfrontend-local translations driven by the shell's language, and an earlier, slower load must never overwrite the current language.

**Actors**: `cpt-template-mfe-demo-actor-visitor`

#### Cross-screen navigation through actions chains

- [x] `p1` - **ID**: `cpt-template-mfe-demo-fr-cross-screen-actions`

The isolation screen **MUST** offer three actions: open the shared state screen; open the data loading screen and then ask it to refresh its data; open the nested widgets screen, then mount a named widget in its domain, then ping that widget. Each action **MUST** be sent as one actions chain whose later steps run after the earlier ones succeed, even though the first step replaces the sending screen.

**Rationale**: It demonstrates navigation and messaging between microfrontends through the runtime, including delivery two levels of nesting away from the shell.

**Actors**: `cpt-template-mfe-demo-actor-visitor`, `cpt-template-mfe-demo-actor-shell-host`

#### Data loading with optimistic edits

- [x] `p1` - **ID**: `cpt-template-mfe-demo-fr-data-loading-screen`

The data loading screen **MUST** load the current user from the accounts API, show a loading state, an error state with a retry and the loaded profile; it **MUST** let the visitor edit first name, last name and department, show the edit at once, roll it back when saving fails and then reload the stored profile; it **MUST** treat surrounding spaces as no change; and it **MUST** reload its data when it receives a refresh request.

**Rationale**: It demonstrates an API service, cached queries, optimistic mutations with rollback and an action handler in a microfrontend.

**Actors**: `cpt-template-mfe-demo-actor-visitor`

#### The shell's theme as shared state

- [x] `p1` - **ID**: `cpt-template-mfe-demo-fr-shared-state-screen`

The shared state screen **MUST** show the shell's current theme name and a swatch for each of the background, foreground, primary, secondary, muted, accent and destructive colour pairs, each painted with the current values of the palette the page's kit components are drawn in and captioned with its token pair, and **MUST** repaint when the shell's theme changes.

**Rationale**: It demonstrates that a microfrontend inside Shadow DOM follows the shell's shared theme and shows the palette it is drawn in.

**Actors**: `cpt-template-mfe-demo-actor-visitor`

#### Screens built from the UI kit

- [x] `p2` - **ID**: `cpt-template-mfe-demo-fr-kit-built-screens`

Every screen and widget **MUST** be built from the UI kit's components, the kit candidates and the package's own blocks, render them inside its Shadow DOM styled with the kit's tokens for the shell's light or dark theme, and import no stylesheet of its own; a block **MUST** take content and behaviour only and lay its parts out on the kit's tokens, with every other declaration recorded with the kit gap it waits for.

**Rationale**: It demonstrates that the kit works inside Shadow DOM, and it keeps the demo's look the kit's, so a kit release changes the demo without a change here.

**Actors**: `cpt-template-mfe-demo-actor-visitor`, `cpt-template-mfe-demo-actor-project-developer`

#### A nested app with its own extension domain

- [x] `p1` - **ID**: `cpt-template-mfe-demo-fr-nested-widgets`

The nested widgets screen **MUST** run a FrontX app of its own that owns the `widgets` extension domain, discovers the widgets other packages declare for that domain from the shell's published package manifests, mounts all of them concurrently, offers a ping for every widget that accepts one, shows a loading state while it starts and an error state when the manifests cannot be read, and **MUST** keep the mounted widgets in the page's address.

**Rationale**: It demonstrates nested extension domains, discovery at run time and concurrent mounting.

**Actors**: `cpt-template-mfe-demo-actor-visitor`, `cpt-template-mfe-demo-actor-shell-host`

#### Widget instances with their own state

- [x] `p2` - **ID**: `cpt-template-mfe-demo-fr-widget-instances`

One widget entry **MUST** back two widget instances whose module state is separate; each instance **MUST** answer a ping by recording its time in its own address, so a reload keeps it and the instances never share it; each instance **MUST** offer to open the isolation screen in the shell, two levels up; a second widget package **MUST** mount next to them.

**Rationale**: It demonstrates several instances of one entry, per-instance routing state and delivery upward across nesting.

**Actors**: `cpt-template-mfe-demo-actor-visitor`

### 5.3 Page Metadata and Overlay

#### Page metadata declared per screen

- [x] `p1` - **ID**: `cpt-template-mfe-demo-fr-screen-metadata`

Each screen **MUST** declare a title and a description of 50 to 160 characters once, next to the screen's own declaration, matching the pages its route tree renders; widgets **MUST NOT** declare page metadata.

**Rationale**: The site generates every page's head, sitemap and crawler files from these declarations; widgets are not pages.

**Actors**: `cpt-template-mfe-demo-actor-metadata-reader`

#### A self-contained overlay

- [x] `p1` - **ID**: `cpt-template-mfe-demo-fr-self-contained-overlay`

The template **MUST** contribute only its own package directories and AI bundle, reference nothing outside them, declare its exclusive subtrees, and state its prerequisites and its incompatibility with template-mfe's demo packages.

**Rationale**: A project developer can copy the template into another project, and the site's composition can copy it into the site, without editing anything else.

**Actors**: `cpt-template-mfe-demo-actor-project-developer`

## 6. Non-Functional Requirements

### 6.1 NFR Inclusions

#### Isolation between microfrontends

- [x] `p1` - **ID**: `cpt-template-mfe-demo-nfr-runtime-isolation`

Each package and each widget instance **MUST** run its own FrontX app with its own state, events and services, and every screen **MUST** carry exactly one copy of the kit's tokens in its shadow root however often it is mounted.

**Threshold**: no state, event or service shared between packages except through shared properties and actions; one kit token style node per shadow root after any number of remounts.

**Rationale**: The demos exist to show isolation; a screen that leaks or accumulates styles across mounts shows the opposite.

#### Mount-independent widget discovery

- [x] `p1` - **ID**: `cpt-template-mfe-demo-nfr-mount-independence`

The nested widgets screen **MUST** find and mount its widgets wherever the site is served, at the origin's root or under a sub-path.

**Threshold**: all three widget instances mount under any mount folder of the shell's document.

**Rationale**: The site is built once and served at any path.

#### Cached data survives screen changes

- [x] `p2` - **ID**: `cpt-template-mfe-demo-nfr-cache-continuity`

Loading one of the template's packages **MUST NOT** clear data the page has already loaded.

**Threshold**: returning to a screen whose data is cached paints from the cache without a loading state, unless the mock mode is switched in between.

**Rationale**: A package that wipes the page's cache on load makes every screen flash its loading state again.

#### Accessible screens inside the shell

- [x] `p2` - **ID**: `cpt-template-mfe-demo-nfr-accessible-screens`

The screens **MUST** add no second main landmark to the shell's page, **MUST** give every form control an accessible name, **MUST** name every live region distinctly from the shell's, and **MUST** announce their loading states.

**Threshold**: zero duplicate main landmarks, zero unnamed inputs and zero duplicate region names on every demo page.

**Rationale**: The screens render inside a page whose landmarks the shell owns.

### 6.2 NFR Exclusions

- **Performance budgets**: the demos show mechanics, not load performance; they inherit the site's build and the shell's loading behaviour.
- **Security and authentication**: the accounts data is mocked in the browser; no credential or personal data is handled.
- **Theme palettes beyond light and dark**: the kit has two token scopes, so a host theme other than light or dark is shown in the nearer of the two.

## 7. Public Library Interfaces

### 7.1 Public API Surface

#### Screen addresses

- [x] `p1` - **ID**: `cpt-template-mfe-demo-interface-screen-addresses`

**Type**: URL addresses in the FrontX URL grammar, one route token per screen.

**Stability**: stable

**Description**: The four screen tokens are public addresses that the shell's menu, the sitemap and crawlers reach; the nested widgets screen's address also carries the mounted widget entries.

**Breaking Change Policy**: A token is never reused for other content; renaming one breaks every link to it and needs a release note.

#### Profile refresh action

- [x] `p2` - **ID**: `cpt-template-mfe-demo-interface-refresh-profile-action`

**Type**: Protocol (a FrontX action type with a closed schema, targeted at the data loading screen).

**Stability**: stable

**Description**: Any microfrontend can ask the data loading screen to reload its data, alone or as a step after opening that screen.

**Breaking Change Policy**: A change to the action's payload needs a new action type version.

#### The widgets extension domain

- [x] `p2` - **ID**: `cpt-template-mfe-demo-interface-widgets-domain`

**Type**: Protocol (a FrontX extension domain with mount, unmount and load actions, a route key and a default action timeout).

**Stability**: unstable

**Description**: Any package can contribute a widget by declaring an extension for the `widgets` domain; the nested widgets screen discovers and mounts it. A widget can declare a ping action that the screen offers.

**Breaking Change Policy**: A change to the domain's actions or route key needs a new domain version.

### 7.2 External Integration Contracts

#### Shell host

- [x] `p1` - **ID**: `cpt-template-mfe-demo-contract-shell-host`

**Direction**: required from client

**Protocol/Format**: template-shell's host: the screen domain with exclusive mounting, the shared theme and language properties, address writing for settled mounts, the build plugin that turns a package's manifest into registered entities, and the test base every package extends.

**Compatibility**: The packages pin the shell's workspace versions exactly; a new shell version is taken in a change that updates the pins.

#### Published package manifests

- [x] `p1` - **ID**: `cpt-template-mfe-demo-contract-manifest-aggregate`

**Direction**: required from client

**Protocol/Format**: the shell publishes the aggregate of every package's manifest as one JSON file next to its document.

**Compatibility**: The nested widgets screen reads the entities in it unchanged; a change of the file's name or shape breaks discovery.

#### Demos nav group

- [x] `p2` - **ID**: `cpt-template-mfe-demo-contract-demos-nav-group`

**Direction**: required from client

**Protocol/Format**: GTS: each screen is an extension of the shell's screen extension type whose optional `presentation.group` names the host's demos nav group by its id (`gts.frontx.screensets.layout.nav_group.v1~frontx.site.layout.demos.v1`), an instance of the shell's nav group type; the package carries no screen type schema.

**Compatibility**: The id changes only when the site's host renames the group; a host that does not define it still admits the screens, since the schema checks only that the value is a nav group id and does not resolve the reference, and lists them as top-level entries.

## 8. Use Cases

#### Explore isolation and shared state

- [x] `p1` - **ID**: `cpt-template-mfe-demo-usecase-explore-isolation`

**Actor**: `cpt-template-mfe-demo-actor-visitor`

**Preconditions**:
- The site is open and the isolation screen's address is known, for example from the header's demos entry.

**Main Flow**:
1. The visitor opens the isolation screen; it shows its domain, instance, theme and language in the visitor's language.
2. The visitor switches the shell's language; the screen loads the new strings and changes direction for a right-to-left language.
3. The visitor chooses to open the shared state screen; it replaces the isolation screen and shows the palette of the shell's theme.

**Postconditions**:
- The address names the shared state screen and Back returns to the isolation screen.

**Alternative Flows**:
- **The language has no strings**: the screen shows English.

#### Edit the profile

- [x] `p1` - **ID**: `cpt-template-mfe-demo-usecase-edit-profile`

**Actor**: `cpt-template-mfe-demo-actor-visitor`

**Preconditions**:
- The data loading screen is open and its data has loaded.

**Main Flow**:
1. The visitor changes the first name and saves.
2. The screen shows the new name at once and disables the form while saving.
3. The save succeeds and the screen reloads the stored profile.

**Postconditions**:
- The profile shows the saved values.

**Alternative Flows**:
- **The save fails**: the screen restores the previous values, shows the error and reloads the stored profile.
- **The loading fails**: the screen shows the error and a retry.

#### Reach a widget across nesting

- [x] `p1` - **ID**: `cpt-template-mfe-demo-usecase-ping-across-nesting`

**Actor**: `cpt-template-mfe-demo-actor-visitor`

**Preconditions**:
- The isolation screen is open.

**Main Flow**:
1. The visitor chooses to mount the nested widgets screen and ping a widget.
2. The shell replaces the isolation screen with the nested widgets screen, which starts its own app and mounts all widgets.
3. The named widget is mounted (already mounted by the screen's own pass) and receives the ping.
4. The widget records the ping time in its own address.

**Postconditions**:
- The address names the nested widgets screen and every mounted widget entry; the pinged widget shows the ping time.

**Alternative Flows**:
- **The manifests cannot be read**: the screen shows its error state and the later steps are not delivered.
- **The visitor uses a widget's own button**: the widget asks the shell, two levels up, to open the isolation screen.

#### Apply the template to a project

- [x] `p2` - **ID**: `cpt-template-mfe-demo-usecase-apply-template`

**Actor**: `cpt-template-mfe-demo-actor-project-developer`

**Preconditions**:
- The project has template-shell applied and does not carry template-mfe's demo packages.

**Main Flow**:
1. The developer copies the template's package directories and AI bundle into the project and installs.
2. The developer builds and starts the project.

**Postconditions**:
- The four screens are registered and reachable at their addresses, and the widgets mount in the nested widgets screen.

**Alternative Flows**:
- **The project carries template-mfe's demo packages**: the copy collides with them by directory and package name, and the developer removes one of the two first.

## 9. Acceptance Criteria

- [ ] Each of the four screens opens at its address in the site, renders its page and shows no console error.
- [ ] The nested widgets screen mounts three widget instances, and its address names them, both at the origin's root and under a sub-path.
- [ ] The three actions of the isolation screen reach their targets with one actions chain each, and Back returns to the previous screen.
- [ ] A failed profile save restores the previous values.
- [ ] Every screen declares a title and a description that the site's metadata check accepts, and each package's tests hold the declarations to its route tree.
- [ ] Every package builds, type-checks and passes its tests on its own.

## 10. Dependencies

| Dependency | Description | Criticality |
|------------|-------------|-------------|
| template-shell | The host, screen domain, shared properties, build plugin and test base the template applies onto | p1 |
| FrontX react package and its framework packages | The app builder, lifecycles, microfrontend registry, API services, query cache and mocks, shared with the host at run time | p1 |
| FrontX routing packages | The route trees inside screens and widgets, shared with the host | p1 |
| FrontX UI kit | The components and design tokens every screen and widget is built from | p1 |
| template-kit-candidates | The typography, description list and heading-capable title parts the kit does not ship yet, as `@gears-frontx/kit-candidates` | p2 |
| The site's demos nav group | The group the screens name, so the shell groups them | p2 |
| template-mfe | The source the packages are adapted from; its demo packages cannot coexist with this template | p2 |

## 11. Assumptions

- The shell publishes the aggregate of package manifests next to its document, and the shell's document base is the address the site is served from.
- The shell registers the theme, language and screen extension schemas the nested app needs, and exposes them from its package.
- The host themes marked as dark are the shell's `dark`, `dracula` and `dracula-large`; any other theme is light.
- The demo data is fictional and stays in the browser.

## 12. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| template-mfe's demo changes upstream | The copy drifts from its source and a re-sync becomes a manual merge | Every difference is classified with its reason in the README; the upstream change that would retire the copy is recorded by the site |
| A host registers another dark theme | The screens paint a light surface inside dark chrome | The dark theme list is one place in the package and documented as such |
| The framework's shared query cache clears on the mock toggle | Loading a package wipes the page's cache | Every app of the template adds the mocks before the shared cache; the demo app's own test holds that order for the package app, and the hosting repository's checks hold it for every app |
| A project applies template-mfe's demo next to this template | Directory and package names collide | The manifest declares exclusive subtrees and the README states the incompatibility |
