# Decomposition: template-calendar-demo

<!-- toc -->

- [1. Overview](#1-overview)
- [2. Entries](#2-entries)
  - [2.1 Calendar placeholder screen - HIGH](#21-calendar-placeholder-screen---high)
- [3. Feature Dependencies](#3-feature-dependencies)

<!-- /toc -->

## 1. Overview

The [DESIGN](./DESIGN.md) of template-calendar-demo describes one screen MFE package, `calendar-demo-mfe`, and the template's AI bundle. It is decomposed into one feature, `cpt-template-calendar-demo-feature-calendar-placeholder`, which owns the whole package and the template packaging.

Why one feature: the package is a single configuration item. The template is versioned, copied, composed and removed as one unit, and its exclusive subtrees are the package and the AI bundle. Its seven components form one mount path: manifest, lifecycle, token anchoring, frame, router, pages, translations. None of them is delivered or released apart from the others. The DESIGN principle `cpt-template-calendar-demo-principle-stable-frame` separates the lasting frame from the replaceable placeholder content. That seam stays inside this feature as two scope groups, not two features: today the content part is one page component file, and a feature cut along that seam would be a fraction of the size of every other feature of the site. When the calendar kit is released and the demo replaces the placeholder, the content part can become a feature of its own without any change of address or id in the frame.

Coverage: every DESIGN component, principle, constraint and sequence of this system, and every PRD functional and non-functional requirement, is listed under the one feature. The DESIGN has no database entities (DESIGN section 3.7 says not applicable), so the feature lists no data ids. The DESIGN's general ids (the design id, the layer table id and the package surface interface) need no decomposition coverage. The package surface interface is listed under API because the feature implements it. Nothing in the DESIGN is left out.

Code scope: the template's codebase is `template-calendar-demo/src-app` (`.ts`, `.tsx`, `.mjs`). Each file of it belongs to this feature. Tests, test helpers and build configuration are excluded from marker scanning by the repository's ignore rules. The manifests, string sets, styles and the AI bundle carry no markers but are still part of the feature's scope. The composed copy of the package under `site/src-app/mfe_packages/calendar-demo-mfe/` is produced by the repository's composition tooling ([root DESIGN](../../architecture/DESIGN.md)) and is not part of this system.

Cross-system relations, named here by link and never by id:

- The host shell (template-shell, applied in `site/`) registers and mounts the screen.
- The metadata pipeline ([template-site-meta](../../template-site-meta/architecture/DESIGN.md)) applies the screen's declared metadata.
- The site's header lists the screen under the demos group's entry ([root DESIGN](../../architecture/DESIGN.md)).
- The repository's composition and shape checks ([root DESIGN](../../architecture/DESIGN.md)) compose and validate the template.

## 2. Entries

**Overall implementation status:**

- [x] `p1` - **ID**: `cpt-template-calendar-demo-status-overall`

### 2.1 [Calendar placeholder screen](features/calendar-placeholder/) - HIGH

- [x] `p1` - **ID**: `cpt-template-calendar-demo-feature-calendar-placeholder`

- **Purpose**: Give the calendar demo a stable address, a menu entry in the demos group and a page that is never indexed, before the calendar kit is released. It also keeps the screen's lasting frame (registration, mount, theme and direction, text loading, metadata declaration) apart from the placeholder content, so the real demo can later replace only the content.

- **Depends On**: None

- **Phases**: single phase; no sub-decomposition is needed for one package of eight source files.

- **Scope**:
  - Lasting frame:
    - Screen registration through the package manifest: one entry exposing the lifecycle; one screen extension of the shell's screen extension type with token `calendar`, the menu entry and the id of the host's demos nav group.
    - Page metadata declared once on the screen extension: title, description, not indexable, no per-route entries. Nothing in the package writes the document head.
    - The package's own FrontX app and the theme-aware lifecycle. On every mount, the lifecycle puts the kit tokens into exactly one marked style node in the shadow root and renders the frame around the extension router.
    - Rewriting the kit token stylesheet's root selectors onto the shadow host.
    - The screen frame:
      - It maps the host theme onto the kit's light or dark scope.
      - It derives the text direction from the language.
      - It sets both on the frame element and on the shadow host, and follows their changes.
      - It provides the bridge to route components.
    - The translations hook. It loads per-language string sets with an English fallback and applies only the latest load while the screen is mounted.
  - Placeholder content:
    - The route tree: `/` shows the placeholder page, and every other path shows the not-found page with a link back to `/`.
    - The placeholder page and the not-found page are built from the kit's `Empty` family, each with one top-level heading. The decorative icon is hidden from assistive technology.
    - The English string set; the pages import no stylesheet, and the screen frame's CSS Module lays the screen out on the kit's semantic tokens.
  - Template packaging: the template manifest with its two exclusive subtrees and no shared file, and the AI bundle with the calendar demo contract guideline.
  - Code paths, all under `template-calendar-demo/`. Files with a marker scope:
    - `src-app/mfe_packages/calendar-demo-mfe/src/init.ts`
    - `src-app/mfe_packages/calendar-demo-mfe/src/lifecycle.tsx`
    - `src-app/mfe_packages/calendar-demo-mfe/src/routes.tsx`
    - `src-app/mfe_packages/calendar-demo-mfe/src/screens/calendar/CalendarPages.tsx`
    - `src-app/mfe_packages/calendar-demo-mfe/src/shared/anchorKitThemeOnShadowHost.ts`
    - `src-app/mfe_packages/calendar-demo-mfe/src/shared/kitThemeScope.ts`
    - `src-app/mfe_packages/calendar-demo-mfe/src/shared/ScreenFrame.tsx`
    - `src-app/mfe_packages/calendar-demo-mfe/src/shared/useScreenTranslations.ts`
  - Code paths without markers, still owned by this feature:
    - `src-app/mfe_packages/calendar-demo-mfe/src/vite-env.d.ts` (type declarations only)
    - `src-app/mfe_packages/calendar-demo-mfe/mfe.json`
    - `src-app/mfe_packages/calendar-demo-mfe/src/screens/calendar/i18n/en.json`
    - `src-app/mfe_packages/calendar-demo-mfe/src/shared/ScreenFrame.module.css`
    - `src-app/mfe_packages/calendar-demo-mfe/package.json`, `tsconfig.json`, `index.html`, `README.md`
    - `frontx-template.json`
    - `README.md`
    - `.frontx/ai/@gears-frontx/frontx-template-calendar-demo/`
  - Files excluded from marker scanning by the repository's ignore rules, owned by this feature as its verification and build setup:
    - the package's `*.test.ts` and `*.test.tsx` files
    - `src/test-support/`
    - `vite.config.ts`, `vitest.config.ts`

- **Out of scope**:
  - Any calendar function: no events, no dates, no calendar data. There is no dependency on a calendar package, released or not.
  - Showing the UI kit's existing `Calendar` and `Date Picker` components. The UI kit catalogue screen shows them.
  - Inner routes beyond the placeholder, and languages other than English.
  - Writing the document title or head tags; generating the sitemap, the crawler summary or the static head. The project's metadata pipeline does this.
  - Where the host shows the demos group (the host's site configuration) and the host's menu, screen container and load-failure state.
  - Composing the template into the site, the composed copy under `site/`, and the repository's shape, drift and style checks.

- **Requirements Covered**:

  - [x] `p1` - `cpt-template-calendar-demo-fr-screen-registration`
  - [x] `p1` - `cpt-template-calendar-demo-fr-placeholder-page`
  - [x] `p2` - `cpt-template-calendar-demo-fr-not-found`
  - [x] `p1` - `cpt-template-calendar-demo-fr-host-theme-direction`
  - [x] `p2` - `cpt-template-calendar-demo-fr-page-text-per-language`
  - [x] `p1` - `cpt-template-calendar-demo-fr-page-metadata`
  - [x] `p1` - `cpt-template-calendar-demo-fr-self-contained`
  - [x] `p2` - `cpt-template-calendar-demo-fr-ai-guideline`
  - [x] `p2` - `cpt-template-calendar-demo-nfr-metadata-quality`
  - [x] `p2` - `cpt-template-calendar-demo-nfr-semantics`
  - [x] `p2` - `cpt-template-calendar-demo-nfr-kit-consistent-look`

- **Design Principles Covered**:

  - [x] `p2` - `cpt-template-calendar-demo-principle-kit-first`
  - [x] `p2` - `cpt-template-calendar-demo-principle-metadata-once`
  - [x] `p2` - `cpt-template-calendar-demo-principle-package-local-helpers`
  - [x] `p2` - `cpt-template-calendar-demo-principle-stable-frame`

- **Design Constraints Covered**:

  - [x] `p2` - `cpt-template-calendar-demo-constraint-host-prerequisites`
  - [x] `p2` - `cpt-template-calendar-demo-constraint-shadow-root`
  - [x] `p2` - `cpt-template-calendar-demo-constraint-one-router`
  - [x] `p2` - `cpt-template-calendar-demo-constraint-exact-pins`
  - [x] `p2` - `cpt-template-calendar-demo-constraint-two-kit-scopes`

- **Domain Model Entities**:
  - Template manifest
  - MFE manifest
  - Entry
  - Screen extension
  - Demos nav group
  - Metadata block
  - String set
  - AI bundle

- **Design Components**:

  - [x] `p1` - `cpt-template-calendar-demo-component-screen-manifest`
  - [x] `p1` - `cpt-template-calendar-demo-component-lifecycle`
  - [x] `p2` - `cpt-template-calendar-demo-component-kit-token-anchoring`
  - [x] `p1` - `cpt-template-calendar-demo-component-screen-frame`
  - [x] `p1` - `cpt-template-calendar-demo-component-pages`
  - [x] `p2` - `cpt-template-calendar-demo-component-screen-translations`
  - [x] `p2` - `cpt-template-calendar-demo-component-template-packaging`

- **API**:
  - [x] `p2` - `cpt-template-calendar-demo-interface-package-surface`
  - `GET /?screen=calendar`: the placeholder page
  - `GET /?screen=calendar;route=<path>`: the not-found page for any other path
  - `./lifecycle` module of the remote: the lifecycle with mount and unmount
  - `mfe.json` screen extension and `frontx-template.json` overlay manifest

- **Sequences**:

  - `cpt-template-calendar-demo-seq-open-screen`
  - `cpt-template-calendar-demo-seq-host-change`
  - `cpt-template-calendar-demo-seq-apply-template`

- **Data**:
  - None: the template has no database and no server process.

---

## 3. Feature Dependencies

```text
cpt-template-calendar-demo-feature-calendar-placeholder (foundation, no dependencies)
```

**Dependency Rationale**:

- `cpt-template-calendar-demo-feature-calendar-placeholder` is the only feature of this system and depends on no other feature. It needs a host project with template-shell and template-mfe applied (`cpt-template-calendar-demo-constraint-host-prerequisites`). That is an environment prerequisite outside this system, not a feature dependency.
