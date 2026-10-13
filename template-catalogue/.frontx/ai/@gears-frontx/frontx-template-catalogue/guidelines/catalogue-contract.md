# template-catalogue contract

What the ui-kit catalogue guarantees and how to change it without breaking the site.

## The screen and its pages

- Package `@gears-frontx/catalogue-mfe`, port 3060, one screen extension with `route: "/catalogue"`, menu label "UI Kit", order 30.
- Pages: `/` (index), `/components/<slug>` for each `src/examples/<slug>.tsx`, `/foundations/<slug>` for `semantic-colors`, `typography`, `layout-elevation`. The addresses are public (`/?screen=catalogue;route=components/button`): never reuse a slug for other content.

## The generated files

- `src/examples/`, `src/pages/` and `src/shared.tsx` are generated from the kit's `packages/ui-kit/demo` at the commit of the pinned kit release, through content rules and per-file adaptations (`catalogue-generation.md`). Never edit them by hand; `npm run generate:check` fails on any difference.
- The examples import `../shared`; that is why the package's own helpers live in `src/frame/`.

## Adding or removing an example

- Example files come and go with the kit release (`catalogue-generation.md`); add or remove the matching `seo.routes["/components/<slug>"]` entry in `mfe.json` (title equal to the page's navigation label, unique, description 50 to 160 characters). Name its family in `FAMILY_OF`, and its name (`label.<slug>`) and one-line description (`description.<slug>`) in `src/screens/catalogue/i18n/en.json`; add an icon to `ICON_MAP` in `src/catalog.ts` if the generic one does not fit.
- The component page reads the example file's own source for its Code tab and its download link, and links the type definitions the installed kit version publishes; the catalog test fails when an example has no family, name or description or the kit ships no type definitions for its slug.
- The source arrives through the `?example-source` import that `exampleSourcePlugin.ts` serves as base64, in `vite.config.ts` and `vitest.config.ts` alike. Never switch it to `?raw`: the MFE loader scans a chunk's text for import statements and would take those inside the source string for real ones, so the Code tab would never load.
- The manifest test fails until the declared paths equal the pages of the route tree (`/` and its two pattern routes expanded over the example files and foundations) and each title equals its `label.<slug>` string; the pages test renders every page at its own route and fails on an error boundary.

## Frame and styling

- New code uses the kit's components, then the kit candidates (`@gears-frontx/kit-candidates`), then a block in `src/blocks/<Block>/` whose CSS Module declares layout on kit tokens; a declaration that is not layout needs a row in `src/blocks/styles-exemptions.json` with the kit gap it waits for. The layout and the pages import no stylesheet. No Tailwind utility classes, no `@apply`. The kit's tokens are anchored on the shadow host by the lifecycle; `data-theme` and `dir` follow the shell's theme and language on the screen root.
- Navigation inside the screen uses routing-tanstack `Link` (it renders the page's composed address as `href`); never write the URL by hand.
- The toast region (`<Toaster />`) is mounted inside the screen with its own name (`toast_region_label`), so it is not a second landmark named like the shell's; the toast example sends its toasts there.
- The index lists the component families in `FAMILIES` order. The navigation panel lists Components (All components), Foundations, then the same families in the same order. A navigation group is `role="group"`, not a section, so no group is a region landmark named like an index section.
- The tab bar has two sections: Components (`/` and every component page) and Foundations (every foundation page; the tab opens the first).
- The catalogue knows no other screen: it reads no `generated-mfe-manifests.json` or other list of screens, uses no routing grammar and links to no other screen; the host lists the application's screens. Another screen opens a component page by sending `mount_ext` for the catalogue and then `show_component` (`gts.frontx.mfes.comm.action.v1~frontx.catalogue.action.show_component.v1~`, payload `{ component }`), which `mfe.json` declares with a closed schema whose payload enum is the component slugs; `src/manifest.test.ts` holds the enum to the components, so a new example file needs its slug added to the `enum` of the `show_component` schema in `mfe.json`.
