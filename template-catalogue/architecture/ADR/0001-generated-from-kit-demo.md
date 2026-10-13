---
status: accepted
date: 2026-10-12
---

# The Catalogue's Demo Files Are Generated from the Kit Demo at the Pinned Release, Stored, and Checked

<!-- toc -->

- [Context and Problem Statement](#context-and-problem-statement)
- [Decision Drivers](#decision-drivers)
- [Considered Options](#considered-options)
- [Decision Outcome](#decision-outcome)
  - [Consequences](#consequences)
  - [Confirmation](#confirmation)
- [Pros and Cons of the Options](#pros-and-cons-of-the-options)
  - [A hand-copied, hand-adapted snapshot](#a-hand-copied-hand-adapted-snapshot)
  - [Generation during the build](#generation-during-the-build)
  - [Reading the demo from the published kit package](#reading-the-demo-from-the-published-kit-package)
  - [A generator with a lock, recorded adaptations and stored output](#a-generator-with-a-lock-recorded-adaptations-and-stored-output)
- [More Information](#more-information)
- [Traceability](#traceability)

<!-- /toc -->

**ID**: `cpt-template-catalogue-adr-generated-from-kit-demo`

## Context and Problem Statement

The catalogue renders the kit's own example files, foundation pages and the helper module they share. Those files exist only in the kit demo inside the gears-frontx repository: the published `@gears-frontx/ui-kit` package ships `dist`, `llms.txt`, `README.md`, `LICENSE` and `NOTICE`, no demo sources, no component manifest and no record of the commit it was published from. The site cannot take the files unchanged either: the demo carries long dashes, the design tool's vendor name and internal mail domains that the repository's text rules refuse, and some files need edits to pass the site's accessibility rules, to keep links on the page and to read tokens inside a shadow root. How does the catalogue get the kit's demo files for the kit version it pins, with its own changes, so that the catalogue stays equal to the kit and every difference is known?

## Decision Drivers

* **The catalogue must equal the installed kit** - a visitor reads the examples of the version the application installed; a catalogue that drifts from it without notice misinforms.
* **Every deviation must be named** - a change to a kit file without a stated reason cannot be ported to the next release or proposed to the kit.
* **Builds must not need the network** - a build, a test run and a page load work from the repository alone, on any machine and in any CI run.
* **Same inputs, same output** - the same template with the same kit version always yields the same files.
* **The repository's text rules apply to every stored file** - no file in the repository may carry the refused text.
* **The template is self-contained** - whatever produces the files lives inside the template and references nothing outside it.

## Considered Options

* **A hand-copied, hand-adapted snapshot** - the demo files copied once into the template at one commit and edited in place.
* **Generation during the build** - the build fetches the demo at the pinned release's commit and applies the site's changes each time; nothing generated is stored.
* **Reading the demo from the published kit package** - the generator reads the demo from the installed package in `node_modules`.
* **A generator with a lock, recorded adaptations and stored output** - a generator inside the template reads the demo at the commit the pinned release was published from, applies content rules and one recorded adaptation per changed file, stores its output in the template, and a check regenerates and compares.

## Decision Outcome

Chosen option: "A generator with a lock, recorded adaptations and stored output", because it is the only available option that keeps the catalogue equal to the pinned kit release, names every deviation and keeps builds free of the network.

**The source is the kit demo at the commit the pinned kit release was published from.** A lock in the template records the kit version, the repository, that commit, the demo files the catalogue takes and the content hash of each. Moving to a new kit version moves the lock to the new commit, and the move refuses a commit whose kit package declares another version.

**Every file passes the content rules, then its adaptation.** The content rules replace the refused text in every file. A file the site changes beyond them has one recorded adaptation: a strict per-file diff headed by its kind (mechanical: the kit's behaviour kept, a site rule met; substantive: the page does or shows something else) and its reason. An adaptation that no longer applies to its source fails generation instead of being guessed at; a deliberate edit of a generated file is kept only by recording it as the file's adaptation.

**The output is stored in the template, and a check guards it.** The check regenerates in memory and fails on a hand edit, an extra or missing file, a pin that differs from the lock, a source whose hash differs from the lock, and an adaptation that no longer applies or lacks its kind or reason. Builds read the stored files and never run the generator. Fetched demo files are cached per commit: at the locked commit only when they match the lock, and on a move to a new commit as fetched, which the moved lock then records.

The scope of this decision is how the catalogue's demo files are produced and kept equal to the kit. It does not decide which pages the catalogue has, how the screen around the files is built, or the metadata of a component (family, name, description, page metadata), which the developer adds and the screen's tests check.

### Consequences

* Good, because the catalogue is the pinned release's demo plus named adaptations, and the check proves it on every change.
* Good, because a kit release becomes a mechanical move that lists exactly the adaptations to port.
* Good, because builds and tests need no network, and the stored files pass the repository's text rules.
* Good, because every adaptation carries a reason, so fixes that belong to every kit consumer can be proposed to the kit and dropped once a release carries them.
* Bad, because producing or checking the demo files needs the network or a local checkout of gears-frontx, at least once per commit.
* Bad, because the template carries a generator, a lock and adaptation files to maintain next to the screen.
* Bad, because the metadata of a new component is still written by hand; the screen's tests only name what is missing.

### Confirmation

The package's `generate:check` command (also run from the repository root and in CI) regenerates the demo files and must exit 0; the generator's unit tests hold each failure case (hand edit, version change, changed source, an adaptation that no longer applies, a missing kind or reason). Review confirms that no change edits a generated file without recording it, and that each new adaptation states its kind and reason. The FrontX CLI's template validation confirms that the generator references nothing outside the template.

## Pros and Cons of the Options

### A hand-copied, hand-adapted snapshot

The demo files are copied by hand from one commit, and the ones the site changes are edited by hand.

* Good, because it needs no tooling and no network at any time.
* Bad, because the catalogue freezes at the copied commit and drifts from the installed kit without any signal.
* Bad, because the hand edits are indistinguishable from the kit's code: a refresh either loses them or repeats them by memory.
* Bad, because nothing tells a reader which part of a page is the kit's and which is the site's.

### Generation during the build

* Good, because nothing generated is stored, so a stored file can never be edited by hand.
* Bad, because every build, test run and preview needs the network and the kit demo source to answer, which breaks offline and makes the build depend on another repository's availability.
* Bad, because storing the pristine demo instead, to transform it offline, would put the refused text into the repository.

### Reading the demo from the published kit package

* Good, because the installed package would be the source, with no lock and no network.
* Bad, because the published package carries no demo sources and no component manifest, so the option is not available today; it becomes the natural source once the kit ships its demo and records its source commit, and the lock's commit would then be dropped.

### A generator with a lock, recorded adaptations and stored output

* Good, because it meets every driver: equal to the release, every deviation named, offline builds, reproducible output, stored files clean, self-contained.
* Neutral, because it follows the pattern the FrontX templates already use for generated content: a template may carry a generator that writes project content, as template-shell generates its manifest aggregate.
* Bad, because generation and the check need the network or a checkout, and the generator itself is code to maintain.

## More Information

The gears-frontx release `@gears-frontx/ui-kit` 0.4.0 was published from commit `00f71b2380ccbe7d12a68d0f021bb69112a25bda`; the kit package at that commit declares 0.4.0, and the demo files fetched from it match a `git archive` of the same commit. The adaptations in force and their kinds are listed in the template's README ([README.md](../../README.md), "Source of the examples"); the template's AI guideline `catalogue-generation.md` gives the developer's procedure.

Applicability of the remaining checklist categories: **PERF** - Not applicable, because generation never runs in a build or a page load. **SEC** - addressed: fetched content is accepted only when its hash matches the lock, so a proxy page or a cut transfer is never cached or written. **REL** - addressed: builds do not depend on the kit demo source being reachable. **DATA** - Not applicable, because no schema is fixed. **INT** - addressed: the integration with gears-frontx is a read of public files at a recorded commit. **OPS** - addressed: CI runs the check, which needs the network or the per-commit cache. **MAINT** - addressed: a kit release is a move that lists what to port. **TEST** - addressed: the generator's unit tests hold every failure case. **COMPL** - addressed: the content rules keep the stored files within the repository's text rules. **UX** - Not applicable, because the rendered pages are unchanged by how their files are produced. **BIZ** - Not applicable.

## Traceability

- **PRD**: [PRD.md](../PRD.md)
- **DESIGN**: [DESIGN.md](../DESIGN.md)

This decision directly addresses the following requirements and design elements:

* `cpt-template-catalogue-fr-demo-files-from-kit` - The demo files are the pinned release's demo plus recorded adaptations, produced reproducibly.
* `cpt-template-catalogue-fr-generation-check` - The check that regenerates and refuses any unrecorded difference.
* `cpt-template-catalogue-fr-record-adaptation` - A deliberate change is kept only as a recorded adaptation with its kind and reason.
* `cpt-template-catalogue-fr-kit-release-move` - The lock moves to the commit of the new release, and the move lists the adaptations to port.
* `cpt-template-catalogue-nfr-offline-build` - The output is stored, so builds never run the generator.
* `cpt-template-catalogue-component-catalogue-generator` - The component that implements this decision.
