# template-site-brand

The brand of the FrontX site as a FrontX template: one package that puts the site's colours, display type, typeface and brand assets on top of `@gears-frontx/ui-kit`, from one record that also keeps the V2 design value of every row, and a check that holds the site to it.

## What it contributes

One package, `src-app/verify_packages/site-brand/` (`@gears-frontx/site-brand`), in the shell's workspace root for template-delivered packages, and its AI bundle `.frontx/ai/@gears-frontx/frontx-template-site-brand/` with the brand guideline.

- `src/brand.json`: the single source. Each row holds a token, our value, the V2 value, the reason for a difference and the role; it also holds the background and text pairs held at 4.5:1 and the head colours.
- `src/tokens.css` and `src/theme.ts`, generated from the record: brand values on kit tokens and the brand tokens the kit lacks; the complete light and dark variable sets for the theme registry.
- `src/font.css`: the variable Inter under the family name the kit's type tokens name.
- `src/document.css`: the document entry importing the two stylesheets.
- `src/assets/`: brand images used inside pages (`constructor-weave.svg`, the lockup logo).
- `src/art/`: the brand art, one component per entry, each with its palette at the top of its stylesheet and no outer layout: `HairlineFigure` (line-art stocks `hub`, `riffle`, `turntable`, `rebuild`, `loupe`, `rest`, 5:4), `TemplateFigure` (the figure of a template role), `HeroArt` and `ClosingVisual` (the application slab), `ArchitectureFigure` (the shell, screens, kit and rules map; labels and links as props), `WorkbenchFigure` (the change-story workbench, light and dark), `ChartThumb` and `MetricBars` (chart art over the kit's chart container). Blocks take them through content slots.
- `src/check/`: `generate` and `check` (`brand:check`, eight rules: generated files, kit names, create-theme value rules, contrast, V2 record, use, one source, head colours).

Exports: `./document.css`, `./tokens.css`, `./font.css`, `./theme`, `./brand.json`, `./assets/*`, `./art/*`.

## Prerequisites

A project with template-shell applied whose document entry loads every `src-app/verify_packages/*/src/document.css` after the kit's `theme.css` (the FrontX site's shell does; template-shell itself has no such convention yet) and whose screens adopt the document's head styles into their shadow roots (template-shell's `ThemeAwareReactLifecycle`). The package pins `@gears-frontx/ui-kit` `0.4.0`, `@fontsource-variable/inter` `5.3.0` and `recharts` `3.10.1`, takes React `19.2.4` as a peer, and the shared toolchain at the shell's versions, exactly. The head colours are checked against a site config (`site.config.json`) with `themeColor` and `backgroundColor`.

## Screens and routes

None. The package contributes no screen and no route; every screen receives the brand through the document.

## SEO metadata

None of its own. The brand record holds the head colours (`themeColor`, `backgroundColor`) and the check holds the site config to them; the project's metadata pipeline writes them into the head and the web manifest.

## Develop

Edit the files here, never the copy under `site/`. From the repository root:

```bash
node template-site-brand/src-app/verify_packages/site-brand/src/check/cli.ts generate --kit site/node_modules/@gears-frontx/ui-kit/dist/theme.css
npm run site:assemble                             # copy into site/
npm install --prefix site                         # once, after a dependency change
node site/src-app/verify_packages/site-brand/src/check/cli.ts check
npm run test:unit --workspace=@gears-frontx/site-brand --prefix site
```

`check` defaults to the project the package sits in, the kit it installs, `src-app` as the sources to scan and the first `site.config.json` found in the project or its parent directory; `--project`, `--kit`, `--config` and `--scan` (repeatable) override them. `generate` rewrites `src/tokens.css`, `src/theme.ts` and the token table of the guideline; never edit those by hand.

## Moving into another project

Copy `src-app/verify_packages/site-brand/` and `.frontx/ai/@gears-frontx/frontx-template-site-brand/` into a project that has template-shell applied, run `npm install`, and load `@gears-frontx/site-brand/document.css` once in the document after the kit's `theme.css` (or add the `verify_packages/*/src/document.css` glob to the shell entry). Replace `brand.json` with the project's brand and run `generate`. The package references nothing outside its own directory except the guideline it updates in its AI bundle.
