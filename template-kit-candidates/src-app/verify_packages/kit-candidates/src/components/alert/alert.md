# AlertTitle with `render`

The kit's `AlertTitle` gains `render`. Without it the markup is the kit's, byte for byte. With it the given element (a heading, typically) takes the kit's title class, and the user agent's heading margins and sizes are reset at zero specificity, so it looks as the kit's `div` did. Every other Alert part is the kit's own.

## When not to use

- A heading outside a Alert: use `Heading`.

## Accessibility

- `role="heading"` with `aria-level` stays only as the fallback where an element swap is not possible.

## Examples

```tsx
import { Alert, AlertTitle } from '@gears-frontx/ui-kit';

<Alert><AlertTitle render={<h2 />}>Sync paused</AlertTitle></Alert>
```
