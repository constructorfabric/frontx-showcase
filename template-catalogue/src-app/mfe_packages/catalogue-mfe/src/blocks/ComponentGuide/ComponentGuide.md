# ComponentGuide

How to use a component, under its example: two columns ("Use in your app", "Component contract"), each a heading, an optional code sample, a note and a link; one column on a phone. The component page's last block.

## Parts and props

| Part | Props |
|------|-------|
| `ComponentGuide` | `children` (the columns) |
| `GuideColumn` | `id` (of its heading, which names the column's `section`), `title`, `code` (a `CodeSample`), `note`, `link` (an `IconLink`) |

## Parts and roles

Headings are kit-candidate `Heading` (`heading-2`, an `h2`); the note is `Text` in the `meta` role, muted.

## Reproduces

The V2 showcase component page's guide: columns 1.2 to 1, 40px apart, 32px under the tabs, headings 20px above the note, the link 36px under a code sample's note (20px with no code), 54px above the footer.
