# GetStartedSteps

The way in, in order: a band of two columns, the title, the lead and the link on the start, and on the end an ordered list of ruled rows, each a figure, a title link that covers the row, a sentence and an arrow.

## When to use

- The landing page's "get started" section.

## When not to use

- The numbered steps of a guide page: use `GuideStep`.

## Props

| Prop | Type | Content |
|------|------|---------|
| `id` | `string` | The title's id |
| `title` | `string` | The section title; a newline breaks the line |
| `lead` | `string?` | The lead under the title |
| `action` | `{ label, link }?` | The link under the lead |
| `steps` | `{ figure?, title, text, link }[]` | `figure` is brand art (`HairlineFigure`), decoration only |

## Kit parts

- Title: kit candidate `Heading` (`h2`) on the display role at the brand's section size. Lead: kit candidate `Text`. Link: kit candidate `Link`.
- Step title: kit candidate `Heading` (`h3`, `heading-1`) holding a kit candidate `Link` (`inherit`) whose pseudo-element covers the row; text kit candidate `Text` (muted); kit `Separator` between rows.

## Layout

- Rhythm 80/80 (40/40 under 640px) on the page column. Two equal columns 100px apart, centred on each other (40px under 900px, one column 32px apart under 640px). Rows 24px above their separator (every row, the last too) and 24px under the one before; figure 128x128 (104x104 under 640px), 16px from the copy.

## Design section

V2 home "A running app. Then your first change.": section 1304x667 at 1440, padding 80, columns 602/602 gap 100, step rows 602x153 with 128px figures, text at x916 (350x129 at 390, figure 104, text at x142).

## Accessibility

- A region named by its level-two title; the steps are an ordered list; each row is one link named by its title, inside a level-three heading. The figure box is `aria-hidden`.
