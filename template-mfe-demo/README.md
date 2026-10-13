# template-mfe-demo

The FrontX MFE mechanics demo, as a FrontX template.

## What it contributes

Three MFE packages and the template's AI bundle (`.frontx/ai/@gears-frontx/frontx-template-mfe-demo/`, one guideline):

- `src-app/mfe_packages/demo-mfe/`: one package with four screen entries, shown in the menu as "MFE mechanics: isolation", "MFE mechanics: data loading", "MFE mechanics: shared state" and "MFE mechanics: nested widgets". The nested widgets screen runs a nested FrontX app that owns the `widgets` extension domain.
- `src-app/mfe_packages/widgets-fixture-a/`: one widget entry wired as two extension instances (alpha and beta) in the `widgets` domain.
- `src-app/mfe_packages/widgets-fixture-b/`: one widget in the `widgets` domain.

Together they show screens, several entries in one package, shared properties (theme, language), an API service with mocks, an action handler, kit components inside Shadow DOM, and a nested extension domain with concurrently mounted widgets.

The screens are built from the package's own blocks (`demo-mfe/src/blocks/`: ScreenFrame, PageHeader, BridgeInfoCard, ActionRow, ReadingColumn, ScreenSkeleton, SkeletonCard, SwatchGrid, TokenList, WidgetSlot), `@gears-frontx/ui-kit` components and the kit candidates (`@gears-frontx/kit-candidates`); a screen, a page or a widget imports no stylesheet, and every block's stylesheet is layout on the kit's tokens except the rows of `demo-mfe/src/blocks/styles-exemptions.json`, each with the kit gap it waits for. The packages need template-kit-candidates applied for `@gears-frontx/kit-candidates`.

## Source of the examples

The three packages are adapted copies of `template-mfe/src-app/mfe_packages/demo-mfe/`, `widgets-fixture-a/` and `widgets-fixture-b/` from gears-frontx-templates at `3b6cddb` (`main`). 114 of the source files are carried byte-identical at the same path; `demo-mfe/src/api/__test-utils__/mocks.ts` is `demo-mfe/src/test-support/mocks.ts` here; `demo-mfe/.npmrc` is not carried (the site's `.npmrc` governs the install); the UI Kit Elements screen is not carried (`demo-mfe/src/lifecycle-uikit.tsx` and the 16 source files and 36 translation files of `demo-mfe/src/screens/uikit/`; see "The UI Kit Elements screen" below); and `demo-mfe/src/screens/helloworld/HelloWorldScreen.module.css` and `demo-mfe/src/screens/profile/ProfileScreen.module.css` are not carried (the screens import no stylesheet; their layout is the package's blocks). Added here: a README per package, the route trees (`demo-mfe/src/routes-<entry>.tsx`, `demo-mfe/src/shared/screenRoutes.tsx`, `widgets-fixture-a/src/routes.tsx`) with their tests, a manifest test per package, the package's blocks (`demo-mfe/src/blocks/`, each with its stylesheet, card, showcase fixture and test, and the exemptions ledger), `demo-mfe/src/test-support/axe.ts`, `demo-mfe/src/lifecycle-theme-direction.test.tsx`, `demo-mfe/src/test-support/routeTreePaths.ts` and `stubScroll.ts`, and widgets-fixture-b's test setup. The 59 files below differ from the source, each for the reason given. Besides its own adaptation, every source file this template marks carries this template's `@cpt-` traceability markers, which are comments only:

| Files | Adaptation |
|---|---|
| `*/mfe.json` | `templateExample` removed (the packages are site content); screen tokens `mfe-hello-world`, `mfe-profile`, `mfe-theme`, `mfe-widgets` with menu orders 65, 66, 67 and 69; the UI Kit Elements screen's entry and extension are not declared; each of the four screen extensions, under template-mfe's id, has `presentation.group` the id of the host's demos nav group (`gts.frontx.screensets.layout.nav_group.v1~frontx.site.layout.demos.v1`); an `seo` block per screen; in widgets-fixture-a, long dashes replaced with "-" and no spec id in a schema `$comment` |
| `*/package.json` | the site's pins (`@gears-frontx/ui-kit` `0.4.0`, both routing packages where a route tree is rendered); `@gears-frontx/kit-candidates` `0.1.0-alpha.0` in demo-mfe and widgets-fixture-a and `@gears-frontx/ui-kit` in both widget packages, which render kit components; `axe-core` for demo-mfe's block tests; `dev` is template-mfe's `vite build && vite preview --port <port>`, so `concurrently` is not a dependency; widgets-fixture-b gains the test scripts and test dependencies every package has |
| `*/vite.config.ts`, `demo-mfe/vitest.config.ts`, `widgets-fixture-a/tsconfig.json` | the upstream `@cpt-` marker lines removed; both routing packages in `sharedDeps`, so `<ExtensionRouter>` and the route trees use one router; the scroll stand-in for route-tree tests; the `@frontx-test-utils` path every package maps; demo-mfe exposes no UI Kit Elements entry, and its federation build attributes the package's whole CSS to every expose (`bundleAllCSS`), because the four screen entries share the blocks and the kit candidates, whose stylesheets Rollup places in chunks that no expose would otherwise be given |
| `demo-mfe/tsconfig.json` | no `src/screens/uikit` include (the screen is not carried) |
| `widgets-fixture-a/vitest.config.ts` | CSS processing on and `@gears-frontx/ui-kit` inlined, as in demo-mfe, since the widget renders kit components |
| `demo-mfe/src/init.ts`, `demo-mfe/src/init.test.ts` | the app adds `microfrontends({ typeSystem: gtsPlugin })`, whose registry `<ExtensionRouter>` builds each screen's router from; `mock()` comes before `queryCacheShared()`, so the package's first load keeps the page's shared query cache (a FrontX limitation of `queryCacheShared()`), and a test holds that order; the upstream `@cpt-` markers removed; long dashes replaced with "-" |
| `demo-mfe/src/lifecycle-helloworld.tsx`, `demo-mfe/src/lifecycle-profile.tsx`, `demo-mfe/src/lifecycle-theme.tsx`, `demo-mfe/src/lifecycle.test.tsx` | each entry renders its route tree through `<ExtensionRouter>`; every screen entry, the shared state one included, extends `KitThemedLifecycle`, since every screen renders kit components; the suite renders the real route trees over the page address, checks the kit style node is added once and holds every screen entry to the kit-themed base |
| `demo-mfe/src/lifecycle-widgets-host.tsx`, `demo-mfe/src/lifecycle-widgets-host.test.tsx` | the nested widgets screen renders its route tree over its nested app's registry; it reads the manifest aggregate against the shell's document (`document.baseURI`), so the widgets load under any mount folder (a screen MFE cannot learn the shell's base); its nested app adds `mock()` before `queryCacheShared()` (same cache limitation); a path that names no page renders the not-found page and settles `mount()`; the entry extends `KitThemedLifecycle` and the page is built from the package's blocks and kit components (an `Alert` for the error, a labelled `Spinner` for the loading state, kit `Button`s for the pings); the remount tests count only the remount's own work, so they can fail; long dashes replaced with "-" |
| `demo-mfe/src/lifecycle-widgets-host.gts-order.test.ts`, `demo-mfe/src/lifecycle-widgets-host.remount.test.tsx` | no issue tracker reference in the comments and suite names; long dashes replaced with "-" |
| `demo-mfe/src/screens/theme/CurrentThemeScreen.tsx`, `demo-mfe/src/screens/theme/CurrentThemeScreen.test.tsx` | Tailwind utility classes replaced by the package's blocks (SwatchGrid, TokenList, BridgeInfoCard, PageHeader, ReadingColumn, ScreenFrame) and kit and candidate parts; the screen carries the kit's tokens scoped to the shell's theme, so its swatches show the palette every kit component of the page is drawn in; a swatch's caption names its token pair |
| `widgets-fixture-a/src/lifecycle.tsx`, `widgets-fixture-b/src/lifecycle.tsx` | Tailwind utility classes replaced by kit `Item`s (outline for widget A, muted for widget B), which read the tokens the nested widgets screen carries; widgets-fixture-a's route tree moves to `src/routes.tsx`; both widgets' apps add `mock()` before `queryCacheShared()` (same cache limitation) |
| `demo-mfe/src/shared/KitThemedLifecycle.ts`, `demo-mfe/src/shared/kitThemeScope.ts`, `demo-mfe/src/shared/anchorKitThemeOnShadowHost.ts`, `demo-mfe/src/shared/kitThemeScope.test.ts`, `demo-mfe/src/shared/README.md` | the kit's tokens go into one style node marked `data-kit-theme`, however often the shell mounts into the same shadow root; the comments describe this repository (every screen entry extends the base, the widgets inherit the nested widgets screen's tokens, four screen entries, template-mfe's own copies named as such); long dashes replaced with "-" |
| `demo-mfe/src/shared/useScreenTranslations.ts`, `demo-mfe/src/shared/useScreenTranslations.test.tsx` | the hook applies only the latest load and nothing after unmount, so a slower load of an earlier language cannot overwrite the current one; the test that proves it |
| `demo-mfe/src/screens/profile/components/ProfileDetailsCard.tsx`, `demo-mfe/src/screens/profile/ProfileScreen.test.tsx` | the stored profile is trimmed like the edited form, so surrounding spaces are no change, and the card renders its name and department from those null-safe values; the card is built from kit and candidate parts (the name as the card's `h2` title, the avatar as its `CardAction`, the details as a `DescriptionList`, the form in a `FieldGroup`, the save error as an `Alert`) and the ActionRow block; tests for the loading, load error and save error states |
| `demo-mfe/src/screens/helloworld/HelloWorldScreen.tsx`, `demo-mfe/src/screens/profile/ProfileScreen.tsx` | built from the package's blocks, kit components and the kit candidates, with no stylesheet of their own (the profile's load error is an `Alert` with a Retry action); long dashes replaced with "-" |
| `demo-mfe/src/screens/helloworld/HelloWorldScreen.test.tsx`, `demo-mfe/src/actions/profileActions.test.ts` | the unsubscription tests first assert which subscriptions exist; the action test waits for the call instead of counting microtasks and drops an unrelated constant |
| `demo-mfe/src/screens/helloworld/i18n/ja.json`, `demo-mfe/src/screens/helloworld/i18n/zh.json`, `demo-mfe/src/screens/helloworld/i18n/zh-TW.json` | the framework is named FrontX |
| `demo-mfe/src/api/AccountsApiService.ts`, `demo-mfe/src/api/AccountsApiService.test.ts`, `demo-mfe/src/api/mocks.test.ts`, `demo-mfe/src/api/mock-user-store.ts`, `demo-mfe/src/test-support/mocks.ts` | the upstream `@cpt-` markers removed; the test helpers live in `src/test-support/` (the shell's lint reserves `_`-prefixed paths) |
| `demo-mfe/src/refresh-profile-action-schema.test.ts` | the data loading screen's token is `/mfe-profile` and its extension names the host's demos nav group, whose type and instance the test registers first; long dashes replaced with "-" |
| `demo-mfe/src/shared/extension-ids.ts` | without the UI Kit Elements screen's extension id; `DEMOS_NAV_GROUP_ID` mirrors the host's demos nav group the screens name; long dashes replaced with "-" |
| `widgets-fixture-a/src/lifecycle.test.tsx`, `widgets-fixture-a/src/shared-deps.vite-config.test.ts`, `demo-mfe/src/shared/useHostDirection.test.tsx` | long dashes replaced with "-" |
| `demo-mfe/src/actions/profileActions.ts`, `demo-mfe/src/api/mocks.ts`, `demo-mfe/src/api/types.ts`, `demo-mfe/src/screens/profile/profileOptimisticUpdate.ts`, `demo-mfe/src/shared/useBridgeProperty.ts`, `demo-mfe/src/shared/useHostDirection.ts` | this template's `@cpt-` traceability markers only (comments) |

## The UI Kit Elements screen

template-mfe's demo has a fifth screen, UI Kit Elements (`lifecycle-uikit`, `screens/uikit/`), which shows 19 of the kit's components by category. The site does not carry it: the site's catalogue (template-catalogue) shows every kit component with its examples, so a second, partial kit showcase among the MFE mechanics demos would duplicate it and fall behind the kit. Kit components inside Shadow DOM stay shown by every remaining screen, which is built from them. This is a difference of the site, and the change it proposes upstream is the same removal in template-mfe's demo, whose remaining screens already show the kit at work.

## Prerequisites

A project with template-shell and template-kit-candidates applied; the template cannot be applied next to template-mfe 0.1.0-alpha.2, which claims the same packages. The shell supplies the host, the screen domain, `src-app/vitest.mfe.base.ts`, `src-app/__test-utils__/` and the `frontxMfGts()` build plugin; template-kit-candidates supplies `@gears-frontx/kit-candidates` (the typography, description list and `render` title parts the kit does not ship yet). The packages pin `@gears-frontx/ui-kit` `0.4.0`, `@gears-frontx/kit-candidates` `0.1.0-alpha.0`, `@gears-frontx/routing` `0.3.0`, `@gears-frontx/routing-tanstack` `0.3.0` and the shell's workspace versions exactly.

## Screens and routes

| Token | Package (entry) | Internal routes | Menu order | Port |
|---|---|---|---|---|
| `mfe-hello-world` | demo-mfe (helloworld) | `/` | 65 | 3001 |
| `mfe-profile` | demo-mfe (profile) | `/` | 66 | 3001 |
| `mfe-theme` | demo-mfe (theme) | `/` | 67 | 3001 |
| `mfe-widgets` | demo-mfe (widgets_host) | `/`; hosts the `widgets` domain | 69 | 3001 |
| (widget) | widgets-fixture-a | `widgets` domain: `widget-alpha`, `widget-beta` | | 3201 |
| (widget) | widgets-fixture-b | `widgets` domain: `widget-b` | | 3202 |

Addresses: `/?screen=mfe-hello-world`, and so on; the nested widgets screen with a widget entry: `/?screen=mfe-widgets&widgets=widget-alpha`. Every screen renders a route tree (`routes-<entry>.tsx`) with its page at `/` and a not-found page for any other path.

## SEO metadata

Declared once per screen, in the `seo` block of its extension in `src-app/mfe_packages/demo-mfe/mfe.json` (`title`, `description`). The screens have no internal route besides `/`, so they declare no `seo.routes`. Widgets are not pages and carry no `seo`. The package's manifest test holds every declaration to its route tree.

## Develop

Edit the files here, never the copies under `site/`. From the repository root:

```bash
npm run site:assemble             # copy into site/
npm install --prefix site         # once, after adding or renaming a package
npm run dev                       # http://localhost:5173/?screen=mfe-hello-world
```

`npm run site:assemble -- --check` reports any difference between this template and the site copy.

## Moving into another project

Copy the three `src-app/mfe_packages/*` directories and `.frontx/ai/@gears-frontx/frontx-template-mfe-demo/` into a project that has template-shell, template-mfe and template-kit-candidates applied, then run `npm install` there. That project must not also carry template-mfe's own `demo-mfe`, `widgets-fixture-a` and `widgets-fixture-b` (same directory and package names). The packages reference nothing outside their own directories except the named packages they depend on.
