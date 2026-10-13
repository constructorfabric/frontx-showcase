# CtaBox

The call to action that closes a guide: a tinted box with a large title, a sentence and one action under it.

## When to use

- The end of a guide, pointing to the next one.

## When not to use

- The end of an index: use `CtaRule`.

## Props

| Prop | Type |
|------|------|
| `title` | `string` |
| `text` | `string` |
| `action` | `ReactNode` - usually one button-styled link |

## Parts

| Role | Part |
|------|------|
| Region | `aside` named by its heading |
| Box | kit `Card` (32px spacing; 24px under 760px) on the brand's `--info-soft` tint (exemption ledger) |
| Title | kit-candidates `Heading` (`display`) as `h2` |
| Sentence | kit-candidates `Text` (muted) |
| Action | kit `CardFooter` |

## Reproduces

The designer site's quickstart close (`.quickstart-next`): 968x207 at 1440, 350x241 at 390.
