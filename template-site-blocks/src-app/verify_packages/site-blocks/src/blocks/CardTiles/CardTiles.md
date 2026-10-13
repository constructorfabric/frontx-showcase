# CardTiles

A collection of related pages: small whole-card links in a grid that fits as many as the width allows.

## When to use

- The related pages at the end of a technical page.

## When not to use

- The leading paths of a section: use `PathCards`.

## Props

| Prop | Type |
|------|------|
| `items` | `{ eyebrow?, title, text, link }[]`; `link` is the element the whole card renders as with no children |

## Parts

| Role | Part |
|------|------|
| Card that navigates | kit-candidates `Card` with `render={link}`, kit `CardHeader` and `CardContent` |
| Title | kit-candidates `CardTitle` rendered as `h3` |
| Eyebrow | kit-candidates `Text` (`label`, muted) |
| Sentence | kit `CardDescription` |

## Layout

`repeat(auto-fill, minmax(16rem, 1fr))` with a 16px gap.

## Reproduces

No designer-site counterpart: the site's own technical library pages.
