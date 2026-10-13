# PRD - template-site-brand

<!-- toc -->

- [1. Overview](#1-overview)
  - [1.1 Purpose](#11-purpose)
  - [1.2 Background / Problem Statement](#12-background--problem-statement)
  - [1.3 Goals (Business Outcomes)](#13-goals-business-outcomes)
  - [1.4 Glossary](#14-glossary)
- [2. Actors](#2-actors)
  - [2.1 Human Actors](#21-human-actors)
  - [2.2 System Actors](#22-system-actors)
- [3. Operational Concept & Environment](#3-operational-concept--environment)
  - [3.1 Module-Specific Environment Constraints](#31-module-specific-environment-constraints)
- [4. Scope](#4-scope)
  - [4.1 In Scope](#41-in-scope)
  - [4.2 Out of Scope](#42-out-of-scope)
- [5. Functional Requirements](#5-functional-requirements)
  - [5.1 Brand Source](#51-brand-source)
  - [5.2 Delivery](#52-delivery)
  - [5.3 Checks](#53-checks)
  - [5.4 Template Portability](#54-template-portability)
- [6. Non-Functional Requirements](#6-non-functional-requirements)
  - [6.1 NFR Inclusions](#61-nfr-inclusions)
  - [6.2 NFR Exclusions](#62-nfr-exclusions)
- [7. Public Library Interfaces](#7-public-library-interfaces)
  - [7.1 Public API Surface](#71-public-api-surface)
  - [7.2 External Integration Contracts](#72-external-integration-contracts)
- [8. Use Cases](#8-use-cases)
- [9. Acceptance Criteria](#9-acceptance-criteria)
- [10. Dependencies](#10-dependencies)
- [11. Assumptions](#11-assumptions)
- [12. Risks](#12-risks)

<!-- /toc -->

## 1. Overview

### 1.1 Purpose

template-site-brand is the template that delivers the brand of the FrontX site: the colours, display type, weights, tracking, radii, motifs, typeface, brand images and brand art (the drawings blocks place in their slots) that the site draws on top of the UI kit. One record holds every brand value next to the value the design reference (V2) uses and the reason for any difference; the token stylesheet and the theme variables are generated from it, and a check holds the record, the generated files and the rest of the site in agreement.

The template is an overlay a project copies: one package and one AI guideline. A project whose shell loads template packages' document entries gets the brand in its document and, through the shell's style adoption, in every screen.

### 1.2 Background / Problem Statement

The UI kit ships a neutral palette and leaves branding to the consumer by overriding its tokens. The site's brand values lived in two hand-kept copies (one for the shell, one appended by the site's own screens), with dead tokens, a hard-coded hover shade and no record of which values follow the design reference and which differ on purpose. Screens of other templates received the brand only through the shell's copy, and the kit's dark fallback leaked into light screens.

A brand in one record, delivered once through the document and checked mechanically, removes the copies, makes every deliberate difference from the design reference visible and keeps the site's text readable.

### 1.3 Goals (Business Outcomes)

- Every brand value exists in exactly one place; no other file of the site declares a brand token or a kit token the brand overrides.
- Every brand value carries its design-reference value, and every difference carries a written reason.
- Every recorded text and background pair keeps a contrast of at least 4.5:1 in the light and the dark appearance.
- A project developer can move the template into another project by copying two directories.

### 1.4 Glossary

| Term | Definition |
|------|------------|
| Kit token | A CSS custom property the UI kit's `theme.css` declares and its components read |
| Brand override | A brand value for a kit token, in the light appearance |
| Brand token | A `--site-*` custom property the kit does not declare (text shades, display type, weights, tracking, radii, motifs) |
| Brand record | `src/brand.json`, the single source of every brand value, its V2 value, reason and role |
| V2 | The design reference of the FrontX site, measured in a browser |
| Appearance | Light or dark; the kit declares one palette per appearance |
| Document entry | `src/document.css`, the stylesheet the shell loads into its document for this package |
| Head colours | `themeColor` and `backgroundColor` of the site config, written into the document head and the web manifest |

## 2. Actors

### 2.1 Human Actors

#### Visitor

**ID**: `cpt-template-site-brand-actor-visitor`

**Role**: Reads the site in a browser.
**Needs**: A consistent brand on every page and every screen, readable text, the site's typeface.

#### Site Developer

**ID**: `cpt-template-site-brand-actor-site-developer`

**Role**: Maintains the brand in the FrontX site repository: changes values, measures them against V2, runs the generator and the check.
**Needs**: One place to change a value, a record of the design reference, a check that fails on drift, dead tokens, unreadable pairs and copies.

#### Template Consumer

**ID**: `cpt-template-site-brand-actor-template-consumer`

**Role**: A project developer elsewhere who copies this template into a project and replaces the record with their own brand.
**Needs**: A self-contained package with documented prerequisites.

### 2.2 System Actors

#### Host Shell

**ID**: `cpt-template-site-brand-actor-host-shell`

**Role**: The template-shell application of the project: loads the kit's `theme.css` and every template package's document entry into its document, and carries the document's styles into each screen's shadow root.

#### UI Kit

**ID**: `cpt-template-site-brand-actor-ui-kit`

**Role**: `@gears-frontx/ui-kit`: declares the tokens and their light and dark palettes the brand overrides and reads.

#### AI Coding Agent

**ID**: `cpt-template-site-brand-actor-ai-agent`

**Role**: An AI agent that changes colours, type or fonts in a project carrying this template; reads the brand guideline first.

## 3. Operational Concept & Environment

### 3.1 Module-Specific Environment Constraints

- The package runs only in a project with template-shell applied, whose document entry loads `src-app/verify_packages/*/src/document.css` after the kit's `theme.css`.
- The generator and the check run under Node's TypeScript type stripping, with no build step; they read the kit stylesheet the project installs.
- The package installs the UI kit and the font at exact released versions, the versions the hosting project installs.

## 4. Scope

### 4.1 In Scope

- The brand record with its V2 values, reasons, roles, contrast pairs and head colours.
- The generated token stylesheet, theme variables and guideline token table.
- The typeface registration and the document entry.
- Brand images used inside pages.
- Brand art: the hairline figure family, the template figures, the application slab of the hero and the closing visual, the architecture figure, the change-story workbench and the chart art, each with its own palette.
- The brand check and its eight rules.
- The AI guideline.

### 4.2 Out of Scope

- Head assets (favicons, the share image): owned by the project root.
- Stamping the theme appearance on screens' shadow hosts: the shell's change.
- A dark brand palette: the kit's dark palette applies, with brand text resets.
- Kit component styles: kit differences are accepted as the kit ships them.

## 5. Functional Requirements

### 5.1 Brand Source

#### One brand record

- [x] `p1` - **ID**: `cpt-template-site-brand-fr-one-record`

The template **MUST** hold every brand value (light overrides of kit tokens, light brand tokens, dark resets, theme-invariant tokens, head colours) in one record, each value with its role, and **MUST** allow a row that records a design-reference value the site does not adopt.

**Rationale**: One place to change a value, and one place that shows what the brand is.

**Actors**: `cpt-template-site-brand-actor-site-developer`, `cpt-template-site-brand-actor-ai-agent`

#### Generated outputs

- [x] `p1` - **ID**: `cpt-template-site-brand-fr-generated-outputs`

The template **MUST** generate from the record the token stylesheet (light values under a selector that outranks the kit light palette on every light scope, dark resets on every dark scope, theme-invariant tokens on the document root), the complete light and dark theme variables, and the guideline's token table, and **MUST NOT** need any of them edited by hand.

**Rationale**: Generated files cannot drift from the record or from each other.

**Actors**: `cpt-template-site-brand-actor-site-developer`

#### Design reference record

- [x] `p1` - **ID**: `cpt-template-site-brand-fr-v2-record`

Every row of the record **MUST** carry the V2 value (or an explicit none when V2 has no counterpart), and every row whose value differs from V2 **MUST** carry a reason.

**Rationale**: Deliberate differences stay visible and reviewable; an unexplained difference is a defect.

**Actors**: `cpt-template-site-brand-actor-site-developer`

### 5.2 Delivery

#### Delivery through the document

- [x] `p1` - **ID**: `cpt-template-site-brand-fr-document-delivery`

The template **MUST** provide one document entry that brings the tokens and the typeface into the shell's document, and **MUST NOT** require any screen to import the brand.

**Rationale**: The shell carries the document's styles into every screen; one entry reaches every template without copies.

**Actors**: `cpt-template-site-brand-actor-host-shell`, `cpt-template-site-brand-actor-visitor`

#### Typeface

- [x] `p2` - **ID**: `cpt-template-site-brand-fr-typeface`

The template **MUST** register the self-hosted variable Inter (weights 100 to 900, Latin and Latin Extended) under the family name the kit's type tokens name.

**Rationale**: The kit names Inter and ships no font files; the design's in-between weights exist only in the variable font.

**Actors**: `cpt-template-site-brand-actor-visitor`

#### Theme variables for the registry

- [x] `p2` - **ID**: `cpt-template-site-brand-fr-theme-variables`

The template **MUST** export the complete light variable set (kit light palette with the brand overrides) and the dark set (kit dark palette), each with its appearance, in the theme registry's variable shape.

**Rationale**: When the theme registry reaches every scope, the brand moves into the light theme's variables with no new authoring.

**Actors**: `cpt-template-site-brand-actor-host-shell`

#### Brand assets

- [x] `p2` - **ID**: `cpt-template-site-brand-fr-brand-assets`

The template **MUST** export the brand images used inside pages as module files of the package.

**Rationale**: Page images belong with the brand and are bundled with the code that draws them.

**Actors**: `cpt-template-site-brand-actor-visitor`

#### Brand art

- [x] `p1` - **ID**: `cpt-template-site-brand-fr-brand-art`

The template **MUST** provide the site's drawings as components blocks place through content slots: a hairline figure family drawn by the site with the structure of the design reference's figures (no copy of its assets or script), the template figures, the hero art and the closing visual, the architecture figure with its labels and links as props, the change-story workbench and the chart art. Each **MUST** fill its slot with no outer layout of its own and declare its colours in a palette at the top of its stylesheet, light and, where it follows the page's theme, dark.

**Rationale**: Blocks stay layout-only with content-only props; a drawing and its palette change in one file.

**Actors**: `cpt-template-site-brand-actor-visitor`, `cpt-template-site-brand-actor-site-developer`

### 5.3 Checks

#### Contrast held

- [x] `p1` - **ID**: `cpt-template-site-brand-fr-contrast`

The record **MUST** list the background and text pairs the site draws together, and the check **MUST** fail on any pair under 4.5:1 that the brand touches, in the light appearance and for the dark resets.

**Rationale**: A brand change cannot leave a text colour unreadable on its background.

**Actors**: `cpt-template-site-brand-actor-visitor`, `cpt-template-site-brand-actor-site-developer`

#### Brand check

- [x] `p1` - **ID**: `cpt-template-site-brand-fr-brand-check`

The template **MUST** provide a check that fails when the generated files differ from the record, an override names no kit token or a brand token takes a kit name, a value breaks the create-theme value rules, a pair is under 4.5:1, a row lacks its V2 value or a reason, a brand token is read nowhere, a file outside the package declares a brand-owned token, or the site config's head colours differ from the record.

**Rationale**: Each rule closes a way the brand drifted before: copies, dead tokens, hard-coded hovers, unrecorded differences.

**Actors**: `cpt-template-site-brand-actor-site-developer`

### 5.4 Template Portability

#### Self-contained template

- [x] `p1` - **ID**: `cpt-template-site-brand-fr-self-contained`

The template **MUST** consist only of its package and its AI bundle, claim exactly those two subtrees and no shared file, and reference nothing outside them except the guideline its generator updates.

**Rationale**: The template moves between projects as an overlay.

**Actors**: `cpt-template-site-brand-actor-template-consumer`

#### AI guideline

- [x] `p2` - **ID**: `cpt-template-site-brand-fr-ai-guideline`

The template **MUST** ship a guideline that states the layering (kit, brand, art palettes), the token table with V2 values, the deliberate differences, how to add a value and what the check holds.

**Rationale**: Agents change colours and type in the projects that carry the template.

**Actors**: `cpt-template-site-brand-actor-ai-agent`

## 6. Non-Functional Requirements

### 6.1 NFR Inclusions

#### Text contrast

- [x] `p1` - **ID**: `cpt-template-site-brand-nfr-contrast`

Every recorded pair the brand touches **MUST** keep a WCAG contrast ratio of at least 4.5:1.

**Threshold**: ratio >= 4.5 for each pair, computed from resolved colours, `color-mix` included.

**Rationale**: Body text at the site's sizes needs 4.5:1.

#### Kit token conformance

- [x] `p1` - **ID**: `cpt-template-site-brand-nfr-kit-conformance`

Every brand value **MUST** satisfy the design guardrails' create-theme value rules: a full CSS colour, no colour fragments, a declared appearance, hover and alpha tokens derived with `color-mix`, no token re-wrapped in a colour function.

**Threshold**: zero violations reported by the check.

**Rationale**: A value the kit cannot consume renders as a broken component without an error.

#### Art accessibility

- [x] `p1` - **ID**: `cpt-template-site-brand-nfr-art-accessibility`

A drawing **MUST** be hidden from assistive technology unless it is given a name, a drawing that carries links or text **MUST** expose them as real links and text, and a text inside a drawing **MUST** keep 4.5:1 on its own surface in every appearance the drawing follows.

**Threshold**: zero axe violations (WCAG A and AA) per art component; contrast measured in the browser.

**Rationale**: Decoration must not add noise for screen readers; a map of links and a workbench of text are content.

### 6.2 NFR Exclusions

- Performance budgets: the brand is three small stylesheets and a font; the variable font is served by the project's build.
- Security and privacy: the package handles no data.
- Availability: the package has no runtime of its own beyond stylesheets.

## 7. Public Library Interfaces

### 7.1 Public API Surface

#### Package exports

- [x] `p1` - **ID**: `cpt-template-site-brand-interface-package-exports`

**Type**: npm package exports

**Stability**: experimental

**Description**: `./document.css` (the document entry), `./tokens.css`, `./font.css`, `./theme` (light and dark variable sets with their appearance), `./brand.json` (the record), `./assets/*` (brand images) and `./art/*` (one art component per entry).

**Breaking Change Policy**: a renamed or removed export or token is a template version bump.

#### Brand record format

- [x] `p2` - **ID**: `cpt-template-site-brand-interface-brand-record`

**Type**: Data format (`src/brand.json`)

**Stability**: experimental

**Description**: Sections `light` (appearance, overrides, tokens), `dark` (appearance, tokens), `invariant` (typed rows), `pairs` (light, dark) and `head` (themeColor, backgroundColor); each row with token, value, V2 value, reason and role.

**Breaking Change Policy**: template version bump on any change to the format.

#### Template overlay

- [x] `p2` - **ID**: `cpt-template-site-brand-interface-template-overlay`

**Type**: Data format (the template manifest and its two claimed subtrees)

**Stability**: experimental

**Description**: The package directory and the AI bundle directory as exclusive subtrees, no shared file.

**Breaking Change Policy**: template version bump on any change to a claimed subtree.

### 7.2 External Integration Contracts

#### Shell document entry

- [x] `p1` - **ID**: `cpt-template-site-brand-contract-shell-document-entry`

**Direction**: required from the host shell

**Protocol/Format**: the shell loads every `src-app/verify_packages/*/src/document.css` into its document after the kit's `theme.css`, and adopts the document's styles into each screen's shadow root

**Compatibility**: a site-side convention of the FrontX site's shell; template-shell has none of its own.

#### UI kit stylesheet

- [x] `p1` - **ID**: `cpt-template-site-brand-contract-ui-kit`

**Direction**: required from `@gears-frontx/ui-kit`

**Protocol/Format**: `theme.css` with the light palette on `:root, [data-theme='light']` and the dark palette on `[data-theme='dark']`

**Compatibility**: pinned to an exact kit release; the check fails when an overridden token leaves the kit.

#### Site config head colours

- [x] `p2` - **ID**: `cpt-template-site-brand-contract-site-config`

**Direction**: required from the project

**Protocol/Format**: `themeColor` and `backgroundColor` in the site config the project's metadata pipeline reads

**Compatibility**: the check compares them with the record.

## 8. Use Cases

#### Change a brand value

- [x] `p2` - **ID**: `cpt-template-site-brand-usecase-change-value`

**Actor**: `cpt-template-site-brand-actor-site-developer`

**Preconditions**:
- The project has the kit installed.

**Main Flow**:
1. The developer measures the V2 value and edits the row in the record (value, V2 value, reason when they differ).
2. The developer runs the generator; the token stylesheet, the theme variables and the guideline table are rewritten.
3. The developer runs the check; it passes.

**Postconditions**:
- The document and every screen draw the new value after a reload.

**Alternative Flows**:
- **The new value breaks a rule**: the check names the row and the rule; the developer fixes the row.

#### Check the brand

- [x] `p2` - **ID**: `cpt-template-site-brand-usecase-check-brand`

**Actor**: `cpt-template-site-brand-actor-site-developer`

**Preconditions**:
- The site is assembled.

**Main Flow**:
1. The developer (or the repository's lint) runs the check.
2. The check reads the record, the kit, the generated files, the project's sources and the site config, and runs the eight rules.

**Postconditions**:
- Exit code 0 and a one-line confirmation, or exit code 1 with one line per finding.

**Alternative Flows**:
- **No kit installed**: the check stops and asks for the kit stylesheet's path.

#### Apply the template to a project

- [x] `p2` - **ID**: `cpt-template-site-brand-usecase-apply-template`

**Actor**: `cpt-template-site-brand-actor-template-consumer`

**Preconditions**:
- The project has template-shell applied and loads template document entries.

**Main Flow**:
1. The consumer copies the package and the AI bundle.
2. The consumer installs dependencies, replaces the record with the project's brand and runs the generator.

**Postconditions**:
- The project's document and screens draw the project's brand.

**Alternative Flows**:
- **The shell has no document-entry convention**: the consumer imports `@gears-frontx/site-brand/document.css` once in the shell entry after the kit's `theme.css`.

## 9. Acceptance Criteria

- [ ] With the site assembled and installed, `brand:check` passes and reports one line per finding when a rule is broken.
- [ ] Home, a content page and one screen of each other template render with the brand values in the light appearance at 1440 and 390 pixels wide, identical to the measurements taken before the brand moved into this package.
- [ ] No file of the site outside this package declares a brand token or an overridden kit token.
- [ ] The package's unit tests and type check pass, and the template shape check accepts the template.
- [ ] Each art component renders, passes axe and keeps every colour in its palette; at 1440 and 390 pixels wide it takes the design reference's box in a slot of the reference's size.

## 10. Dependencies

| Dependency | Description | Criticality |
|------------|-------------|-------------|
| template-shell (applied in the project) with the document-entry convention | Loads the document entry; adopts document styles into screens | p1 |
| `@gears-frontx/ui-kit` `0.4.0` | The tokens and palettes the brand overrides and reads | p1 |
| `@fontsource-variable/inter` `5.3.0` | The variable Inter font files | p2 |
| `recharts` `3.10.1`, React `19.2.4` | The chart art's primitives; the art components' runtime | p2 |
| The project's site config | Head colours the check compares | p2 |

## 11. Assumptions

- The kit keeps declaring its light palette on `:root, [data-theme='light']` and its dark palette on `[data-theme='dark']`.
- The shell keeps carrying the document's styles into screens' shadow roots at mount.
- The shell stamps the site's appearance on screens' shadow hosts, so the document's light block matches each host.

## 12. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| A kit release renames or drops an overridden token | The override silently stops applying | Rule 2 of the check fails on any override the installed kit does not declare |
| A screen declares its own palette on its shadow host | The brand stops at that host | The host stamp makes the document's light block match the host from the outer tree; the check's one-source rule catches brand tokens declared elsewhere |
| The theme registry starts reaching every scope | Brand values are declared twice | The theme variables are generated from the same record; moving the overrides into the light theme is one switch |
