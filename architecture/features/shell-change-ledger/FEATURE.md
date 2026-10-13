# Feature: Shell Change Ledger


<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Print or Check the Ledger](#print-or-check-the-ledger)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Compute the Actual Shell Changes](#compute-the-actual-shell-changes)
  - [Compare the Recorded List](#compare-the-recorded-list)
  - [Adapt a Pristine File](#adapt-a-pristine-file)
  - [Name the Site-Owned Shell Files](#name-the-site-owned-shell-files)
- [4. States (CDSL)](#4-states-cdsl)
  - [No Lifecycle to Model](#no-lifecycle-to-model)
- [5. Definitions of Done](#5-definitions-of-done)
  - [The List Equals the Actual Shell Changes](#the-list-equals-the-actual-shell-changes)
  - [The Policies Know the Site-Owned Shell Files](#the-policies-know-the-site-owned-shell-files)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

- [x] `p2` - **ID**: `cpt-site-featstatus-shell-change-ledger`
## 1. Feature Context

- [x] `p2` - `cpt-site-feature-shell-change-ledger`

### 1.1 Overview

This feature keeps, for each official template applied to `site/` (template-shell, template-mfe, template-design-guardrails), the exact list of every file the site changed, added or removed against the template at the source-spec `site/.frontx/provenance.json` records, prints it, and checks it against the site and the pristine template in the repository's FrontX CLI inventory. Every other applied text file carries one adaptation, the long-dash rule (a long dash becomes `-`), which the check holds too and a command writes. The lists also tell the repository policies which applied files are site-owned code.

The code is `scripts/shell-changes.mjs`: the recorded lists, the adaptation, the comparison, the check and the adapt command. What the changed files do is specified by the features that own them (shell layout and navigation, production build layout, dev run); the styling and text checks over them belong to the repository policies.

### 1.2 Purpose

The shell rebuild is carried into template-shell later; that needs an exact, checked list of what the site changed. Every applied file not on a list stays as its template ships it apart from the adaptation, so the repository's text policy holds in every file without hand edits to upstream text; a file that changes without being recorded, or keeps text the adaptation changes, fails the check.

**Requirements**: None: the ledger serves the shell rebuild decision and the policies' scope; the requirements the changed files meet are covered by the features that own those files.

**Principles**: `cpt-site-principle-shell-as-is`

**Components**: `cpt-site-component-shell-change-ledger`

**ADRs**: `cpt-site-adr-shell-rebuilt-in-place`

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-site-actor-site-developer` | Records a change in the list when changing an applied file, writes the adaptation after a template upgrade, prints the lists, and runs the check |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md), sections 3.2 (shell change ledger), 4.3.4 (the shell rebuild), 4.7 (commands)
- **ADR**: [0003 shell rebuilt in place](../../ADR/0003-shell-rebuilt-in-place.md)
- **Dependencies**: `cpt-site-feature-template-composition` (the shared entry check), `cpt-site-feature-site-data` (it installs the pristine applied templates into the CLI inventory)

## 2. Actor Flows (CDSL)

**Use cases**: None: the ledger is a maintenance check of the site developer, not one of the PRD's use cases.

### Print or Check the Ledger

- [x] `p2` - **ID**: `cpt-site-flow-shell-change-ledger-run`

**Actor**: `cpt-site-actor-site-developer`

**Success Scenarios**:
- Without a flag, every recorded change is printed with its template and kind (changed, added, removed).
- With `--adapt`, every applied file kept byte for byte although the adaptation changes it is written with the adapted pristine text, and the command says how many.
- With `--check`, each recorded list equals the actual changes of `site/` against its pristine template, every other applied file carries the adaptation, and the command says so.

**Error Scenarios**:
- An applied template is not in the CLI inventory: the command names it, asks to run the site data generation, which installs it, and exits with code 1.
- An applied file changed, was added or was removed without being recorded, a recorded change is not there, or an applied file keeps text the adaptation changes: the command names each one and exits with code 1.

**Steps**:
1. [x] - `p2` - Developer runs `npm run shell:changes`, `npm run shell:changes -- --adapt` or `npm run shell:changes -- --check`; the command resolves the repository root, the mode and each applied template's place in the CLI inventory - `inst-run`
2. [x] - `p2` - **IF** neither adapting nor checking: print every recorded file with its template and kind and exit with code 0 - `inst-print`
3. [x] - `p2` - **IF** an applied template is not in the CLI inventory: name it, print the hint to run `npm run site:data` and exit with code 1 - `inst-inventory-missing`
4. [x] - `p2` - **IF** adapting: **FOR EACH** applied template, write the pristine file adapted by `cpt-site-algo-shell-change-ledger-adapt` over every file `cpt-site-algo-shell-change-ledger-diff` finds unadapted, print the count and exit with code 0 - `inst-adapt`
5. [x] - `p2` - **FOR EACH** applied template, compare its recorded list with the actual changes using `cpt-site-algo-shell-change-ledger-diff` and `cpt-site-algo-shell-change-ledger-compare` - `inst-compare`
6. [x] - `p2` - **IF** there is any difference: print each one and exit with code 1 - `inst-fail`
7. [x] - `p2` - **RETURN** that the recorded changes and the adaptation match `site/` against the applied templates - `inst-pass`

## 3. Processes / Business Logic (CDSL)

### Compute the Actual Shell Changes

- [x] `p2` - **ID**: `cpt-site-algo-shell-change-ledger-diff`

**Input**: The site directory and a pristine applied template's directory.

**Output**: The changed, added, removed, adapted and unadapted files, relative to `site/`, each list sorted.

**Steps**:
1. [x] - `p2` - Read the subtrees the template's manifest claims - `inst-claimed`
2. [x] - `p2` - List every file of the pristine template, skipping installs and build and test output (the inventory is git-ignored, so it is walked) - `inst-pristine-files`
3. [x] - `p2` - List the site's files as git would record them, so ignored caches and editor files never count; outside a git checkout, walk the directory instead - `inst-current-files`
4. [x] - `p2` - Keep only the files inside the claimed subtrees on both sides, leaving out installs, build output and the two manifest files the build writes - `inst-restrict`
5. [x] - `p2` - **FOR EACH** file present on both sides: the same bytes is unchanged, or unadapted when `cpt-site-algo-shell-change-ledger-adapt` changes the pristine bytes; the adapted pristine bytes is adapted; any other bytes is changed - `inst-changed`
6. [x] - `p2` - **RETURN** the changed files, the added files (in the site only), the removed files (in the template only), the adapted files and the unadapted files - `inst-return-diff`

### Compare the Recorded List

- [x] `p2` - **ID**: `cpt-site-algo-shell-change-ledger-compare`

**Input**: The actual changes, the template's recorded list and the names of the template and its list.

**Output**: One message per difference.

**Steps**:
1. [x] - `p2` - **FOR EACH** kind (changed, added, removed): report every actual file the list does not cover under that kind, and every recorded entry that covers no actual file of that kind; an entry ending in `/` covers every file below it - `inst-compare-kinds`
2. [x] - `p2` - Report every unadapted file, naming the adaptation and the command that writes it - `inst-compare-unadapted`
3. [x] - `p2` - **RETURN** the messages - `inst-return-messages`

### Adapt a Pristine File

- [x] `p2` - **ID**: `cpt-site-algo-shell-change-ledger-adapt`

**Input**: A pristine file's bytes.

**Output**: The bytes the site carries for the file when it does not change it.

**Steps**:
1. [x] - `p2` - **IF** the file is binary (a NUL byte in its first 8 KiB): **RETURN** it as it is - `inst-adapt-binary`
2. [x] - `p2` - **RETURN** the text with every adaptation applied: each long dash (U+2014, U+2013) becomes `-` - `inst-adapt-text`

### Name the Site-Owned Shell Files

- [x] `p2` - **ID**: `cpt-site-algo-shell-change-ledger-owned-files`

**Input**: The recorded lists.

**Output**: The site-owned applied files, relative to the repository root.

**Steps**:
1. [x] - `p2` - **RETURN** the changed and added files of every list under `site/`; a removed or adapted file is never site-owned - `inst-owned`

## 4. States (CDSL)

### No Lifecycle to Model

Not applicable: the lists are constants of the script and the check is a stateless comparison.

## 5. Definitions of Done

### The List Equals the Actual Shell Changes

- [x] `p2` - **ID**: `cpt-site-dod-shell-change-ledger-exact-list`

The system **MUST** record every file of template-shell, template-mfe and template-design-guardrails the site changed, added or removed against the pristine template at the provenance source-spec, **MUST** carry the long-dash adaptation in every other applied text file, and its check **MUST** fail, naming each file, when a list and the actual changes differ in either direction or an applied file lacks the adaptation.

**Implements**:
- `cpt-site-flow-shell-change-ledger-run`
- `cpt-site-algo-shell-change-ledger-diff`
- `cpt-site-algo-shell-change-ledger-compare`
- `cpt-site-algo-shell-change-ledger-adapt`

**Touches**:
- `scripts/shell-changes.mjs`

### The Policies Know the Site-Owned Shell Files

- [x] `p2` - **ID**: `cpt-site-dod-shell-change-ledger-policy-scope`

The system **MUST** give the repository policies the changed and added applied files as site-owned code, and never a removed or adapted one.

**Implements**:
- `cpt-site-algo-shell-change-ledger-owned-files`

**Touches**:
- `scripts/shell-changes.mjs`

## 6. Acceptance Criteria

- [x] The comparison finds the changed, added and removed files of the claimed subtrees with installs left out (`scripts/shell-changes.test.mjs`: "finds the changed, added and removed files of the claimed subtrees, installs left out").
- [x] In a git checkout, what `.gitignore` excludes is not an unrecorded addition (`scripts/shell-changes.test.mjs`: "leaves out what .gitignore excludes, so a local cache or editor file is not an unrecorded addition").
- [x] A file that differs by the adaptation only is adapted, not changed, and a file that still lacks it is found (`scripts/shell-changes.test.mjs`: "tells an applied file that differs by the adaptations only from a changed one, and finds one that still lacks them").
- [x] The adaptation turns both long dashes into `-` and leaves a binary file as it is (`scripts/shell-changes.test.mjs`: "turns both long dashes into a hyphen and leaves a binary file as it is").
- [x] A change the list misses and a recorded change that is not there are both named (`scripts/shell-changes.test.mjs`: "names a change the list misses and a recorded change that is not there").
- [x] A folder entry covers every file below it, an entry that covers nothing is named, and an unadapted file is refused (`scripts/shell-changes.test.mjs`: "covers every file below a recorded folder entry, names an empty one and refuses an unadapted file").
- [x] The site-owned files are the changed and added applied files, never a removed one (`scripts/shell-changes.test.mjs`: "owns the changed and added applied files, never a removed one").
- [x] `npm run shell:changes -- --check` passes on the repository as committed.
