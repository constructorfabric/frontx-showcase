# template-site-blocks

The blocks of the FrontX site as a FrontX template: one workspace package, `@gears-frontx/site-blocks`, with the section-level compositions the site's pages are built from, and a showcase screen that renders every block on its own route. Every block is built only from `@gears-frontx/ui-kit` components, kit candidates, brand art and tokens, lays out with layout-only styles and takes content-only props; each arrangement the design draws is its own block.

## What it contributes

- `src-app/verify_packages/site-blocks/` (`@gears-frontx/site-blocks`): TypeScript and CSS Modules source, no build step; the consuming screen package's build bundles it. One folder per block under `src/blocks/<Block>/` with the block, its layout stylesheet, its card, its fixture, its test and its entry; each block is imported from `@gears-frontx/site-blocks/<Block>`. `src/layout.css` declares the layout tokens (page column, header column and height, section and page rhythms, rail and lead columns); `src/document.css` brings them into the document through the shell's document-entry convention. `styles-exemptions.json` lists every non-layout declaration of a block stylesheet with the kit gap it waits for. `src/showcase.ts` collects the fixtures.
- `src-app/mfe_packages/site-blocks-mfe/`: the showcase screen.
- `.frontx/ai/@gears-frontx/frontx-template-site-blocks/`: one guideline with the block rules.

Blocks: `SectionFrame`, `Hero`, `Features`, `ArchitectureMap`, `ChangeStory`, `KitShowcase`, `MetricComparison`, `LogoStrip`, `GetStartedSteps`, `ClosingCta` (landing page); `PageIntro`, `DocsFrame`, `DocsFrameWithRail`, `TemplateDetailFrame`, `SectionHeading`, `GuideClosingHeading`, `PathCards`, `StartPaths`, `TemplatePair`, `TemplateRow`, `CardTiles`, `Panels`, `CtaBox`, `CtaRule`, `ActionRow`, `Facts`, `PackageList`, `GuideStep`, `GuideStepUnnumbered`, `AgentTask`, `Troubleshooting`, `FileExplorer` (inner pages).

## Prerequisites

A project with template-shell (its `src-app/verify_packages/*` and `src-app/mfe_packages/*` workspace roots and its document-entry convention), template-mfe, template-site-brand and template-kit-candidates applied. The blocks package pins `@gears-frontx/ui-kit` `0.4.0`, `@gears-frontx/kit-candidates` `0.1.0-alpha.0`, `@gears-frontx/site-brand` `0.1.0-alpha.0` and `lucide-react` `1.33.0`, and takes `react` and `react-dom` `19.2.4` as peers, exactly. The screen package pins the shell's workspace versions exactly, as every screen package of template-mfe does.

## Screens and routes

| Token | Internal routes | Menu | Port |
|---|---|---|---|
| `blocks` | `/` (index by group), `/$block` (one block's fixture) | 31 Blocks | 3080 |

Addresses: `/?screen=blocks`, `/?screen=blocks;route=<block>` where `<block>` is the block's folder name in kebab case (`section-frame`, `path-cards`). Any other path, or a name that is no block, renders the screen's not-found page with a link back to `/`.

## SEO metadata

Declared once, in the `seo` block of the screen extension in `src-app/mfe_packages/site-blocks-mfe/mfe.json`: `title`, `description` and `indexable: false` for the screen and for its `/$block` route, so every page of the showcase is served with `noindex` and stays out of the sitemap and `llms.txt`. The screen never writes the document title or head tags.

## Develop

Edit the files here, never the copies under `site/`. From the repository root:

```bash
npm run site:assemble                                                 # copy into site/
npm install --prefix site                                             # once, after adding the template or a dependency
npm run test:unit --workspace=@gears-frontx/site-blocks --prefix site
npm run test:unit --workspace=@gears-frontx/site-blocks-mfe --prefix site
npm run dev                                                           # http://localhost:5173/?screen=blocks
```

`npm run site:assemble -- --check` reports any difference between this template and the site copies. A consuming screen package adds `"@gears-frontx/site-blocks": "0.1.0-alpha.0"` to its `dependencies` and imports `@gears-frontx/site-blocks/<Block>`.

## Moving into another project

Copy `src-app/verify_packages/site-blocks/`, `src-app/mfe_packages/site-blocks-mfe/` and `.frontx/ai/@gears-frontx/frontx-template-site-blocks/` into a project that has the prerequisites applied, then run `npm install`. Pick another port if 3080 is taken (`package.json` scripts and `mfe.json` `remoteEntry`). The packages reference nothing outside their own directories except their declared dependencies.
