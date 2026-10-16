# template-catalogue

The `@gears-frontx/ui-kit` catalogue as a FrontX template.

## What it contributes

One screen MFE package, `src-app/mfe_packages/catalogue-mfe/`: the kit's component examples and design-token foundation pages as one screen with a page per example, plus an index. Its AI bundle, `.frontx/ai/@gears-frontx/frontx-template-catalogue/`, carries two guidelines: the catalogue contract and how the example files are generated.

The example files (`src/examples/*.tsx`), the foundation pages (`src/pages/`) and `src/shared.tsx` are generated from the kit's own demo by the package's generator (see Source of the examples). The package adds the screen around them: the route tree, a tab bar (Components, Foundations), the navigation panel (All components, the foundations, then the components by family; a page select on a phone), the index (the page header, the intro with a search, the families as list cards with a count each), the component page (the way back, title and family, description, Preview and Code tabs, then "Use in your app" with the install line for the installed kit version and the example to download, and "Component contract" with the type definitions link), the page names and other strings in `i18n/en.json`, the theme from the shell and the page metadata. The layout and the pages are compositions with no stylesheet: they are drawn with the package's blocks in `src/blocks/` (one folder per block with its layout CSS Module, its card, its showcase fixture and its test), built from the kit's components and the kit candidates; a declaration a block keeps that is not layout is a row of `src/blocks/styles-exemptions.json` naming the kit gap it waits for, and `src/blocks/blocks-policy.test.ts` holds those rules. The Code tab's source reaches the page base64-encoded, through the package's own Vite plugin `exampleSourcePlugin.ts`: the MFE loader scans each chunk's text for import statements, and it would take the import lines inside a plain source string for real ones.

## Source of the examples

`src/examples/`, `src/pages/` and `src/shared.tsx` are generated, never edited by hand. The generator, `catalogue-mfe/scripts/generate-catalogue.mjs`, takes the demo files of gears-frontx `packages/ui-kit/demo` at the commit the pinned `@gears-frontx/ui-kit` release was published from, passes each through the content rules and then through its adaptation, and writes the result into the package. The published kit carries no demo sources (its `files[]` holds `dist`, `llms.txt`, `README.md`, `LICENSE` and `NOTICE`), so the generator reads them from the repository; the same package and the same kit version always produce the same files.

- `kit-demo/kit-demo.lock.json`: the kit version, the repository, the commit (`00f71b23`, the commit `@gears-frontx/ui-kit` 0.4.0 was published from), the demo files the catalogue takes (`examples/*.tsx`, `pages/*.ts`, `pages/*.tsx`, `shared.tsx`: 64 examples, 4 page files and `shared.tsx`) and the SHA-256 of each.
- Content rules, applied to every file: long dashes become "-", the design tool's vendor name becomes "the design source", internal mail addresses move to `example.com` (the repository's text policy refuses all three).
- `kit-demo/adaptations/<file>.patch`: one strict unified diff per file the site changes beyond the content rules, headed by its `Kind:` (`mechanical`: the behaviour is the kit's, the edit meets a site rule such as jsx-a11y or links that stay on the page; `substantive`: the page does or shows something else) and its `Reason:`. A hunk whose source lines changed upstream fails the generation instead of being guessed at.

The adaptations (54 files are the demo after the content rules alone):

| File | Kind | Adaptation |
|---|---|---|
| `src/examples/badge.tsx` | mechanical | an element given through `render` made a function so jsx-a11y sees its content (same rendered DOM) |
| `src/examples/breadcrumb.tsx` | mechanical | the same for the stand-in router link; every link points at a `#` fragment instead of `/` or `/components`, which would leave the site |
| `src/examples/button.tsx` | mechanical | the link-styled button is a function `render` for jsx-a11y and points at `#button-link` instead of `#` |
| `src/examples/item.tsx` | mechanical | the link item is a function `render` for jsx-a11y and points at `#notes` instead of `#` |
| `src/examples/marker.tsx` | mechanical | an element given through `render` made a function so jsx-a11y sees its content (same rendered DOM) |
| `src/examples/sidebar.tsx` | mechanical | the same for the search group's label |
| `src/examples/spinner.tsx` | mechanical | the search input's value is a neutral word |
| `src/examples/carousel.tsx` | substantive | the API example reads the current slide when the API arrives and removes its `select` listener on cleanup |
| `src/examples/data-table.tsx` | substantive | the row-actions column has a header |
| `src/examples/input.tsx` | substantive | the Button group example's input has its own value, which its Clear button clears; the invalid and the file inputs have accessible names |
| `src/pages/layout-elevation-page.tsx` | substantive | token values are read on an element of the page; every token name and value breaks anywhere, so on a phone a long one wraps inside its half-width column instead of running past it |
| `src/pages/semantic-colors-page.tsx` | substantive | token values are read on an element of the page; no second title under the page's H1; the note describes the chips instead of pointing at the demo's theme toggle |
| `src/pages/token-utils.ts` | substantive | values are read on an element of the page inside the shadow root, and re-read when the `data-theme` of its scope or of the shadow host changes |
| `src/pages/typography-page.tsx` | substantive | token values are read on an element of the page; no second title under the page's H1 |
| `src/shared.tsx` | substantive | `Measure` renders its children only, without the demo's measurement readout, and keeps its signature; `Section` takes an optional title and lays its content in one column no wider than the page, so a wide example scrolls inside the preview instead of widening the page on a phone |

## Prerequisites

A project with template-shell, template-mfe and template-kit-candidates applied (the shell supplies the host, the screen domain, `src-app/vitest.mfe.base.ts`, `src-app/__test-utils__/` and the `frontxMfGts()` build plugin; template-kit-candidates delivers the workspace package `@gears-frontx/kit-candidates`, the headings, text roles, links and code block the kit does not ship yet). The package pins `@gears-frontx/ui-kit` `0.4.0`, `@gears-frontx/kit-candidates` `0.1.0-alpha.0`, `@gears-frontx/routing` `0.3.0`, `@gears-frontx/routing-tanstack` `0.3.0`, the shell's workspace versions and the kit's own `lucide-react` `1.33.0`, `react-day-picker` `10.0.1` and `recharts` `3.10.1` exactly.

## Screens and routes

| Token | Internal routes | Menu | Port |
|---|---|---|---|
| `catalogue` | `/` (index), `/components/<slug>` (one per example file), `/foundations/<slug>` (one per foundation page) | 30 UI Kit | 3060 |

Address: `/?screen=catalogue`, and a page inside it: `/?screen=catalogue;route=components/button`. Component slugs are the example file names; foundations are `semantic-colors`, `typography`, `layout-elevation`. An unknown slug or path renders the catalogue's not-found page. Another screen opens a component page without reloading with the screen domain's `mount_ext` and the catalogue's own `show_component` action (`gts.frontx.mfes.comm.action.v1~frontx.catalogue.nav.show_component.v1~`, payload `{ component }`, the component's slug) as its `next` step: `mfe.json` declares the action with a closed schema (target: the catalogue's screen; payload: an enum of the component slugs), and the lifecycle registers the handler from `src/frame/showComponent.ts` when it mounts. The catalogue opens no other screen and reads no list of the host's screens; the host lists them in its menu.

## SEO metadata

Declared once, in the `seo` block of the screen extension in `src-app/mfe_packages/catalogue-mfe/mfe.json`: the screen's `title` and `description` describe `/`, and `seo.routes` has one entry per other page. The package's manifest test holds the declared paths equal to the pages of the route tree (its pattern routes expanded over the example files and foundation pages they serve), each page's title equal to its navigation label, and the titles unique.

## Develop

Edit the files here, never the copy under `site/`. A generated file changes only through the generator: a deliberate change to one is kept as a recorded adaptation (`--record`, below), never as a plain hand edit, which `generate:check` refuses. From `src-app/mfe_packages/catalogue-mfe/` (Node only, no install needed):

```bash
npm run generate                                   # regenerate from the locked commit
npm run generate:check                             # regenerate in memory; fails on a hand edit, a pin that differs from the lock, a changed source or an adaptation that no longer applies
npm run generate -- --record src/examples/x.tsx    # keep a deliberate edit of a generated file as its adaptation, then fill in its Kind: and Reason:
npm run generate -- --ref <commit>                 # after pinning a new kit version: the commit that version was published from; lists each adaptation to redo and --record
```

The demo files are fetched from `raw.githubusercontent.com` once per commit and cached in `node_modules/.cache/catalogue-kit-demo/`, only when they match the lock's hashes; `--source <checkout>/packages/ui-kit/demo` reads a local checkout instead. Building the site needs no network: the generated files are stored here. A kit update that adds a component adds its example file; give it its `seo.routes` entry in `mfe.json`, its family in `FAMILY_OF`, and its `label.<slug>` and `description.<slug>` in `src/screens/catalogue/i18n/en.json` (the catalog and manifest tests name what is missing). From the repository root:

```bash
npm run site:assemble             # copy into site/
npm install --prefix site         # once, after adding or renaming a package
npm run dev                       # http://localhost:5173/?screen=catalogue
```

`npm run site:assemble -- --check` reports any difference between this template and the site copy.

## Moving into another project

Copy `src-app/mfe_packages/catalogue-mfe/` and `.frontx/ai/@gears-frontx/frontx-template-catalogue/` into a project that has template-shell, template-mfe and template-kit-candidates applied, then run `npm install` there. Pick another port if 3060 is taken (`package.json` scripts and `mfe.json` `remoteEntry`). The package references no file outside its own directory; it takes `@gears-frontx/kit-candidates` by name.
