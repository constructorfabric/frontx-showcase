# Decomposition: template-site-brand

<!-- toc -->

- [1. Overview](#1-overview)
- [2. Entries](#2-entries)
  - [2.1 Brand source and generation - HIGH](#21-brand-source-and-generation---high)
  - [2.2 Brand check - HIGH](#22-brand-check---high)
  - [2.3 Brand art - MEDIUM](#23-brand-art---medium)
- [3. Feature Dependencies](#3-feature-dependencies)

<!-- /toc -->

## 1. Overview

The [DESIGN](./DESIGN.md) of template-site-brand describes one package, `site-brand`, and the template's AI bundle. It is decomposed into three features: the brand source with everything generated and delivered from it, the brand check that holds the record, the generated files and the project to it, and the brand art the site's blocks place in their slots. The check is cut apart because it has its own inputs (the project's sources and site config), its own rules and its own consumer (the repository's lint), and it changes for different reasons than the brand values do. The art is cut apart because it is React code with its own palettes, consumed by blocks rather than by the document, and it changes with the drawings rather than with the brand values.

Coverage: every DESIGN component, principle, constraint and sequence of this system, and every PRD functional and non-functional requirement, is listed under exactly one feature. The DESIGN has no database entities (DESIGN section 3.7 says not applicable), so the features list no data ids. The DESIGN's general ids (the design id, the layer table id) need no decomposition coverage; the package surface interface is listed under the first feature, which implements it.

Code scope: the template's codebase is `template-site-brand/src-app` (`.ts`, `.tsx`, `.mjs`). Tests and `src/test-support/` are excluded from marker scanning by the repository's ignore rules. Stylesheets, JSON, images and the AI bundle carry no markers but belong to the feature that lists them. The composed copy under `site/src-app/verify_packages/site-brand/` is produced by the repository's composition tooling ([root DESIGN](../../architecture/DESIGN.md)) and is not part of this system.

Cross-system relations, named here by link and never by id:

- The host shell (template-shell, applied in `site/`, with the site's document-entry convention and appearance stamp) loads the document entry ([root DESIGN](../../architecture/DESIGN.md)).
- The metadata pipeline ([template-site-meta](../../template-site-meta/architecture/DESIGN.md)) writes the head colours the check compares.
- The repository's lint runs the check; its style policy holds hex literals outside the record ([root DESIGN](../../architecture/DESIGN.md)).

## 2. Entries

**Overall implementation status:**

- [x] `p1` - **ID**: `cpt-template-site-brand-status-overall`

### 2.1 [Brand source and generation](features/brand-source-and-generation/) - HIGH

- [x] `p1` - **ID**: `cpt-template-site-brand-feature-brand-source-and-generation`

- **Purpose**: Hold every brand value once with its V2 value, generate what the browser, the theme registry and the guideline read, and deliver it through one document entry with the typeface and the brand images.

- **Depends On**: None

- **Phases**: single phase.

- **Scope**:
  - The brand record and its shape check.
  - Reading the kit's light and dark palettes.
  - Rendering and writing the token stylesheet, the theme variables and the guideline's token table.
  - The document entry with the font stylesheet; the brand assets; the template packaging.
  - Code paths with a marker scope, under `template-site-brand/src-app/verify_packages/site-brand/`:
    - `src/check/model.ts`
    - `src/check/generate.ts`
    - `src/check/cli.ts` (the generate command)
  - Code paths without markers, still owned by this feature:
    - `src/brand.json`, `src/tokens.css`, `src/theme.ts` (generated), `src/document.css`, `src/font.css`, `src/assets/`
    - `package.json`, `tsconfig.json`
    - `frontx-template.json`, `README.md`, `.frontx/ai/@gears-frontx/frontx-template-site-brand/`
  - Files excluded from marker scanning: the package's `*.test.ts` files and `src/test-support/`, `vitest.config.ts`.

- **Out of scope**:
  - Art components and their palettes.
  - Head assets of the project root.
  - The shell's document-entry convention, style adoption and appearance stamp.

- **Requirements Covered**:

  - [x] `p1` - `cpt-template-site-brand-fr-one-record`
  - [x] `p1` - `cpt-template-site-brand-fr-generated-outputs`
  - [x] `p1` - `cpt-template-site-brand-fr-document-delivery`
  - [x] `p2` - `cpt-template-site-brand-fr-typeface`
  - [x] `p2` - `cpt-template-site-brand-fr-theme-variables`
  - [x] `p2` - `cpt-template-site-brand-fr-brand-assets`
  - [x] `p1` - `cpt-template-site-brand-fr-self-contained`
  - [x] `p2` - `cpt-template-site-brand-fr-ai-guideline`

- **Design Principles Covered**:

  - [x] `p1` - `cpt-template-site-brand-principle-one-record`
  - [x] `p1` - `cpt-template-site-brand-principle-kit-first`
  - [x] `p2` - `cpt-template-site-brand-principle-generated`
  - [x] `p1` - `cpt-template-site-brand-principle-document-delivery`

- **Design Constraints Covered**:

  - [x] `p2` - `cpt-template-site-brand-constraint-host-prerequisites`
  - [x] `p1` - `cpt-template-site-brand-constraint-registry-reach`
  - [x] `p2` - `cpt-template-site-brand-constraint-light-only`
  - [x] `p2` - `cpt-template-site-brand-constraint-exact-pins`

- **Domain Model Entities**:
  - Brand row
  - Palette
  - Head row
  - Kit palette
  - Template manifest

- **Design Components**:

  - [x] `p1` - `cpt-template-site-brand-component-brand-record`
  - [x] `p1` - `cpt-template-site-brand-component-generator`
  - [x] `p1` - `cpt-template-site-brand-component-token-stylesheet`
  - [x] `p2` - `cpt-template-site-brand-component-theme-variables`
  - [x] `p1` - `cpt-template-site-brand-component-document-entry`
  - [x] `p2` - `cpt-template-site-brand-component-brand-assets`
  - [x] `p2` - `cpt-template-site-brand-component-template-packaging`

- **API**:
  - [x] `p2` - `cpt-template-site-brand-interface-package-surface`
  - `@gears-frontx/site-brand/document.css`, `./tokens.css`, `./font.css`, `./theme`, `./brand.json`, `./assets/*`
  - `node src/check/cli.ts generate`

- **Sequences**:

  - `cpt-template-site-brand-seq-change-value`
  - `cpt-template-site-brand-seq-document-load`

- **Data**:
  - None: the template has no database and no server process.

### 2.2 [Brand check](features/brand-check/) - HIGH

- [x] `p1` - **ID**: `cpt-template-site-brand-feature-brand-check`

- **Purpose**: Fail the repository's lint on any drift of the brand: generated files, kit names, value rules, contrast, the V2 record, unused tokens, brand values declared elsewhere, head colours.

- **Depends On**: `cpt-template-site-brand-feature-brand-source-and-generation`

- **Phases**: single phase.

- **Scope**:
  - The check command, its options and its report.
  - Colour resolution (`var()`, `color-mix` in oklab) and the contrast ratio.
  - The source walk over the project.
  - The eight rules.
  - Code paths with a marker scope, under `template-site-brand/src-app/verify_packages/site-brand/`:
    - `src/check/cli.ts` (the check command)
    - `src/check/rules.ts`
    - `src/check/color.ts`
    - `src/check/sources.ts`
  - Files excluded from marker scanning: `src/check/*.test.ts`, `src/test-support/`.

- **Out of scope**:
  - Layout tokens, art palettes and hex literals in other files (the repository's style policy).
  - Rendered-page contrast (the design guardrails' runtime checker).

- **Requirements Covered**:

  - [x] `p1` - `cpt-template-site-brand-fr-v2-record`
  - [x] `p1` - `cpt-template-site-brand-fr-contrast`
  - [x] `p1` - `cpt-template-site-brand-fr-brand-check`
  - [x] `p1` - `cpt-template-site-brand-nfr-contrast`
  - [x] `p1` - `cpt-template-site-brand-nfr-kit-conformance`

- **Design Principles Covered**:

  - None beyond those of the brand source feature, which this feature enforces.

- **Design Constraints Covered**:

  - None of its own.

- **Domain Model Entities**:
  - Contrast pair
  - Brand row
  - Kit palette

- **Design Components**:

  - [x] `p1` - `cpt-template-site-brand-component-brand-check`

- **API**:
  - `node src/check/cli.ts check [--project <dir>] [--kit <theme.css>] [--config <file>] [--scan <dir>]...`

- **Sequences**:

  - `cpt-template-site-brand-seq-check-brand`

- **Data**:
  - None.

### 2.3 [Brand art](features/brand-art/) - MEDIUM

- [x] `p1` - **ID**: `cpt-template-site-brand-feature-brand-art`

- **Purpose**: Draw the site's pictures (hairline figures, template figures, the application slab of the hero and the closing visual, the architecture figure, the change-story workbench, the chart art) as components the blocks place through content slots, each with its palette at the top of its stylesheet.

- **Depends On**: `cpt-template-site-brand-feature-brand-source-and-generation`

- **Phases**: single phase.

- **Scope**:
  - The art components and their isometric geometry.
  - Their palettes, light and dark, and their motion.
  - The `./art/*` export, the art type-check configuration and the art test lane.
  - Code paths with a marker scope, under `template-site-brand/src-app/verify_packages/site-brand/`:
    - `src/art/HairlineFigure.tsx`, `src/art/TemplateFigure.tsx`
    - `src/art/SlabDrawing.tsx`, `src/art/HeroArt.tsx`, `src/art/ClosingVisual.tsx`
    - `src/art/ArchitectureFigure.tsx`, `src/art/WorkbenchFigure.tsx`
    - `src/art/ChartThumb.tsx`, `src/art/MetricBars.tsx`
  - Code paths without markers, still owned by this feature:
    - `src/art/iso.ts` (the projection the hairline figures share), `src/art/*.module.css`, `tsconfig.art.json`
  - Files excluded from marker scanning: `src/art/*.test.*`, `src/test-support/art-setup.ts`, `src/test-support/axe.ts`, `src/test-support/art-palettes.ts`.

- **Out of scope**:
  - Where a drawing sits and how large its slot is (the site's blocks).
  - Brand tokens and the record.

- **Requirements Covered**:

  - [x] `p1` - `cpt-template-site-brand-fr-brand-art`
  - [x] `p1` - `cpt-template-site-brand-nfr-art-accessibility`

- **Design Principles Covered**:

  - None beyond `cpt-template-site-brand-principle-kit-first`, covered by the brand source feature, which the art follows as its last layer.

- **Design Constraints Covered**:

  - None of its own.

- **Domain Model Entities**:
  - Art palette

- **Design Components**:

  - [x] `p1` - `cpt-template-site-brand-component-brand-art`

- **API**:
  - `@gears-frontx/site-brand/art/<Name>`: `HairlineFigure`, `TemplateFigure`, `HeroArt`, `ClosingVisual`, `ArchitectureFigure`, `WorkbenchFigure`, `ChartThumb`, `MetricBars`

- **Sequences**:

  - None.

- **Data**:
  - None.

---

## 3. Feature Dependencies

```text
cpt-template-site-brand-feature-brand-source-and-generation (foundation)
  -> cpt-template-site-brand-feature-brand-check
  -> cpt-template-site-brand-feature-brand-art
```

**Dependency Rationale**:

- `cpt-template-site-brand-feature-brand-check` reads the record and regenerates the outputs in memory through the brand source feature's code.
- `cpt-template-site-brand-feature-brand-art` reads the brand tokens the brand source delivers to the document.
