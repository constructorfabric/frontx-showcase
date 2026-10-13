# Panels

Ways in, explained: kit cards two to a row, each a title, a sentence and its links one per line.

## When to use

- A docs page's reference section, a guide's "other ways" section.

## When not to use

- Cards that are links as a whole: use `PathCards` or `CardTiles`.

## Props

| Prop | Type |
|------|------|
| `items` | `{ label?, title, text, actions? }[]` - `actions` holds the panel's links or buttons |

## Parts

| Role | Part |
|------|------|
| Panel | kit `Card` (32px spacing; 24px under 760px) |
| Label | kit-candidates `Text` (`label`, muted) rendered as `code` |
| Title | kit-candidates `CardTitle` rendered as `h3` |
| Sentence | kit `CardDescription` |
| Actions | kit `CardFooter`, one per line |

## Layout

Two equal columns with a 24px gap; one column with a 32px gap under 760px.

## Reproduces

The designer site's guide cards (`.guide-grid` of `.guide-card`): 640x220 at 1440, 350 wide at 390.
