# Feature: Template Composition


<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Compose the Templates Into the Site](#compose-the-templates-into-the-site)
  - [Check the Site Copy for Drift](#check-the-site-copy-for-drift)
  - [Re-compose on Template Edits](#re-compose-on-template-edits)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Discover the Templates](#discover-the-templates)
  - [Compute the Claimed Files](#compute-the-claimed-files)
  - [Compute the Drift](#compute-the-drift)
  - [Tell a Command Run From an Import](#tell-a-command-run-from-an-import)
- [4. States (CDSL)](#4-states-cdsl)
  - [No Lifecycle to Model](#no-lifecycle-to-model)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Screen Code Committed Once, Composed Into the Site](#screen-code-committed-once-composed-into-the-site)
  - [Drift Named File by File](#drift-named-file-by-file)
  - [Composition Follows Template Edits](#composition-follows-template-edits)
  - [One Template Discovery and One Entry Check](#one-template-discovery-and-one-entry-check)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

- [x] `p1` - **ID**: `cpt-site-featstatus-template-composition`
## 1. Feature Context

- [x] `p1` - `cpt-site-feature-template-composition`

### 1.1 Overview

This feature composes the repository's templates into `site/`: every subtree a template claims in its manifest is copied to the same path under `site/`, each written file is recorded with its hash in `site/src-app/mfe_packages/.assembled.json`, and a check reports every difference between the templates and the site copy. It also holds the two modules every repository script shares: the template discovery (`scripts/template-discovery.mjs`) and the entry check (`scripts/entry-point.mjs`).

The code is `scripts/site-assemble.mjs`, `scripts/template-discovery.mjs` and `scripts/entry-point.mjs`. The rest of the feature's scope is configuration that carries no markers: the composition order of DESIGN section 4.3.3, the registry pins in `site/package.json` and in the framework and react workspaces, `site/.npmrc`, the site lockfile, and the root `package.json` and lockfile with the Node floor and the pinned npm. They are exercised by `npm ci` and `npm run setup` (compose, then a clean install of `site/`) and their pins are checked by the repository policies feature.

### 1.2 Purpose

Screen code is committed once, inside the template that owns it; the site's copy is a composition product that git ignores and that a check compares with the templates, naming each drifted file. The site application stays an npm project of its own, installed cleanly at the registry pins, which is the base every other root feature builds on. The catalogue's screen reaches the site the same way as every other template's screens; its routes and pages are specified by [template-catalogue DESIGN](../../../template-catalogue/architecture/DESIGN.md).

**Requirements**: `cpt-site-fr-single-copy`, `cpt-site-fr-catalogue-routes`, `cpt-site-nfr-toolchain`

**Principles**: `cpt-site-principle-single-source`

**Constraints**: `cpt-site-constraint-site-own-project`, `cpt-site-constraint-toolchain`

**Components**: `cpt-site-component-site-assemble`, `cpt-site-component-site-app`

**ADRs**: `cpt-site-adr-composition-by-copy`

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-site-actor-site-developer` | Edits a package inside its template, composes the templates into the site, checks the site copy for drift, or keeps the composition running while editing |
| `cpt-site-actor-frontx-cli` | Applies the official templates to `site/` before composition; composition never touches the files it applies |
| `cpt-site-actor-template-consumer` | Copies the same claimed subtrees of a template into a project of their own |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md), sections 3.2 (site-assemble, site application), 4.3.1 (ownership of `site/` files), 4.3.3 (composition order), 4.7 (commands)
- **ADR**: [0002 composition by copy](../../ADR/0002-composition-by-copy.md)
- **Dependencies**: None

## 2. Actor Flows (CDSL)

**Use cases**: `cpt-site-usecase-change-screen`

### Compose the Templates Into the Site

- [x] `p1` - **ID**: `cpt-site-flow-template-composition-assemble`

**Actor**: `cpt-site-actor-site-developer`

**Success Scenarios**:
- Every claimed file is in the site at the template's content, the record lists exactly the claimed files, and the command reports how many files it wrote and removed.
- A file no template claims any more is removed from the site, and an emptied subtree goes with its build output and installs.

**Error Scenarios**:
- `site/` does not exist: nothing is written and the command fails.
- A subtree leaves its template or two templates claim the same file: nothing is written and the command names each conflict.
- A file inside a claimed subtree was not written by an earlier run: nothing is written and the command names the file.
- A template manifest cannot be read: the command fails with the reason and a hint instead of a stack trace.

**Steps**:
1. [x] - `p1` - Developer runs `npm run site:assemble` without a flag: the command composes once - `inst-run`
2. [x] - `p1` - **IF** `site/` does not exist: **RETURN** the error without writing - `inst-site-missing`
3. [x] - `p1` - Compute what the templates claim using `cpt-site-algo-template-composition-desired-state`; **IF** it reports errors: **RETURN** them without writing - `inst-desired`
4. [x] - `p1` - Read the assembly record of the previous run from `site/src-app/mfe_packages/.assembled.json` - `inst-read-record`
5. [x] - `p1` - **FOR EACH** file present in a claimed subtree that the record does not list: refuse to overwrite it when a template claims it, or ask to move it into its template or delete it otherwise; **IF** any is refused: **RETURN** the errors without writing - `inst-refuse`
6. [x] - `p1` - **FOR EACH** claimed file whose site copy is absent or differs by hash: copy it from its template with the source's file mode - `inst-copy`
7. [x] - `p1` - **FOR EACH** recorded file no template claims any more: remove it and every directory it leaves empty - `inst-remove-files`
8. [x] - `p1` - **FOR EACH** recorded subtree no template claims any more: remove it when it holds only ignored build output and installs - `inst-remove-subtrees`
9. [x] - `p1` - Write the assembly record: the claimed subtrees and the hash of every claimed file - `inst-write-record`
10. [x] - `p1` - **IF** the run returned errors: print each one and exit with code 1; otherwise print the counts of written and removed files and each removed path, and exit with code 0 - `inst-report`
11. [x] - `p1` - **CATCH** an exception of the run, such as a malformed manifest: print its message and a hint to fix the template, and exit with code 1 - `inst-catch`

### Check the Site Copy for Drift

- [x] `p1` - **ID**: `cpt-site-flow-template-composition-check`

**Actor**: `cpt-site-actor-site-developer`

**Success Scenarios**:
- The site copy equals the templates and the record: the command prints that it is in sync and exits with code 0.

**Error Scenarios**:
- A file differs, is missing, is unrecorded, is stale or is not in any template, or an entry of the composition directory is claimed by no template: the command names each path with its kind of drift and exits with code 1.

**Steps**:
1. [x] - `p1` - Developer runs `npm run site:assemble -- --check` - `inst-check-run`
2. [x] - `p1` - Compute the drift using `cpt-site-algo-template-composition-drift` - `inst-check-compute`
3. [x] - `p1` - Print every claim error and every drifted path with its kind - `inst-check-print`
4. [x] - `p1` - **IF** anything was printed: print that `site/` is out of sync with the hint to edit the template and compose, and exit with code 1 - `inst-check-fail`
5. [x] - `p1` - **RETURN** in sync, exit code 0 - `inst-check-pass`

### Re-compose on Template Edits

- [x] `p2` - **ID**: `cpt-site-flow-template-composition-watch`

**Actor**: `cpt-site-actor-site-developer`

**Success Scenarios**:
- After every edit inside a template, the site copy is composed again once the edits settle.

**Error Scenarios**:
- A composition fails (for example on a malformed manifest): the failure is printed and watching continues, so the next edit composes again.

**Steps**:
1. [x] - `p2` - Developer runs `npm run site:assemble -- --watch` - `inst-watch-run`
2. [x] - `p2` - Compose once, as the compose flow does - `inst-watch-initial`
3. [x] - `p2` - **FOR EACH** template directory: watch it recursively, and on a change outside the ignored directories compose again after a 200 ms quiet period - `inst-watch-templates`
4. [x] - `p2` - **RETURN** a stop function that cancels the pending run and closes every watcher - `inst-watch-stop`

## 3. Processes / Business Logic (CDSL)

### Discover the Templates

- [x] `p1` - **ID**: `cpt-site-algo-template-composition-discover`

**Input**: The repository root and the manifest filename (`frontx-template.json` by default; validate-templates passes the value the installed FrontX CLI exports).

**Output**: The template directories, sorted, and each template's parsed manifest on request.

**Steps**:
1. [x] - `p1` - **FOR EACH** top-level directory of the root except `node_modules`: keep it exactly when it holds the manifest file, whatever its name - `inst-find`
2. [x] - `p1` - **RETURN** the kept directories as absolute paths, sorted - `inst-return-dirs`
3. [x] - `p1` - Parse a template's manifest from its directory on request - `inst-read-manifest`

### Compute the Claimed Files

- [x] `p1` - **ID**: `cpt-site-algo-template-composition-desired-state`

**Input**: The repository root.

**Output**: Every claimed file as a site-relative path with its source, hash and template; the claimed subtrees; the claim errors.

**Steps**:
1. [x] - `p1` - **FOR EACH** template found with `cpt-site-algo-template-composition-discover`, **FOR EACH** subtree in its `ownershipBoundaries.exclusiveSubtrees`: normalize it to a relative path ending in `/` - `inst-normalize`
2. [x] - `p1` - **IF** the subtree leaves the template (a parent reference or an absolute path): record an error and skip it - `inst-leaves`
3. [x] - `p1` - **FOR EACH** file under the subtree, skipping installs, build and test output, the build caches and editor droppings: **IF** another template already claims the same site path, record an error; otherwise record its source, hash and template - `inst-claim-files`
4. [x] - `p1` - **RETURN** the claimed files, the distinct claimed subtrees sorted, and the errors - `inst-return-desired`

### Compute the Drift

- [x] `p1` - **ID**: `cpt-site-algo-template-composition-drift`

**Input**: The repository root.

**Output**: Every drifted site path with its kind, sorted; the claim errors.

**Steps**:
1. [x] - `p1` - Read the claimed files, the assembly record, and the files present in the site copy of every claimed or recorded subtree - `inst-drift-read`
2. [x] - `p1` - **FOR EACH** claimed file: report it as missing in the site, as differing from its template, or as not recorded - `inst-drift-claimed`
3. [x] - `p1` - **FOR EACH** present file no template claims: report it as claimed by no template when the record lists it, otherwise as in no template - `inst-drift-present`
4. [x] - `p1` - **FOR EACH** recorded file that is neither claimed nor present: report it as recorded but absent - `inst-drift-recorded`
5. [x] - `p1` - **FOR EACH** entry of `site/src-app/mfe_packages/` and of its `shared/` folder that no claimed subtree covers, the record itself and ignored names excepted: report it as an entry no template claims - `inst-drift-unclaimed`
6. [x] - `p1` - **RETURN** the drift sorted by path, and the claim errors - `inst-drift-return`

### Tell a Command Run From an Import

- [x] `p1` - **ID**: `cpt-site-algo-template-composition-entry-point`

**Input**: The calling module's address and the started script's path.

**Output**: Whether the module runs as the command.

**Steps**:
1. [x] - `p1` - **IF** no script was started: **RETURN** false - `inst-no-script`
2. [x] - `p1` - **RETURN** whether the module and the started script resolve to the same real path, symlinks resolved, falling back to the absolute path when a file cannot be resolved - `inst-compare-real`

## 4. States (CDSL)

### No Lifecycle to Model

Not applicable: the assembly record is rewritten whole on every run and has no lifecycle; composition is a stateless pass over the templates and the site.

## 5. Definitions of Done

### Screen Code Committed Once, Composed Into the Site

- [x] `p1` - **ID**: `cpt-site-dod-template-composition-single-copy`

The system **MUST** copy every subtree a template claims to the same path under `site/`, record each written file with its hash, remove what no template claims any more, refuse to overwrite a path it did not create, and never write outside the composed packages, the claimed tooling packages and the templates' AI bundles in `site/`.

**Implements**:
- `cpt-site-flow-template-composition-assemble`
- `cpt-site-algo-template-composition-desired-state`

**Constraints**: `cpt-site-constraint-site-own-project`

**Touches**:
- `scripts/site-assemble.mjs`
- `site/src-app/mfe_packages/.assembled.json` (written)

### Drift Named File by File

- [x] `p1` - **ID**: `cpt-site-dod-template-composition-drift-check`

The system **MUST** report, without writing, every difference between the templates and the site copy in both directions, naming each drifted file and its kind, and **MUST** exit with a non-zero code when there is any.

**Implements**:
- `cpt-site-flow-template-composition-check`
- `cpt-site-algo-template-composition-drift`

**Touches**:
- `scripts/site-assemble.mjs`

### Composition Follows Template Edits

- [x] `p2` - **ID**: `cpt-site-dod-template-composition-watch`

The system **MUST** compose again after template edits settle and **MUST** keep watching when a composition fails.

**Implements**:
- `cpt-site-flow-template-composition-watch`

**Touches**:
- `scripts/site-assemble.mjs`

### One Template Discovery and One Entry Check

- [x] `p1` - **ID**: `cpt-site-dod-template-composition-shared-modules`

The system **MUST** recognise a template by the presence of its manifest file only, through one discovery every repository script that walks templates uses, and **MUST** tell a command run from an import by a test through one entry check every repository script uses.

**Implements**:
- `cpt-site-algo-template-composition-discover`
- `cpt-site-algo-template-composition-entry-point`

**Touches**:
- `scripts/template-discovery.mjs`
- `scripts/entry-point.mjs`

## 6. Acceptance Criteria

- [x] Composing copies the claimed subtrees without installs and build output and records a hash per file; a second run writes nothing and a template edit is propagated (`scripts/site-assemble.test.mjs`: "copies claimed subtrees without node_modules and dist, and records sha256 per file", "is idempotent and propagates template edits").
- [x] A site copy edited by hand is restored; what no template claims any more is removed, and build output stays only while its subtree is claimed (`scripts/site-assemble.test.mjs`: "restores a site copy edited by hand", "removes what it created when no template claims it any more, and keeps build output only while claimed").
- [x] A path the composition did not create, a foreign file inside a claimed subtree and a path two templates claim are refused without writing; paths outside the claimed subtrees are left alone (`scripts/site-assemble.test.mjs`: "refuses to overwrite a path it did not create", "refuses a foreign file inside a claimed subtree", "reports a path two templates claim", "leaves paths outside the claimed subtrees alone").
- [x] The drift check is empty right after composing, reports drift both ways, reports every unclaimed entry of the composition directory, and exits non-zero naming the file (`scripts/site-assemble.test.mjs`: "is empty right after assembling", "reports drift both ways", "reports every entry of mfe_packages/ and shared/ that no template claims, except the state file", "returns non-zero for --check on drift and names the file").
- [x] A malformed manifest fails a run and the check with a clear message, and does not stop watching (`scripts/site-assemble.test.mjs`: "fails a run and --check with a clear message instead of a stack", "does not stop --watch, which re-assembles once the manifest is fixed").
- [x] Templates are found by manifest presence whatever their name, `node_modules` and plain files are ignored, and another manifest filename is accepted (`scripts/template-discovery.test.mjs`).
- [x] The entry check holds for the started script by its real path, a relative path or a path through a symlink, and does not hold for another script or without one (`scripts/entry-point.test.mjs`).
- [x] `npm run site:assemble -- --check` passes on the repository as committed.
