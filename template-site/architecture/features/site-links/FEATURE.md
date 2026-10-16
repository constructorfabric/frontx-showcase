# Feature: Site Links

- [x] `p1` - **ID**: `cpt-template-site-featstatus-site-links`

<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Open Another Screen or a Page of It](#open-another-screen-or-a-page-of-it)
  - [Jump to a Heading of the Page](#jump-to-a-heading-of-the-page)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Select the Link Form](#select-the-link-form)
  - [Show a Page on Request](#show-a-page-on-request)
  - [Name the Screens a Link Opens](#name-the-screens-a-link-opens)
- [4. States (CDSL)](#4-states-cdsl)
  - [No Lifecycle to Model](#no-lifecycle-to-model)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Links to Other Screens Through Actions](#links-to-other-screens-through-actions)
  - [Opening Another Screen in Place](#opening-another-screen-in-place)
  - [Heading Jumps Move Focus](#heading-jumps-move-focus)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

## 1. Feature Context

- [x] `p1` - `cpt-template-site-feature-site-links`

### 1.1 Overview

Every link in a template-site screen is rendered by one site link component from an outline link target: an external address, a heading of the current page, a route inside the current screen, or another screen named by its screen extension id, with an optional show action for a page of it. A link to another screen is a link element with no address: it has the link role, sits in the tab order, and a primary click or Enter dispatches one actions chain through the screen's bridge, the screen domain's mount action for the target and, for a page, the target's own show action as the chain's next step. The docs screen declares `show_guide` and the templates screen `show_template`; each handles its action by replacing its own route through its app's navigation facade. The home page's UI kit tiles send template-catalogue's `show_component`; the home page, the docs overview, the libs screen and the template-catalogue page's Example tab on the templates screen also open the catalogue at its root. A heading jump scrolls to the heading and moves keyboard focus to it.

### 1.2 Purpose

The feature lets a screen lead to another screen, or to a page of it, the FrontX way: through actions the receiving screen declares, with the address written by the host's router as a byproduct and no screen building the host's address, naming another screen's routes or reading the list of registered screens. Code: `shared/site/navigation/` (`SiteLink.tsx`, `openScreen.ts`, `siteScreens.ts`, `jump.ts`), paths relative to `template-site/src-app/mfe_packages/`.

**Requirements**: `cpt-template-site-fr-cross-screen-links`, `cpt-template-site-fr-show-page`, `cpt-template-site-fr-mount-independent-links`, `cpt-template-site-fr-in-page-jumps`

**Principles**: `cpt-template-site-principle-actions-not-addresses`

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-site-actor-visitor` | Opens links to other screens with a click or Enter, and jumps to headings of the current page |
| `cpt-template-site-actor-host` | Executes the mount action on its screen domain, validates the show action against its schema, writes the address, and delivers the show action to the mounted screen |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md), component "Site navigation", sequence "Open a page in another screen"
- **Dependencies**: None
- **Related trees**: the repository-level contract of the screen actions, and the show actions of other templates' screens, are described in the [repository DESIGN](../../../../architecture/DESIGN.md)

## 2. Actor Flows (CDSL)

### Open Another Screen or a Page of It

- [x] `p1` - **ID**: `cpt-template-site-flow-site-links-open-other-screen`

**Use cases**: `cpt-template-site-usecase-open-other-screen`

**Actor**: `cpt-template-site-actor-visitor`

**Success Scenarios**:
- A click or Enter on a link to a page inside another screen opens that screen at the page inside the running host; the history gains one entry and the page is not reloaded.
- A click or Enter on a link to another screen's root mounts that screen with no show action.
- Dispatch only accepts the chain: the host mounts the screen and writes its address, and the target's handler shows the page (`cpt-template-site-algo-site-links-show-page`).

**Error Scenarios**:
- A click with another button, or one a caller's handler already took, and any key other than Enter: nothing is dispatched.
- The host refuses the show action (a page the target's schema does not name): the target stays at its root.

**Steps**:
1. [x] - `p1` - Render the link as an element with the link role, in the tab order, with the content's text and no address - `inst-render-screen-link`
2. [x] - `p1` - **IF** the event is not a primary click or Enter, or a caller's handler already took it, **RETURN** without dispatching - `inst-if-activated`
3. [x] - `p1` - Prevent the event's default and open the target screen in place - `inst-open-in-place`
4. [x] - `p1` - Build the screen domain's mount action with the target's screen extension id as its subject - `inst-build-mount-action`
5. [x] - `p1` - Dispatch one actions chain through the calling screen's bridge: the mount action alone for the screen root, or the mount action with the target's show action, targeted at the opened extension with the link's payload, as its next step - `inst-dispatch-chain`

### Jump to a Heading of the Page

- [x] `p2` - **ID**: `cpt-template-site-flow-site-links-jump-to-heading`

**Actor**: `cpt-template-site-actor-visitor`

**Success Scenarios**:
- A plain click on a link to a heading scrolls the heading into view and moves keyboard focus to it, so the next Tab continues from that section.

**Error Scenarios**:
- A modified click is left to the browser, which follows the `#id` address.
- The link sits in no document or shadow root, or the heading does not exist: nothing happens.
- The view has no smooth scrolling support: the focus still moves.

**Steps**:
1. [x] - `p2` - Render the heading link as an anchor whose `href` is `#<id>` - `inst-render-anchor-link`
2. [x] - `p2` - **IF** the click is not a plain primary click - `inst-if-modified-click`
   1. [x] - `p2` - **RETURN** without handling the click, so the browser follows the address - `inst-return-modified`
3. [x] - `p2` - Prevent the browser's navigation and jump to the heading from the clicked link - `inst-jump`
4. [x] - `p2` - Resolve the root node of the clicked link; **IF** it is neither a document nor a shadow root **RETURN** - `inst-resolve-root`
5. [x] - `p2` - Find the heading by its id in that root; **IF** it is missing **RETURN** - `inst-find-heading`
6. [x] - `p2` - **IF** the heading supports `scrollIntoView`, scroll it smoothly to the top of the view - `inst-scroll-heading`
7. [x] - `p2` - Move keyboard focus to the heading without a second scroll - `inst-focus-heading`

## 3. Processes / Business Logic (CDSL)

### Select the Link Form

- [x] `p1` - **ID**: `cpt-template-site-algo-site-links-select-link-form`

**Input**: An outline link target, the screen's bridge, and the link's class name, children and test id.

**Output**: One anchor, routing-tanstack link or screen link element.

**Steps**:
1. [x] - `p1` - **IF** the target is an external address, render a plain anchor to it with `rel="noopener"` - `inst-external-link`
2. [x] - `p1` - **IF** the target is a heading of the current page, render the heading link (`cpt-template-site-flow-site-links-jump-to-heading`) - `inst-anchor-link`
3. [x] - `p1` - **IF** the target is a route inside the current screen, render a routing-tanstack `Link` to the route, so the screen's own router moves - `inst-route-link`
4. [x] - `p1` - **ELSE** the target is another screen: render the screen link (`cpt-template-site-flow-site-links-open-other-screen`) - `inst-screen-link`

### Show a Page on Request

- [x] `p1` - **ID**: `cpt-template-site-algo-site-links-show-page`

**Input**: The mounted screen's bridge, its show action type, and a handler bound to the screen's app, the payload property that names a page and the rule from that page to the screen's own route; at handling, the show action's payload.

**Output**: The screen's own router replaced at the page's route; or a thrown error when the payload or the app is not as the contract requires.

**Steps**:
1. [x] - `p1` - Register the handler on the screen's bridge for the screen's show action type (`gts.frontx.mfes.comm.action.v1~frontx.site_docs.nav.show_guide.v1~` for docs, `gts.frontx.mfes.comm.action.v1~frontx.site_templates.nav.show_template.v1~` for templates); the lifecycle calls this from `mount()` before it returns, so the chain's next step finds the handler - `inst-register-handler`
2. [x] - `p1` - **IF** the payload carries no string under the handler's property, throw, since the action schema and the handler disagree - `inst-read-value`
3. [x] - `p1` - **IF** the app was built without the microfrontends plugin and has no router, throw - `inst-require-router`
4. [x] - `p1` - Replace the current entry through the app's navigation facade with the page's route (`/<guide>`, `/<template>`), resolving the facade per action - `inst-replace-route`
5. [x] - `p1` - **RETURN** a resolved promise - `inst-return-handled`

### Name the Screens a Link Opens

- [x] `p1` - **ID**: `cpt-template-site-algo-site-links-screen-ids`

**Input**: The manifests of the template's screen packages and of the catalogue screen.

**Output**: The screen extension ids and show action types a link in code names (the template's four screens, the docs and templates show actions, the catalogue screen and its `show_component`); content names its targets the same way.

**Steps**:
1. [x] - `p1` - Name the template's four screens by the screen extension ids their manifests declare, and the docs and templates screens' show actions by the action types their entries declare; each package's manifest test holds its own to these - `inst-own-screens`
2. [x] - `p1` - Name the catalogue screen, which the home page, the docs overview, the libs screen and the templates screen open, by the extension id template-catalogue's manifest declares, and its `show_component` action, which the home page's UI kit tiles send - `inst-catalogue-screen`

## 4. States (CDSL)

### No Lifecycle to Model

A link holds no state: it needs nothing but the screen's bridge, and the show action handler keeps nothing between actions.

## 5. Definitions of Done

### Links to Other Screens Through Actions

- [x] `p1` - **ID**: `cpt-template-site-dod-site-links-screen-links`

The system **MUST** render a link to another screen as an element with the link role, in the tab order and with no address, that dispatches the screen domain's mount action for the target's screen extension id and, for a page, the target's show action, on a primary click or on Enter; **MUST NOT** build or render the host's address, name another screen's routes or read the list of registered screens; and **MUST** render a heading link as `#<id>` and an external address as given. The links to plain-text twins, the content model's, are the only document-relative addresses a screen renders.

**Implements**:
- `cpt-template-site-algo-site-links-select-link-form`
- `cpt-template-site-flow-site-links-open-other-screen`
- `cpt-template-site-algo-site-links-screen-ids`

**Constraints**: `cpt-template-site-constraint-query-addressing`, `cpt-template-site-constraint-no-screen-list`, `cpt-template-site-constraint-unknown-mount-point`

**Touches**:
- API: `mount_ext` on the screen domain, the target's show action
- DB: none
- Entities: `Link target`, `Site screen`

**Tests**: `site-docs-mfe/src/screens/docs/DocsPage.test.tsx` ("opens another screen through the screen domain on a click or on Enter, the link carrying no address, and ignores other keys, a held Enter, an input method's Enter and another button"); `site-home-mfe/src/content/outline.test.ts` ("links, in every hand-written outline of the template, only screens the site has and pages their show actions name, as the target declares them"); `site-home-mfe/src/screens/home/HomeScreen.test.tsx` ("opens a page of another screen with one chain: mount_ext, then that screen's own show action, never its route", "links every block of the architecture map to the page behind it, the screens through their template"); the shared helper `shared/site/test-support/screenLinks.ts` checks every such link for the link role, the tab order, the missing address and one and the same chain on a click and on Enter.

### Opening Another Screen in Place

- [x] `p1` - **ID**: `cpt-template-site-dod-site-links-open-in-place`

The system **MUST** open another screen through one actions chain of the screen domain's mount action and, for a page, the target's show action as its next step; the docs and templates screens **MUST** declare their show action with a closed schema whose target is their own screen and whose payload enum names their pages, register its handler before `mount()` returns, and replace their own route through their app's navigation facade.

**Implements**:
- `cpt-template-site-flow-site-links-open-other-screen`
- `cpt-template-site-algo-site-links-show-page`

**Constraints**: `cpt-template-site-constraint-no-screen-list`

**Touches**:
- API: `mount_ext` on the screen domain; `gts.frontx.mfes.comm.action.v1~frontx.site_docs.nav.show_guide.v1~` with payload `{ guide }`; `gts.frontx.mfes.comm.action.v1~frontx.site_templates.nav.show_template.v1~` with payload `{ template }`; template-catalogue's `gts.frontx.mfes.comm.action.v1~frontx.catalogue.nav.show_component.v1~` with payload `{ component }` (sent)
- DB: none
- Entities: `Site screen`

**Tests**: `site-docs-mfe/src/showGuide.chain.test.tsx` ("makes one history entry naming the docs screen at the guide, without reloading, and Back returns to the previous screen"); `site-docs-mfe/src/showGuide.test.ts` and `site-templates-mfe/src/showTemplate.test.ts` (each handler replaces the entry with the named page and rejects a payload without its string property or an app without a router); the docs and templates packages' `lifecycle.test.tsx` ("registers its show_guide handler on the bridge when it mounts, passing the mount context on to the base mount", "registers its show_template handler on the bridge when it mounts, passing the mount context on to the base mount") and `manifest.test.ts` ("declares its show action on its entry, with a closed schema that names each page of its route tree and targets only this screen").

### Heading Jumps Move Focus

- [x] `p2` - **ID**: `cpt-template-site-dod-site-links-heading-jumps`

The system **MUST** turn a plain click on a heading link into a scroll to the heading and a move of keyboard focus to it, inside a document or a shadow root, and leave a modified click to the browser.

**Implements**:
- `cpt-template-site-flow-site-links-jump-to-heading`

**Touches**:
- API: none
- DB: none
- Entities: `Link target`

**Tests**: `site-docs-mfe/src/screens/docs/DocsPage.test.tsx` ("moves keyboard focus to the heading an \"On this page\" item jumps to", "shows the toolchain chips, the two start paths and the closing band on get-started, with a path card that focuses its step").

## 6. Acceptance Criteria

- [x] Every link to another screen has the link role, is in the tab order and has no `href`; a click or Enter opens the target through the screen domain, a page of it through the target's show action, and no other key or button does.
- [x] A link to a page inside another screen makes one history entry naming that screen at the page, without a reload, and Back mounts the previous screen again.
- [x] The docs and templates screens register their show action handler during `mount()` and declare the action with a closed schema of their pages in their manifest; home and libs declare no action.
- [x] No screen of the template uses the routing grammar, renders the host's address or reads the host's manifest aggregate.
- [x] A plain click on a heading link moves keyboard focus to the heading.

Not applicable to this feature, with reasons: security (public, read-only links with no visitor data; each show action's schema fixes its target and closes its payload; external links carry `rel="noopener"`), performance (no request beyond the actions), data and operations (no stored data, no diagnostics of its own).
