# template-mfe-demo contract

What the MFE mechanics demo guarantees and how to change it without breaking the site.

## Packages and addresses

- `demo-mfe` (port 3001) exposes four entries as `./lifecycle-<entry>`; its screen tokens are `mfe-hello-world`, `mfe-profile`, `mfe-theme`, `mfe-widgets`, menu orders 65, 66, 67 and 69. template-mfe's UI Kit Elements screen is not carried: the catalogue is the kit's showcase. Tokens are public addresses (`/?screen=<token>`): never reuse one for other content.
- `widgets-fixture-a` (port 3201) and `widgets-fixture-b` (port 3202) contribute to the `widgets` domain that demo-mfe declares and the nested widgets screen's nested app registers.
- Package names, directory names and GTS ids are kept from template-mfe, the four screen extension ids included: they are chained directly onto the shell's screen type (`gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~`). Each screen's `presentation.group` is the id of the host's demos nav group (`gts.frontx.screensets.layout.nav_group.v1~frontx.site.layout.demos.v1`), and demo-mfe's `mfe.json` carries no screen type schema (template-site's `menu-groups` guideline). A project cannot carry both this template and template-mfe's demo packages.

## Routing

- Every screen entry has a `routes-<entry>.tsx` route tree (page at `/`, not-found otherwise) rendered through `<ExtensionRouter>` over the app registry. A new internal route goes into the route tree and into the screen's `seo.routes`; the manifest test reads the pages from the route tree and fails until the two agree.
- `@gears-frontx/routing` and `@gears-frontx/routing-tanstack` stay in every package's `sharedDeps` next to `@gears-frontx/react`, so the router and the route tree share one copy and one context.

## Metadata

- Each screen extension carries `seo.title` and `seo.description` (50 to 160 characters). Widget extensions carry none.

## Styling

- A screen, a page or a widget imports no stylesheet and passes no `style`: it composes the package's blocks (`demo-mfe/src/blocks/<Block>/`), `@gears-frontx/ui-kit` components and the kit candidates (`@gears-frontx/kit-candidates`). No Tailwind utility class and no `@apply`.
- A block takes content and behaviour props only (texts, rows, children, callbacks), never a variant or layout switch; a different arrangement is a different block. Its CSS Module is layout on the kit's tokens; any other declaration is a row of `demo-mfe/src/blocks/styles-exemptions.json` naming the kit gap it waits for. Each block has its `.tsx`, `.module.css` (when it lays anything out), `.md` card, `.showcase.tsx` fixture, a test that runs axe on the fixture, and `index.ts`.
- Every screen entry extends `KitThemedLifecycle`, which anchors the kit's tokens on the shadow host; a screen that receives the theme passes it to its `ScreenFrame`, which sets the kit's `data-theme` scope. The nested widgets screen receives no theme and takes the scope its shadow host carries. The widget packages render kit components on `ThemeAwareReactLifecycle` and read the tokens the nested widgets screen carries; they have no theme property to scope by.
- demo-mfe's federation build keeps `bundleAllCSS: true`: the screen entries share blocks and candidates, whose stylesheets would otherwise sit in chunks no expose is attributed, and the host injects only attributed CSS.
