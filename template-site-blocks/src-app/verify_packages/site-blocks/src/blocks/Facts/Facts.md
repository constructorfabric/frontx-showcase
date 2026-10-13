# Facts

What a reader should know before starting: a titled card of name and value pairs, with optional actions one per line.

## When to use

- The aside of a template or library detail page.

## Props

| Prop | Type |
|------|------|
| `title` | `string` |
| `facts` | `{ label, value }[]` |
| `actions` | `ReactNode`, optional |

## Parts

| Role | Part |
|------|------|
| Region | `aside` named by its heading |
| Card | kit `Card` (24px spacing) |
| Title | kit-candidates `CardTitle` rendered as `h2` |
| Pairs | kit-candidates `DescriptionList`, `DescriptionItem`, `DescriptionTerm`, `DescriptionDetails` |
| Actions | kit `CardFooter`, one per line |

## Reproduces

The designer site's "Before you start" panel (`aside.detail-panel`): 520x339 at 1440, 350x339 at 390.
