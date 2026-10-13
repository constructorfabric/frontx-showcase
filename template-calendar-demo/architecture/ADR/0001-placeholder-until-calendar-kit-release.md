---
status: accepted
date: 2026-10-12
---

# The Calendar Screen Is a Kit-Built Placeholder With No Calendar Dependency Until the Calendar Kit Is Released

<!-- toc -->

- [Context and Problem Statement](#context-and-problem-statement)
- [Decision Drivers](#decision-drivers)
- [Considered Options](#considered-options)
- [Decision Outcome](#decision-outcome)
  - [Consequences](#consequences)
  - [Confirmation](#confirmation)
- [Pros and Cons of the Options](#pros-and-cons-of-the-options)
  - [A placeholder page built from the UI kit, depending on no calendar package](#a-placeholder-page-built-from-the-ui-kit-depending-on-no-calendar-package)
  - [A calendar demo built from the UI kit's existing `Calendar` and `Date Picker` components](#a-calendar-demo-built-from-the-ui-kits-existing-calendar-and-date-picker-components)
  - [Depend on the calendar kit in development by source](#depend-on-the-calendar-kit-in-development-by-source)
  - [No calendar screen until the calendar kit is released](#no-calendar-screen-until-the-calendar-kit-is-released)
- [More Information](#more-information)
- [Traceability](#traceability)

<!-- /toc -->

**ID**: `cpt-template-calendar-demo-adr-placeholder-until-kit-release`

## Context and Problem Statement

The FrontX site shows what FrontX builds through demo screens, and a calendar demo belongs among them. The calendar kit such a demo would show is in development as a series of pull requests in gears-frontx-templates (PR #5 opens it with the package foundation) and has no release on the npm registry. The site consumes ecosystem code only as exact released versions. What does the site's calendar screen show, and what may it depend on, while the calendar kit is unreleased?

## Decision Drivers

* **Released versions only** - the site and its template packages install the FrontX ecosystem packages from the npm registry at exact versions equal to the site's installs; an unreleased package has no version to pin.
* **A stable place among the demos** - the demos group the site's header lists and links from other pages need the calendar screen's address and menu entry before its content exists.
* **No misleading content** - the screen must not present something as the calendar demo that is not built with the calendar kit, and a page with no content of its own must not be offered to search engines.
* **Replaceable content** - when the kit is released, the demo must replace the page without changing an address, a link or another template.

## Considered Options

* **A placeholder page built from the UI kit, depending on no calendar package** - one page that says the calendar demo is in development and names the catalogue as the place for the kit's existing calendar components, marked not indexable.
* **A calendar demo built from the UI kit's existing `Calendar` and `Date Picker` components** - an events screen composed from the date components the kit already ships.
* **Depend on the calendar kit in development by source** - take the package from the gears-frontx-templates pull requests before it is published.
* **No calendar screen until the calendar kit is released** - leave the template out of the site.

## Decision Outcome

Chosen option: "A placeholder page built from the UI kit, depending on no calendar package", because it is the only option that gives the calendar demo its permanent address and menu entry now while installing nothing unreleased and showing nothing the calendar kit did not build.

The screen registers at token `calendar` in the demos group with the label "Calendar: coming soon"; its one page is the kit's `Empty` with a heading, a short description and an icon; its page metadata is marked not indexable, so it is absent from the sitemap and the crawler summary. The package lists no calendar package among its dependencies.

### Consequences

* Good, because the address, the menu entry, the lifecycle, the frame and the translations loader exist now and stay when the demo arrives; only the page content changes.
* Good, because the package installs only released versions, so the site's exact-pin rule and its install stay intact.
* Good, because visitors and crawlers are told plainly that the demo is not there yet, and the page does not compete in search with real content.
* Bad, because the site shows no calendar behaviour of its own until the kit is released; the kit's date components are visible only in the catalogue.
* Bad, because the page has to be rewritten, not extended, when the demo is built, and its metadata has to become indexable then.

### Confirmation

The package's manifest test holds the route tree to `/` alone, the metadata to `indexable: false` with no per-route entries, and the title to the page heading. Review confirms that `package.json` lists no calendar package and that the template's AI guideline states the same.

## Pros and Cons of the Options

### A placeholder page built from the UI kit, depending on no calendar package

* Good, because it needs only the released UI kit and the shell.
* Good, because the screen's contract (token, menu entry, metadata) is fixed before the content.
* Bad, because the page carries no demo value beyond the notice.

### A calendar demo built from the UI kit's existing `Calendar` and `Date Picker` components

* Good, because it shows working date behaviour with released packages.
* Bad, because it presents a calendar that is not the calendar kit as its demo, and it would be discarded when the kit arrives.
* Bad, because the same components already have their own pages in the catalogue screen.

### Depend on the calendar kit in development by source

* Good, because it shows the real kit early.
* Bad, because it breaks the exact registry pins of the site: there is no released version to pin, and the source changes under the site with each pull request of the series.
* Bad, because the template would no longer move as a self-contained overlay installable from the registry.

### No calendar screen until the calendar kit is released

* Good, because nothing is built that will be replaced.
* Bad, because the demos group the header lists and links to the calendar have no target, and adding the screen later changes the menu and the site's routing table.

## More Information

The exact registry pins of template packages are a decision of the site repository, recorded in its root [ADR folder](../../../architecture/ADR/). The page metadata contract the placeholder uses is template-site-meta's ([template-site-meta architecture](../../../template-site-meta/architecture/)). The calendar kit's development series starts at constructorfabric/gears-frontx-templates pull request #5.

Applicability of the remaining checklist categories: **PERF** - Not applicable: one static page. **SEC** - Not applicable: no data. **REL** - addressed: no unreleased dependency can break the install. **DATA** - Not applicable. **INT** - addressed: the screen's contract with the host and the metadata pipeline is fixed now. **OPS** - Not applicable. **MAINT** - addressed: the content is the only part to replace. **TEST** - addressed by the manifest test above. **COMPL** - Not applicable. **UX** - addressed: the page says plainly that the demo is coming. **BIZ** - addressed: the demos set is complete in navigation from the first release.

## Traceability

- **PRD**: [PRD.md](../PRD.md)
- **DESIGN**: [DESIGN.md](../DESIGN.md)

This decision directly addresses the following requirements and design elements:

* `cpt-template-calendar-demo-fr-screen-registration` - The screen is registered with its permanent token and menu entry.
* `cpt-template-calendar-demo-fr-placeholder-page` - The page is the notice, built from the kit.
* `cpt-template-calendar-demo-fr-page-metadata` - The page is kept out of indexes.
* `cpt-template-calendar-demo-principle-stable-frame` - The design principle this decision sets.
* `cpt-template-calendar-demo-constraint-exact-pins` - The constraint that rules out the unreleased kit.
