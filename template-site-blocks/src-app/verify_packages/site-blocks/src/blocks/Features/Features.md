# Features

What a product gives, three across: each feature a figure over its title, a sentence and a link; on a phone the figure sits beside the text.

## When to use

- The landing page's "groundwork" section, right under the hero.

## When not to use

- A list of pages to choose from: use `PathCards`.
- Ordered steps: use `GetStartedSteps`.

## Props

| Prop | Type | Content |
|------|------|---------|
| `id` | `string` | The title's id |
| `title` | `string` | The section title |
| `items` | `{ figure?, title, text, action: { label, link } }[]` | One feature each; `figure` is brand art (`HairlineFigure`), decoration only |

## Kit parts

- Frame: `SectionFrame` (title only).
- Feature title: kit candidate `Heading` (`h3`, `heading-1` role).
- Sentence: kit candidate `Text` (muted).
- Link: kit candidate `Link` with an arrow icon.

## Layout

- Rhythm 52/56 (40/40 under 640px) on the section frame's padding tokens; the title runs across the column (one heading column), 32px over the list (`--site-header-space`).
- Three columns 60px apart (32px under 1200px); each a 220x176 figure box, 16px above the copy; the link 16px under the text. Under 640px one column, 24px apart, the 132x106 figure beside the copy, 16px from it, the link 12px under the text.

## Design section

V2 home groundwork: section 1304x492 at 1440, three items 395x312, figures 220x176, titles 20/26, text 320 wide; at 390 items 350x140, figure 132x106, text column 202 wide at x168.

## Accessibility

- A region named by its level-two title; the features are a list, each with a level-three title.
- The figure box is `aria-hidden`.
