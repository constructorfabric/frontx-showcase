# CtaRule

The call to action that closes an index: an open row under a rule, the title and sentence on the left, the action at its end.

## When to use

- The end of an index page, pointing to where to start.

## When not to use

- The end of a guide: use `CtaBox`.

## Props

| Prop | Type |
|------|------|
| `title` | `string` |
| `text` | `string` |
| `action` | `ReactNode` - usually one text link |

## Parts

| Role | Part |
|------|------|
| Region | `aside` named by its heading |
| Rule | kit `Separator` |
| Title | kit-candidates `Heading` (`display`) as `h2` |
| Sentence | kit-candidates `Text` (muted) |

## Layout

A row with 32px block padding and a 24px gap, the action at the end; under 640px the action drops under the text.

## Reproduces

The designer site's templates close (`aside.template-next`): 1304x131 at 1440, 350x195 at 390.
