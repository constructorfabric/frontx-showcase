# catalogue-mfe

The `@gears-frontx/ui-kit` catalogue screen: an index, a page per component example and per design-token foundation page.

## Screens and routes

| Token | Route inside the screen | Page |
|---|---|---|
| `catalogue` | `/` | Index: the page header, the intro with a search, and the components grouped by family, a list card with a count each |
| `catalogue` | `/components/<slug>` | One component: the way back, title and family, description, the example (`src/examples/<slug>.tsx`, loaded lazily) in a Preview tab and its source in a Code tab, then two columns: "Use in your app" (install for the installed kit version, where the theme and the imports come from, the example file to download) and "Component contract" (the kit publishes no contracts yet, and the type definitions of the installed version) |
| `catalogue` | `/foundations/<slug>` | One foundations page (`src/pages/`) |
| `catalogue` | any other path | The catalogue's not-found page |

A tab bar (Components, Foundations) runs across the screen. The navigation panel lists All components, the foundations, then every component under its family's label, and ends with the kit version; on a phone a page select under the tab bar replaces it. Rows and index entries are routing-tanstack `Link`s. The screen links to no other screen; another screen opens a component page through the catalogue's `show_component` action (`src/frame/showComponent.ts`). Each page's title is its `<h1>`; an example renders behind its own error boundary, so a broken example stays on its own page.

## Structure

| Path | What it is |
|---|---|
| `mfe.json` | Manifest, entry, the screen extension with `route`, menu entry and `seo` (one entry per page) |
| `src/examples/`, `src/pages/`, `src/shared.tsx` | Generated from the kit's demo; never edited by hand (see the template README) |
| `scripts/generate-catalogue.mjs` | The generator of those files and its `--check` (tests beside it) |
| `kit-demo/` | The generator's input: the lock (kit version, source commit, file hashes) and one adaptation per file the site changes |
| `src/catalog.ts` | The page list: components from the `examples/*.tsx` glob with their families and source loaders, the foundations, labels, row and family icons |
| `src/routes.tsx` | The route tree |
| `src/screens/catalogue/` | Layout (tab bar, navigation panel, page select, toast region), pages, the screen's strings (`CatalogueText.tsx` loads `i18n/*.json` once for the route tree), CSS Modules |
| `src/frame/` | Screen frame (theme scope, direction, bridge), the translations hook, kit token anchoring, error boundary, the kit version and the `show_component` action handler (`showComponent.ts`). Named `frame/`, not `shared/`, because the examples import `../shared` and resolve it to `src/shared.tsx` |
| `src/init.ts`, `src/lifecycle.tsx` | The package app with `microfrontends()`; the lifecycle puts the kit's tokens into the shadow root and renders the route tree through `<ExtensionRouter>` |
| `src/test-support/` | Test helpers: route-tree rendering, the route tree's paths, jsdom stand-ins for browser APIs |

The new code styles with CSS Modules on kit tokens. The examples keep their inline `style` objects on kit variables and one kit utility class (`shimmer` in `marker.tsx`).

## Run alone

Inside an assembled site:

```bash
npm run build      # vite build
npm run preview    # serves the remote at http://localhost:3060/assets/remoteEntry.js
npm run test:unit  # includes a render of every page at its own route
npm run type-check
npm run generate:check  # the generated files equal a fresh generation from the pinned kit release
```
