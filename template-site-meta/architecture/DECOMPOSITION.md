# Decomposition: template-site-meta

<!-- toc -->

- [1. Overview](#1-overview)
- [2. Entries](#2-entries)
  - [2.1 Page Map and Package Foundation - HIGH](#21-page-map-and-package-foundation---high)
  - [2.2 Head Follows the Address - HIGH](#22-head-follows-the-address---high)
  - [2.3 Plain-Text Twins - MEDIUM](#23-plain-text-twins---medium)
  - [2.4 Head Block, Discovery Files and Web Manifest - HIGH](#24-head-block-discovery-files-and-web-manifest---high)
  - [2.5 Generate and Check - HIGH](#25-generate-and-check---high)
- [3. Feature Dependencies](#3-feature-dependencies)

<!-- /toc -->

## 1. Overview

The [DESIGN](./DESIGN.md) of template-site-meta describes one tooling package, `@gears-frontx/site-meta` in `src-app/verify_packages/site-meta/`, and the template's AI bundle. Its nine components form a pipeline from declarations to files plus one browser runtime. It is decomposed into five features along the component boundaries and the source files, so that every file of the package belongs to exactly one feature:

- `cpt-template-site-meta-feature-page-map` is the foundation: the source reader and the page map, the model every other part reads, together with the package and template packaging that let the project's lanes reach the code.
- `cpt-template-site-meta-feature-head-sync` is the browser runtime that applies a page's head from the page map.
- `cpt-template-site-meta-feature-plain-text-twins` renders outline pages as text, for the build and for the dev server.
- `cpt-template-site-meta-feature-seo-outputs` holds the output renderers: the head block of the built document, the discovery files and the web manifest, each a pure function of the page map.
- `cpt-template-site-meta-feature-generate-and-check` holds the generator, the raster check and the command line. Generation and the check stay in one feature because the DESIGN's generator component runs both from one loading, rule and rendering path so they cannot diverge, and both live in one source file.

Coverage: every DESIGN component, principle, constraint and sequence, and every PRD functional and non-functional requirement, is listed under at least one feature. Two ids are deliberately listed under two features, each time with the reason stated in both entries: `cpt-template-site-meta-nfr-deterministic-outputs` (the renderers and the head-sync bundle the generator produces must both be deterministic) and `cpt-template-site-meta-nfr-head-before-boot` (head-sync runs without a request, and the renderers place it ahead of the module scripts). The DESIGN has no database entities (DESIGN section 3.7 says not applicable), so no feature lists data ids. The DESIGN's general ids (the design id, the layer table id `cpt-template-site-meta-tech-node-and-browser` and the tool surface interface `cpt-template-site-meta-interface-tool-surface`) need no decomposition coverage; the parts of the tool surface are named under API in the feature that implements each. The DESIGN's sequences carry no task checkbox, so they are referenced without one. Nothing in the DESIGN is left out.

Granularity and phases: each feature is one configuration item of two to five source files and is delivered in a single phase; the subordinate decomposition is the flows and algorithms of its FEATURE. Every feature id is versioned by its slug only and stays stable through implementation.

Code scope: the template's codebase is `template-site-meta/src-app` (`.ts`, `.tsx`, `.mjs`). All paths below are under `template-site-meta/src-app/verify_packages/site-meta/` unless they start with another top-level name. Tests, test helpers, snapshots and build configuration are excluded from marker scanning by the repository's ignore rules; each is still owned by one feature. The manifests, the README and the AI bundle carry no markers and are owned by the foundation feature. The composed copy of the package under `site/src-app/verify_packages/site-meta/` is produced by the repository's composition tooling ([root DESIGN](../../architecture/DESIGN.md)) and is not part of this system.

Cross-system relations, named here by link and never by id:

- The host shell (template-shell, applied in `site/`) provides the screen domain instance, the composed packages directory, the workspace root the package lands in, the build output and the icon set.
- Screen packages of other templates declare the metadata block on their screen extensions and, for content screens, the outlines; the outline model belongs to [template-site](../../template-site/architecture/DESIGN.md).
- The repository that hosts the template ([root DESIGN](../../architecture/DESIGN.md)) runs generation after its build and the check in its checks, keeps the site configuration and the raster record, adds the dev-server twin middleware, and holds the twin path agreement test over its composed site.

## 2. Entries

**Overall implementation status:**

- [x] `p1` - **ID**: `cpt-template-site-meta-status-overall`

### 2.1 [Page Map and Package Foundation](features/page-map/) - HIGH

- [x] `p1` - **ID**: `cpt-template-site-meta-feature-page-map`

- **Purpose**: Build the one page map every output, every check and the runtime head derive from, from the screens' metadata blocks and the site configuration only, with canonical addresses written in the router's own grammar. It also makes the package a part of the project it is applied into, so the project's install, type-check, lint and unit tests reach it with no shell change.

- **Depends On**: None

- **Phases**: single phase.

- **Scope**:
  - Project path resolution: the project root, the site configuration (by default in the project root), the composed packages directory, the screen domain instance and the build output, from one place.
  - Reading the site configuration, the screen domain's id and route key from the shell's screen domain instance, and every screen extension on that domain with the shell's scanner rules (no `shared`, no dot-directories, no `templateExample`, no other domain).
  - Origin resolution: the preview override first, then the configuration, no default; refusal of a non-http address or one with a query or fragment; trailing slash dropped, sub-path kept.
  - Building the page map: one entry per screen root and declared route; the route inherits the screen's share image; title falls back to the screen's label and description to the site default; document titles from the title template with the home page titled by the site name alone; pattern pages apart and non-indexable by default; the home and fallback pages; duplicate tokens and an unknown home screen refused; static pages listed in menu order.
  - The page map module shared with the browser runtime: the map's types, the `route` parameter name, canonical address writing with the routing grammar's serializer, and address resolution with its parser (bare mount address, static page, pattern page, fallback), own keys only.
  - Package and template packaging: the package manifest with exact pins, its type-check and unit-test configuration, the `Object.hasOwn` declaration for the shell's application lib, the template manifest with its two exclusive subtrees, the README and the AI bundle guideline that documents the metadata block contract.
  - Code paths with a marker scope:
    - `src/site.ts`
    - `src/page-map.ts`
  - Code paths without markers, still owned by this feature:
    - `src/object-has-own.d.ts` (type declaration only)
    - `src/site.test.ts`, `src/page-map.test.ts`, `src/route-convention.test.ts`, `src/test-support/fixtures.ts`
    - `package.json`, `tsconfig.json`, `vitest.config.ts`
    - `template-site-meta/frontx-template.json`, `template-site-meta/README.md`
    - `template-site-meta/.frontx/ai/@gears-frontx/frontx-template-site-meta/`

- **Out of scope**:
  - The metadata rules beyond duplicate tokens and an unknown home screen (`cpt-template-site-meta-feature-generate-and-check`).
  - Rendering or writing any output.
  - Applying a page's head in the browser (`cpt-template-site-meta-feature-head-sync`).

- **Requirements Covered**:

  - [x] `p1` - `cpt-template-site-meta-fr-metadata-once`
  - [x] `p1` - `cpt-template-site-meta-fr-canonical-addresses`
  - [x] `p1` - `cpt-template-site-meta-fr-required-origin`
  - [x] `p1` - `cpt-template-site-meta-nfr-self-contained`
  - [x] `p2` - `cpt-template-site-meta-nfr-project-lanes`

- **Design Principles Covered**:

  - [x] `p1` - `cpt-template-site-meta-principle-metadata-once`
  - [x] `p1` - `cpt-template-site-meta-principle-router-grammar`
  - [x] `p2` - `cpt-template-site-meta-principle-project-boundary`

- **Design Constraints Covered**:

  - [x] `p1` - `cpt-template-site-meta-constraint-query-addressing`
  - [x] `p2` - `cpt-template-site-meta-constraint-shell-workspace-root`

- **Domain Model Entities**:
  - SiteConfig
  - SeoBlock
  - ScreenExtension
  - SitePaths
  - PageMeta
  - ScreenPages
  - SiteMetaMap

- **Design Components**:

  - [x] `p1` - `cpt-template-site-meta-component-source-reader`
  - [x] `p1` - `cpt-template-site-meta-component-page-map`

- **API**:
  - Module functions for the other features: project path resolution, page map building, address writing and page resolution.
  - The screen metadata block, the site configuration, the shell project layout and the routing grammar, read as the contracts the PRD names.

- **Sequences**:

  - None of its own; it is the first step of the generate, check and dev twin sequences, which belong to the features that run them.

- **Data**: None (the template has no database; DESIGN section 3.7).

### 2.2 [Head Follows the Address](features/head-sync/) - HIGH

- [x] `p1` - **ID**: `cpt-template-site-meta-feature-head-sync`

- **Purpose**: Keep the document head equal to the page the address shows, before the application boots and on every navigation, so a visitor's tab, bookmark and link preview and a script-running crawler see the page's own metadata, while the router stays the only writer of the address.

- **Depends On**: `cpt-template-site-meta-feature-page-map`

- **Phases**: single phase.

- **Scope**:
  - The browser entry: reads the page map from its inert script node and starts head-sync; does nothing when the node is absent.
  - Head-sync: resolves the realm's navigation history, resolves the page of the current address through the page map, and applies its head at once and on every history change.
  - The head of a page: document title, description, robots, canonical link, Open Graph and Twitter tags with the document title as the share title; static tags updated in place, missing ones added and marked as owned, a share image tag the page lacks removed.
  - The head tag list of a page, shared with the renderers of the static head block.
  - Never writing the address or the history.
  - Code paths with a marker scope:
    - `src/head-sync.ts`
    - `src/head-sync-entry.ts`
  - Code paths without markers, still owned by this feature:
    - `src/head-sync.test.ts`

- **Out of scope**:
  - Bundling the runtime and checking its routing version (`cpt-template-site-meta-feature-generate-and-check`).
  - Inlining the runtime and the page map into the built document (`cpt-template-site-meta-feature-seo-outputs`).

- **Requirements Covered**:

  - [x] `p1` - `cpt-template-site-meta-fr-head-follows-address`
  - [x] `p1` - `cpt-template-site-meta-fr-head-only`
  - [x] `p2` - `cpt-template-site-meta-nfr-head-before-boot` (shared with `cpt-template-site-meta-feature-seo-outputs`: this feature runs from the inline map with no request of its own; that feature places the script ahead of the module scripts)

- **Design Principles Covered**:

  - [x] `p1` - `cpt-template-site-meta-principle-head-only`

- **Design Constraints Covered**:

  - [x] `p1` - `cpt-template-site-meta-constraint-single-static-document`

- **Domain Model Entities**:
  - PageMeta
  - SiteMetaMap

- **Design Components**:

  - [x] `p1` - `cpt-template-site-meta-component-head-sync`

- **API**:
  - The inline browser script in the built document; no public function beyond the module's start and apply functions used by the generated document and the tests.

- **Sequences**:

  - `cpt-template-site-meta-seq-visit-page`

- **Data**: None (the template has no database; DESIGN section 3.7).

### 2.3 [Plain-Text Twins](features/plain-text-twins/) - MEDIUM

- [x] `p2` - **ID**: `cpt-template-site-meta-feature-plain-text-twins`

- **Purpose**: Give coding agents and crawlers that run no script the full content of every outline page as text, rendered from the same outline, strings and data as the page, at the same path in a build and in development.

- **Depends On**: `cpt-template-site-meta-feature-page-map`

- **Phases**: single phase.

- **Scope**:
  - Finding every composed package with an outline file and reading its strings and data.
  - Resolving text keys and variables (the site origin available as a variable) and writing links as canonical addresses.
  - Rendering each outline page, the home page included, as Markdown by entry type, rendering nothing for an unknown entry type, and rendering an agent task's text on its own when the task offers a copy.
  - Deriving each twin's path from the screen token and route, and the task copy's path next to its page's twin.
  - Refusing an outline for an unknown screen and an outline page the screen's metadata block does not declare.
  - The dev twin: for a request path ending in `.md`, building the page map on the dev server's origin from the current sources, rendering the twins and returning the one at that path with the plain-text media type, or nothing; re-exporting the project path resolution for the dev server.
  - Code paths with a marker scope:
    - `src/twins.ts`
    - `src/dev.ts`
  - Code paths without markers, still owned by this feature:
    - `src/twins.test.ts`, `src/dev.test.ts`

- **Out of scope**:
  - The outline model itself, owned by template-site.
  - The dev-server middleware that calls the dev twin, which the hosting project adds.
  - Writing twins into the build output and listing them in `llms.txt` (`cpt-template-site-meta-feature-generate-and-check`, `cpt-template-site-meta-feature-seo-outputs`).

- **Requirements Covered**:

  - [x] `p1` - `cpt-template-site-meta-fr-plain-text-twins`
  - [x] `p2` - `cpt-template-site-meta-fr-dev-twins`

- **Design Principles Covered**:

  - None of its own beyond those of the foundation it depends on.

- **Design Constraints Covered**:

  - [x] `p2` - `cpt-template-site-meta-constraint-dev-server-plugin`
  - [x] `p2` - `cpt-template-site-meta-constraint-twin-media-type`
  - [x] `p2` - `cpt-template-site-meta-constraint-no-cross-template-reference`

- **Domain Model Entities**:
  - ScreenOutline
  - Twin

- **Design Components**:

  - [x] `p1` - `cpt-template-site-meta-component-twin-renderer`
  - [x] `p2` - `cpt-template-site-meta-component-dev-twin`

- **API**:
  - Dev twin function: project paths, dev server origin and request path in; the twin and its media type, or nothing, out.

- **Sequences**:

  - `cpt-template-site-meta-seq-dev-twin`

- **Data**: None (the template has no database; DESIGN section 3.7).

### 2.4 [Head Block, Discovery Files and Web Manifest](features/seo-outputs/) - HIGH

- [x] `p1` - **ID**: `cpt-template-site-meta-feature-seo-outputs`

- **Purpose**: Turn the page map into everything a crawler, a link preview or a browser installing the site reads from a build, as pure functions with no file access, so every output is deterministic and testable by snapshot.

- **Depends On**: `cpt-template-site-meta-feature-page-map`, `cpt-template-site-meta-feature-head-sync`, `cpt-template-site-meta-feature-plain-text-twins`

- **Phases**: single phase.

- **Scope**:
  - The sitemap of every indexable static page, screens in menu order.
  - The robots file that allows crawling and names the sitemap.
  - `llms.txt`: site name and summary, a section per screen in menu order, pages grouped under a common first path segment, the plain-text twins, then the documented packages' published `llms.txt`.
  - The page map manifest: site fields, pages keyed by canonical address, pattern pages apart.
  - The web manifest with the home page as start address relative to the manifest, the colours and the icon set.
  - The built document's head block: language and title set; the block placed after the title between its start and end comment markers, replacing a previous block; the site-level tags; the page map inlined as inert JSON with `<` escaped; the runtime inlined as a classic script with closing sequences escaped, ahead of the module scripts.
  - The icon set the head and the web manifest link.
  - Code paths with a marker scope:
    - `src/outputs.ts`
  - Code paths without markers, still owned by this feature:
    - `src/outputs.test.ts`, `src/__snapshots__/outputs.test.ts.snap`, `src/bundle.test.ts`

- **Out of scope**:
  - Reading or writing any file, bundling the runtime and finding the published `llms.txt` (`cpt-template-site-meta-feature-generate-and-check`).
  - The twins' content (`cpt-template-site-meta-feature-plain-text-twins`).

- **Requirements Covered**:

  - [x] `p1` - `cpt-template-site-meta-fr-site-head`
  - [x] `p1` - `cpt-template-site-meta-fr-discovery-files`
  - [x] `p2` - `cpt-template-site-meta-fr-web-manifest`
  - [x] `p1` - `cpt-template-site-meta-nfr-deterministic-outputs` (shared with `cpt-template-site-meta-feature-generate-and-check`: this feature keeps every rendered output a pure function of the page map; that feature keeps the bundled runtime deterministic)
  - [x] `p2` - `cpt-template-site-meta-nfr-head-before-boot` (shared with `cpt-template-site-meta-feature-head-sync`: this feature places the inline map and script ahead of the module scripts; that feature runs with no request of its own)

- **Design Principles Covered**:

  - None of its own beyond those of the foundation it depends on.

- **Design Constraints Covered**:

  - [x] `p1` - `cpt-template-site-meta-constraint-no-shell-head-port`

- **Domain Model Entities**:
  - SiteMetaMap
  - PageMeta
  - Twin

- **Design Components**:

  - [x] `p1` - `cpt-template-site-meta-component-output-renderers`

- **API**:
  - Generated outputs at fixed paths in the build output: the head block of `index.html`, `sitemap.xml`, `robots.txt`, `llms.txt`, `seo-manifest.json`, `site.webmanifest`.

- **Sequences**:

  - `cpt-template-site-meta-seq-crawl`

- **Data**: None (the template has no database; DESIGN section 3.7).

### 2.5 [Generate and Check](features/generate-and-check/) - HIGH

- [x] `p1` - **ID**: `cpt-template-site-meta-feature-generate-and-check`

- **Purpose**: Run the pipeline as the project's commands: after the build, apply every rule and write every output into the build output; in the project's checks, apply the same rules and report each output that no longer equals what the sources generate, so published metadata never goes stale silently.

- **Depends On**: `cpt-template-site-meta-feature-page-map`, `cpt-template-site-meta-feature-head-sync`, `cpt-template-site-meta-feature-plain-text-twins`, `cpt-template-site-meta-feature-seo-outputs`

- **Phases**: single phase.

- **Scope**:
  - Loading the site through the source reader on a given origin.
  - The configuration rule (a share image needs its alternative text) and the metadata rules (metadata block present, titles, descriptions of 50 to 160 characters on screens and indexable static routes, route keys inside the screen and not its root, unique document titles and canonical addresses).
  - The routing version check: the routing package esbuild resolves for head-sync equals the project's.
  - Bundling head-sync with esbuild into one minified, deterministic script.
  - Finding the documented packages' published `llms.txt` at the installed versions, linked and never fetched.
  - Listing the linked assets the build output lacks: the icon set, the icons the built document links, a same-origin share image.
  - Generate: refuse without an origin, on a rule failure, without a built document or with a missing asset; otherwise render every output and twin and write them into the build output only, returning their paths.
  - Check: take the origin from the page map manifest in the build output when present, apply the rules, and when outputs exist regenerate them and name each that differs or is missing; without outputs, say that none were compared.
  - The raster check: strict parsing of the record, paths resolved against the record's folder, and reports of a missing file, a changed source, an unrecorded raster and a stale copy; nothing without a record.
  - The command line: `generate` or `check` with the project, configuration and raster record options resolved against the working directory, the project defaulting to the one the package sits in; failures printed relative to the working directory; exit 0, 1 on failure, 2 on a usage error.
  - Code paths with a marker scope:
    - `src/generate.ts`
    - `src/rasters.ts`
    - `src/cli.ts`
    - `src/args.ts`
  - Code paths without markers, still owned by this feature:
    - `src/check.test.ts`, `src/generate.test.ts`, `src/args.test.ts`, `src/test-support/project.ts`

- **Out of scope**:
  - Rendering images from their vector sources.
  - The project's script names, the site configuration's values and the raster record's content, which the hosting repository owns.
  - Edge or server injection of the per-page head.

- **Requirements Covered**:

  - [x] `p2` - `cpt-template-site-meta-fr-linked-assets`
  - [x] `p1` - `cpt-template-site-meta-fr-metadata-rules`
  - [x] `p1` - `cpt-template-site-meta-fr-output-drift`
  - [x] `p1` - `cpt-template-site-meta-fr-routing-version`
  - [x] `p2` - `cpt-template-site-meta-fr-raster-record`
  - [x] `p1` - `cpt-template-site-meta-nfr-deterministic-outputs` (shared with `cpt-template-site-meta-feature-seo-outputs`: this feature keeps the bundled runtime deterministic and compares bytes; that feature keeps the rendered outputs pure)

- **Design Principles Covered**:

  - [x] `p2` - `cpt-template-site-meta-principle-regenerate-never-edit`

- **Design Constraints Covered**:

  - [x] `p1` - `cpt-template-site-meta-constraint-routing-version`

- **Domain Model Entities**:
  - RastersRecord
  - SitePaths

- **Design Components**:

  - [x] `p1` - `cpt-template-site-meta-component-generator`
  - [x] `p2` - `cpt-template-site-meta-component-raster-check`
  - [x] `p2` - `cpt-template-site-meta-component-command-line`

- **API**:
  - `node src/cli.ts generate [--project <dir>] [--config <file>] [--rasters <file>]`
  - `node src/cli.ts check [--project <dir>] [--config <file>] [--rasters <file>]`
  - `SITE_ORIGIN` environment override for a local preview

- **Sequences**:

  - `cpt-template-site-meta-seq-generate`
  - `cpt-template-site-meta-seq-check`

- **Data**: None (the template has no database; DESIGN section 3.7).

---

## 3. Feature Dependencies

```text
cpt-template-site-meta-feature-page-map
    |
    +-> cpt-template-site-meta-feature-head-sync
    |       |
    +-> cpt-template-site-meta-feature-plain-text-twins
    |       |
    +-------+-> cpt-template-site-meta-feature-seo-outputs
                    |
                    +-> cpt-template-site-meta-feature-generate-and-check
```

**Dependency Rationale**:

- `cpt-template-site-meta-feature-head-sync` requires `cpt-template-site-meta-feature-page-map`: it resolves the current address with the page map's lookup and applies the page entries the map defines.
- `cpt-template-site-meta-feature-plain-text-twins` requires `cpt-template-site-meta-feature-page-map`: twins are checked against the screens' declared pages, their links are canonical addresses, and the dev twin builds the page map from the current sources.
- `cpt-template-site-meta-feature-seo-outputs` requires `cpt-template-site-meta-feature-page-map`, `cpt-template-site-meta-feature-head-sync` and `cpt-template-site-meta-feature-plain-text-twins`: the outputs are rendered from the page map, the static head block uses the same head tag list and map node as head-sync, and `llms.txt` lists the twins.
- `cpt-template-site-meta-feature-generate-and-check` requires all four: it loads the page map, bundles head-sync, renders the twins and every output, and writes or compares them.
- `cpt-template-site-meta-feature-head-sync` and `cpt-template-site-meta-feature-plain-text-twins` are independent of each other and can be developed in parallel once the foundation exists.
