# template-site-meta

The page metadata pipeline of the FrontX site as a FrontX template: one tooling package that turns the screens' `seo` blocks and a site config into the document head, the discovery files, the web manifest and plain-text twins, checks them, and keeps the head equal to the current page at run time.

## What it contributes

One tooling package, `src-app/verify_packages/site-meta/` (`@gears-frontx/site-meta`): TypeScript run by Node's type stripping, no build step. It lands in the shell's workspace root for template-delivered packages, so the shell's install, type-check (`type-check:mfe`), lint and `test:unit` reach it without wiring. Its AI bundle, `.frontx/ai/@gears-frontx/frontx-template-site-meta/`, carries one guideline: what it does, how to configure it, and what is generated.

- `generate`, after the project's build: the head block of `dist/index.html` (site-level tags, the page map and the bundled head-sync script), `sitemap.xml`, `robots.txt`, `llms.txt`, `seo-manifest.json`, `site.webmanifest` and a Markdown twin of every outline page.
- `check`: the metadata rules over the composed sources, and that the outputs in `dist/` equal what the sources generate now.
- head-sync, the browser runtime inside the generated `index.html`, and `src/dev.ts`, which renders a twin for the dev server and names its content type, `text/plain; charset=utf-8`; a static host serves the generated twins the same way, since a browser downloads `text/markdown` instead of showing it.

## Prerequisites

A project with template-shell applied (its `src-app/verify_packages/*` workspace root, the screen domain instance under `packages/framework/`, `src-app/mfe_packages/` and the `dist/` its build writes). The package pins `@gears-frontx/routing` `0.3.0` and `@gears-frontx/routing-tanstack` `0.3.0`, and the shared toolchain at the shell's versions, exactly. The head links the icon set under `public/brand/`, which the project supplies.

## Screens and routes

None. The package contributes no screen and no route; it reads the screens other templates contribute.

## SEO metadata

This template is the SEO pipeline. Each screen declares its pages once, in the `seo` block of its screen extension in `mfe.json`; site-level values come from the site config (`site.config.json` in the project, or the file `--config` names). Rules `check` holds: every screen extension has a `seo` block with a title and a 50 to 160 character description, route keys are paths inside the screen, no two pages share a title or a canonical URL, a share image has its alternative text, and head-sync bundles the project's routing version.

## Develop

Edit the files here, never the copy under `site/`. From the repository root:

```bash
npm run site:assemble                             # copy into site/
npm install --prefix site                         # once, after a dependency change
SITE_ORIGIN=http://localhost:4173 npm run build   # builds the site, then seo:generate
npm run seo:check
npm run test:unit --workspace=@gears-frontx/site-meta --prefix site
```

The repository passes its own config and raster record: `--config site.config.json --rasters assets/rasters.json`. `npm run site:assemble -- --check` reports any difference between this template and the site copy.

## Moving into another project

Copy `src-app/verify_packages/site-meta/` and `.frontx/ai/@gears-frontx/frontx-template-site-meta/` into a project that has template-shell applied, run `npm install`, put `site.config.json` in the project root (or pass `--config`), and run `node src-app/verify_packages/site-meta/src/cli.ts generate` after `npm run build`. Serving twins in dev needs a `.md` middleware in `vite.config.ts` that calls `devTwin` of `src/dev.ts`. The package references nothing outside its own directory.
