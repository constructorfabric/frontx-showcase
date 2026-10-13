# site-libs-mfe

The libs screen of the FrontX site: the FrontX packages with their versions and install commands, and three short technical summaries (routing, microfrontends, the screen domain), each a route of the screen, with a tab bar across the four.

## Screens and routes

| Token | Route inside the screen | Page | Menu |
|---|---|---|---|
| `libs` | `/` | The libraries, `/?screen=libs` | 35 Libraries |
| `libs` | `/routing` | Routing, `/?screen=libs;route=routing` | |
| `libs` | `/mfes` | Microfrontends, `/?screen=libs;route=mfes` | |
| `libs` | `/screen-domain` | Screen domain, `/?screen=libs;route=screen-domain` | |
| `libs` | any other path | The screen's not-found page | |

## Content

The pages are an outline (`src/content/outline.json`) in the content model of this template's shared folder (`../shared/site/content/outline.ts`). Texts are keys of `src/screens/libs/i18n/en.json`; `{name}` placeholders are filled from `src/data/libraries.generated.json`, which `npm run site:data` writes from the site's `package.json` and lock file, the installed packages, the npm registry (the commit each release was published from) and `site/.frontx/provenance.json`. The data holds the library list, the shell template's workspace packages and the variables the summaries read: a version per package and the addresses of the sources the summaries are written from (the FrontX repository at the commit each summarized package's release was published from, and template-shell at the commit the site applies). The repository's metadata tooling renders the same outline, strings and data as a plain-text twin of each page (`/libs/<route>.md`), which the page links.

The summaries are written from the packages' own documentation and sources at that commit: the READMEs, the type declarations and design documents of `@gears-frontx/routing`, `@gears-frontx/routing-tanstack` and `@gears-frontx/mfes`, and template-shell's framework package and bootstrap. The screen domain page shows this package's own extension from `mfe.json`, and a test holds the two equal.

## Data

`src/api/LibsApiService.ts` serves the data through `@gears-frontx/api` (`RestProtocol` with the package's mock plugin, which `init.ts` switches on by default because the site has no backend): `getLibraries` answers `GET /api/site-libs/libraries`.

## Structure

| Path | What it is |
|---|---|
| `mfe.json` | Manifest, entry and the screen extension with its `route` token, menu entry and `seo` block for every route |
| `src/init.ts` | The package's FrontX app: `microfrontends()` for the screen's own router, `mock()` on by default, the API service registered |
| `src/lifecycle.tsx` | The kit's tokens and the site's brand tokens anchored on the shadow host; the route tree rendered through `<ExtensionRouter>` |
| `src/routes.tsx` | The route tree: one route per outline page and a not-found page |
| `src/screens/libs/` | The libs layout (tab bar), the outline page, the library list, the not-found page and `i18n/en.json` |
| `src/content/outline.json` | The pages' content |
| `src/data/libraries.generated.json` | Generated data |
| `src/shared/` | Screen frame (theme scope, content language and direction), translations hook, kit token anchoring |

## Run alone

The package builds and runs inside an assembled site:

```bash
npm run build      # vite build
npm run preview    # serves the remote at http://localhost:3053/assets/remoteEntry.js
npm run test:unit
npm run type-check
```
