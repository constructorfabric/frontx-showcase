---
status: accepted
date: 2026-10-12
decision-makers: frontx-site maintainers
---

# Ship the Site as One Self-Contained Static Build that Works at Any Mount Path

<!-- toc -->

- [Context and Problem Statement](#context-and-problem-statement)
- [Decision Drivers](#decision-drivers)
- [Considered Options](#considered-options)
- [Decision Outcome](#decision-outcome)
  - [Consequences](#consequences)
  - [Confirmation](#confirmation)
- [Pros and Cons of the Options](#pros-and-cons-of-the-options)
  - [Self-contained `dist/` with relative addresses](#self-contained-dist-with-relative-addresses)
  - [One origin per remote with absolute addresses](#one-origin-per-remote-with-absolute-addresses)
  - [One `dist/` built for a fixed mount path](#one-dist-built-for-a-fixed-mount-path)
  - [A server that answers the aggregate](#a-server-that-answers-the-aggregate)
- [More Information](#more-information)
- [Traceability](#traceability)

<!-- /toc -->

**ID**: `cpt-site-adr-static-deploy-layout`

## Context and Problem Statement

The site is a FrontX host plus thirteen Module Federation remotes, each built by its own package into its own `dist/` with the same file names (`remoteEntry.js`, `mf-manifest.json`, `assets/`). template-shell's manifest generator writes each remote's `publicPath` as one base URL per run or as the remote's build-time origin (in development, its preview port on localhost), the shell fetches the manifest aggregate from `/`, and Vite builds the host with the base `/`. The site has no backend, its hosting target and origin are not chosen yet, and it may be served at the root of an origin or under a sub-path. A remote that cannot be fetched leaves the shell's screen area empty with an error in the console. What does the production build look like, how are its addresses written, and what does a visitor see when a screen cannot load?

## Decision Drivers

* **Any static host, any mount path** - the hosting target is deferred; the build must not depend on it, on a rewrite rule or on a server process.
* **One artifact** - the same build must work at the origin root and under any sub-path, without a rebuild per mount.
* **No build-time origin in loading** - a localhost or other absolute address baked into the build breaks every other deployment.
* **Links survive outside the page** - a link opened in a new tab, copied or followed by a crawler must stay under the mount folder.
* **Failure is visible** - a remote that cannot be fetched must show the visitor a state with a way to retry, not an empty page.
* **FrontX mechanics stay** - loading still goes through the manifest aggregate and the MFE handler; the address is still written by the framework router.

## Considered Options

* **Self-contained `dist/` with relative addresses** - copy every remote into `dist/mfe/<package>/`, write each `publicPath` relative to the aggregate, build the host with a relative base, write links relative to the document, and show a kit-built error state when a screen fails to load.
* **One origin per remote with absolute addresses** - deploy each remote at its own origin or path and write absolute `publicPath`s with the generator's `--base-url`.
* **One `dist/` built for a fixed mount path** - build the host and the aggregate for a known absolute base such as `/frontx/` and rebuild for any other mount.
* **A server that answers the aggregate** - serve `generated-mfe-manifests.json` from a backend that knows where each remote lives.

## Decision Outcome

Chosen option: "Self-contained `dist/` with relative addresses", because it is the only option that gives one artifact working on any static host at any mount path, with no deploy configuration for loading.

**Layout.** `site/dist/` holds the host (`index.html`, its assets, the brand assets, the generated discovery files and plain-text twins), the manifest aggregate `generated-mfe-manifests.json`, and each remote in `mfe/<package directory>/`. A repository step, `scripts/site-dist.mjs` (run by `npm run build` after the host build), copies every remote the aggregate lists from its package's `dist/`, leaves out the development-only files, and rewrites each remote's `publicPath` to `mfe/<package directory>/`, relative to the aggregate. It refuses an unknown manifest id or a missing aggregate before it writes anything.

**Addresses.** The host is built with the relative base `./`. The shell's bootstrap fetches the aggregate from its build base resolved against the document and registers each relative `publicPath` as the aggregate writes it; the MFE handler of `@gears-frontx/mfes` resolves it against the document, which sits in the aggregate's folder. The MFE demo's widgets host, the one screen that reads the aggregate, resolves it against the document too, since a remote's own build base says nothing about where the shell is mounted. Every link the shell renders, and every link to a plain-text twin, is written relative to the shell's document (`./?screen=...`, `./<screen>/<route>.md` for twins), which resolves the same way from a screen's shadow root; a link from one screen to another carries no address at all ([0006](./0006-cross-screen-deep-links.md)). Only the generated discovery files and canonical addresses are absolute, from the configured origin, which may carry the sub-path. Development is unchanged: the development aggregate keeps each remote's preview server and Vite serves the host at `/`.

**Load failure.** The screen domain's `mount_ext` handler reports a failed load or mount to a per-page store and rethrows; the screen container then shows an error state built only from kit parts, with `role="alert"`, under the normal header and footer, and "Try again" dispatches `mount_ext` again for the same screen. When the aggregate itself cannot be fetched, the same state appears and the retry reloads the page, because bootstrap is not safe to repeat.

The scope of this decision is the production layout, how its addresses resolve, and the visitor's view of a failed load. The hosting target, the production origin and edge head injection stay deferred; independent deployment of one remote without the host is out of scope.

### Consequences

* Good, because any static file server on one origin serves the site at the root or under any sub-path, with no rewrite rule: every page is the mount folder plus a query string.
* Good, because the origin is the only deploy-specific value, and it affects the SEO outputs only, not loading.
* Good, because a missing or broken remote shows a clear state with a retry, and the other screens keep working.
* Good, because a new-tab open, a copied link and a crawler stay under the mount folder.
* Bad, because the shell files that resolve addresses and show the failure state differ from template-shell; they are recorded in the shell change ledger ([0003](./0003-shell-rebuilt-in-place.md)) as upstream candidates.
* Bad, because one remote cannot be redeployed alone: the aggregate carries each remote's hashed chunk names, so a remote and the aggregate are deployed together.
* Bad, because three copies of the document-relative link rule exist (the shell, template-site, the catalogue), since a template cannot import another template's code or the shell.
* Bad, because a sub-path deploy needs `robots.txt` placed at the origin's root by the host, since crawlers read it only there.

### Confirmation

`scripts/site-dist.test.mjs` covers the layout step; the bootstrap, screen container and link helper suites cover address resolution, the failure state and its retry, and document-relative links including links inside a shadow root. `npm run seo:check` holds the generated files to the configured origin. The static build was served at the root and under a sub-path, every screen mounted with no failed request, and a renamed remote folder showed the alert with a working retry; the same browser check confirms the decision after a change to loading or links.

## Pros and Cons of the Options

### Self-contained `dist/` with relative addresses

* Good, because the build is independent of the hosting target and the mount path.
* Good, because loading still goes through the FrontX manifest aggregate and the MFE handler, which resolves the relative addresses against the document.
* Bad, because it adds a repository build step and changes three shell files.

### One origin per remote with absolute addresses

* Good, because it is what template-shell's generator supports today and lets a remote be deployed on its own.
* Bad, because the build depends on deploy addresses known at build time, so it is rebuilt per environment.
* Bad, because thirteen origins or paths must be hosted, kept in step and allowed by cross-origin rules, for a site that needs none of that independence.

### One `dist/` built for a fixed mount path

* Good, because it needs no relative-address resolution in the shell.
* Bad, because the artifact works only at the mount it was built for; a move or a preview under another path needs a rebuild.
* Bad, because the generator still writes one base per run, so every remote's address is tied to that mount too.

### A server that answers the aggregate

* Good, because it would allow redeploying one remote by updating its entry, and the shell's bootstrap already reads a JSON shape a future API could serve.
* Bad, because the site has no backend and the hosting target is deferred; a server process contradicts the static-host driver.

## More Information

The decision is revisited when template-shell's generator gains a per-package layout and the bootstrap resolves relative addresses upstream (the ledgered files then return to the shipped template), when FrontX offers an API for an occupant's address that replaces the document-relative link rule, or when independent deployment of a single remote becomes a requirement, which needs per-remote manifests fetched at run time or a served aggregate. Caching follows the layout: hashed assets can be cached long, while `index.html`, the aggregate, each `remoteEntry.js`, `mf-manifest.json` and the unhashed shared modules must be revalidated, or a deploy mixes versions.

Applicability of the remaining checklist categories: **PERF** - addressed: loading is unchanged apart from one URL resolution per remote, and hashed assets stay cacheable. **SEC** - addressed: a single origin needs no cross-origin allowances. **REL** - addressed: a failed remote is isolated to its screen and offers a retry. **DATA** - Not applicable. **INT** - addressed: the aggregate stays the integration contract between host and remotes. **OPS** - addressed: one artifact, any static host, origin as the only setting. **MAINT** - addressed: the changed shell files are ledgered as upstream candidates. **TEST** - addressed: unit suites plus the served-build check. **COMPL** - Not applicable. **UX** - addressed: the failure state is visible, accessible and recoverable. **BIZ** - Not applicable.

## Traceability

- **PRD**: [PRD.md](../PRD.md)
- **DESIGN**: [DESIGN.md](../DESIGN.md)

This decision directly addresses the following requirements and design elements:

* `cpt-site-fr-static-build` - One self-contained static output that works at the origin root and under any sub-path, with no build-time origin in loading or links.
* `cpt-site-fr-screen-load-failure` - The kit-built error state with a retry inside the page frame when a screen cannot load.
* `cpt-site-fr-screen-pages` - Every page keeps its address under any mount path, because links and the document resolve relative to the mount folder.
* `cpt-site-interface-canonical-address` - Canonical addresses stay absolute from the configured origin, which may carry the sub-path, while the shell's links and the links to twins are document-relative.
* `cpt-site-fr-discovery-files` - The discovery files are written with the configured origin and stay correct under a sub-path.
* `cpt-site-usecase-visit-page` - A visitor reaches any page by its address on any mount, and sees a recoverable state when a screen cannot load.
* `cpt-site-component-site-app` - The host's bootstrap and screen container resolve the relative addresses and show the failure state.
* `cpt-site-constraint-query-addressing` - Because screens are addressed in the query string, every page is the mount folder plus a query, which is what makes the static layout rewrite-free.
