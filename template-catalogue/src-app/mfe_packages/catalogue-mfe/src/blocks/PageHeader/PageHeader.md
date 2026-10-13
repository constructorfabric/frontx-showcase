# PageHeader

The top of a catalogue page: the breadcrumb trail, the way back, the page's one `h1` with an item on the right of its row, and the lead.

## When to use

At the top of every catalogue page, inside `PageFrame`.

## Props

| Prop | Content |
|------|---------|
| `trail` | `label` (the breadcrumb's name), `root` and `rootRender` (the root page and the router's link to it), `current` |
| `back` | The way back (an `IconLink`) |
| `title` | The `h1` |
| `aside` | The right of the title's row (an `IconLink`, or the family's name as `Text`) |
| `lead` | The sentence under the title |

## Parts and roles

The trail is the kit's `Breadcrumb`; the title is kit-candidate `Heading` in the `display` role rendered as `h1`; the lead is `Text` in the muted tone. The row stacks under 48rem.

## Reproduces

The V2 showcase page header: trail, title row 44px high and 32px above what follows (24px on a phone), lead 20px under the title.
