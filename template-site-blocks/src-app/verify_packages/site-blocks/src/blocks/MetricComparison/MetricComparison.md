# MetricComparison

Two ways of working compared, metric by metric: the section frame with the title, the note and the lead, three kit cards across, each a title row with its unit when it has one, a statement line, a chart when it has one and an explanation under a rule, and a rule across the band's bottom edge.

## When to use

- The landing page's AI section.

## When not to use

- Figures that are not a comparison: use `Facts` or a kit `Card`.

## Props

| Prop | Type | Content |
|------|------|---------|
| `id` | `string` | The title's id |
| `title` | `string` | The section title |
| `lead` | `string?` | The lead beside the title |
| `note` | `string?` | A small line above the lead, such as "Illustrative comparison" |
| `metrics` | `{ title, unit, statement, benefit, chart?, explanation }[]` | `chart` is brand art (`MetricBars`); an empty `unit` and a missing `chart` leave no slot |

The block carries no figure of its own: every word on a card is a prop. The site's home passes words, no unit, no chart and no note.

## Kit parts

- Frame: `SectionFrame`. Card: kit candidate `Card`; title kit candidate `CardTitle` (`h3`); unit and benefit kit candidate `Text` (meta, muted); explanation kit candidate `Text` (muted) under a kit `Separator`; a kit `Separator` across the band's bottom edge.

## Layout

- Rhythm 70/70 (42/42 under 640px); the header in two equal columns 96px apart, the lead 460px wide. Three cards 24px apart (16px under 1100px, one column under 900px); each a grid of rows 44px, 56px, 104px and the rest, 24px apart, 24px padding (20px under 1100px); a card without a chart has three rows sized to their content.

## Design section

V2 home AI section: 1440x746 at 1440, padding 70, cards 419x418 (350x395 at 390), card rows `44px 56px 104px 1fr`, statement 40px w600 in the brand blue, explanation under a rule.

## Accessibility

- A region named by its level-two title; the cards are a list, each with a level-three title.
