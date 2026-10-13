# Decomposition: template-kit-candidates

<!-- toc -->

- [1. Overview](#1-overview)
- [2. Entries](#2-entries)
  - [2.1 Typography and links - HIGH](#21-typography-and-links---high)
  - [2.2 Code and description - HIGH](#22-code-and-description---high)
- [3. Feature Dependencies](#3-feature-dependencies)

<!-- /toc -->

## 1. Overview

The [DESIGN](./DESIGN.md) of template-kit-candidates describes one workspace package, `kit-candidates`, and the template's AI bundle. It is decomposed into two features along the two kit pull requests the package mirrors: `cpt-template-kit-candidates-feature-typography-and-links` (pull request A) and `cpt-template-kit-candidates-feature-code-and-description` (pull request B). The cut follows the release unit: the kit can release either pull request alone, and each feature is then switched and deleted on its own.

Coverage: every DESIGN component, principle, constraint and sequence, and every PRD functional and non-functional requirement, is listed under at least one feature. The template packaging component and the shared principles sit under the first feature, which the second depends on. The DESIGN has no database entities, so no feature lists data ids. The design id, the layer table id and the package surface interface need no decomposition coverage; the package surface is listed under API of both features.

Code scope: the template's codebase is `template-kit-candidates/src-app` (`.ts`, `.tsx`, `.mjs`). Tests, test helpers and build configuration are excluded from marker scanning by the repository's ignore rules. Stylesheets, cards, contract overlays, the manifest and the AI bundle carry no markers but belong to the features below. The composed copy under `site/src-app/verify_packages/kit-candidates/` is produced by the repository's composition tooling ([root DESIGN](../../architecture/DESIGN.md)) and is not part of this system.

Cross-system relations, named here by link and never by id:

- The host shell (template-shell, applied in `site/`) installs and tests the package.
- Screen packages of the site's templates consume it ([root DESIGN](../../architecture/DESIGN.md)).

## 2. Entries

**Overall implementation status:**

- [x] `p1` - **ID**: `cpt-template-kit-candidates-status-overall`

### 2.1 [Typography and links](features/typography-and-links/) - HIGH

- [x] `p1` - **ID**: `cpt-template-kit-candidates-feature-typography-and-links`

- **Purpose**: Deliver the components of kit pull request A: headings and text on the type ramp, the inline link, visually hidden text and the `sr-only` utility; and the template's packaging.

- **Depends On**: None

- **Scope**:
  - `Heading` and `Text` with their recipes; `Link` with its variants, router render and `external`; `VisuallyHidden` and `sr-only`.
  - Template packaging: the manifest, the package entry and `package.json`, the AI bundle.
  - Files with a marker scope, under `template-kit-candidates/src-app/verify_packages/kit-candidates/`:
    - `src/components/heading/heading.tsx`
    - `src/components/text/text.tsx`
    - `src/components/link/link.tsx`
    - `src/components/visually-hidden/visually-hidden.tsx`
  - Files without markers owned by this feature: the four folders' stylesheets, cards, contract overlays and `public.ts`; `src/utilities.css`; `src/index.ts`; `src/vite-env.d.ts`; `package.json`, `tsconfig.json`; `frontx-template.json`; `README.md`; `.frontx/ai/@gears-frontx/frontx-template-kit-candidates/`.
  - Excluded from marker scanning, owned as verification setup: the tests of the four folders, `src/index.test.ts`, `src/test-support/`, `vitest.config.ts`.

- **Out of scope**:
  - Layout primitives, a skip link, brand display sizes.

- **Requirements Covered**:

  - [x] `p1` - `cpt-template-kit-candidates-fr-ramp-text`
  - [x] `p1` - `cpt-template-kit-candidates-fr-inline-link`
  - [x] `p1` - `cpt-template-kit-candidates-fr-visually-hidden`
  - [x] `p1` - `cpt-template-kit-candidates-fr-proposed-api`
  - [x] `p1` - `cpt-template-kit-candidates-fr-self-contained`
  - [x] `p1` - `cpt-template-kit-candidates-nfr-accessible`
  - [x] `p1` - `cpt-template-kit-candidates-nfr-tokens-only`

- **Design Principles Covered**:

  - [x] `p1` - `cpt-template-kit-candidates-principle-proposed-api`
  - [x] `p2` - `cpt-template-kit-candidates-principle-kit-conventions`

- **Design Constraints Covered**:

  - [x] `p2` - `cpt-template-kit-candidates-constraint-host-prerequisites`
  - [x] `p2` - `cpt-template-kit-candidates-constraint-exact-pins`

- **Domain Model Entities**:
  - Template manifest
  - Component folder
  - Contract overlay
  - Package entry
  - Utility stylesheet
  - AI bundle

- **Design Components**:

  - [x] `p1` - `cpt-template-kit-candidates-component-typography`
  - [x] `p1` - `cpt-template-kit-candidates-component-link`
  - [x] `p1` - `cpt-template-kit-candidates-component-visually-hidden`
  - [x] `p2` - `cpt-template-kit-candidates-component-template-packaging`

- **API**:
  - [x] `p2` - `cpt-template-kit-candidates-interface-package-surface`
  - `Heading`, `headingVariants`, `Text`, `textVariants`, `Link`, `linkVariants`, `VisuallyHidden`; `utilities.css`

- **Sequences**:

  - `cpt-template-kit-candidates-seq-release`

- **Data**:
  - None.

### 2.2 [Code and description](features/code-and-description/) - HIGH

- [x] `p1` - **ID**: `cpt-template-kit-candidates-feature-code-and-description`

- **Purpose**: Deliver the components of kit pull request B: the code block with its copy button, the description list, and `render` on the kit's card and title parts.

- **Depends On**: `cpt-template-kit-candidates-feature-typography-and-links`

- **Scope**:
  - `CodeBlock`, `CodeBlockHeader`, `CodeBlockTitle`, `CodeBlockCopyButton`; `DescriptionList`, `DescriptionItem`, `DescriptionTerm`, `DescriptionDetails`; `Card`, `CardTitle`, `EmptyTitle`, `AlertTitle` with `render`.
  - Files with a marker scope, under `template-kit-candidates/src-app/verify_packages/kit-candidates/`:
    - `src/components/code-block/code-block.tsx`
    - `src/components/description-list/description-list.tsx`
    - `src/components/card/card.tsx`
    - `src/components/empty/empty.tsx`
    - `src/components/alert/alert.tsx`
    - `src/kit-parts/kitClassName.ts`
  - Files without markers owned by this feature: the five folders' stylesheets, cards, contract overlays and `public.ts`.
  - Excluded from marker scanning: the tests of the five folders.

- **Out of scope**:
  - Syntax highlighting; every other part of the card, empty and alert families (the kit's own).

- **Requirements Covered**:

  - [x] `p1` - `cpt-template-kit-candidates-fr-code-block`
  - [x] `p1` - `cpt-template-kit-candidates-fr-description-list`
  - [x] `p1` - `cpt-template-kit-candidates-fr-render-on-parts`
  - [x] `p1` - `cpt-template-kit-candidates-fr-proposed-api`
  - [x] `p1` - `cpt-template-kit-candidates-nfr-accessible`
  - [x] `p1` - `cpt-template-kit-candidates-nfr-tokens-only`

- **Design Principles Covered**:

  - [x] `p1` - `cpt-template-kit-candidates-principle-proposed-api`
  - [x] `p2` - `cpt-template-kit-candidates-principle-kit-conventions`
  - [x] `p2` - `cpt-template-kit-candidates-principle-reuse-kit-classes`

- **Design Constraints Covered**:

  - [x] `p2` - `cpt-template-kit-candidates-constraint-exact-pins`
  - [x] `p2` - `cpt-template-kit-candidates-constraint-hook-free-kit-parts`

- **Domain Model Entities**:
  - Component folder
  - Contract overlay

- **Design Components**:

  - [x] `p1` - `cpt-template-kit-candidates-component-code-block`
  - [x] `p1` - `cpt-template-kit-candidates-component-description-list`
  - [x] `p1` - `cpt-template-kit-candidates-component-render-parts`

- **API**:
  - [x] `p2` - `cpt-template-kit-candidates-interface-package-surface`
  - `CodeBlock` family, `DescriptionList` family, `Card`, `CardTitle`, `EmptyTitle`, `AlertTitle`

- **Sequences**:

  - `cpt-template-kit-candidates-seq-copy-code`
  - `cpt-template-kit-candidates-seq-release`

- **Data**:
  - None.

---

## 3. Feature Dependencies

```text
cpt-template-kit-candidates-feature-typography-and-links (foundation, no dependencies)
cpt-template-kit-candidates-feature-code-and-description -> cpt-template-kit-candidates-feature-typography-and-links
```

**Dependency Rationale**:

- `cpt-template-kit-candidates-feature-code-and-description` depends on `cpt-template-kit-candidates-feature-typography-and-links`: the copy button announces through `VisuallyHidden`, and the package entry and template packaging belong to the first feature, as the kit pull request B lands after pull request A.
