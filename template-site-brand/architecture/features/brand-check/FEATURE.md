# Feature: Brand Check


<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Run the Brand Check](#run-the-brand-check)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Collect Sources](#collect-sources)
  - [Resolve a Colour](#resolve-a-colour)
  - [Run Every Rule](#run-every-rule)
  - [Rule 1: Generated Files](#rule-1-generated-files)
  - [Rule 2: Kit Names](#rule-2-kit-names)
  - [Rule 3: Value Rules](#rule-3-value-rules)
  - [Rule 4: Contrast](#rule-4-contrast)
  - [Rule 5: V2 Record](#rule-5-v2-record)
  - [Rule 6: Use](#rule-6-use)
  - [Rule 7: One Source](#rule-7-one-source)
  - [Rule 8: Head Colours](#rule-8-head-colours)
- [4. States (CDSL)](#4-states-cdsl)
  - [No Feature-Owned State Machine](#no-feature-owned-state-machine)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Eight Rules](#eight-rules)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

- [x] `p1` - **ID**: `cpt-template-site-brand-featstatus-brand-check`
## 1. Feature Context

- [x] `p1` - `cpt-template-site-brand-feature-brand-check`

### 1.1 Overview

`node src/check/cli.ts check`: reads the record, the installed kit, the generated files, the guideline, the project's style and script sources and the site config, runs eight rules and reports one line per finding.

### 1.2 Purpose

Each rule closes a way the brand drifted: hand-edited outputs, overrides of tokens the kit no longer has, values the kit cannot consume, unreadable pairs, unrecorded differences from V2, dead tokens, copies of brand values and head colours that disagree with the brand.

**Requirements**: `cpt-template-site-brand-fr-v2-record`, `cpt-template-site-brand-fr-contrast`, `cpt-template-site-brand-fr-brand-check`, `cpt-template-site-brand-nfr-contrast`, `cpt-template-site-brand-nfr-kit-conformance`

**Principles**: `cpt-template-site-brand-principle-one-record`, `cpt-template-site-brand-principle-generated`

**Constraints**: `cpt-template-site-brand-constraint-exact-pins`

**Components**: `cpt-template-site-brand-component-brand-check`

**Scope**: the check command of `src/check/cli.ts`, `src/check/rules.ts`, `src/check/color.ts`, `src/check/sources.ts`.

**Out of scope**: art palettes and hex literals elsewhere (the repository's style policy); contrast on rendered pages (the design guardrails' runtime checker).

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-site-brand-actor-site-developer` | Runs the check, directly or through the repository's lint |
| `cpt-template-site-brand-actor-ui-kit` | Supplies the names and palettes the rules compare with |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md)
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.2
- **ADRs**: `cpt-template-site-brand-adr-brand-through-document`
- **Sequences**: `cpt-template-site-brand-seq-check-brand`
- **Dependencies**: `cpt-template-site-brand-feature-brand-source-and-generation`

## 2. Actor Flows (CDSL)

**Use cases**: `cpt-template-site-brand-usecase-check-brand`

### Run the Brand Check

- [x] `p1` - **ID**: `cpt-template-site-brand-flow-brand-check-run`

**Actor**: `cpt-template-site-brand-actor-site-developer`

**Success Scenarios**:
- Every rule passes: exit code 0 and one confirmation line.

**Error Scenarios**:
- A rule finds a defect: one line per finding, exit code 1.
- An unknown option or command: usage, exit code 2.
- No kit installed for the project: a request for `--kit`, exit code 1.

**Steps**:
1. [x] - `p1` - Read the command and the options `--project` (default: the project the package sits in), `--kit`, `--config` and `--scan` (repeatable, default `<project>/src-app`); fail with the usage on anything else - `inst-parse-options`
2. [x] - `p1` - Locate the kit stylesheet: the option, else the project's installed `@gears-frontx/ui-kit/theme.css`, else fail asking for `--kit` - `inst-locate-kit`
3. [x] - `p1` - Read the record, the kit, the generated files, the guideline when present, the site config (the option, else `site.config.json` in the project or its parent) and the sources (algorithm Collect Sources, this package excluded), plus the package's own `src/art/` as art sources for Rule 6 only - `inst-read-inputs`
4. [x] - `p1` - Run every rule (algorithm Run Every Rule) against the files and the outputs regenerated in memory - `inst-run-rules`
5. [x] - `p1` - Print one line per finding, or one confirmation line, and **RETURN** exit code 0 when there is none, else 1 - `inst-report`

## 3. Processes / Business Logic (CDSL)

### Collect Sources

- [x] `p1` - **ID**: `cpt-template-site-brand-algo-brand-check-collect-sources`

**Input**: Root directories, excluded directories, a base directory for relative paths

**Output**: The style and script sources, sorted by path

**Steps**:
1. [x] - `p1` - Walk each root (failing on a missing one), skipping excluded directories, `node_modules`, `dist`, `coverage` and `.vite`; read every `.css`, `.ts`, `.tsx`, `.js`, `.jsx` and `.mjs` file that is not a test - `inst-walk`
2. [x] - `p1` - **RETURN** them sorted by their path relative to the base - `inst-sorted`

### Resolve a Colour

- [x] `p1` - **ID**: `cpt-template-site-brand-algo-brand-check-resolve-colour`

**Input**: A colour value and a palette of token values

**Output**: The `#rrggbb` it renders, or an error

**Steps**:
1. [x] - `p1` - **IF** the value is a 3 or 6 digit hex colour, **RETURN** it normalized - `inst-resolve-hex`
2. [x] - `p1` - **IF** it is `var(--name)`, fail on a missing token or a cycle, else **RETURN** the token's value resolved - `inst-resolve-var`
3. [x] - `p1` - **IF** it is `color-mix(in oklab, a [p%], b [q%])`, resolve both operands and mix them; **ELSE** fail: the value cannot be resolved - `inst-resolve-mix`
4. [x] - `p1` - Mix in oklab: convert both colours to oklab, interpolate each channel by the first operand's share, convert back and round - `inst-mix-oklab`
5. [x] - `p1` - The contrast ratio of two colours is (lighter luminance + 0.05) / (darker luminance + 0.05), with WCAG relative luminance - `inst-contrast`

### Run Every Rule

- [x] `p1` - **ID**: `cpt-template-site-brand-algo-brand-check-run-rules`

**Input**: The record, the kit, the generated files with their expected text, the sources, the site config

**Output**: Every finding, in rule order

**Steps**:
1. [x] - `p1` - **RETURN** the findings of rules 1 to 8, concatenated - `inst-all-rules`

### Rule 1: Generated Files

- [x] `p1` - **ID**: `cpt-template-site-brand-algo-brand-check-generated`

**Input**: The token stylesheet, the theme variables and the guideline, each with the text generated now

**Output**: Findings

**Steps**:
1. [x] - `p1` - **FOR EACH** file present, report it when it differs from the generated text, naming `brand:generate` - `inst-compare-generated`

### Rule 2: Kit Names

- [x] `p1` - **ID**: `cpt-template-site-brand-algo-brand-check-kit-names`

**Input**: The record and the kit's names

**Output**: Findings

**Steps**:
1. [x] - `p1` - Report every override whose token the kit does not declare - `inst-overrides-in-kit`
2. [x] - `p1` - Report every brand token whose name the kit declares - `inst-tokens-not-in-kit`

### Rule 3: Value Rules

- [x] `p1` - **ID**: `cpt-template-site-brand-algo-brand-check-value-rules`

**Input**: The record

**Output**: Findings

**Steps**:
1. [x] - `p1` - Report a light palette whose appearance is not `light` and a dark palette whose appearance is not `dark` - `inst-appearance`
2. [x] - `p1` - **FOR EACH** adopted value and head colour: report a colour fragment, and a colour row whose value is not a full CSS colour - `inst-full-colour`
3. [x] - `p1` - Report a colour with a literal alpha, and a `-hover` token not derived with `color-mix(in oklab, var(<base>) ...)` - `inst-derived`
4. [x] - `p1` - Report a token re-wrapped in a colour function - `inst-no-rewrap`

### Rule 4: Contrast

- [x] `p1` - **ID**: `cpt-template-site-brand-algo-brand-check-contrast`

**Input**: The record and the kit palettes

**Output**: Findings

**Steps**:
1. [x] - `p1` - Build the light palette (kit light with the adopted light rows) and the dark palette (kit dark with the dark resets) - `inst-palettes`
2. [x] - `p1` - **FOR EACH** recorded pair of an appearance where the brand declares a side or a side is unknown: resolve both (algorithm Resolve a Colour) and report a ratio under 4.5:1 or an unresolvable side - `inst-pair-ratio`

### Rule 5: V2 Record

- [x] `p1` - **ID**: `cpt-template-site-brand-algo-brand-check-v2-record`

**Input**: The record

**Output**: Findings

**Steps**:
1. [x] - `p1` - **FOR EACH** row and head colour: report a missing V2 value - `inst-has-v2`
2. [x] - `p1` - Compare our value and the V2 value normalized (hex to lower-case six digits, rem to px, spacing); report a difference, a value not adopted or a V2 value of none without a reason - `inst-reason`

### Rule 6: Use

- [x] `p1` - **ID**: `cpt-template-site-brand-algo-brand-check-use`

**Input**: The record, the sources and the art sources

**Output**: Findings

**Steps**:
1. [x] - `p1` - Collect every `var(--name)` read in the sources and the art sources, comments dropped - `inst-collect-reads`
2. [x] - `p1` - Report every light brand token and theme-invariant token no source reads - `inst-unread`

### Rule 7: One Source

- [x] `p1` - **ID**: `cpt-template-site-brand-algo-brand-check-one-source`

**Input**: The record and the sources

**Output**: Findings

**Steps**:
1. [x] - `p1` - **FOR EACH** source line, comments dropped: report a declaration (CSS `--name:` or a quoted `'--name':` key) of a brand token or an adopted override, with the path and the line - `inst-find-declarations`

### Rule 8: Head Colours

- [x] `p1` - **ID**: `cpt-template-site-brand-algo-brand-check-head`

**Input**: The record and the site config

**Output**: Findings

**Steps**:
1. [x] - `p1` - **IF** there is no site config, report it - `inst-head-config`
2. [x] - `p1` - Report `themeColor` and `backgroundColor` when they differ from the record, hex compared normalized - `inst-head-compare`

## 4. States (CDSL)

### No Feature-Owned State Machine

Not applicable. The check reads files and reports; it keeps nothing between runs.

## 5. Definitions of Done

### Eight Rules

- [x] `p1` - **ID**: `cpt-template-site-brand-dod-brand-check-rules`

The system **MUST** provide `check`, which runs the eight rules over the record, the installed kit, the generated files, the guideline, the project's sources outside the package and the site config, reports every finding with its token or path and line, and exits 0 only when there is none.

**Implements**:
- `cpt-template-site-brand-flow-brand-check-run`
- `cpt-template-site-brand-algo-brand-check-collect-sources`
- `cpt-template-site-brand-algo-brand-check-resolve-colour`
- `cpt-template-site-brand-algo-brand-check-run-rules`
- `cpt-template-site-brand-algo-brand-check-generated`
- `cpt-template-site-brand-algo-brand-check-kit-names`
- `cpt-template-site-brand-algo-brand-check-value-rules`
- `cpt-template-site-brand-algo-brand-check-contrast`
- `cpt-template-site-brand-algo-brand-check-v2-record`
- `cpt-template-site-brand-algo-brand-check-use`
- `cpt-template-site-brand-algo-brand-check-one-source`
- `cpt-template-site-brand-algo-brand-check-head`

**Constraints**: `cpt-template-site-brand-constraint-exact-pins`

**Touches**:
- Files: `src/brand.json`, `src/tokens.css`, `src/theme.ts`, the guideline, the project's sources, the site config
- Entities: Brand row, Contrast pair, Kit palette

## 6. Acceptance Criteria

- [x] On a conforming project every rule passes; a copy broken for one rule fails that rule with a line naming the token, or the path and line.
- [x] Every recorded pair the brand touches keeps 4.5:1 in its appearance, `color-mix` values resolved in oklab.
- [x] A source declaring a brand token outside the package is reported with its path and line; reads and comments are not.

**Test scenarios** (Vitest, in the package):
- `src/check/rules.test.ts`: the conforming fixture passes; per rule a broken copy fails (hand-edited outputs and guideline; unknown override and kit-named brand token; fragment, non-colour, literal alpha, literal hover, re-wrap, wrong appearance; light and dark pairs under 4.5:1 and an unresolvable pair; missing reason, missing V2 value, head colour; unread tokens, and a token read only in the package art counts as read; declarations in CSS and TSX; missing and differing head colours).
- `src/check/color.test.ts`: hex normalisation, contrast, oklab mixing, `var()` and `color-mix` resolution, unresolvable values and cycles.
- `src/check/sources.test.ts`: the walk skips tests, installs, build output and the excluded package; a missing root fails.
