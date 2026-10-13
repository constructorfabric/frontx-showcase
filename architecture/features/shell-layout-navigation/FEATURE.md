# Feature: Shell layout and navigation


<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Open a screen from the navigation](#open-a-screen-from-the-navigation)
  - [Open the home screen at the bare address](#open-the-home-screen-at-the-bare-address)
  - [Retry a screen that failed to load](#retry-a-screen-that-failed-to-load)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Read the registered screens](#read-the-registered-screens)
  - [Build the navigation entries](#build-the-navigation-entries)
  - [Read a screen's group](#read-a-screens-group)
  - [Write a canonical address](#write-a-canonical-address)
  - [Read the site's layout choices](#read-the-sites-layout-choices)
  - [Render the page frame](#render-the-page-frame)
  - [Operate a navigation group](#operate-a-navigation-group)
  - [Set up the shell's look and strings](#set-up-the-shells-look-and-strings)
  - [Stamp the theme appearance on screen hosts](#stamp-the-theme-appearance-on-screen-hosts)
- [4. States (CDSL)](#4-states-cdsl)
  - [Screen Load Failure State Machine](#screen-load-failure-state-machine)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Header navigation from the registered screens](#header-navigation-from-the-registered-screens)
  - [Home screen at the bare address](#home-screen-at-the-bare-address)
  - [Visible screen load failure](#visible-screen-load-failure)
  - [Page frame on the kit](#page-frame-on-the-kit)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

- [x] `p1` - **ID**: `cpt-site-featstatus-shell-layout-navigation`
## 1. Feature Context

- [x] `p1` - `cpt-site-feature-shell-layout-navigation`

### 1.1 Overview

The shell layout is the page frame every screen of the site renders in: a skip link, a sticky header with the Constructor Fabric lockup, the navigation built from the registered screen extensions, the source link and the language select, the main landmark holding the screen domain's slot and the right sidebar domain, a footer, and the popup and overlay layers. The screen container under it opens the home screen at the bare address, stamps the active theme's appearance on every screen's shadow host, shows a not-found state when no screen matches the address and an error state with a retry when a screen cannot load; both states stand in for a screen and carry the page's level-one heading. The header and footer are shell chrome under the rules of the site's blocks: kit components and the kit candidates (`Link`, `Text`, `VisuallyHidden`), content-only props, stylesheets that lay out on tokens, and every other declaration a row of the chrome's exemptions ledger (`site/src-app/app/layout/styles-exemptions.json`) naming the kit gap it waits for. The lockup's logo is template-site-brand's asset, imported as a module. Every FrontX mechanic (the screen domain and its mount action, the framework router, query addressing, the theme and language registries) is used as template-shell ships it; the layout only reads and dispatches through them.

### 1.2 Purpose

The site needs one look across the shell and its screens, a navigation that follows the registered screens with no shared list to edit, real links a crawler and a modified click can follow, a home page at the bare address and a visible failure instead of a blank page. The feature holds the root's share of the requirements on pages, links and demos: the screens themselves, the links between them and the demo screens are specified in the templates' own trees ([template-site DESIGN](../../../template-site/architecture/DESIGN.md), [template-mfe-demo DESIGN](../../../template-mfe-demo/architecture/DESIGN.md), [template-inbox DESIGN](../../../template-inbox/architecture/DESIGN.md), [template-calendar-demo DESIGN](../../../template-calendar-demo/architecture/DESIGN.md)); the root defines the screen actions those links send (DESIGN section 3.3: `mount_ext`, then the show action a receiving screen declares), and the layout is the one place that lists the registered screens: its header lists the demo screens under the demos group's entry. The development server's plain-text twin middleware lives in `site/vite.config.ts`, a configuration file the registry ignores, and serves the twins template-site-meta's renderer produces ([template-site-meta DESIGN](../../../template-site-meta/architecture/DESIGN.md)); it has no numbered instruction here.

**Requirements**: `cpt-site-fr-site-navigation`, `cpt-site-fr-screen-pages`, `cpt-site-fr-cross-screen-links`, `cpt-site-fr-demo-screens`, `cpt-site-fr-screen-load-failure`, `cpt-site-fr-plain-text-twins`, `cpt-site-nfr-semantics`

**Principles**: None beyond the principles assigned to other features; the rule that every other shell file stays as it ships belongs to the shell change ledger.

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-site-actor-visitor` | Opens addresses, follows the header, brand and footer links, retries a page that failed to load |
| `cpt-site-actor-crawler` | Follows the navigation's document-relative link addresses |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md), section 3.2 (shell layout component), section 3.6 (visit a page, follow a link), section 4.3.4 (the shell rebuild), section 4.5.1 (how the site uses FrontX routing)
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.2
- **Dependencies**: `cpt-site-feature-template-composition`
- **Code**: `site/src-app/app/layout/`, `site/src-app/app/mfe/MfeScreenContainer.tsx`, `site/src-app/app/mfe/hostTheme.ts`, `site/src-app/app/mfe/screenLoadFailure.ts`, `site/src-app/app/App.tsx`, `site/src-app/app/main.tsx`, `site/src-app/app/documentEntries.ts`, `site/src-app/app/themes/`

## 2. Actor Flows (CDSL)

### Open a screen from the navigation

- [x] `p1` - **ID**: `cpt-site-flow-shell-layout-navigation-open-screen`

**Actor**: `cpt-site-actor-visitor`

**Use case**: `cpt-site-usecase-visit-page`

**Success Scenarios**:
- A plain click on a header entry, the brand lockup or a footer screen link mounts that screen in place; the framework router writes its canonical address and the document does not reload.

**Error Scenarios**:
- A modified or secondary click (new tab, new window, download) is left to the browser, which opens the link's document-relative address.

**Steps**:
1. [x] - `p1` - The layout reads the navigation entries once and hands the same entries to the header and the footer - `inst-share-entries`
2. [x] - `p1` - **IF** the click is not a plain primary click (a modifier key, another button, or a handler already took it) **RETURN** and leave the link's address to the browser - `inst-if-modified-click`
3. [x] - `p1` - Cancel the browser's navigation and open the clicked screen by its extension id - `inst-open-clicked`
4. [x] - `p1` - Dispatch the screen domain's `mount_ext` action for the extension through the shell's registry, with no history intent of its own, so the framework router writes the address - `inst-dispatch-mount`

### Open the home screen at the bare address

- [x] `p1` - **ID**: `cpt-site-flow-shell-layout-navigation-open-home`

**Actor**: `cpt-site-actor-visitor`

**Use case**: `cpt-site-usecase-visit-page`

**Success Scenarios**:
- The visitor opens the bare address; once bootstrap has settled and the navigation is known, the home screen `site.config.json` names is mounted with the `replace` intent and the address becomes the home page's canonical address with no second document load.

**Error Scenarios**:
- `homeScreen` names no registered screen: the container logs the configuration error and opens no other screen.
- The address names a screen that has not mounted yet: the container opens nothing, so a deep link is never replaced by the home screen.

**Steps**:
1. [x] - `p1` - Bootstrap the MFE runtime once per page and record when it has settled; a rejected bootstrap is logged and recorded as failed - `inst-bootstrap-once`
2. [x] - `p1` - Treat the page as at the bare address while bootstrap has settled, the screen domain's route status counts no entry and no screen is mounted - `inst-detect-bare`
3. [x] - `p1` - **IF** the page is not at the bare address or the navigation is not known yet **RETURN** - `inst-if-not-bare`
4. [x] - `p1` - Read the address through the shell app's navigation facade and parse it with the routing grammar; **IF** it carries an entry of the screen domain **RETURN** - `inst-if-address-names-screen`
5. [x] - `p1` - **IF** no registered screen carries the configured home token, log the configuration error and **RETURN** - `inst-if-home-missing`
6. [x] - `p1` - Dispatch `mount_ext` for the home screen with the `replace` history intent - `inst-mount-home`

### Retry a screen that failed to load

- [x] `p1` - **ID**: `cpt-site-flow-shell-layout-navigation-retry-failed-screen`

**Actor**: `cpt-site-actor-visitor`

**Use case**: `cpt-site-usecase-visit-page`

**Success Scenarios**:
- A screen's files do not arrive or its lifecycle throws; the page frame shows an alert with "Try again" under the normal header and footer, and the retry mounts the same screen with the history behaviour of the visitor's original request.

**Error Scenarios**:
- Bootstrap itself failed (the manifest aggregate is unreachable): the same alert appears, without the empty-navigation message, and its retry reloads the page, because bootstrap is not safe to repeat.
- The retried mount is rejected: the rejection is logged and the next failure report shows the alert again.

**Steps**:
1. [x] - `p1` - Subscribe to the page's screen load failure store - `inst-read-failure`
2. [x] - `p1` - Render the error state from the kit's empty-state parts and button, announced as an alert, with the layout strings' title as the page's level-one heading, description and retry label - `inst-render-error-state`
3. [x] - `p1` - **IF** bootstrap failed, show the error state whose retry reloads the page - `inst-if-bootstrap-failed`
4. [x] - `p1` - **IF** a screen load failure is reported, show the error state whose retry mounts the screen again - `inst-if-load-failed`
5. [x] - `p1` - On retry take the failed screen and its history intent, `replace` kept and every other intent becoming `push` - `inst-retry-intent`
6. [x] - `p1` - Clear the failure report - `inst-retry-clear`
7. [x] - `p1` - **IF** the failed action named no screen **RETURN** - `inst-if-no-subject`
8. [x] - `p1` - Dispatch `mount_ext` for the failed screen with that intent and log a rejected retry - `inst-retry-mount`
9. [x] - `p1` - Show the empty-navigation message only when bootstrap did not fail and the navigation lists no screen - `inst-empty-navigation`

## 3. Processes / Business Logic (CDSL)

### Read the registered screens

- [x] `p1` - **ID**: `cpt-site-algo-shell-layout-navigation-read-screens`

**Input**: The shell's FrontX app: the registry, the screen domain's registered and mounted extensions, the bootstrap outcome.

**Output**: The navigation entries, or no list while bootstrap is pending; the action that opens a screen.

**Steps**:
1. [x] - `p1` - Read the screen domain's mounted extension and its registered extensions, which the registry re-reads on every registration change - `inst-read-registry`
2. [x] - `p1` - Track the shared bootstrap's outcome as pending, settled or failed - `inst-track-bootstrap`
3. [x] - `p1` - **IF** the screen domain has no URL key **RETURN** an empty list; **IF** bootstrap is pending **RETURN** no list; **IF** bootstrap failed or there is no registry **RETURN** an empty list - `inst-if-not-ready`
4. [x] - `p1` - Keep the extensions carrying the route and presentation block the screen schema requires - `inst-keep-screens`
5. [x] - `p1` - **RETURN** the navigation built from them with the screen domain's URL key, the mounted screen and the names of the nav groups the host defines - `inst-return-navigation`

### Build the navigation entries

- [x] `p1` - **ID**: `cpt-site-algo-shell-layout-navigation-build-entries`

**Input**: The registered screen extensions, the screen domain's URL key, the mounted screen, the name of each nav group the host defines by its instance id.

**Output**: The navigation entries in menu order: top-level screens and groups.

**Steps**:
1. [x] - `p1` - Order the screens by `presentation.order`, unordered screens last, ties by label - `inst-order`
2. [x] - `p1` - **FOR EACH** screen in that order - `inst-for-each-screen`
   1. [x] - `p1` - Compute its canonical address and route token; **IF** the routing grammar cannot carry its route, leave it out - `inst-if-unaddressable`
   2. [x] - `p1` - Make its entry with label, order, address and whether it is the mounted screen - `inst-make-entry`
   3. [x] - `p1` - **IF** it names no group, or names a group the host does not define, add it as a top-level entry - `inst-if-ungrouped`
   4. [x] - `p1` - **ELSE** add it to its group's entry, created at the order of the group's first member and active when any member is - `inst-else-grouped`
3. [x] - `p1` - **RETURN** the entries - `inst-return-entries`

### Read a screen's group

- [x] `p1` - **ID**: `cpt-site-algo-shell-layout-navigation-read-group`

**Input**: A registered screen extension and the nav groups the host defines.

**Output**: The group's name, or none.

**Steps**:
1. [x] - `p1` - The host registers the nav group type (`gts.frontx.screensets.layout.nav_group.v1~`) and its instances with the type system after the screen extension schema, so the screen type's `pattern` refuses at registration a `presentation.group` that is not a nav group id; whether the named instance exists is not checked there, so a well-formed id the host does not define is admitted and read as no group (`navGroups.ts`) - `inst-register-groups`
2. [x] - `p1` - **RETURN** the name of the host-defined group whose instance id the screen's `presentation.group` names, else none - `inst-return-group`

### Write a canonical address

- [x] `p1` - **ID**: `cpt-site-algo-shell-layout-navigation-canonical-address`

**Input**: The screen domain's URL key and an extension's `route`.

**Output**: The screen root's address relative to the shell's document, or none.

**Steps**:
1. [x] - `p1` - Derive the extension token from the route; **IF** there is none or the URL key is not a grammar name **RETURN** none - `inst-if-no-token`
2. [x] - `p1` - Serialize the routing grammar at the shell subroute `/` with one entry of the screen domain naming the token - `inst-serialize`
3. [x] - `p1` - **IF** the path does not start at the site root, refuse it - `inst-if-not-site-root`
4. [x] - `p1` - **RETURN** the path relative to the shell's document, so the link stays under the mount folder - `inst-relative`

### Read the site's layout choices

- [x] `p1` - **ID**: `cpt-site-algo-shell-layout-navigation-site-choices`

**Input**: The repository's `site.config.json`, the navigation entries, the framework's supported languages.

**Output**: The home screen, the footer screens, the ink footer screens, the header's entries and the offered languages.

**Steps**:
1. [x] - `p1` - Read `homeScreen`, `languages`, `footerScreens`, `inkFooterScreens` and `headerHiddenGroups` from `site.config.json` - `inst-read-config`
2. [x] - `p1` - Find a screen by its route token wherever it sits in the entries, the screens of a group included, so menu order never moves the home screen or a footer link - `inst-screen-by-token`
3. [x] - `p1` - Find the mounted screen wherever it sits in the entries - `inst-active-screen`
4. [x] - `p1` - Leave the groups `headerHiddenGroups` names out of the header's entries; their screens stay registered and addressable - `inst-without-groups`
5. [x] - `p1` - Offer the framework's supported languages the site ships, in the site's order, dropping a code the framework cannot switch to - `inst-offered-languages`

### Render the page frame

- [x] `p1` - **ID**: `cpt-site-algo-shell-layout-navigation-page-frame`

**Input**: The navigation entries, the layout state, the layout strings.

**Output**: The rendered frame around the screen domain's slot.

**Steps**:
1. [x] - `p1` - Render a skip link first; on activation it moves focus to the main landmark without following the fragment, so no history entry is added and the address stays clean - `inst-skip-link`
2. [x] - `p1` - Render the header: the lockup (the brand template's logo and the wordmark on the kit candidate `Link`) linking to the home screen (or the bare document address while the home is unknown), the menu without the hidden groups, the source repository link on the kit candidate `Link` and the language select - `inst-header`
3. [x] - `p1` - **IF** the site offers fewer than two languages, render no language select - `inst-if-one-language`
4. [x] - `p1` - Render the menu: an empty labelled navigation while the entries are unknown, else one real link per top-level screen and one disclosure group per group, the mounted screen marked current, a group named from the layout strings (`nav.groups.<name>`) or its name title-cased - `inst-menu`
5. [x] - `p1` - Render the main landmark holding the screen domain's slot, with the right sidebar shown while the layout state keeps it visible - `inst-main`
6. [x] - `p1` - **IF** the layout state hides the footer, render none - `inst-if-footer-hidden`
7. [x] - `p1` - Render the footer: the compact lockup linking to the home screen, then a list on the kit candidate `Text` meta role of kit candidate `Link`s: the two source repositories, in the same tab, with their read-out names in `VisuallyHidden`, and the screens `footerScreens` names; the ink variant while a screen `inkFooterScreens` names is mounted - `inst-footer`
8. [x] - `p1` - **IF** every screen entry of the address fails to resolve and no screen is mounted, render the not-found state on the kit's empty-state parts, its message the page's level-one heading - `inst-not-found`
9. [x] - `p1` - Render the top popup of the layout's popup stack as the kit's modal dialog named by its title or the layout's fallback name, closing the top popup on Escape or the backdrop, and the overlay while the layout state shows it - `inst-popup-overlay`

### Operate a navigation group

- [x] `p1` - **ID**: `cpt-site-algo-shell-layout-navigation-group-disclosure`

**Input**: A group entry's links and the mounted screen.

**Output**: The group's open or closed list and the keyboard focus.

**Steps**:
1. [x] - `p1` - **IF** the mounted screen changed since the list opened, close it during render - `inst-close-on-screen-change`
2. [x] - `p1` - While the list is open, focus its first link when the keyboard opened it, and close it on a pointer press outside the group - `inst-close-outside`
3. [x] - `p1` - **IF** Escape is pressed while open, close the list and return focus to its button - `inst-escape`
4. [x] - `p1` - **IF** ArrowDown is pressed on the button, open the list or focus its first link; **ELSE IF** an arrow key is pressed on a link, move to the next or previous link, ArrowUp from the first returning to the button - `inst-arrows`
5. [x] - `p1` - Close the list when focus leaves the group - `inst-close-on-blur`
6. [x] - `p1` - Close the list after a link in it is chosen - `inst-close-on-choice`

### Set up the shell's look and strings

- [x] `p1` - **ID**: `cpt-site-algo-shell-layout-navigation-look-and-strings`

**Input**: The kit's tokens and theme stylesheet, the document stylesheets installed verify packages deliver, the layout strings.

**Output**: A document painted by the kit's light token set with the values the delivered document stylesheets declare (on this site the brand's tokens and typeface), and the layout strings registered.

**Steps**:
1. [x] - `p1` - Import the kit's tokens, the delivered document stylesheets, the document styles and the kit's component styles once at the application entry, in that order - `inst-import-styles`
2. [x] - `p1` - Load every `src/document.css` an installed verify package (`src-app/verify_packages/*`) delivers, naming no template or package, so a project without such a package loads none - `inst-document-entries`
3. [x] - `p1` - Declare the light theme (the default) and the dark theme with no variables of their own, each selecting the kit's token set through its appearance - `inst-declare-themes`
4. [x] - `p1` - Register both themes with the theme registry and apply the default - `inst-apply-default-theme`
5. [x] - `p1` - Register the layout strings under the `layout` namespace with a loader that answers every language with the English source - `inst-register-strings`
6. [x] - `p1` - Load the development overlay in development only - `inst-dev-overlay`

### Stamp the theme appearance on screen hosts

- [x] `p1` - **ID**: `cpt-site-algo-shell-layout-navigation-host-theme`

The mount manager gives a screen's shadow host no theme (GAPS G33), and every screen declares the kit's palette on its host from inside its shadow root, where the kit's dark fallback follows the operating system. With the appearance stamped on the host, the document's own `[data-theme]` rules (the kit's palette and the delivered brand values) match the host from the outer tree and outrank those rules, so the host and anything a screen renders outside its own themed frame take the site's appearance and brand. The stamp copies no value.

**Input**: The screen domain's slot root, the theme registry.

**Output**: Every shadow host in the slot root carrying `data-theme` equal to the current theme's appearance.

**Steps**:
1. [x] - `p1` - When the screen domain's slot attaches its root, start the stamp on it, releasing any earlier one - `inst-on-attach`
2. [x] - `p1` - Set `data-theme` to the current theme's appearance on every child of the root that hosts a shadow root, or remove it while the theme declares no appearance - `inst-stamp-hosts`
3. [x] - `p1` - Stamp every child added to the root later the same way - `inst-stamp-added`
4. [x] - `p1` - Stamp every host again on each change the theme registry reports - `inst-follow-theme`
5. [x] - `p1` - When the slot detaches, release the stamp - `inst-on-detach`
6. [x] - `p1` - **RETURN** a release that stops observing the root and unsubscribes from the theme registry - `inst-dispose`

## 4. States (CDSL)

### Screen Load Failure State Machine

- [x] `p1` - **ID**: `cpt-site-state-shell-layout-navigation-load-failure`

One store per page holds the latest failed screen mount and notifies its subscribers on every change; the production build layout feature's mount handler reports and clears it, and the screen container reads it.

**States**: NoFailure, Failed

**Initial State**: NoFailure

**Transitions**:
1. [x] - `p1` - **FROM** NoFailure **TO** Failed **WHEN** the screen domain's mount handler reports a failed mount with its screen and history intent - `inst-report`
2. [x] - `p1` - **FROM** Failed **TO** NoFailure **WHEN** a later mount succeeds or the visitor retries - `inst-clear`

## 5. Definitions of Done

### Header navigation from the registered screens

- [x] `p1` - **ID**: `cpt-site-dod-shell-layout-navigation-header-navigation`

The system **MUST** build the header navigation from the registered screen extensions (label and order from `presentation`, a group only when `presentation.group` names a nav group the host defines), leave out the groups `site.config.json` hides, render every entry as a real link to its canonical address relative to the shell's document, and mount a screen on a plain click through the screen domain's `mount_ext` action.

**Implements**:
- `cpt-site-flow-shell-layout-navigation-open-screen`
- `cpt-site-algo-shell-layout-navigation-read-screens`
- `cpt-site-algo-shell-layout-navigation-build-entries`
- `cpt-site-algo-shell-layout-navigation-read-group`
- `cpt-site-algo-shell-layout-navigation-canonical-address`
- `cpt-site-algo-shell-layout-navigation-site-choices`

**Constraints**: `cpt-site-constraint-query-addressing`

**Touches**:
- API: `GET /?screen=<token>`, `mount_ext` on the screen domain
- Entities: Screen extension, Site config

### Home screen at the bare address

- [x] `p1` - **ID**: `cpt-site-dod-shell-layout-navigation-home-at-bare-address`

The system **MUST** mount the home screen `site.config.json` names with the `replace` intent when the address names no screen and nothing is mounted, after reading the address through the shell app's navigation facade, and **MUST NOT** open any other screen when the configured home is not registered.

**Implements**:
- `cpt-site-flow-shell-layout-navigation-open-home`

**Constraints**: `cpt-site-constraint-query-addressing`

**Touches**:
- API: `GET /`, `mount_ext` on the screen domain
- Entities: Page, Site config

### Visible screen load failure

- [x] `p1` - **ID**: `cpt-site-dod-shell-layout-navigation-load-failure`

The system **MUST** show an error state built from kit parts, announced as an alert, under the normal header and footer when a screen fails to load or mount or bootstrap fails, and its retry **MUST** keep the history intent of the failed request (reloading the page after a failed bootstrap).

**Implements**:
- `cpt-site-flow-shell-layout-navigation-retry-failed-screen`
- `cpt-site-state-shell-layout-navigation-load-failure`

**Touches**:
- API: `mount_ext` on the screen domain
- Entities: Page, Screen extension

### Page frame on the kit

- [x] `p1` - **ID**: `cpt-site-dod-shell-layout-navigation-page-frame`

The system **MUST** render the skip link, header, main landmark with the screen slot and the right sidebar, footer, popup and overlay layers from kit components, the kit candidates and the shell's own components laid out on tokens, with every other declaration of their stylesheets recorded in the chrome's exemptions ledger, render no top-level heading of its own except in the not-found and error states that stand in for a screen, paint the document with the kit's light token set and the document stylesheets installed verify packages deliver (the site's brand values and typeface), carry the active theme's appearance on every screen's shadow host, and keep the layout strings in the FrontX i18n registry.

**Implements**:
- `cpt-site-algo-shell-layout-navigation-page-frame`
- `cpt-site-algo-shell-layout-navigation-group-disclosure`
- `cpt-site-algo-shell-layout-navigation-look-and-strings`
- `cpt-site-algo-shell-layout-navigation-host-theme`

**Touches**:
- Entities: Page, Site config

## 6. Acceptance Criteria

- [x] The header lists Home, Templates, UI Kit, Blocks, Libraries and Docs from the registered screens and the demo screens under the demos group's entry; a group `site.config.json` hides is left out, and the site hides none (`navigation.test.ts`, `Header.test.tsx`, `useScreenNavigation.test.ts`, `navGroups.test.ts`).
- [x] Every navigation, brand and footer entry is a link whose address is relative to the shell's document; a plain click mounts the screen through `mount_ext`, a modified click is left to the browser (`Menu.test.tsx`, `Footer.test.tsx`, `navigation.test.ts`).
- [x] At the bare address the configured home screen opens with the `replace` intent; a deep link is not replaced; a home token no screen carries is reported and opens nothing (`MfeScreenContainer.test.tsx`, `home.test.ts`).
- [x] A screen that fails to load shows a kit-built alert with a retry that keeps the failed action's history intent; a failed bootstrap shows only that alert and reloads on retry (`MfeScreenContainer.test.tsx`).
- [x] The page opens with a skip link that moves focus to the main landmark; the layout renders no top-level heading of its own; the popup is a modal dialog named by its title (`Layout.test.tsx`, `Popup.test.tsx`).
- [x] The not-found state and the load error state carry the page's level-one heading and pass axe; the header and footer pass axe, the lockup's logo is the brand template's asset and the footer's source links stay in the same tab (`MfeScreenContainer.test.tsx`, `Header.test.tsx`, `Footer.test.tsx`).
- [x] A widget nested in a screen's shadow root renders in the site's typeface: the framework's base resets set every shadow host's font from the theme's `--font-sans`, with the system stack as its fallback (`site/packages/react/src/mfe/__tests__/ThemeAwareReactLifecycle.font.test.tsx`; a change to template-shell recorded in the shell change ledger).
- [x] A navigation group closes after a choice, on Escape with focus back on its button, on a press outside and on a screen change (`ui/NavMenu.test.tsx`).
- [x] The language select is shown only for more than one shipped language (`Header.test.tsx`, `site.test.ts`).
- [x] Every screen host in the screen slot carries the active theme's appearance as `data-theme`, a host added later included, follows each theme change and is released when the slot detaches (`hostTheme.test.ts`, `MfeScreenContainer.test.tsx`).
