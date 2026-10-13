# site-home-mfe

The home screen of the FrontX site: the landing page that says what FrontX is and leads to the templates, the docs and the UI kit.

## Screens and routes

| Token | Route inside the screen | Page | Menu |
|---|---|---|---|
| `home` | `/` | The home page, `/?screen=home` | 10 Home |
| `home` | any other path | The screen's not-found page | |

The page has a hero with the two ways in (docs and templates), the three templates that give an application its structure, the architecture as an inline SVG diagram on the kit's tokens, a worked first change (task, one-line diff, result), live UI kit samples (inert, each tile one link to its catalogue page), three steps to a running application and a closing call to action. Links to other screens are their canonical addresses (`shared/site/navigation/SiteLink.tsx`).

## Structure

| Path | What it is |
|---|---|
| `mfe.json` | Manifest, entry and the screen extension with its `route` token, menu entry and `seo` block |
| `src/init.ts` | The package's FrontX app, with `microfrontends()` so the screen can render its own router |
| `src/lifecycle.tsx` | Kit tokens anchored on the shadow host; the route tree rendered through `<ExtensionRouter>` |
| `src/routes.tsx` | The route tree: `/` and a not-found page |
| `src/screens/home/` | The home page, its two diagrams, the not-found page, their CSS Modules and `i18n/en.json` |
| `src/shared/` | Screen frame (theme scope, direction), translations hook, kit token anchoring |

Styles are CSS Modules on `@gears-frontx/ui-kit` tokens. The routing packages are externalized with the other shared dependencies so `<ExtensionRouter>` and the route tree use one router.

## Run alone

The package builds and runs inside an assembled site (template-shell supplies `vitest.mfe.base.ts`, `__test-utils__` and the build plugin):

```bash
npm run build      # vite build
npm run preview    # serves the remote at http://localhost:3050/assets/remoteEntry.js
npm run test:unit
npm run type-check
```
