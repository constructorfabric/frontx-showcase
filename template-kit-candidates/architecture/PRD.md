# PRD - template-kit-candidates

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
  - [5.1 Typography and Links](#51-typography-and-links)
  - [5.2 Code and Description](#52-code-and-description)
  - [5.3 Template Portability](#53-template-portability)
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

template-kit-candidates delivers the components that two proposed pull requests to the FrontX UI kit add, before the kit releases them: headings and text on the kit's type ramp, an inline link, visually hidden text, a code block with a copy action, a description list, and an element choice on the kit's card and title parts. Each candidate has exactly the name and the props its pull request proposes, so screens use it as a kit component today and switch to the kit by changing one import specifier when the kit releases it.

The template is an overlay a project copies: one workspace package and one AI bundle. It contributes no screen.

### 1.2 Background / Problem Statement

The FrontX site builds its pages from UI kit components first. The kit defines a complete type ramp but no component that applies it, no link that sits inside a sentence, no public visually hidden text, no code block, no description list, and its card and title parts always render a `div`. Every template of the site therefore wrote its own heading, text, link, code frame and definition list recipes, each a copy that drifts from the ramp and the kit's focus rules in its own way.

The generic parts belong in the kit; the site proposes them upstream. Until a kit release carries them, they need one home in the site that has the proposed API, so that no template invents a variant of its own and the release costs an import change rather than a migration.

### 1.3 Goals (Business Outcomes)

- One copy of each missing primitive in the site, used by every template that needs it, with zero local copies elsewhere.
- Each candidate's names and props equal the proposed kit pull request, so the kit release changes import specifiers only.
- Every candidate passes the kit's accessibility checks (axe, WCAG A and AA) in its own tests.
- The whole template is removed in one change when the kit releases the components.

### 1.4 Glossary

| Term | Definition |
|------|------------|
| Kit | `@gears-frontx/ui-kit`, the FrontX UI kit: React components on Base UI, CSS Modules on semantic tokens |
| Candidate | A component this template delivers that a proposed kit pull request adds, with that pull request's API |
| Pull request A | The proposed kit change that adds `Heading`, `Text`, `Link`, `VisuallyHidden` and the `sr-only` utility |
| Pull request B | The proposed kit change that adds `CodeBlock`, `DescriptionList`, and `render` on `Card`, `CardTitle`, `EmptyTitle` and `AlertTitle` |
| Type ramp | The kit's typography roles (display, heading-1, heading-2, body, label, meta, mono, micro), each a set of `--text-<role>-*` tokens |
| Contract overlay | The hand-written half of a kit component contract (`<name>.contract.yaml`): intent, typical uses, alternatives, invariants, examples |
| Consumer | A screen package or the shell code that imports a candidate |

## 2. Actors

### 2.1 Human Actors

#### Visitor

**ID**: `cpt-template-kit-candidates-actor-visitor`

**Role**: Reads and operates the pages built with the candidates, with a mouse, a keyboard or assistive technology.
**Needs**: Headings in a correct outline, links that look and focus like links, code that can be copied and scrolled from the keyboard, name and value pairs announced together.

#### Template Author

**ID**: `cpt-template-kit-candidates-actor-template-author`

**Role**: Builds screens and blocks of the site's templates from kit components and candidates.
**Needs**: The missing primitives with the kit's conventions and documentation, in one place, so no screen writes its own.

#### Kit Maintainer

**ID**: `cpt-template-kit-candidates-actor-kit-maintainer`

**Role**: Reviews the proposed kit pull requests and releases the kit.
**Needs**: Candidates that already follow the kit's folder layout, recipes, tokens and contract overlays, as a working reference for the proposal.

### 2.2 System Actors

#### AI Coding Agent

**ID**: `cpt-template-kit-candidates-actor-ai-agent`

**Role**: An AI agent working in a project that carries this template; reads the template's guideline and the components' cards before using or changing them.

## 3. Operational Concept & Environment

### 3.1 Module-Specific Environment Constraints

- The package runs only in a project with template-shell applied: the shell's `src-app/verify_packages/*` workspace root installs, type-checks and tests it, and the consumer's build bundles its source.
- The package is source only (TypeScript and CSS Modules) and has no build of its own.
- The kit's token stylesheet must be loaded wherever a candidate renders, as it must for any kit component.

## 4. Scope

### 4.1 In Scope

- The components of pull request A: `Heading`, `Text`, `Link`, `VisuallyHidden` and the `sr-only` utility class.
- The components of pull request B: `CodeBlock` and its header, title and copy button; `DescriptionList` and its item, term and details parts; `render` on `Card`, `CardTitle`, `EmptyTitle` and `AlertTitle`.
- A card, a contract overlay, a unit test with axe and a contract test per component, in the kit's folder layout.
- One AI guideline: what is here, how to use it, how to release.

### 4.2 Out of Scope

- Any prop, variant or component the two pull requests do not propose (layout primitives, a skip link, axis additions on other kit components).
- Syntax highlighting in the code block.
- Brand display sizes: they are brand token overrides of the ramp, delivered by the site's brand template.
- The compiled contract JSON and the kit's contract freshness suite, which run in the kit repository.
- Sending the pull requests: that is the owner's decision per item.

## 5. Functional Requirements

### 5.1 Typography and Links

#### Headings and text on the type ramp

- [x] `p1` - **ID**: `cpt-template-kit-candidates-fr-ramp-text`

The package **MUST** provide `Heading` with the sizes display, heading-1 and heading-2, and `Text` with the variants body, label, meta, mono and micro and the tones default and muted, each setting its role only from the kit's ramp tokens, with zero margin, and each letting the caller choose the rendered element apart from the role.

**Rationale**: Templates write the same heading and text recipes again and again; one part per role keeps every copy on the ramp, and a separate element choice keeps the document outline correct.

**Actors**: `cpt-template-kit-candidates-actor-template-author`, `cpt-template-kit-candidates-actor-visitor`

#### Inline link

- [x] `p1` - **ID**: `cpt-template-kit-candidates-fr-inline-link`

The package **MUST** provide `Link`, an anchor that inherits the font of its line, with the variants default, muted and inherit, a keyboard focus outline on the kit's ring token, an element choice for the application's router link, and an `external` flag that opens a new tab safely and appends an arrow hidden from assistive technology.

**Rationale**: The kit's button link variant carries a control's height and padding into a line of text, so every template wrote its own inline link.

**Actors**: `cpt-template-kit-candidates-actor-template-author`, `cpt-template-kit-candidates-actor-visitor`

#### Visually hidden text

- [x] `p1` - **ID**: `cpt-template-kit-candidates-fr-visually-hidden`

The package **MUST** provide `VisuallyHidden`, whose text stays in the accessibility tree while the box is one pixel and clipped, with an element choice, and the same rule as the global `sr-only` class for markup that is not React.

**Rationale**: The rule is copied into many component and screen modules; one public copy ends that.

**Actors**: `cpt-template-kit-candidates-actor-template-author`, `cpt-template-kit-candidates-actor-visitor`

### 5.2 Code and Description

#### Code block with a copy action

- [x] `p1` - **ID**: `cpt-template-kit-candidates-fr-code-block`

The package **MUST** provide `CodeBlock`, which shows a given code string verbatim in a frame on kit tokens with an optional header and title, makes a non-wrapping block a named region reachable from the keyboard, and provides `CodeBlockCopyButton`, which writes the code to the clipboard, confirms the copy for a set time, announces it once and reports a failure to the caller.

**Rationale**: Guides and package lists show commands; the kit has no part for a code frame that the application places on a screen.

**Actors**: `cpt-template-kit-candidates-actor-template-author`, `cpt-template-kit-candidates-actor-visitor`

#### Description list

- [x] `p1` - **ID**: `cpt-template-kit-candidates-fr-description-list`

The package **MUST** provide `DescriptionList` with item, term and details parts on real description list elements, in a vertical and a horizontal orientation (terms aligned in one column), in two sizes, and a mono variant for values.

**Rationale**: Detail panels built their pairs from `div`s, which loses the term-to-value relation for assistive technology.

**Actors**: `cpt-template-kit-candidates-actor-template-author`, `cpt-template-kit-candidates-actor-visitor`

#### Element choice on the card and title parts

- [x] `p1` - **ID**: `cpt-template-kit-candidates-fr-render-on-parts`

The package **MUST** provide `Card`, `CardTitle`, `EmptyTitle` and `AlertTitle` under the kit's names that render exactly the kit's markup without `render`, and with `render` put the kit's classes on the given element; a card whose root is a link or a button **MUST** show a hover border and a keyboard focus ring, and a title rendered as a heading **MUST** keep the kit's title look.

**Rationale**: A card that navigates as a whole and a title that is a real heading had no kit form; templates wrapped cards in anchors and restyled them.

**Actors**: `cpt-template-kit-candidates-actor-template-author`, `cpt-template-kit-candidates-actor-visitor`

### 5.3 Template Portability

#### Equal to the proposed kit API

- [x] `p1` - **ID**: `cpt-template-kit-candidates-fr-proposed-api`

Each candidate **MUST** have exactly the export names, props, defaults and folder layout its kit pull request proposes, and the package **MUST** export nothing else.

**Rationale**: The kit release must cost an import-specifier change, never a migration.

**Actors**: `cpt-template-kit-candidates-actor-kit-maintainer`, `cpt-template-kit-candidates-actor-template-author`

#### Self-contained template, deleted on release

- [x] `p1` - **ID**: `cpt-template-kit-candidates-fr-self-contained`

The template **MUST** consist only of its package and its AI bundle, claim exactly those two subtrees, reference nothing outside them, and ship a guideline that states the components, the rules of use and the release step.

**Rationale**: The template moves between projects as an overlay and is removed whole when the kit releases the components.

**Actors**: `cpt-template-kit-candidates-actor-template-author`, `cpt-template-kit-candidates-actor-ai-agent`

## 6. Non-Functional Requirements

### 6.1 NFR Inclusions

#### Accessible by construction

- [x] `p1` - **ID**: `cpt-template-kit-candidates-nfr-accessible`

Every candidate **MUST** render with no axe violation of the WCAG A and AA rules in its unit tests, and every focusable candidate **MUST** draw a visible keyboard focus state, also under forced colours.

**Threshold**: zero axe violations per component test; a focus rule and a forced-colours rule for every focusable part.

**Rationale**: The candidates are used across the site; a defect in one repeats on every page.

#### Kit tokens only

- [x] `p1` - **ID**: `cpt-template-kit-candidates-nfr-tokens-only`

Every candidate **MUST** take its colours, type, radii, spacing and motion only from the kit's tokens, with no colour literal, and **MUST NOT** use a utility-class styling framework.

**Threshold**: zero colour literals in the package's stylesheets; zero utility-class framework imports.

**Rationale**: A kit or brand token change reaches every candidate without editing it, as it reaches kit components.

### 6.2 NFR Exclusions

- Performance budgets: the components render static markup; the copy button holds one timer.
- Security and privacy: the copy button writes only the code it was given to the clipboard, on a user action.
- Server rendering: the parts that use the render hook carry the client boundary banner, as the kit's comparable parts do.

## 7. Public Library Interfaces

### 7.1 Public API Surface

#### Package exports

- [x] `p1` - **ID**: `cpt-template-kit-candidates-interface-package-exports`

**Type**: TypeScript module (`@gears-frontx/kit-candidates`) and a global stylesheet (`@gears-frontx/kit-candidates/utilities.css`)

**Stability**: experimental

**Description**: `Heading`, `headingVariants`, `Text`, `textVariants`, `Link`, `linkVariants`, `VisuallyHidden`, `CodeBlock`, `CodeBlockHeader`, `CodeBlockTitle`, `CodeBlockCopyButton`, `DescriptionList`, `DescriptionItem`, `DescriptionTerm`, `DescriptionDetails`, `Card`, `CardTitle`, `EmptyTitle`, `AlertTitle` and their prop types; the `sr-only` class.

**Breaking Change Policy**: follows the kit pull requests; a change there is mirrored here in the same change, and the package version is bumped.

#### Template overlay

- [x] `p2` - **ID**: `cpt-template-kit-candidates-interface-template-overlay`

**Type**: Data format (the template manifest and the two subtrees it claims)

**Stability**: experimental

**Description**: The manifest names the package and the AI bundle as its exclusive subtrees and claims no shared file, so a project copies or removes the template as a unit.

**Breaking Change Policy**: template version bump on any change to a claimed subtree.

### 7.2 External Integration Contracts

#### UI kit components and tokens

- [x] `p1` - **ID**: `cpt-template-kit-candidates-contract-ui-kit`

**Direction**: required from `@gears-frontx/ui-kit`

**Protocol/Format**: the kit's token stylesheet, its `Button`, `Card`, `CardTitle`, `EmptyTitle` and `AlertTitle`, and the classes those parts compute

**Compatibility**: pinned to an exact kit release; the candidates' tests compare their markup with the kit parts' and fail when a kit part changes shape.

## 8. Use Cases

#### Build a screen with candidates

- [x] `p2` - **ID**: `cpt-template-kit-candidates-usecase-build-screen`

**Actor**: `cpt-template-kit-candidates-actor-template-author`

**Preconditions**:
- The project has template-shell and this template applied, and the screen package depends on `@gears-frontx/kit-candidates`.

**Main Flow**:
1. The author composes the screen from kit components.
2. Where the kit has no part, the author imports the candidate from `@gears-frontx/kit-candidates`.
3. The screen renders with the kit's tokens and passes its accessibility checks.

**Postconditions**:
- The screen carries no local copy of a heading, text, link, code frame or description list recipe.

**Alternative Flows**:
- **The need is not in either pull request**: the author proposes a kit change; the candidate package is not extended.

#### Switch to the kit release

- [x] `p2` - **ID**: `cpt-template-kit-candidates-usecase-release`

**Actor**: `cpt-template-kit-candidates-actor-kit-maintainer`

**Preconditions**:
- The kit releases pull request A, B or both.

**Main Flow**:
1. Consumers change the import specifier of the released components to `@gears-frontx/ui-kit` and pin the new kit release.
2. The released half of the package, or the whole template with its architecture tree, is deleted.

**Postconditions**:
- No consumer imports a released component from the candidates.

**Alternative Flows**:
- **The release changes an API during review**: the candidate is changed to the reviewed API first, then switched.

## 9. Acceptance Criteria

- [ ] Every candidate's unit test, axe run and contract overlay test pass in the composed package.
- [ ] The package exports exactly the names of the two pull requests.
- [ ] Without `render`, `Card`, `CardTitle`, `EmptyTitle` and `AlertTitle` render markup equal to the kit parts'.
- [ ] The repository's template shape check accepts the template.

## 10. Dependencies

| Dependency | Description | Criticality |
|------------|-------------|-------------|
| template-shell (applied in the project) | The workspace root that installs, type-checks and tests the package | p1 |
| `@gears-frontx/ui-kit` `0.4.0` | Tokens, `Button`, the card and title parts | p1 |
| `@base-ui/react` `1.6.0` | `useRender` and `mergeProps` | p1 |
| `class-variance-authority` `0.7.1` | Variant recipes | p1 |
| `lucide-react` (the kit's version) | The external-link arrow and the copy icons | p2 |
| The proposed kit pull requests A and B | The API each candidate equals | p1 |

## 11. Assumptions

- The kit's card and title parts stay plain functions that render one element, so a candidate can reuse the classes they compute.
- The kit's ramp, colour, ring and radius tokens keep their names.

## 12. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| A kit release changes a card or title part's shape | A wrapper loses the kit's classes or adds markup | The tests compare each wrapper's markup with the kit part's and fail on any difference |
| Review changes a proposed API | Consumers built on the candidate need edits on release | The candidate follows the reviewed API in the same change as the review |
| A template extends a candidate locally | The release stops being an import change | The guideline forbids it, and the package test pins the export list |
