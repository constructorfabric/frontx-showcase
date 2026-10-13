# Feature: Brand Source and Generation


<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Change a Brand Value](#change-a-brand-value)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Load the Record](#load-the-record)
  - [Read the Kit](#read-the-kit)
  - [Render the Token Stylesheet](#render-the-token-stylesheet)
  - [Render the Theme Variables](#render-the-theme-variables)
  - [Render the Guideline Table](#render-the-guideline-table)
- [4. States (CDSL)](#4-states-cdsl)
  - [No Feature-Owned State Machine](#no-feature-owned-state-machine)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Brand Record and Its Outputs](#brand-record-and-its-outputs)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

- [x] `p1` - **ID**: `cpt-template-site-brand-featstatus-brand-source-and-generation`
## 1. Feature Context

- [x] `p1` - `cpt-template-site-brand-feature-brand-source-and-generation`

### 1.1 Overview

The brand record `src/brand.json`, the generator that turns it into the token stylesheet, the theme variables and the guideline's token table, and the document entry that brings the tokens and the typeface into the shell's document.

### 1.2 Purpose

Every brand value is written once with its V2 value and role; everything the browser, the theme registry and the guideline read is generated from it, and one document entry delivers it to every screen.

**Requirements**: `cpt-template-site-brand-fr-one-record`, `cpt-template-site-brand-fr-generated-outputs`, `cpt-template-site-brand-fr-document-delivery`, `cpt-template-site-brand-fr-typeface`, `cpt-template-site-brand-fr-theme-variables`, `cpt-template-site-brand-fr-brand-assets`, `cpt-template-site-brand-fr-self-contained`, `cpt-template-site-brand-fr-ai-guideline`

**Principles**: `cpt-template-site-brand-principle-one-record`, `cpt-template-site-brand-principle-kit-first`, `cpt-template-site-brand-principle-generated`, `cpt-template-site-brand-principle-document-delivery`

**Constraints**: `cpt-template-site-brand-constraint-host-prerequisites`, `cpt-template-site-brand-constraint-registry-reach`, `cpt-template-site-brand-constraint-light-only`, `cpt-template-site-brand-constraint-exact-pins`

**Components**: `cpt-template-site-brand-component-brand-record`, `cpt-template-site-brand-component-generator`, `cpt-template-site-brand-component-token-stylesheet`, `cpt-template-site-brand-component-theme-variables`, `cpt-template-site-brand-component-document-entry`, `cpt-template-site-brand-component-brand-assets`, `cpt-template-site-brand-component-template-packaging`

**Scope**: the record, `src/check/model.ts`, `src/check/generate.ts`, the generate command of `src/check/cli.ts`, the generated `src/tokens.css` and `src/theme.ts`, `src/document.css`, `src/font.css`, `src/assets/`, the template manifest and the AI bundle.

**Out of scope**: art components and palettes; head assets; the shell's entry convention, style adoption and appearance stamp.

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-site-brand-actor-site-developer` | Edits the record and runs the generator |
| `cpt-template-site-brand-actor-host-shell` | Loads the document entry and carries it into screens |
| `cpt-template-site-brand-actor-ui-kit` | Supplies the palettes the generator merges and the names the overrides target |
| `cpt-template-site-brand-actor-visitor` | Sees the brand on every page and screen |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md)
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.1
- **ADRs**: `cpt-template-site-brand-adr-brand-through-document`, `cpt-template-site-brand-adr-art-palettes-in-art`
- **Interface**: `cpt-template-site-brand-interface-package-surface`
- **Sequences**: `cpt-template-site-brand-seq-change-value`, `cpt-template-site-brand-seq-document-load`
- **Dependencies**: None

## 2. Actor Flows (CDSL)

**Use cases**: `cpt-template-site-brand-usecase-change-value`, `cpt-template-site-brand-usecase-apply-template`

### Change a Brand Value

- [x] `p1` - **ID**: `cpt-template-site-brand-flow-brand-source-and-generation-change-value`

**Actor**: `cpt-template-site-brand-actor-site-developer`

**Success Scenarios**:
- The developer edits a row and runs `generate`; the stylesheet, the theme variables and the guideline table are rewritten.

**Error Scenarios**:
- The record is malformed: `generate` stops with every shape error and writes nothing.
- No kit is installed for the project: `generate` stops and asks for `--kit`.

**Steps**:
1. [x] - `p1` - Read the record (algorithm Load the Record) and the installed kit stylesheet (algorithm Read the Kit) - `inst-read-record`
2. [x] - `p1` - Write `src/tokens.css` (algorithm Render the Token Stylesheet) and `src/theme.ts` (algorithm Render the Theme Variables) - `inst-write-outputs`
3. [x] - `p1` - **IF** the guideline exists in the AI bundle, replace its token table (algorithm Render the Guideline Table); **RETURN** the written paths - `inst-write-table`

## 3. Processes / Business Logic (CDSL)

### Load the Record

- [x] `p1` - **ID**: `cpt-template-site-brand-algo-brand-source-and-generation-load-record`

**Input**: The text of `src/brand.json`

**Output**: The brand record, or an error listing every shape error

**Steps**:
1. [x] - `p1` - Parse the JSON and start an empty error list - `inst-parse-record`
2. [x] - `p1` - Check every section: rows with a custom-property name, a value (string, or null for a V2 value not adopted, never null for a brand token), a role, a type on theme-invariant rows, no repeated token; every dark row resets a light brand token; pairs are two-token lists per appearance; both head colours have a value and a role - `inst-check-rows`
3. [x] - `p1` - **IF** any error, fail with all of them; **ELSE RETURN** the record - `inst-return-record`

### Read the Kit

- [x] `p1` - **ID**: `cpt-template-site-brand-algo-brand-source-and-generation-read-kit`

**Input**: The installed kit `theme.css`

**Output**: The light and dark palettes in declaration order, and every name the kit declares

**Steps**:
1. [x] - `p1` - Drop comments, group declarations by normalized selector, and take the `:root, [data-theme='light']` and `[data-theme='dark']` blocks; fail when either is missing - `inst-kit-blocks`
2. [x] - `p1` - **RETURN** both palettes and the set of every custom property declared in any block - `inst-kit-names`

### Render the Token Stylesheet

- [x] `p1` - **ID**: `cpt-template-site-brand-algo-brand-source-and-generation-render-tokens`

**Input**: The record

**Output**: The text of `src/tokens.css`

**Steps**:
1. [x] - `p1` - Start with a header naming the record as the source and the generator as the only writer - `inst-tokens-header`
2. [x] - `p1` - Declare the adopted light overrides, then the light brand tokens, each after its role as a comment, under `:root:not([data-theme='dark'])` and `[data-theme='light']:not([data-theme='dark'])` - `inst-tokens-light`
3. [x] - `p1` - Declare the dark resets under `[data-theme='dark']` - `inst-tokens-dark`
4. [x] - `p1` - Declare the theme-invariant tokens under `:root` and **RETURN** the text - `inst-tokens-invariant`

### Render the Theme Variables

- [x] `p1` - **ID**: `cpt-template-site-brand-algo-brand-source-and-generation-render-theme`

**Input**: The record and the kit palettes

**Output**: The text of `src/theme.ts`

**Steps**:
1. [x] - `p1` - Copy the kit light palette and replace each overridden token with its adopted value, keeping the kit's order - `inst-merge-light`
2. [x] - `p1` - **RETURN** a module exporting the light set, the kit dark set, and both with their appearance - `inst-render-module`

### Render the Guideline Table

- [x] `p2` - **ID**: `cpt-template-site-brand-algo-brand-source-and-generation-render-table`

**Input**: The record; the guideline text

**Output**: The guideline with its token table replaced

**Steps**:
1. [x] - `p2` - Render one table per section (light overrides, light brand tokens, dark resets, theme-invariant tokens) and one for the head colours, each row with our value (or "not adopted"), the V2 value and the role with the reason - `inst-table-rows`
2. [x] - `p2` - Replace the text between the guideline's start and end markers; fail when the markers are missing - `inst-table-splice`

## 4. States (CDSL)

### No Feature-Owned State Machine

Not applicable. The record and its outputs are files; generation is a pure function of the record and the kit.

## 5. Definitions of Done

### Brand Record and Its Outputs

- [x] `p1` - **ID**: `cpt-template-site-brand-dod-brand-source-and-generation-record`

The system **MUST** hold every brand value in `src/brand.json` with its V2 value and role, generate `src/tokens.css`, `src/theme.ts` and the guideline's token table from it, and deliver the tokens and the variable Inter through `src/document.css`, with the lockup logo exported from `src/assets/`.

**Implements**:
- `cpt-template-site-brand-flow-brand-source-and-generation-change-value`
- `cpt-template-site-brand-algo-brand-source-and-generation-load-record`
- `cpt-template-site-brand-algo-brand-source-and-generation-read-kit`
- `cpt-template-site-brand-algo-brand-source-and-generation-render-tokens`
- `cpt-template-site-brand-algo-brand-source-and-generation-render-theme`
- `cpt-template-site-brand-algo-brand-source-and-generation-render-table`

**Constraints**: `cpt-template-site-brand-constraint-registry-reach`, `cpt-template-site-brand-constraint-light-only`, `cpt-template-site-brand-constraint-exact-pins`

**Touches**:
- Files: `src/brand.json`, `src/tokens.css`, `src/theme.ts`, `src/document.css`, `src/font.css`, `src/assets/`
- Entities: Brand row, Palette, Head row, Kit palette

## 6. Acceptance Criteria

- [x] `generate` over the record and the installed kit writes a stylesheet with the light block under the two-condition selector, the dark resets and the theme-invariant block, and rows not adopted are absent.
- [x] The theme variables carry the kit light palette with the overrides applied, in kit order, and the kit dark palette, each with its appearance.
- [x] The guideline's token table lists every row with our value, the V2 value and the reason, and nothing outside its markers changes.
- [x] `document.css` imports the token and font stylesheets; the font registers the variable Inter, Latin and Latin Extended, weights 100 to 900, under the family name `Inter`.

**Test scenarios** (Vitest, in the package):
- `src/check/generate.test.ts`: light selector and skipped rows; dark resets and theme-invariant block; header and stability; theme variables merge and order; dark palette and appearances; guideline table rows and splice.
- `src/check/record.test.ts`: the shipped record follows the value rules and records V2 everywhere; the shipped stylesheet equals the generated one; with a kit installed, kit names, contrast and the shipped theme variables.
