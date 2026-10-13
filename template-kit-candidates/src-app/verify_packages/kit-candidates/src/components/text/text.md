# Text

Text on the kit's type ramp: `variant` is the ramp role and `tone` the colour. The default element is `p`; `render` swaps it.

## When to use

- A paragraph between kit components.
- A short muted line (an update time, a hint) on the meta role.
- A path or a name on the mono role, with `render={<code />}`.

## When not to use

- A heading: use `Heading`.
- A block of code with a copy action: use `CodeBlock`.
- A key or a shortcut: use `Kbd`.
- The description line of a card: use `CardDescription`.

## Props (kit level)

| Prop | Type | Default |
|------|------|---------|
| `variant` | `'body' \| 'label' \| 'meta' \| 'mono' \| 'micro'` - the ramp role; `mono` also sets `--font-mono` | `'body'` |
| `tone` | `'default' \| 'muted'` - `--foreground` or `--muted-foreground` | `'default'` |
| `render` | `ReactElement` or callback - the element | `p` |
| `className` | `string` | - |

No `lead`, `overline` or uppercase variants: they are not ramp roles; a consumer that wants one adds a class or brands a role.

## Accessibility

- Contrast of the two tones is a property of the theme's tokens.

## Examples

```tsx
import { Text } from '@gears-frontx/ui-kit';

<Text>Invite people by email.</Text>
<Text variant="meta" tone="muted" render={<span />}>Updated 2 hours ago</Text>
<Text variant="mono" render={<code />}>src/app/main.tsx</Text>
```

## Anti-patterns

- Do not set font sizes or colours on it from outside: pick `variant` and `tone`.
