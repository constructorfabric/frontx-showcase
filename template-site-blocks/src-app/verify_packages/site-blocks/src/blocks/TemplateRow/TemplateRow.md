# TemplateRow

A template that follows the leading ones: one full-width whole-card link, the figure left of the title and sentence.

## When to use

- The templates index, under the pair, for a template that adds to an application.

## When not to use

- The two leading templates: use `TemplatePair`.

## Props

| Prop | Type |
|------|------|
| `item` | `{ figure?, title, text, link }`; `link` is the element the whole card renders as with no children |

## Parts

| Role | Part |
|------|------|
| Card that navigates | kit-candidates `Card` with `render={link}` |
| Title | kit-candidates `CardTitle` rendered as `h2` |
| Sentence | kit `CardDescription` |
| Figure | brand art in a decorative slot (200x160; 96x77 under 640px) |

## Layout

A row with 24px padding and a 24px gap, a 20px decorative arrow at the far end; under 640px 24/16px padding, a 16px gap and the copy and the arrow aligned to the top.

## Reproduces

The designer site's guardrails card (`a.template-rules`): 1304x210 at 1440, 350x182 at 390.
