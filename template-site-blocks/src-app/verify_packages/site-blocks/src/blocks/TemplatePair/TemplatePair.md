# TemplatePair

Two templates applied together: two whole-card links side by side, the figure left of the title and sentence, joined by a "+" sign.

## When to use

- The templates index, for the pair of templates a new application starts from.

## When not to use

- A template that follows the pair: use `TemplateRow`.

## Props

| Prop | Type |
|------|------|
| `items` | `[TemplateCard, TemplateCard]`, each `{ figure?, title, text, link }`; `link` is the element the whole card renders as with no children |

## Parts

| Role | Part |
|------|------|
| Card that navigates | kit-candidates `Card` with `render={link}` |
| Title | kit-candidates `CardTitle` rendered as `h3` (the page's section heading is the `h2`) |
| Sentence | kit `CardDescription` |
| Figure | brand art in a decorative slot (200x160; 96x77 under 640px) |
| Join | a decorative "+" centred in the gap between the cards |

## Layout

Two equal columns with a 40px gap; each card is a `200px 350px` grid with 24px padding, at least 220px high, its title closed by an 18px decorative arrow. One column with a 24px gap under 640px, the card grid then `96px 200px` and at least 164px high.

## Reproduces

The designer site's templates pair (`.template-pair .template-grid`): two 632x220 cards at 1440, 350x164 at 390.
