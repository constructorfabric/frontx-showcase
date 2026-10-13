# site-docs-mfe

The docs screen of the FrontX site: an overview and two guides, each a route of the screen, with a tab bar across the three.

## Screens and routes

| Token | Route inside the screen | Page | Menu |
|---|---|---|---|
| `docs` | `/` | Docs overview, `/?screen=docs` | 40 Docs |
| `docs` | `/get-started` | Run a shell and its first MFE, `/?screen=docs;route=get-started` | |
| `docs` | `/first-change` | Make your first change, `/?screen=docs;route=first-change` | |
| `docs` | any other path | The screen's not-found page | |

## Content

The pages are an outline (`src/content/outline.json`) in the content model of this template's shared folder (`../shared/site/content/outline.ts`): numbered steps with a titled command block, an expected result and a note, collapsible "versions and limits" blocks, cards, panels with links, a closing band and an "On this page" list that moves focus to the heading it jumps to. Texts are keys of `src/screens/docs/i18n/en.json`; `{name}` placeholders in texts and commands are filled from `src/data/versions.generated.json`, which `npm run site:data` writes from the root `package.json` and lock file (the CLI's pin), the npm registry (the commit the CLI release was published from), `site/.frontx/provenance.json`, `.nvmrc` and the root `packageManager` pin. The repository's metadata tooling renders the same outline, strings and data as a plain-text twin of each page (`/docs/<route>.md`), which the page links.

The commands of the get-started and first-change pages were run in a clean directory with the same CLI release from the registry before they were published here. The FrontX packages the site's application depends on are listed by the Libs screen (`site-libs-mfe`); the overview and get-started pages link to it.

## Data

`src/api/DocsApiService.ts` serves the version data (the CLI, the template source-specs and the toolchain) through `@gears-frontx/api` (`RestProtocol` with the package's mock plugin, which `init.ts` switches on by default because the site has no backend): `getVersions` answers `GET /api/site-docs/versions`.

## Structure

| Path | What it is |
|---|---|
| `mfe.json` | Manifest, entry and the screen extension with its `route` token, menu entry and `seo` block for every route |
| `src/init.ts` | The package's FrontX app: `microfrontends()` for the screen's own router, `mock()` on by default, the API service registered |
| `src/lifecycle.tsx` | Kit tokens anchored on the shadow host; the route tree rendered through `<ExtensionRouter>` |
| `src/routes.tsx` | The route tree: one route per outline page and a not-found page |
| `src/screens/docs/` | The docs layout (tab bar, outline page), the not-found page, their CSS Modules and `i18n/en.json` |
| `src/content/outline.json` | The pages' content |
| `src/data/versions.generated.json` | Generated version data |
| `src/shared/` | Screen frame (theme scope, direction), translations hook, kit token anchoring |

## Run alone

The package builds and runs inside an assembled site:

```bash
npm run build      # vite build
npm run preview    # serves the remote at http://localhost:3052/assets/remoteEntry.js
npm run test:unit
npm run type-check
```
