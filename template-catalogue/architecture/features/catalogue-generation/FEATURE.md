# Feature: Demo File Generation

- [x] `p1` - **ID**: `cpt-template-catalogue-featstatus-catalogue-generation`

<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Generate the Demo Files](#generate-the-demo-files)
  - [Check the Demo Files](#check-the-demo-files)
  - [Record a Deliberate Edit](#record-a-deliberate-edit)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Load the Demo Sources](#load-the-demo-sources)
  - [Read From the Network](#read-from-the-network)
  - [Generate the Files](#generate-the-files)
  - [Apply an Adaptation](#apply-an-adaptation)
  - [Create an Adaptation Diff](#create-an-adaptation-diff)
  - [Verify the Lock](#verify-the-lock)
  - [Compare With the Stored Files](#compare-with-the-stored-files)
  - [List the Source at a Commit](#list-the-source-at-a-commit)
- [4. States (CDSL)](#4-states-cdsl)
  - [Cached Demo File State Machine](#cached-demo-file-state-machine)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Reproducible Demo Files](#reproducible-demo-files)
  - [Check Refuses Any Unrecorded Difference](#check-refuses-any-unrecorded-difference)
  - [Recording an Adaptation](#recording-an-adaptation)
  - [Moving to a New Kit Release](#moving-to-a-new-kit-release)
  - [Generation Commands](#generation-commands)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

## 1. Feature Context

- [x] `p1` - `cpt-template-catalogue-feature-catalogue-generation`

### 1.1 Overview

The package's generator, `scripts/generate-catalogue.mjs`, produces the catalogue's demo files (the kit demo's example files, its foundation pages and their shared helper) from the gears-frontx kit demo at the commit the pinned kit release was published from, passes each through the content rules and its recorded adaptation, and stores the result in the package. It also checks the stored files, records a deliberate edit as an adaptation and moves the catalogue to a new kit release. It reads `kit-demo/kit-demo.lock.json` and `kit-demo/adaptations/`, and it runs only on request, never in a build.

### 1.2 Purpose

The catalogue shows the kit as released (`cpt-template-catalogue-adr-generated-from-kit-demo`): every difference from the kit demo is a recorded adaptation with its kind and reason, a hand edit or a changed source is caught by a check, a kit release names exactly what has to be ported, and a build needs neither the network nor the kit demo because the output is stored.

**Requirements**: `cpt-template-catalogue-fr-demo-files-from-kit`, `cpt-template-catalogue-fr-generation-check`, `cpt-template-catalogue-fr-record-adaptation`, `cpt-template-catalogue-fr-kit-release-move`, `cpt-template-catalogue-nfr-offline-build`, `cpt-template-catalogue-nfr-self-contained`

**Principles**: `cpt-template-catalogue-principle-kit-demo-is-source`

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-catalogue-actor-template-developer` | Runs the generation, the check, the record and the move commands and redoes an adaptation that no longer applies |
| `cpt-template-catalogue-actor-kit-demo-source` | Serves the kit demo's files, the demo tree and the kit's `package.json` at a commit, over HTTPS or as a local checkout |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md), component `cpt-template-catalogue-component-catalogue-generator`, sequence `cpt-template-catalogue-seq-generate-demo-files`
- **ADR**: [0001 Generated from the kit demo](../../ADR/0001-generated-from-kit-demo.md)
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.1
- **Procedure**: the template's AI guideline `catalogue-generation.md` in `.frontx/ai/@gears-frontx/frontx-template-catalogue/guidelines/`
- **Dependencies**: None

## 2. Actor Flows (CDSL)

**Use cases**: `cpt-template-catalogue-usecase-move-kit-release`

### Generate the Demo Files

- [x] `p1` - **ID**: `cpt-template-catalogue-flow-catalogue-generation-generate`

**Actor**: `cpt-template-catalogue-actor-template-developer`

**Success Scenarios**:
- At the locked commit, every demo file is written from the locked source through the content rules and its adaptation, a demo file the generator no longer produces is removed from the generated folders, and the lock is written unchanged.
- With a new commit (`--ref`), the lock moves to that commit and the pinned kit version, records the hash of every included demo file there, and every file is written.

**Error Scenarios**:
- The pin differs from the lock and no commit is named: refused, asking for the commit the pinned version was published from.
- The named commit declares another kit version than the pin: refused, naming the version found.
- A source file does not match the lock's hash, or the network fails: refused, naming the address and the local checkout alternative.
- An adaptation no longer applies to the new source: the file is written as the new source after the content rules, its adaptation stays as it was, and the run lists it and exits non-zero.
- An adaptation lacks its kind or reason, or refused text survives: refused, naming the file.

**Steps**:
1. [x] - `p1` - The developer runs `npm run generate`, optionally with `--ref <commit>` and `--source <checkout>/packages/ui-kit/demo` - `inst-run-generate`
2. [x] - `p1` - Read the lock and the kit version the package pins; a pin that is not an exact version is refused - `inst-read-lock-and-pin`
3. [x] - `p1` - **IF** a commit other than the locked one is named - `inst-if-new-commit`
   1. [x] - `p1` - List the included demo files and the kit version declared at that commit (List the Source at a Commit) - `inst-list-at-commit`
   2. [x] - `p1` - **IF** the commit declares another kit version than the pin, refuse naming both versions - `inst-refuse-other-version`
   3. [x] - `p1` - Move the lock's source commit and kit version to the commit and the pin - `inst-move-lock`
   4. [x] - `p1` - Load the listed files (Load the Demo Sources) and record each file's SHA-256 in the lock - `inst-load-new-sources`
4. [x] - `p1` - **ELSE** - `inst-else-locked-commit`
   1. [x] - `p1` - **IF** the lock names another kit version than the pin, refuse, asking for `--ref` with the commit the pinned version was published from - `inst-refuse-unmoved-pin`
   2. [x] - `p1` - Load the locked files against the lock's hashes (Load the Demo Sources) - `inst-load-locked-sources`
5. [x] - `p1` - Verify the lock against the pin and the sources (Verify the Lock); **IF** anything differs, refuse listing every problem - `inst-verify-lock`
6. [x] - `p1` - Generate every file (Generate the Files), collecting each adaptation that no longer applies instead of failing - `inst-generate-files`
7. [x] - `p1` - Remove each file of the generated folders the generator no longer produces, write every generated file and write the lock - `inst-write-files`
8. [x] - `p1` - Report how many files were generated from which kit version - `inst-report-count`
9. [x] - `p1` - **IF** any adaptation no longer applies, list each one with how to port and record it, and exit non-zero - `inst-report-unported`

### Check the Demo Files

- [x] `p1` - **ID**: `cpt-template-catalogue-flow-catalogue-generation-check`

**Actor**: `cpt-template-catalogue-actor-template-developer`

**Success Scenarios**:
- The stored demo files equal a fresh generation from the locked source and the adaptations: the run says which kit version they match and exits 0.

**Error Scenarios**:
- A hand edit, an extra or missing generated file, a pin that differs from the lock, a source whose hash differs from the lock, an adaptation that no longer applies or lacks its kind or reason: the run lists every problem with the remedy and exits non-zero.

**Steps**:
1. [x] - `p1` - The developer, or continuous integration, runs `npm run generate:check` (at the repository root `npm run catalogue:check`) - `inst-run-check`
2. [x] - `p1` - Read the lock and the pin and load the locked files against the lock's hashes (Load the Demo Sources) - `inst-load-locked`
3. [x] - `p1` - **IF** the lock disagrees with the pin or a source (Verify the Lock), **RETURN** those problems - `inst-return-lock-problems`
4. [x] - `p1` - **TRY** to generate every file in memory (Generate the Files); **CATCH** a refused adaptation or refused text and **RETURN** it as the problem - `inst-generate-in-memory`
5. [x] - `p1` - **RETURN** the differences between the generation and the stored files (Compare With the Stored Files) - `inst-compare-stored`
6. [x] - `p1` - **IF** there is any problem, print every problem with how to regenerate or record an adaptation and exit non-zero - `inst-report-problems`
7. [x] - `p1` - **ELSE** say which kit version the stored files match - `inst-report-match`

### Record a Deliberate Edit

- [x] `p2` - **ID**: `cpt-template-catalogue-flow-catalogue-generation-record`

**Actor**: `cpt-template-catalogue-actor-template-developer`

**Success Scenarios**:
- A deliberate edit of a generated file becomes that file's adaptation against the locked commit; an existing adaptation keeps its header (kind and reason); the run lists every adaptation written or removed.
- A file that equals its source after the content rules loses its adaptation.

**Error Scenarios**:
- A commit is named that the lock does not name yet: refused, asking to move the lock first.
- A named path the kit demo does not have at the locked commit: loading its source fails with a read error naming it.
- A named demo file the lock does not list: refused.
- A new adaptation's header still needs its kind and reason: generation refuses it until they are given.

**Steps**:
1. [x] - `p2` - The developer edits a generated file and runs `npm run generate -- --record [file]`, optionally with the `--ref` the lock already names - `inst-run-record`
2. [x] - `p2` - **IF** a commit is named that the lock does not name, refuse, naming the move command to run first - `inst-refuse-unmoved-ref`
3. [x] - `p2` - Take the named files, or every locked file when none is named, and load their locked sources against the lock's hashes (Load the Demo Sources) and the existing adaptations - `inst-load-targets`
4. [x] - `p2` - **FOR EACH** target file - `inst-each-target`
   1. [x] - `p2` - **IF** it is a demo file the lock does not list, refuse naming it (a path the demo does not have already failed when its source was loaded) - `inst-refuse-unknown-file`
   2. [x] - `p2` - Diff the locked source after the content rules against the file on disk (Create an Adaptation Diff) - `inst-diff-target`
   3. [x] - `p2` - **IF** there is no difference, remove the file's adaptation when it has one - `inst-drop-adaptation`
   4. [x] - `p2` - **ELSE** keep the existing adaptation's header, or start a header that asks for the kind and the reason, and write the adaptation when it changed - `inst-write-adaptation`
5. [x] - `p2` - **RETURN** the adaptations written or removed, which the run prints - `inst-return-changed`

## 3. Processes / Business Logic (CDSL)

### Load the Demo Sources

- [x] `p1` - **ID**: `cpt-template-catalogue-algo-catalogue-generation-load-sources`

**Input**: The source description (repository, commit, demo path), the demo-relative files, the package directory, an optional local checkout and optionally the lock's hashes.

**Output**: Each file's text.

**Steps**:
1. [x] - `p1` - **FOR EACH** file - `inst-each-file`
   1. [x] - `p1` - **IF** a local checkout is given, read the file from it - `inst-read-checkout`
   2. [x] - `p1` - **IF** the per-commit cache holds the file, read it; **IF** its hash differs from the lock's, delete the entry and read it again from the source - `inst-read-cache`
   3. [x] - `p1` - **IF** nothing was read, GET the file at the commit from `raw.githubusercontent.com`; **IF** a hash is expected and the answer does not match it, fail naming the address, without caching - `inst-fetch-file`
   4. [x] - `p1` - Write the fetched file to the cache whole or not at all, through a temporary file and a rename - `inst-cache-file`
2. [x] - `p1` - **RETURN** the texts - `inst-return-sources`

### Read From the Network

- [x] `p2` - **ID**: `cpt-template-catalogue-algo-catalogue-generation-fetch-text`

**Input**: An address.

**Output**: The answer's text.

**Steps**:
1. [x] - `p2` - **TRY** a GET of the address and read the body of a successful answer - `inst-get`
2. [x] - `p2` - **CATCH** a network failure: fail naming the address, the cause and the local checkout alternative - `inst-network-failure`
3. [x] - `p2` - **IF** the answer is not successful, fail naming the address, the HTTP status and the local checkout alternative - `inst-http-failure`
4. [x] - `p2` - **RETURN** the text - `inst-return-text`

### Generate the Files

- [x] `p1` - **ID**: `cpt-template-catalogue-algo-catalogue-generation-generate-files`

**Input**: The demo sources, the adaptations, and optionally a list that collects adaptations that no longer apply.

**Output**: The generated files by package path (`src/examples/`, `src/pages/`, `src/shared.tsx`).

**Steps**:
1. [x] - `p1` - **IF** an adaptation names a file the kit demo does not have, refuse naming it - `inst-refuse-orphan-adaptation`
2. [x] - `p1` - **FOR EACH** source file in path order - `inst-each-source`
   1. [x] - `p1` - Apply the content rules: long dashes to a hyphen, the design tool's name to the design source, internal mail addresses to `example.com` - `inst-content-rules`
   2. [x] - `p1` - **IF** the file has an adaptation - `inst-if-adaptation`
      1. [x] - `p1` - **IF** its kind is neither mechanical nor substantive, or it gives no reason, refuse naming the adaptation - `inst-require-kind-reason`
      2. [x] - `p1` - **TRY** to apply it strictly (Apply an Adaptation) - `inst-apply-adaptation`
      3. [x] - `p1` - **CATCH** a hunk that no longer applies: **IF** adaptations that no longer apply are collected, record it and emit the file without its adaptation; **ELSE** fail - `inst-collect-unported`
   3. [x] - `p1` - **IF** a long dash, the design tool's name or an internal company domain survives on any line, refuse naming the file and the line - `inst-refuse-survivors`
   4. [x] - `p1` - Emit the file under `src/` at its demo-relative path - `inst-emit-file`
3. [x] - `p1` - **RETURN** the generated files - `inst-return-files`

### Apply an Adaptation

- [x] `p1` - **ID**: `cpt-template-catalogue-algo-catalogue-generation-apply-adaptation`

**Input**: A text, an adaptation (a header with kind and reason, then a unified diff), a label for messages.

**Output**: The adapted text, or a failure naming the hunk that no longer matches.

**Steps**:
1. [x] - `p1` - Parse the diff's hunks; refuse a diff without its `---`/`+++` header, without hunks, with a line before the first hunk, a "No newline at end of file" line or an unexpected line - `inst-parse-hunks`
2. [x] - `p1` - **FOR EACH** hunk - `inst-each-hunk`
   1. [x] - `p1` - **IF** its old lines match exactly at the line it names, shifted by the previous hunks' offset, apply it there - `inst-match-at-line`
   2. [x] - `p1` - **ELSE** search after the previous hunk; **IF** the old lines match nowhere or more than once, fail asking to port the adaptation and record it again - `inst-match-once`
   3. [x] - `p1` - Replace the old lines with the new ones and carry the offset forward - `inst-splice-hunk`
3. [x] - `p1` - **RETURN** the text with the rest of the source after the last hunk - `inst-return-adapted`

### Create an Adaptation Diff

- [x] `p2` - **ID**: `cpt-template-catalogue-algo-catalogue-generation-create-diff`

**Input**: The source text after the content rules, the edited text, the demo-relative path.

**Output**: A unified diff with three lines of context, or nothing when the texts are equal.

**Steps**:
1. [x] - `p2` - **IF** the texts are equal **RETURN** nothing - `inst-equal-texts`
2. [x] - `p2` - Compute the line edit script by the longest common subsequence - `inst-edit-script`
3. [x] - `p2` - Group the changed lines that lie within twice the context of each other - `inst-group-changes`
4. [x] - `p2` - **RETURN** the diff header and one hunk per group with its old and new line ranges - `inst-write-hunks`

### Verify the Lock

- [x] `p1` - **ID**: `cpt-template-catalogue-algo-catalogue-generation-verify-lock`

**Input**: The lock, the pinned kit version, the loaded sources.

**Output**: The problems found.

**Steps**:
1. [x] - `p1` - **IF** the lock's kit version differs from the pin, report it with the `--ref` remedy - `inst-pin-differs`
2. [x] - `p1` - **FOR EACH** source whose SHA-256 differs from the lock's, report it - `inst-hash-differs`
3. [x] - `p1` - **RETURN** the problems - `inst-return-problems`

### Compare With the Stored Files

- [x] `p1` - **ID**: `cpt-template-catalogue-algo-catalogue-generation-compare-stored`

**Input**: The generated files and the package directory.

**Output**: The sorted differences.

**Steps**:
1. [x] - `p1` - Read the stored files: everything in the generated folders (`src/examples/`, `src/pages/`), plus the other generated files - `inst-read-stored`
2. [x] - `p1` - **FOR EACH** generated file, report it as missing or as differing from what the generator produces - `inst-missing-or-different`
3. [x] - `p1` - **FOR EACH** stored file the generator does not produce, report it - `inst-not-produced`
4. [x] - `p1` - **RETURN** the problems sorted - `inst-return-sorted`

### List the Source at a Commit

- [x] `p1` - **ID**: `cpt-template-catalogue-algo-catalogue-generation-list-at-commit`

**Input**: The source description at the new commit, the lock's include patterns, an optional local checkout.

**Output**: The included demo files in path order and the kit version declared at the commit.

**Steps**:
1. [x] - `p1` - **IF** a local checkout is given, list its files and read the kit version from the kit's `package.json` beside the demo folder - `inst-list-checkout`
2. [x] - `p1` - **ELSE** read the demo tree at the commit from the GitHub API and the kit version from the kit's `package.json` at the commit - `inst-list-remote`
3. [x] - `p1` - **RETURN** the files the include patterns take (`dir/*.ext` or a plain path), sorted, with the kit version - `inst-filter-included`

## 4. States (CDSL)

### Cached Demo File State Machine

- [x] `p2` - **ID**: `cpt-template-catalogue-state-catalogue-generation-cache-entry`

**States**: Absent, Cached

**Initial State**: Absent

**Transitions**:
1. [x] - `p2` - **FROM** Absent **TO** Cached **WHEN** a fetched file matches the lock's hash, or a move to a new commit fetches it - `inst-entry-cached`
2. [x] - `p2` - **FROM** Cached **TO** Absent **WHEN** the cached text no longer matches the lock's hash, before it is fetched again - `inst-entry-dropped`

## 5. Definitions of Done

### Reproducible Demo Files

- [x] `p1` - **ID**: `cpt-template-catalogue-dod-catalogue-generation-reproducible-files`

The system **MUST** write the catalogue's demo files from the kit demo at the locked commit, through the content rules and the recorded adaptations, at the paths the generated imports require, the same files for the same lock and adaptations, using Node built-ins and the package's own files only, and never during a build or a test run.

**Implements**:
- `cpt-template-catalogue-flow-catalogue-generation-generate`
- `cpt-template-catalogue-algo-catalogue-generation-load-sources`
- `cpt-template-catalogue-algo-catalogue-generation-fetch-text`
- `cpt-template-catalogue-algo-catalogue-generation-generate-files`
- `cpt-template-catalogue-algo-catalogue-generation-apply-adaptation`
- `cpt-template-catalogue-state-catalogue-generation-cache-entry`

**Constraints**: `cpt-template-catalogue-constraint-no-published-demo`, `cpt-template-catalogue-constraint-generated-layout`

**Touches**:
- API: HTTPS GET of `packages/ui-kit/demo` files at a commit
- DB: none
- Entities: Kit demo lock, Adaptation

### Check Refuses Any Unrecorded Difference

- [x] `p1` - **ID**: `cpt-template-catalogue-dod-catalogue-generation-check`

The system **MUST** regenerate the demo files in memory and fail, naming each cause, on a hand edit, an extra or missing file, a pin that differs from the lock, a source that differs from the lock's hash, and an adaptation that no longer applies or lacks its kind or reason.

**Implements**:
- `cpt-template-catalogue-flow-catalogue-generation-check`
- `cpt-template-catalogue-algo-catalogue-generation-verify-lock`
- `cpt-template-catalogue-algo-catalogue-generation-compare-stored`

**Constraints**: `cpt-template-catalogue-constraint-generated-layout`

**Touches**:
- API: `npm run generate:check`, `npm run catalogue:check`
- DB: none
- Entities: Kit demo lock, Adaptation

### Recording an Adaptation

- [x] `p2` - **ID**: `cpt-template-catalogue-dod-catalogue-generation-record`

The system **MUST** turn a deliberate edit of a demo file into its adaptation against the locked commit, keep an existing adaptation's kind and reason, remove an adaptation the file no longer needs, and refuse a commit the lock does not name yet.

**Implements**:
- `cpt-template-catalogue-flow-catalogue-generation-record`
- `cpt-template-catalogue-algo-catalogue-generation-create-diff`

**Constraints**: `cpt-template-catalogue-constraint-no-published-demo`

**Touches**:
- API: `npm run generate -- --record [file]`
- DB: none
- Entities: Adaptation

### Moving to a New Kit Release

- [x] `p1` - **ID**: `cpt-template-catalogue-dod-catalogue-generation-move`

The system **MUST** move the lock to a named commit only when that commit declares the pinned kit version, **MUST** write every demo file from it, and **MUST** list each file whose adaptation no longer applies while leaving that adaptation in place to port.

**Implements**:
- `cpt-template-catalogue-flow-catalogue-generation-generate`
- `cpt-template-catalogue-algo-catalogue-generation-list-at-commit`

**Constraints**: `cpt-template-catalogue-constraint-no-published-demo`

**Touches**:
- API: `npm run generate -- --ref <commit>`, the GitHub API tree of the demo at the commit
- DB: none
- Entities: Kit demo lock, Adaptation

### Generation Commands

- [x] `p2` - **ID**: `cpt-template-catalogue-dod-catalogue-generation-commands`

The system **MUST** accept exactly the generation commands of the template's interface (`--check`, `--ref <commit>`, `--record [file...]`, `--source <dir>`), refuse any other argument, and exit non-zero on every failure.

**Implements**:
- `cpt-template-catalogue-flow-catalogue-generation-generate`
- `cpt-template-catalogue-flow-catalogue-generation-check`
- `cpt-template-catalogue-flow-catalogue-generation-record`

**Constraints**: `cpt-template-catalogue-constraint-generated-layout`

**Touches**:
- API: `npm run generate`, `npm run generate:check`
- DB: none
- Entities: none

## 6. Acceptance Criteria

- [x] The content rules replace long dashes, the design tool's name and internal mail domains, and generated text where refused content survives is refused (`scripts/generate-catalogue.test.mjs`, "content rules").
- [x] A recorded diff round-trips, applies where the source moved and only there, fails instead of guessing when the source under a hunk changed, and an adaptation without its kind and reason, or of a file the demo does not have, is refused ("adaptations").
- [x] Generation is deterministic, and the check fails on a hand edit, an extra or missing generated file, a changed pin and a source that differs from the locked hashes ("generation and --check").
- [x] A commit that declares another kit version is refused; a deliberate edit is recorded and reproduced once its header is filled in; an adaptation the file no longer needs is dropped ("generation and --check").
- [x] A wrong answer is not cached and names its address; a cached file that does not match is fetched again; a network failure names the address and the local alternative ("the network and the cache").
- [x] A move writes every file and leaves an adaptation that no longer applies in place; the ported edit is recorded against the new commit, after which the check passes; `--record` with a commit the lock does not name yet is refused ("moving to a new kit version").
- [x] `npm run generate:check` passes on the stored demo files.
