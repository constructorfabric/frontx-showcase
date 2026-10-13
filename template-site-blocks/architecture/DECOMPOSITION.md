# Decomposition: template-site-blocks

<!-- toc -->

- [1. Overview](#1-overview)
- [2. Entries](#2-entries)
  - [2.1 Blocks showcase - HIGH](#21-blocks-showcase---high)
  - [2.2 Section blocks - HIGH](#22-section-blocks---high)
  - [2.3 Docs blocks - HIGH](#23-docs-blocks---high)
- [3. Feature Dependencies](#3-feature-dependencies)

<!-- /toc -->

## 1. Overview

The [DESIGN](./DESIGN.md) of template-site-blocks describes one workspace package of blocks, `site-blocks`, its showcase screen package, `site-blocks-mfe`, and the template's AI bundle. It is decomposed into three features: `cpt-template-site-blocks-feature-blocks-showcase` (the showcase, the layout tokens and the template's packaging), `cpt-template-site-blocks-feature-section-blocks` (the blocks of the landing page) and `cpt-template-site-blocks-feature-docs-blocks` (the blocks of the inner pages). The cut follows the pages that use the blocks: landing-page blocks change with the landing page, inner-page blocks with the docs, templates and libraries pages, and the showcase with neither.

Coverage: every DESIGN component, principle, constraint and sequence, and every PRD functional and non-functional requirement, is listed under at least one feature. The DESIGN has no database entities, so no feature lists data ids. The design id and the layer table id need no decomposition coverage; the package surface interface is listed under API of every feature.

Code scope: the template's codebase is `template-site-blocks/src-app` (`.ts`, `.tsx`, `.mjs`). Tests, test helpers, fixtures and build configuration are excluded from marker scanning by the repository's ignore rules or carry no markers. Stylesheets, cards, the ledger, the manifest and the AI bundle carry no markers but belong to the features below. The composed copies under `site/src-app/verify_packages/site-blocks/` and `site/src-app/mfe_packages/site-blocks-mfe/` are produced by the repository's composition tooling ([root DESIGN](../../architecture/DESIGN.md)) and are not part of this system.

Cross-system relations, named here by link and never by id:

- The host shell (template-shell, applied in `site/`) installs and tests the packages, loads the document entry and mounts the showcase screen.
- The kit candidates ([template-kit-candidates](../../template-kit-candidates/architecture/DESIGN.md)) and the brand ([template-site-brand](../../template-site-brand/architecture/DESIGN.md)) provide parts and values.
- The page templates of the site consume the blocks ([root DESIGN](../../architecture/DESIGN.md)).

## 2. Entries

**Overall implementation status:**

- [x] `p1` - **ID**: `cpt-template-site-blocks-status-overall`

### 2.1 [Blocks showcase](features/blocks-showcase/) - HIGH

- [x] `p1` - **ID**: `cpt-template-site-blocks-feature-blocks-showcase`

- **Purpose**: Show every block on its own route of a non-indexed screen, collect the fixtures without a registry, and package the template: manifest, package entries, layout tokens, ledger and AI bundle.

- **Depends On**: None

- **Scope**:
  - The showcase collector, the `blocks` screen with its index, block routes and not-found page.
  - The layout tokens and the package's document entry; the exemptions ledger; the template packaging.
  - Files with a marker scope:
    - `src-app/verify_packages/site-blocks/src/showcase.ts`
    - `src-app/mfe_packages/site-blocks-mfe/src/init.ts`
    - `src-app/mfe_packages/site-blocks-mfe/src/lifecycle.tsx`
    - `src-app/mfe_packages/site-blocks-mfe/src/routes.tsx`
    - `src-app/mfe_packages/site-blocks-mfe/src/screens/blocks/BlocksPages.tsx`
    - `src-app/mfe_packages/site-blocks-mfe/src/shared/ScreenFrame.tsx`
  - Files without markers owned by this feature: the screen package's helpers (`src/shared/anchorKitThemeOnShadowHost.ts`, `kitThemeScope.ts`, `useScreenTranslations.ts`, kept code-identical to template-mfe's copies), its strings, `mfe.json`, `package.json`, `vite.config.ts`, `index.html`, `tsconfig.json`; the blocks package's `src/layout.css`, `src/document.css`, `styles-exemptions.json`, `package.json`, `tsconfig.json`, `src/vite-env.d.ts`; `frontx-template.json`; `README.md`; `.frontx/ai/@gears-frontx/frontx-template-site-blocks/`.
  - Excluded from marker scanning, owned as verification setup: the tests of both packages, `src/test-support/` of both, both `vitest.config.ts`.

- **Out of scope**:
  - The blocks and their fixtures' content.

- **Requirements Covered**:

  - [x] `p1` - `cpt-template-site-blocks-fr-showcase`
  - [x] `p1` - `cpt-template-site-blocks-fr-layout-tokens`
  - [x] `p1` - `cpt-template-site-blocks-fr-self-contained`
  - [x] `p1` - `cpt-template-site-blocks-fr-block-card`
  - [x] `p1` - `cpt-template-site-blocks-nfr-accessible`

- **Design Principles Covered**:

  - [x] `p1` - `cpt-template-site-blocks-principle-one-arrangement-one-block`

- **Design Constraints Covered**:

  - [x] `p2` - `cpt-template-site-blocks-constraint-host-prerequisites`
  - [x] `p2` - `cpt-template-site-blocks-constraint-exact-pins`

- **Domain Model Entities**:
  - Template manifest
  - Fixture
  - Showcase entry
  - Layout tokens
  - Exemptions ledger
  - AI bundle

- **Design Components**:

  - [x] `p1` - `cpt-template-site-blocks-component-showcase-screen`
  - [x] `p1` - `cpt-template-site-blocks-component-layout-tokens`
  - [x] `p2` - `cpt-template-site-blocks-component-exemptions-ledger`
  - [x] `p2` - `cpt-template-site-blocks-component-template-packaging`

- **API**:
  - [x] `p2` - `cpt-template-site-blocks-interface-package-surface`
  - `@gears-frontx/site-blocks/showcase`, `@gears-frontx/site-blocks/document.css`, `@gears-frontx/site-blocks/layout.css`; the `blocks` screen routes

- **Sequences**:

  - `cpt-template-site-blocks-seq-open-showcase`

- **Data**:
  - None.

### 2.2 [Section blocks](features/section-blocks/) - HIGH

- [x] `p1` - **ID**: `cpt-template-site-blocks-feature-section-blocks`

- **Purpose**: Deliver the landing page's blocks: the frame every landing-page section shares and the sections built on it, from the hero to the closing call to action.

- **Depends On**: `cpt-template-site-blocks-feature-blocks-showcase`

- **Scope**:
  - `SectionFrame`, `Hero`, `Features`, `ArchitectureMap`, `ChangeStory`, `KitShowcase` (with its sample layout parts), `MetricComparison`, `LogoStrip`, `GetStartedSteps`, `ClosingCta`.
  - Files with a marker scope:
    - `src-app/verify_packages/site-blocks/src/blocks/SectionFrame/SectionFrame.tsx`
    - `src-app/verify_packages/site-blocks/src/blocks/Hero/Hero.tsx`
    - `src-app/verify_packages/site-blocks/src/blocks/Features/Features.tsx`
    - `src-app/verify_packages/site-blocks/src/blocks/ArchitectureMap/ArchitectureMap.tsx`
    - `src-app/verify_packages/site-blocks/src/blocks/ChangeStory/ChangeStory.tsx`
    - `src-app/verify_packages/site-blocks/src/blocks/KitShowcase/KitShowcase.tsx`
    - `src-app/verify_packages/site-blocks/src/blocks/MetricComparison/MetricComparison.tsx`
    - `src-app/verify_packages/site-blocks/src/blocks/LogoStrip/LogoStrip.tsx`
    - `src-app/verify_packages/site-blocks/src/blocks/GetStartedSteps/GetStartedSteps.tsx`
    - `src-app/verify_packages/site-blocks/src/blocks/ClosingCta/ClosingCta.tsx`
  - Files without markers owned by this feature: each folder's stylesheet, card, fixture and entry.
  - Excluded from marker scanning: each folder's test.

- **Out of scope**:
  - The art the sections take through their slots (template-site-brand); the landing page's content and its sample registry (template-site).

- **Requirements Covered**:

  - [x] `p1` - `cpt-template-site-blocks-fr-kit-built`
  - [x] `p1` - `cpt-template-site-blocks-fr-layout-only`
  - [x] `p1` - `cpt-template-site-blocks-fr-content-props`
  - [x] `p1` - `cpt-template-site-blocks-fr-block-card`
  - [x] `p1` - `cpt-template-site-blocks-nfr-accessible`
  - [x] `p1` - `cpt-template-site-blocks-nfr-v2-structure`

- **Design Principles Covered**:

  - [x] `p1` - `cpt-template-site-blocks-principle-one-arrangement-one-block`
  - [x] `p1` - `cpt-template-site-blocks-principle-layout-only`
  - [x] `p2` - `cpt-template-site-blocks-principle-ramp-overrides`

- **Design Constraints Covered**:

  - [x] `p2` - `cpt-template-site-blocks-constraint-exact-pins`

- **Domain Model Entities**:
  - Block folder
  - Fixture
  - Layout tokens

- **Design Components**:

  - [x] `p1` - `cpt-template-site-blocks-component-blocks-package`
  - [x] `p1` - `cpt-template-site-blocks-component-layout-tokens`

- **API**:
  - [x] `p2` - `cpt-template-site-blocks-interface-package-surface`
  - `@gears-frontx/site-blocks/<Block>` for each block above

- **Sequences**:

  - None.

- **Data**:
  - None.

### 2.3 [Docs blocks](features/docs-blocks/) - HIGH

- [x] `p1` - **ID**: `cpt-template-site-blocks-feature-docs-blocks`

- **Purpose**: Deliver the blocks of the inner pages: frames, section headings, cards and panels, guide steps, tasks, answers, the file explorer and package lists.

- **Depends On**: `cpt-template-site-blocks-feature-blocks-showcase`

- **Scope**:
  - `PageIntro`, `DocsFrame`, `DocsFrameWithRail`, `TemplateDetailFrame`, `SectionHeading`, `GuideClosingHeading`, `PathCards`, `StartPaths`, `TemplatePair`, `TemplateRow`, `CardTiles`, `Panels`, `CtaBox`, `CtaRule`, `ActionRow`, `Facts`, `PackageList`, `GuideStep`, `GuideStepUnnumbered`, `AgentTask`, `Troubleshooting`, `FileExplorer`.
  - Files with a marker scope, under `src-app/verify_packages/site-blocks/`:
    - `src/blocks/PageIntro/PageIntro.tsx`
    - `src/blocks/DocsFrame/DocsFrame.tsx`
    - `src/blocks/DocsFrameWithRail/DocsFrameWithRail.tsx`
    - `src/blocks/DocsFrameWithRail/railAnchors.ts`
    - `src/blocks/TemplateDetailFrame/TemplateDetailFrame.tsx`
    - `src/blocks/SectionHeading/SectionHeading.tsx`
    - `src/blocks/GuideClosingHeading/GuideClosingHeading.tsx`
    - `src/blocks/PathCards/PathCards.tsx`
    - `src/blocks/StartPaths/StartPaths.tsx`
    - `src/blocks/TemplatePair/TemplatePair.tsx`
    - `src/blocks/TemplateRow/TemplateRow.tsx`
    - `src/blocks/CardTiles/CardTiles.tsx`
    - `src/blocks/Panels/Panels.tsx`
    - `src/blocks/CtaBox/CtaBox.tsx`
    - `src/blocks/CtaRule/CtaRule.tsx`
    - `src/blocks/ActionRow/ActionRow.tsx`
    - `src/blocks/Facts/Facts.tsx`
    - `src/blocks/PackageList/PackageList.tsx`
    - `src/blocks/GuideStep/GuideStep.tsx`
    - `src/blocks/GuideStepUnnumbered/GuideStepUnnumbered.tsx`
    - `src/blocks/AgentTask/AgentTask.tsx`
    - `src/blocks/Troubleshooting/Troubleshooting.tsx`
    - `src/blocks/FileExplorer/FileExplorer.tsx`

  - Files without markers owned by this feature: each folder's stylesheet, card, fixture and entry, and helper modules without markers.
  - Excluded from marker scanning: each folder's test.

- **Out of scope**:
  - Landing-page blocks; page content; art drawings.

- **Requirements Covered**:

  - [x] `p1` - `cpt-template-site-blocks-fr-kit-built`
  - [x] `p1` - `cpt-template-site-blocks-fr-layout-only`
  - [x] `p1` - `cpt-template-site-blocks-fr-content-props`
  - [x] `p1` - `cpt-template-site-blocks-fr-block-card`
  - [x] `p2` - `cpt-template-site-blocks-fr-section-navigation`
  - [x] `p1` - `cpt-template-site-blocks-nfr-accessible`
  - [x] `p1` - `cpt-template-site-blocks-nfr-v2-structure`

- **Design Principles Covered**:

  - [x] `p1` - `cpt-template-site-blocks-principle-one-arrangement-one-block`
  - [x] `p1` - `cpt-template-site-blocks-principle-layout-only`
  - [x] `p2` - `cpt-template-site-blocks-principle-ramp-overrides`

- **Design Constraints Covered**:

  - [x] `p2` - `cpt-template-site-blocks-constraint-exact-pins`

- **Domain Model Entities**:
  - Block folder
  - Fixture
  - Layout tokens

- **Design Components**:

  - [x] `p1` - `cpt-template-site-blocks-component-blocks-package`
  - [x] `p1` - `cpt-template-site-blocks-component-layout-tokens`
  - [x] `p2` - `cpt-template-site-blocks-component-exemptions-ledger`

- **API**:
  - [x] `p2` - `cpt-template-site-blocks-interface-package-surface`
  - `@gears-frontx/site-blocks/<Block>` for each block above

- **Sequences**:

  - `cpt-template-site-blocks-seq-jump-to-section`

- **Data**:
  - None.

---

## 3. Feature Dependencies

```text
cpt-template-site-blocks-feature-blocks-showcase (foundation, no dependencies)
cpt-template-site-blocks-feature-section-blocks -> cpt-template-site-blocks-feature-blocks-showcase
cpt-template-site-blocks-feature-docs-blocks -> cpt-template-site-blocks-feature-blocks-showcase
```

**Dependency Rationale**:

- `cpt-template-site-blocks-feature-section-blocks` and `cpt-template-site-blocks-feature-docs-blocks` depend on `cpt-template-site-blocks-feature-blocks-showcase`: the package entries, the layout tokens and the fixture contract their folders follow belong to it.
