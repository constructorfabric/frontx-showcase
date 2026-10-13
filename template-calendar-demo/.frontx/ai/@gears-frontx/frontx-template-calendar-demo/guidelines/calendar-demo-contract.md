# template-calendar-demo contract

What the calendar demo screen package guarantees and how to change it without breaking the site.

## The screen

- Package `@gears-frontx/calendar-demo-mfe`, directory `src-app/mfe_packages/calendar-demo-mfe/`, port 3070.
- One screen extension in the shell's screen domain with `route: "/calendar"` (the token in `/?screen=calendar`), menu label "Calendar: coming soon", order 60, `presentation.group` the id of the host's demos nav group (`gts.frontx.screensets.layout.nav_group.v1~frontx.site.layout.demos.v1`). The extension is a plain screen extension: its id is chained directly onto the shell's screen type (`gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~frontx.calendar_demo.screens.calendar.v1`) and `mfe.json` carries no screen type schema (template-site's `menu-groups` guideline). The site's header lists the demos group's screens under one entry.
- One page: `/` renders a placeholder that says the calendar demo is in development. Any other path renders the screen's not-found page. Each page has exactly one `<h1>`.
- The package depends on no calendar package; the page is built from `@gears-frontx/ui-kit` components (`Empty` and its parts) and an icon from `lucide-react`.

## Metadata

- Page metadata lives only in the `seo` block of the screen extension in `mfe.json`: `title` (equal to the page's heading), `description` (50 to 160 characters) and `indexable: false`. There is no `seo.routes`; the manifest test fails when the route tree gains a page.
- The screen never writes `document.title` or head tags; the site's head-sync applies the `seo` block.

## Theme and direction

- Theme and language come from the shell's shared properties through `ScreenFrame`, which sets the kit's `data-theme` scope and `dir` on the screen's root element and on the shadow host. The lifecycle puts the ui-kit tokens (re-anchored on the shadow host) into the shadow root.

## Styling

- `@gears-frontx/ui-kit` components first, then the kit candidates (`@gears-frontx/kit-candidates`) for what the kit does not ship yet (a heading-capable `EmptyTitle`, `Link`). The pages import no stylesheet; only the screen frame's CSS Module lays the screen out on the kit's tokens. No Tailwind utility classes, no `@apply`.

## Build

- `vite.config.ts` keeps template-mfe's form. `@gears-frontx/routing` and `@gears-frontx/routing-tanstack` stay in `sharedDeps` so `<ExtensionRouter>` and the route tree share one router.
