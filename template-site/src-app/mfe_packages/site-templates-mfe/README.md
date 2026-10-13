# site-templates-mfe

The templates screen of the FrontX site: an index of the templates, grouped by what they are for, and one page per template.

## Screens and routes

| Token | Route inside the screen | Page | Menu |
|---|---|---|---|
| `templates` | `/` | Templates index, `/?screen=templates` | 20 Templates |
| `templates` | `/<template>` | One page per template, for example `/?screen=templates;route=template-shell` | |
| `templates` | any other path | The screen's not-found page | |

The templates are template-shell, template-mfe and template-design-guardrails (the official ones, at the commit `site/.frontx/provenance.json` records) and this repository's five templates.

## Content

`src/content/outline.generated.json` holds the pages in the content model of this template's shared folder (`../shared/site/content/outline.ts`). `npm run site:data` writes it from each template's `frontx-template.json` (identity, version, description, claimed paths), the template's source (each key file is checked to exist, counted and carried with its content, bounded in size: `site:data` fails on a key file over 40000 bytes or a page over 120000 bytes of key files) and the hand-written `src/content/guide.json` (groups, template type, requirements, key files, live screens, next steps). A template page has a Files tab (the key files, a find box, a viewer with Copy and, for the official templates, a link to the file at the pinned commit) and, where the template contributes screens of this site, an Example tab that links them; `npm run site:data -- --check` fails when it is out of date. Texts are keys of `src/screens/templates/i18n/en.json`. The repository's metadata tooling renders the same outline as a plain-text twin of each page (`/templates/<route>.md`).

## Data

`src/api/TemplatesApiService.ts` serves the outline through `@gears-frontx/api` (`RestProtocol` with the package's mock plugin, which `init.ts` switches on by default because the site has no backend): `getCatalogue` answers `GET /api/site-templates/catalogue`. The route tree is built from the same generated file when the module loads, so the routes are static by design: the page set is fixed when the site is generated.

## Structure

| Path | What it is |
|---|---|
| `mfe.json` | Manifest, entry and the screen extension with its `route` token, menu entry and `seo` block for every route |
| `src/init.ts` | The package's FrontX app: `microfrontends()` for the screen's own router, `mock()` on by default, the API service registered |
| `src/lifecycle.tsx` | Kit tokens anchored on the shadow host; the route tree rendered through `<ExtensionRouter>` |
| `src/routes.tsx` | The route tree: one route per outline page and a not-found page |
| `src/screens/templates/` | The page, the not-found page, their CSS Module and `i18n/en.json` |
| `src/content/` | The guide and the generated outline |
| `src/shared/` | Screen frame (theme scope, direction), translations hook, kit token anchoring |

## Run alone

The package builds and runs inside an assembled site:

```bash
npm run build      # vite build
npm run preview    # serves the remote at http://localhost:3051/assets/remoteEntry.js
npm run test:unit
npm run type-check
```
