---
status: accepted
date: 2026-10-12
decision-makers: frontx-site maintainers
---

# Open a Page of Another Screen with the Screen Domain's Mount Followed by the Receiving Screen's Own Typed Action

<!-- toc -->

- [Context and Problem Statement](#context-and-problem-statement)
- [Decision Drivers](#decision-drivers)
- [Considered Options](#considered-options)
- [Decision Outcome](#decision-outcome)
  - [Consequences](#consequences)
  - [Confirmation](#confirmation)
- [Pros and Cons of the Options](#pros-and-cons-of-the-options)
  - [`mount_ext`, then a typed action the receiving entry declares](#mount_ext-then-a-typed-action-the-receiving-entry-declares)
  - [`mount_ext`, then a generic action that carries a route](#mount_ext-then-a-generic-action-that-carries-a-route)
  - [Links with the shell's address](#links-with-the-shells-address)
  - [Mount the target at its root and leave the page to the visitor](#mount-the-target-at-its-root-and-leave-the-page-to-the-visitor)
- [More Information](#more-information)
- [Traceability](#traceability)

<!-- /toc -->

**ID**: `cpt-site-adr-cross-screen-deep-links`

## Context and Problem Statement

Pages of the site lead to pages inside other screens: the home page leads to the template pages and the catalogue's component pages, the docs lead to the catalogue and the template pages, inbox chat leads to a contact's page. FrontX addresses a screen as an entry of the screen domain and a page inside it through the screen's own router; the screen domain's `mount_ext` action carries only the extension to mount. FrontX ADR-0036 makes the framework router the only writer of the address: the address is a byproduct of executing actions, never their trigger. A screen is isolated in its container: it does not know which other screens the shell registers, does not know their routes, and does not write or build the shell's address. How does one screen open a page of another?

## Decision Drivers

* **The address is a byproduct** - no screen writes the address, builds it with the routing grammar or renders it as a link; the framework router writes it after the actions run.
* **Explicit, typed contracts** - what one screen may ask of another is an action type the receiving screen declares, with a closed schema, so the type system refuses anything else.
* **Private routes stay private** - the sender names the target screen by its extension id and the page by the receiving screen's own vocabulary (a guide, a template, a component, a contact), never by the receiving screen's route.
* **No list of screens in a screen** - a screen does not read the shell's manifest aggregate or any list of registered screens; knowing which screens exist is the shell's concern.
* **One history entry, working Back, no reload** - a move to another screen behaves like any in-app move.
* **Accessible links** - an element that opens another screen is a link to assistive technology and works from the keyboard.

## Considered Options

* **`mount_ext`, then a typed action the receiving entry declares** - the sender dispatches one actions chain: `mount_ext` for the target screen and, for a page of it, the target's own show action as the chain's `next` step.
* **`mount_ext`, then a generic action that carries a route** - one site action with a free-form `{ route }` payload that every routed screen handles.
* **Links with the shell's address** - each link carries the target's canonical address as its `href` and a plain click is intercepted.
* **Mount the target at its root and leave the page to the visitor** - links open other screens only at their root.

## Decision Outcome

Chosen option: "`mount_ext`, then a typed action the receiving entry declares", because it is the only option in which the receiving screen alone decides what may be asked of it, the sender knows no route, and the address stays a byproduct of the actions.

**The move to another screen.** An element of a screen that leads to another screen dispatches one actions chain through the screen's bridge: the screen domain's `mount_ext` with the target's screen extension id as its subject. `mount_ext` pushes one history entry; the framework router writes the address.

**A page of that screen.** A screen whose pages others open declares one show action on its entry, with a closed schema whose `target` is its own screen extension and whose payload names the page in the screen's own terms: the docs screen's `show_guide` (`{ guide }`), the templates screen's `show_template` (`{ template }`), the catalogue's `show_component` (`{ component }`), each an enum of the pages the screen offers to other screens (the catalogue's component pages; its index and foundation pages open only at its root or address), and the inbox contacts screen's `show_contact` (`{ contact }`, a person's id). The sender puts the action in the chain's `next` step, targeted at the extension `mount_ext` mounted. The receiving screen registers its handler in its lifecycle's `mount()` before `mount()` returns, because the `next` step is dispatched as soon as `mount()` returns; the handler maps the payload to its own route and replaces the entry `mount_ext` pushed through its app's navigation facade, so the move leaves one history entry and Back returns to the previous screen. The schema lives once, in the receiving package's `mfe.json`; the host registers it with the receiving entry, and the host's mediator validates every chain against it.

**The link element.** The element carries the text the content gives it, has the link role, sits in the tab order and opens the target on a primary click or on Enter. It renders no address: a modified click, a new tab and a copied link are not ways into another screen from inside a screen. The shell's own links (the header navigation, the brand, the footer) are the shell's and keep the addresses the shell provides.

**What names the target.** The site's content names a link's target as a screen extension id and, for a page, the show action and its payload; the twins and the sitemap, which the site's metadata tooling builds from the same content and from every screen's declared pages, turn those into canonical addresses. A screen holds the extension ids it links to as content or as known constants checked against the manifests; it never reads the shell's manifest aggregate.

The scope of this decision is how a screen opens another screen or a page of it. It does not decide how a screen moves between its own routes (its router's links), how the shell's addresses and the discovery files are written ([0005](./0005-static-deploy-layout.md)), or which screens declare which show action, which each template's design states.

### Consequences

* Good, because every request one screen makes of another is a declared, closed action type: the target is fixed to the receiving screen and the payload to its pages, so no caller can drive the receiving screen anywhere its router reaches.
* Good, because the address is written only by the framework router, after the actions run, so it cannot drift from what is shown.
* Good, because screens hold no list of screens and read no shell file; the shell, which owns the registered screens, owns every list of them (the header lists the demo screens).
* Good, because each action schema lives once, in its receiving package.
* Bad, because a link inside a screen has no address: a crawler follows no in-content link of a screen, so the sitemap and the plain-text twins are what list every page and carry the links between pages.
* Bad, because a sender must know the target's extension id, and a renamed extension or a removed page breaks the link; the manifest and content tests hold the ids, and the metadata generator fails on a link to a screen or a page the site does not have.
* Bad, because a handler registered later than `mount()` (for example in a React effect) misses the chain's next step; the lifecycle suites hold the registration point.

### Confirmation

`site-docs-mfe/src/showGuide.chain.test.tsx` drives the chain through the real host router, mediator, screen domain strategy and slot, with the docs package's own schema registered and a target that builds its own app from its own module copy, and asserts one history entry naming the docs screen at the guide, no reload, and Back mounting the previous screen. The manifest suites hold each declared show action and its closed schema to the screen's pages, the lifecycle suites hold each handler's registration in `mount()`, and the page suites hold the chain each link sends, its link role, its tab order and its Enter key. The metadata generator's tests hold the resolution of a link target to a page and its refusal of an unknown screen or page. Review confirms that no screen writes or builds the address, renders a shell address, or reads the manifest aggregate.

## Pros and Cons of the Options

### `mount_ext`, then a typed action the receiving entry declares

* Good, because it meets every driver with public FrontX mechanisms: an actions chain with `next`, an action handler, the navigation facade and the type system's validation.
* Neutral, because each receiving screen carries a small handler and one schema, and each sender the ids it links to.
* Bad, because in-content links inside screens are not crawlable; the twins and the sitemap carry the site's links instead.

### `mount_ext`, then a generic action that carries a route

* Good, because one action and one handler serve every screen.
* Bad, because the sender must know the receiving screen's private routes.
* Bad, because a free-form route cannot be constrained by a schema: any caller can drive anything the receiving router reaches, which bypasses the explicit action whitelist.
* Bad, because the route becomes the trigger of the state change, the opposite of the address being a byproduct.

### Links with the shell's address

* Good, because crawlers, new tabs and copied links follow every link.
* Bad, because the screen builds the shell's address with the routing grammar and must learn the shell's screens and base, which a screen has no way to know.
* Bad, because a modified click, a new tab or a copied link navigates around FrontX.

### Mount the target at its root and leave the page to the visitor

* Good, because `mount_ext` alone covers it, with no action to declare.
* Bad, because a link to a component page or a contact would land on an index, which breaks the content's links.

## More Information

FrontX ADR-0036 ("Extension routing port", URL ownership) and routing ADR 0003 (query addressing) are cited as plain text; neither is a dependency by id. The decision is revisited if FrontX standardises a navigation action set for routed entries; the site's show actions are then replaced by it.

Applicability of the remaining checklist categories: **PERF** - addressed: no document reload on a move to another screen. **SEC** - addressed: each show action's schema fixes its target to the receiving screen and closes its payload, so a screen can only be asked for its own pages. **REL** - addressed: a refused or failed `next` step leaves the target at its root. **DATA** - addressed: each payload has a closed JSON schema carried once by its receiving package. **INT** - addressed: the action type and its schema are the contract between sender and receiver. **OPS** - Not applicable. **MAINT** - addressed: one handler per receiving screen, held by manifest and lifecycle tests. **TEST** - addressed: the chain test runs the real router and validates against the real schema. **COMPL** - Not applicable. **UX** - addressed: one history entry, working Back, the link role and keyboard activation. **BIZ** - Not applicable.

## Traceability

- **PRD**: [PRD.md](../PRD.md)
- **DESIGN**: [DESIGN.md](../DESIGN.md)

This decision directly addresses the following requirements and design elements:

* `cpt-site-fr-cross-screen-links` - One history entry, working Back and no reload for a link into another screen, through declared, typed actions.
* `cpt-site-usecase-follow-link` - The visitor's path from a link on one screen to a page inside another.
* `cpt-site-fr-screen-pages` - Every page of a screen that others lead to is reachable from them by its screen's show action, not only by address.
* `cpt-site-fr-site-sections` - The site's own sections lead into each other's pages and into the catalogue.
* `cpt-site-usecase-visit-page` - A visitor moves between pages of different screens without a reload and returns with Back.
* `cpt-site-constraint-query-addressing` - A page inside a screen is the screen's own route, which only its own router projects, so the receiving screen moves its own router.
* `cpt-site-interface-canonical-address` - Canonical addresses are the shell's and the metadata tooling's; a link inside a screen carries none.
