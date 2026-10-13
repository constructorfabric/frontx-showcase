# PathCards

The main paths through a section: three whole-card links side by side, each a figure beside its title, a sentence and an arrow.

## When to use

- The leading choices of a docs overview, where each choice is a page of its own.

## When not to use

- A guide's two starting points: use `StartPaths`.
- A longer collection of related pages: use `CardTiles`.

## Props

| Prop | Type |
|------|------|
| `items` | `{ figure?, eyebrow?, title, text, link }[]` - `link` is the element the whole card renders as (an anchor or the router's link) with its destination and no children |

## Parts

| Role | Part |
|------|------|
| Card that navigates | kit-candidates `Card` with `render={link}` |
| Title | kit-candidates `CardTitle` rendered as `h2` |
| Sentence | kit `CardDescription` |
| Eyebrow | kit-candidates `Text` (`label`, muted) |
| Figure | brand art in a decorative slot (144x132; 104x104 under 640px) |

## Layout

Three equal columns with a 24px gap; one column with a 16px gap under 900px. Inside a card the figure sits beside the copy, centred; the copy runs the card's height so the arrow closes it.

## Reproduces

The designer site's docs overview paths (`.docs-paths`): 1304 wide, cards 419x249 at 1440, 350 wide at 390.

## States

Hover and keyboard focus come from the kit-candidates `Card` rendered as a link.
