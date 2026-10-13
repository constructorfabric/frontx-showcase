---
status: accepted
date: 2026-10-12
---

# The Head Is Generated Statically and Kept Current by an Inline head-sync Script, With No Server Rendering

<!-- toc -->

- [Context and Problem Statement](#context-and-problem-statement)
- [Decision Drivers](#decision-drivers)
- [Considered Options](#considered-options)
- [Decision Outcome](#decision-outcome)
  - [Consequences](#consequences)
  - [Confirmation](#confirmation)
- [Pros and Cons of the Options](#pros-and-cons-of-the-options)
  - [Static site-level head plus an inline head-sync script](#static-site-level-head-plus-an-inline-head-sync-script)
  - [Server-side rendering or prerendering per address](#server-side-rendering-or-prerendering-per-address)
  - [Edge head injection at deploy time](#edge-head-injection-at-deploy-time)
  - [Screens write the head at run time](#screens-write-the-head-at-run-time)
  - [A head port in the shell](#a-head-port-in-the-shell)
- [More Information](#more-information)
- [Traceability](#traceability)

<!-- /toc -->

**ID**: `cpt-template-site-meta-adr-static-head-and-head-sync`

## Context and Problem Statement

A FrontX site is one built document; its pages are addressed in the query string (`/?screen=<token>;route=<path>`), and the FrontX router changes the address in the browser without a new document. A static host answers every address with the same `index.html`. template-shell has no head management: its static head is one title and an icon. Each page still needs its own title, description, canonical link, robots directive and share data, for visitors, for crawlers that run scripts and for those that do not. How does the right head reach the document for every address, given static hosting and no head API in the shell?

## Decision Drivers

* **Static hosting** - the site is deployable to any static server at any mount path, with no server process and no rewrite rule; hosting is not chosen yet.
* **One document for every address** - pages differ only in the query string, which a static host does not route on.
* **The router owns the address** - FrontX routing writes every address change through the realm's navigation history; nothing else may write the URL.
* **No head port in the shell** - template-shell offers no API to set the head, and screens must not write it (the metadata decision of [ADR 0001](./0001-metadata-on-screen-extension.md)).
* **Crawlers that run no script** - they read only what the served document carries.
* **Head before boot** - the head should be right before the application's own scripts run, without an extra request.

## Considered Options

* **Static site-level head plus an inline head-sync script** - generation writes the site-level head and the page map into the built document, together with a small bundled script that applies the head of the page the address shows before the application boots and on every navigation, writing the head only.
* **Server-side rendering or prerendering per address** - a server or a build step renders a document per page with its head.
* **Edge head injection at deploy time** - a CDN or edge function rewrites the head of the served document per request from the page map manifest.
* **Screens write the head at run time** - each screen sets the title and tags when it mounts or changes route.
* **A head port in the shell** - the shell exposes an API that the router or the screens call to set the head.

## Decision Outcome

Chosen option: "Static site-level head plus an inline head-sync script", because it is the only option that gives every page its head on any static host, today, without a server, without a shell change and without a second writer of the address.

**Generation writes a delimited block into the built document**, after its title: the site-level head (language, site name, summary, canonical link to the home page, robots, Open Graph and Twitter data, theme colour, icons and web manifest link), the page map as an inert JSON script, and the head-sync runtime bundled into one classic inline script, so it runs before the application's deferred module scripts. Generating again replaces the block. **head-sync resolves the page from the address** with the routing package's grammar, applies its head at once, and subscribes to the realm's navigation history, the singleton the router writes through, so the head follows every navigation. **It writes the head only, never the URL or the history.** It is bundled with the same routing version the project runs, since the navigation history is shared only within one version. No document is rendered per address; edge injection from the page map manifest stays available as a later addition once hosting exists.

### Consequences

* Good, because the site runs on any static host at any mount path, and the per-page head reaches visitors and script-running crawlers on the first paint.
* Good, because the router stays the only writer of the address; Back, deep links and the shell's home redirect are untouched.
* Good, because the static head and the runtime head are rendered from the same page map, so they cannot disagree.
* Bad, because crawlers and link-preview scrapers that run no script see the site-level head for every address.
* Bad, because head-sync depends on the realm singleton of one routing version and on routing-tanstack's internal `route` parameter name; the check enforces the first and a test the second.
* Bad, because in development the shell serves its own static head without the block, so the per-page head is visible only in a build.

### Confirmation

The bundle test runs the generated document with the real head-sync bundle in a DOM at an address and asserts the page's head, a navigation through the history, and an unchanged address. The check fails when the routing version head-sync bundles differs from the project's, and when the block in the build output differs from what the sources generate. Review confirms that head-sync never calls a history or location write.

## Pros and Cons of the Options

### Static site-level head plus an inline head-sync script

* Good, because it needs only static files.
* Good, because the inline script has no network request and runs before boot.
* Good, because the page map manifest it is generated from is also the input an edge step would need later.
* Bad, because a crawler that runs no script sees only the site-level head.

### Server-side rendering or prerendering per address

* Good, because every crawler sees the per-page head.
* Bad, because a static host cannot serve different documents for addresses that differ only in the query string; prerendering would need one file per page and a host that routes on the query.
* Bad, because the FrontX shell and its microfrontends render in the browser only; server rendering is outside what FrontX offers, and the site keeps a static deploy.

### Edge head injection at deploy time

* Good, because every crawler would see the per-page head with a static origin behind the edge.
* Neutral, because it complements head-sync rather than replacing it: navigations inside the application still need the runtime head.
* Bad, because it ties the site to a hosting provider, and the hosting target is not chosen.

### Screens write the head at run time

* Good, because no build step is needed for the runtime head.
* Bad, because it contradicts the decision that metadata is declared once on the screen extension and that screens never write the head.
* Bad, because many writers share one head, the head is wrong until each screen's bundle loads, and an address that names no screen has no writer at all.

### A head port in the shell

* Good, because the shell would own the head as it owns the document.
* Bad, because template-shell has no such port, and this template cannot add one without changing the shell every project applies.
* Neutral, because if template-shell gains a head port, head-sync can be retired in favour of it.

## More Information

FrontX routing addresses screens in the query string (the `@gears-frontx/routing` ADR 0003, domain occupancy addressing granularity, in gears-frontx), and an occupant's own entry parameters are private to it at interface level (FrontX ADR-0036, extension routing port, in gears-frontx, proposed there); head-sync reads the screen's `route` parameter by the name routing-tanstack uses internally, which a test holds. The components that implement this decision are described in this template's [DESIGN](../DESIGN.md).

Applicability of the remaining checklist categories: **PERF** - addressed: inline script, no request, applied before boot. **SEC** - addressed: the page map is inlined as JSON in an inert script node with `<` escaped, and the script source is escaped so it cannot close its element. **REL** - addressed: when the page map node is absent the script does nothing and the static head stays. **DATA** - Not applicable. **INT** - addressed: the routing package's grammar and navigation history are the only integration. **OPS** - addressed: static deploy, no server. **MAINT** - addressed: one page map renders both heads. **TEST** - addressed in Confirmation. **COMPL** - Not applicable. **UX** - addressed: the tab title and previews match the page. **BIZ** - addressed through the search-ready goal of the PRD.

## Traceability

- **PRD**: [PRD.md](../PRD.md)
- **DESIGN**: [DESIGN.md](../DESIGN.md)

This decision directly addresses the following requirements and design elements:

* `cpt-template-site-meta-fr-site-head` - the static site-level head and the generated block.
* `cpt-template-site-meta-fr-head-follows-address` - head-sync applies the page's head on load and on every navigation.
* `cpt-template-site-meta-fr-head-only` - head-sync writes the head only.
* `cpt-template-site-meta-fr-routing-version` - head-sync is bundled with the project's routing version.
* `cpt-template-site-meta-nfr-head-before-boot` - the inline classic script runs before the application's module scripts.
* `cpt-template-site-meta-principle-head-only` - the design principle this decision fixes.
* `cpt-template-site-meta-constraint-single-static-document` - the constraint this decision answers.
