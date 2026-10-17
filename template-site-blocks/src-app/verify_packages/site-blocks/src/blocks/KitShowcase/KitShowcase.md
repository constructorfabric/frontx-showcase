# KitShowcase

A catalogue of live kit samples: the section frame with the label, the title, the lead and the link, then titled groups of tiles, each tile an inert sample over a ruled link that covers the tile.

## When to use

- The landing page's UI kit section.

## When not to use

- Links to pages without a live sample: use `CardTiles` or `PathCards`.

## Props

| Prop | Type | Content |
|------|------|---------|
| `id` | `string` | The title's id |
| `label` | `string?` | The section label |
| `title` | `string` | The section title |
| `lead` | `string?` | The lead beside the title |
| `action` | `{ label, link }?` | The link under the lead |
| `groups` | `{ title, tiles: { title, link, sample }[] }[]` | `sample` is a live sample built from kit components; it stays inert |

The folder also exports the layout pieces a sample is built with, so a sample registry needs no stylesheet: `SampleStack` (a column, at most 225px wide), `SampleRow` (a wrapping row), `SampleSpread` (a row spread to both ends), `SampleCaption` (`label`, `value?`), `SampleLines` (three placeholder lines of kit skeletons), `SampleOptional` (a part a tile under 152px of sample width leaves out).

## Kit parts

- Frame: `SectionFrame`. Group title: kit candidate `Heading` (`h3`, `heading-1`), right above its tiles.
- Tile: kit candidate `Card` with no padding; the sample slot, a kit `Separator`, and a kit candidate `Link` (`inherit`) whose pseudo-element covers the tile.
- Caption: kit candidate `Text` (meta, muted).

## Layout

- Rhythm 58/64 (40/40 under 640px); the header in two equal columns 96px apart, the lead 460px wide. Groups 24px apart; tiles four across with a 16px gap (12px under 1200px, three across under 900px, two with an 8px gap under 640px). Sample slot 158px high (146px under 1200px, 132px under 640px), a size container for `SampleOptional`; a slot holding a table keeps 12/16px of padding (4px above and below and none at the sides under 640px), so the kit table fits a phone's tile even beside a classic scrollbar.

## Design section

V2 home "One visual language. Every interaction.": section 1304x1053 at 1440, padding 58/64, three groups of four tiles 314x205 (170x172 at 390), group titles 22px.

## Accessibility

- A region named by its level-two title; each group a level-three title over a list of tiles; each tile one link named by its title. The sample is `inert`: out of focus and out of the accessibility tree.
