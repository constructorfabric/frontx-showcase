# template-calendar-demo

The calendar demo screen of the FrontX site as a FrontX template. The calendar kit it will demonstrate is in development, so the screen is a placeholder.

## What it contributes

One screen MFE package, `src-app/mfe_packages/calendar-demo-mfe/`: one page that says the calendar demo is in development, built from the `Empty` component of `@gears-frontx/ui-kit`, with the theme and the text direction of the shell. Its AI bundle, `.frontx/ai/@gears-frontx/frontx-template-calendar-demo/`, carries one guideline.

The package depends on no calendar package. The calendar components the UI kit already has (`Calendar`, `Date Picker`) are shown on their own pages of the catalogue screen.

## Prerequisites

A project with template-shell, template-mfe and template-kit-candidates applied (the shell supplies the host, the screen domain, `src-app/vitest.mfe.base.ts`, `src-app/__test-utils__/` and the `frontxMfGts()` build plugin; template-kit-candidates supplies `@gears-frontx/kit-candidates`, whose `EmptyTitle` renders the page heading and whose `Link` renders the router link). The package pins `@gears-frontx/ui-kit` `0.4.0`, `@gears-frontx/kit-candidates` `0.1.0-alpha.0`, `@gears-frontx/routing` `0.3.0`, `@gears-frontx/routing-tanstack` `0.3.0`, `lucide-react` at the kit's version and the shell's workspace versions exactly.

## Screens and routes

| Token | Internal routes | Menu | Port |
|---|---|---|---|
| `calendar` | `/` (the placeholder): 1 page | 60 Calendar | 3070 |

Address: `/?screen=calendar`. Any other path inside the screen renders the screen's not-found page with a link back to `/`.

## SEO metadata

Declared once, in the `seo` block of the screen extension in `src-app/mfe_packages/calendar-demo-mfe/mfe.json`: `title`, `description` and `indexable: false`, so the page is served with `noindex` and stays out of the sitemap and `llms.txt`. The block has no `seo.routes`. The package's manifest test holds the route tree to `/` alone, the title equal to the page's heading and the description to 50 to 160 characters. The screen never writes the document title or head tags.

## Develop

Edit the files here, never the copy under `site/`. From the repository root:

```bash
npm run site:assemble             # copy into site/
npm install --prefix site         # once, after adding or renaming a package
npm run dev                       # http://localhost:5173/?screen=calendar
```

`npm run site:assemble -- --check` reports any difference between this template and the site copy.

## Moving into another project

Copy `src-app/mfe_packages/calendar-demo-mfe/` and `.frontx/ai/@gears-frontx/frontx-template-calendar-demo/` into a project that has template-shell and template-mfe applied, then run `npm install`. Pick another port if 3070 is taken (`package.json` scripts and `mfe.json` `remoteEntry`). The package references nothing outside its own directory.
