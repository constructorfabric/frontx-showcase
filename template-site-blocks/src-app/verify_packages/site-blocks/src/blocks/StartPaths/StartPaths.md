# StartPaths

The starting points of a guide: two whole-row links side by side inside a named navigation landmark, the reader's current path tinted.

## When to use

- The top of a guide that has more than one way in.

## When not to use

- The main paths through a section: use `PathCards`.

## Props

| Prop | Type |
|------|------|
| `label` | `string` - the navigation landmark's accessible name |
| `items` | `{ icon?, title, text, link, current? }[]` - `link` is the element the whole row renders as with no children; `current` marks the reader's path |

## Parts

| Role | Part |
|------|------|
| Row that navigates | kit `Item` with `render={link}`, `outline`, or `muted` for the current path |
| Icon | kit `ItemMedia` (`icon`), decorative |
| Title and sentence | kit `ItemTitle`, `ItemDescription` |
| Arrow | kit `ItemActions`, decorative |

## Layout

Two equal columns with a 16px gap and 24px row padding; one column with a 12px gap and 16px padding under 640px.

## Reproduces

The designer site's get-started choice (`nav.start-paths`): two 643x96 links at 1440, 350x108 at 390.

## States

The current path carries `aria-current="true"` and the kit's muted tint.
