# ActionRow

A row of actions in a page's body: the actions side by side with a gap, one under the other on a phone.

## When to use

- Two or more actions that end a guide or a template page's body ("Explore MFE source", "UI Kit integration"; "View manifest", "Explore source").

## When not to use

- One action closing a page: use `CtaBox` or `CtaRule`.
- Actions inside a card: use the card's own footer (`Facts` takes its actions).

## Props

| Prop | Type |
|------|------|
| `children` | `ReactNode` - the actions, usually links drawn as buttons (`buttonVariants` on the link) |

## Parts

| Role | Part |
|------|------|
| Row | a `div` with layout-only CSS; the actions keep their own roles |

## Layout

A wrapping row with a 16px gap (`--space-4`), items centred; under 640px one action per line at its own width with the same gap.

## Reproduces

The designer site's action pairs (first change: "Explore MFE source" and "UI Kit integration"; template pages: "View manifest" and "Explore source"): 15px apart at 1440, stacked 15px apart at 390; the kit space scale's nearest step is 16px.
