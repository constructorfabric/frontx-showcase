# calendar-demo-mfe

The calendar demo screen of the FrontX site, in development: one placeholder page built from `@gears-frontx/ui-kit` components.

## Screens and routes

| Token | Route inside the screen | Page | Menu |
|---|---|---|---|
| `calendar` | `/` | The placeholder: the calendar demo is in development, `/?screen=calendar` | 60 Calendar |
| `calendar` | any other path | The screen's not-found page, with a link back to `/` | |

## Structure

| Path | What it is |
|---|---|
| `mfe.json` | Manifest, entry and the screen extension with its `route` token, menu entry and `seo` block (`indexable: false`) |
| `src/init.ts` | The package's FrontX app, with `microfrontends()` so the screen can render its own router |
| `src/lifecycle.tsx` | The ui-kit tokens (re-anchored on the shadow host) in the shadow root; the route tree rendered through `<ExtensionRouter>` |
| `src/routes.tsx` | The route tree: `/` and a not-found page |
| `src/screens/calendar/` | The placeholder and not-found pages, their styles and `i18n/en.json` |
| `src/shared/` | Screen frame (theme scope and direction, also on the shadow host), translations hook, kit token anchoring |
| `src/test-support/` | A jsdom stand-in for scrolling and the route-tree path reader |

The pages are `@gears-frontx/ui-kit` components and kit candidates (`EmptyTitle` rendered as the `h1`, `Link` over the router link) and import no stylesheet; the screen frame's CSS Module lays the page out on the kit's tokens. The routing packages are externalized with the other shared dependencies so `<ExtensionRouter>` and the route tree use one router.

## Run alone

The package builds and runs inside an assembled site (template-shell supplies `vitest.mfe.base.ts`, `__test-utils__` and the build plugin):

```bash
npm run build      # vite build
npm run preview    # serves the remote at http://localhost:3070/assets/remoteEntry.js
npm run test:unit
npm run type-check
```
