# Card and CardTitle with `render`

The kit's `Card` and `CardTitle` gain `render`. Without it the markup is the kit's, byte for byte. With it the given element takes the kit's classes:

- `Card render={<a href />}` (or a `button`) becomes a card that navigates or acts as a whole: no underline, a `--ring` border on hover, and on keyboard focus the kit's border recolour plus `--ring-inset` ring (an outline in forced colours), the same rules as `Item`. A card rendered as anything else gains no hover.
- `CardTitle render={<h3 />}` puts the title in the document outline with the kit's title look; the user agent's heading margins and sizes are reset at zero specificity.

Every other Card part (`CardHeader`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`) is the kit's own.

## When not to use

- A whole row of a list that navigates: use `Item` with `render`.
- A link inside text: use `Link`.

## Accessibility

- A card rendered as a link or a button holds no other link or button (nested interactive content); use a plain `Card` with `CardAction`, or an `Item`.
- `role="heading"` with `aria-level` stays only as the fallback where an element swap is not possible.

## Examples

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@gears-frontx/ui-kit';

<Card render={<a href="/guides/setup" />}>
  <CardHeader><CardTitle render={<h3 />}>Setup guide</CardTitle></CardHeader>
  <CardContent>From install to the first screen.</CardContent>
</Card>
```
