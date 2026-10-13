# demo-mfe

Four screens of the FrontX MFE mechanics demo in one Module Federation remote, each its own entry and exposed module.

## Screens and routes

| Token | Entry / exposed module | Route tree | Page |
|---|---|---|---|
| `mfe-hello-world` | `helloworld` / `./lifecycle-helloworld` | `src/routes-helloworld.tsx` | Bridge information, theme and language from the shell, navigation actions |
| `mfe-profile` | `profile` / `./lifecycle-profile` | `src/routes-profile.tsx` | A user profile from `AccountsApiService` (mocked), with an optimistic edit and a `refresh_profile` action handler |
| `mfe-theme` | `theme` / `./lifecycle-theme` | `src/routes-theme.tsx` | The shell's current theme as colour swatches |
| `mfe-widgets` | `widgets_host` / `./lifecycle-widgets-host` | `src/routes-widgets-host.tsx` | A nested FrontX app that owns the `widgets` domain and mounts the widget packages |

Each route tree has the page at `/` and a not-found page for any other path (`src/shared/screenRoutes.tsx`). The lifecycles render the trees through `<ExtensionRouter>` over the package app's registry (`microfrontends()` in `src/init.ts`; the Widgets Host uses its own nested app).

## Structure

| Path | What it is |
|---|---|
| `mfe.json` | Manifest, the `refresh_profile` action schema, the `widgets` domain, four entries, four screen extensions with `route`, menu entry in the host's demos nav group and `seo` |
| `src/init.ts` | The package app: effects, shared query cache, mocks, `microfrontends()` |
| `src/lifecycle-<entry>.tsx` | One lifecycle per entry; `KitThemedLifecycle` anchors the kit's tokens on the shadow host for the kit-based screens |
| `src/screens/<screen>/` | Screens, their tests and `i18n/` (36 locales); no stylesheet. The nested widgets page lives in `src/lifecycle-widgets-host.tsx` with its English strings inline |
| `src/blocks/<Block>/` | The blocks the screens are built from: ScreenFrame, PageHeader, BridgeInfoCard, ActionRow, ReadingColumn, ScreenSkeleton, SkeletonCard, SwatchGrid, TokenList, WidgetSlot; each with its layout stylesheet, card, showcase fixture and test; `styles-exemptions.json` lists the declarations that are not layout on tokens |
| `src/api/` | `AccountsApiService`, mocks and types |
| `src/shared/` | Lifecycle base, kit token anchoring, bridge hooks, translations hook, route-tree helpers |
| `src/test-support/` | Test helpers |

Screens import no stylesheet: they compose the blocks, `@gears-frontx/ui-kit` components and the kit candidates. Every screen entry extends `KitThemedLifecycle`, so each shadow root carries the kit's tokens; the screens that receive the theme scope them to it through `ScreenFrame`. The federation build attributes the package's whole CSS to every expose (`bundleAllCSS`), because the entries share blocks whose stylesheets would otherwise sit in shared chunks the host never injects.

## Run alone

Inside an assembled site:

```bash
npm run build      # vite build
npm run preview    # serves the remote at http://localhost:3001/assets/remoteEntry.js
npm run test:unit
npm run type-check
```
