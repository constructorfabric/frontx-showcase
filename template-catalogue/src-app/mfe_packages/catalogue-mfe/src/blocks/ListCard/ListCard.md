# ListCard

A bordered list with a tinted header band (icon, title, count) over divided rows, each row one link with its name, an optional sentence, a short meta label and an arrow.

## When to use

A family of components on the index (inside `ListCardGrid`).

## Parts and props

| Part | Props |
|------|-------|
| `ListCard` | `title` (also the `section`'s name), `icon`, `count`, `testId`, `children` (rows) |
| `ListCardEntry` | `label`, `description`, `meta`, `href` or `render` (the router's link), `onClick`, `testId` |

## Parts and roles

The title is kit-candidate `Heading` (`heading-2`, an `h2`); the count, the sentence and the meta label are `Text` in the `meta` role, 12px, the kit's control text floor (the label sits inside the row's link). The kit's `Card` pads its content while the band and the rows run edge to edge (GAPS G34), so the frame, band and row look are rows of `styles-exemptions.json` waiting for a kit list card.

## Reproduces

The V2 showcase overview's family cards: 12px radius, band 18/20 padding, rows 15/20 padding with 13px names.
