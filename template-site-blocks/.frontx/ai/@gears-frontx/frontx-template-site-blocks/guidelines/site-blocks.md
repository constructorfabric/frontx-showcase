# Site blocks

`@gears-frontx/site-blocks` holds the blocks of the FrontX site: one React component per arrangement a page draws, each imported from its own entry (`@gears-frontx/site-blocks/<Block>`). A page is its content in the order of its blocks and imports no stylesheet.

## Layers

1. Kit first: `@gears-frontx/ui-kit` components wherever they fit.
2. Kit candidates (`@gears-frontx/kit-candidates`) for the parts the kit lacks: `Heading`, `Text`, `Link`, `VisuallyHidden`, `CodeBlock`, `DescriptionList`, `render` on `Card` and the title parts.
3. Brand (`@gears-frontx/site-brand`) for values and art; it reaches the document by itself, so no block or page imports it for tokens.
4. Blocks arrange the above. Pages compose blocks.

## Rules for a block

- Markup: kit components, kit candidates, brand art components and plain structural elements only.
- A link drawn as a button is the link element (anchor or router link) with the kit's `buttonVariants` classes. The kit `Button` with `render` and `nativeButton={false}` keeps `role="button"` on the anchor, so a navigation would be announced as a button; it is for actions that also navigate, not for links.
- Props: content and behaviour only (texts, links, items, slots for art and children, callbacks). No `variant`, `tone`, `layout`, `size` or similar switch. When the design draws the same content another way, make another block.
- Stylesheet: layout only (display, flex and grid, gaps, sizes, spacing, position, overflow, alignment) on layout tokens (`src/layout.css`) and the kit's spacing tokens. No colour literal. A title larger than the kit's ramp is `Heading size="display"` with the role's tokens (`--text-display-size`, `-line-height`, `-weight`, `-tracking`) set to a brand display token on that element; the site's display sizes are the brand's page and section sizes, plus the hero's and the closing band's own. A landing-page block sets its rhythm and its heading-row arrangement (`--site-section-pad-*`, `--site-heading-columns`, `--site-heading-gap`, `--site-heading-row-gap`, `--site-lead-column`) on an ancestor of `SectionFrame`.
- Every other declaration needs a row in `styles-exemptions.json` (file, selector, property, the kit gap or defect it waits for, the gaps register row). Remove the row when the gap closes.
- Folder: `<Block>.tsx`, `<Block>.module.css`, `<Block>.md` (purpose, when to use, props, kit parts, layout, states, the design section it reproduces), `<Block>.showcase.tsx`, `<Block>.test.tsx` (renders, landmarks and headings, axe on the fixture), `index.ts`.
- Fixture: a default component with sample content and a named `showcase` export `{ title, group: 'section' | 'docs', summary, ownsPageTitle?, fullBleed? }`. The showcase screen finds it by itself; there is no registry to edit. It renders a page frame (`ownsPageTitle`) as it is, a full-bleed band (`fullBleed`) edge to edge, and any other block inside the page column under its title and summary.
- Measure each block on `/?screen=blocks;route=<block>` against its design target at 1440 and 390 pixels; differences from kit parts are accepted and recorded, others are fixed or recorded as defects.

## Rules for a page

- Import blocks by name from `@gears-frontx/site-blocks/<Block>` and declare `@gears-frontx/site-blocks` in the screen package's `dependencies` at the package's exact version.
- No stylesheet import, no `style` prop, no class beyond a block's or a kit part's documented prop.
- A section the blocks cannot draw is a new block in this package, never page CSS.

## What is here

- Landing page: `SectionFrame` and the sections on it or beside it, in page order: `Hero`, `Features`, `ArchitectureMap`, `ChangeStory`, `KitShowcase` (with the sample layout parts a sample registry uses instead of CSS), `MetricComparison`, `LogoStrip`, `GetStartedSteps`, `ClosingCta`. Art comes from template-site-brand's art components through each block's slot.
- Inner pages: `PageIntro`, `DocsFrame` (with the docs tab bar), `DocsFrameWithRail` (with the "On this page" rail), `TemplateDetailFrame` (the explorer across, the facts beside the body), `SectionHeading`, `GuideClosingHeading` (a guide's ruled closing section), `PathCards`, `StartPaths`, `TemplatePair`, `TemplateRow`, `CardTiles`, `Panels`, `CtaBox`, `CtaRule`, `ActionRow`, `Facts`, `PackageList`, `GuideStep`, `GuideStepUnnumbered`, `AgentTask`, `Troubleshooting`, `FileExplorer`.
- Each block's card (`<Block>.md`) says when to use it and when not.
