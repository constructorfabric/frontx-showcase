# GuideStep

One numbered step of a guide: a rule above, the number marker apart from the title, the lead, then whichever parts the step has (a command with Copy, the files it works with, a drawing of the result, what the reader should see, a note, links).

## When to use

- A step of a procedure the reader follows in order (get started, first change).
- The closing section of a guide that has no number: use `GuideStepUnnumbered`.

## Props

| Prop | Content |
| --- | --- |
| `id` | The heading's id, the target of an "On this page" jump |
| `number` | The step's position in its guide |
| `title`, `lead` | The heading and the sentence under it |
| `code` | `{ title, code }`: the command or excerpt, copied whole |
| `files` | `{ path, name, text }[]`: `name` is a node so a file with an address renders as a link |
| `result` | The drawing of what the reader should see (a brand art component) |
| `expected` | `{ label, text }`: the label is read by assistive technology only |
| `note` | A sentence, or `{ title, items }` for a titled box |
| `links` | The row of links after the text |
| `copyLabel`, `copiedLabel` | The copy button's labels |

## Roles to kit parts

| Part | Built from |
| --- | --- |
| Rule above | ui-kit `Separator` |
| Number marker | ui-kit `Badge` (`accent`), hidden from assistive technology |
| Title, lead | kit candidates `Heading` (`heading-1`, an `h2`), `Text` (muted) |
| Command | kit candidates `CodeBlock` (`wrap`: long lines wrap instead of scrolling), `CodeBlockHeader`, `CodeBlockTitle`, `CodeBlockCopyButton` |
| Files | ui-kit `ItemGroup` and `Item` (`outline`, one `listitem` each), `ItemMedia`, `ItemTitle`, `ItemDescription`; kit candidates `Text` (`mono`) for the path |
| Note | ui-kit `Card` (`sm`) with kit candidates `CardTitle` as an `h3` |
| Expected result | kit candidates `Text` (`meta`, muted) and `VisuallyHidden` |

## States

None of its own. The copy button's states belong to `CodeBlockCopyButton`.

## V2 section

`section.quickstart-step` on `/get-started/` and `/docs/first-change/`: rule, 28px marker at the column's start with the title beside it, lead, command block, `p.step-result`; `ul.docs-files` and `figure.docs-result` in the first-change steps. Differences that come from kit parts: the marker is the kit Badge's round 24px box (V2 a 28px square of radius 8), the title is on the kit's `heading-1` role (V2 23px), the files are separate outlined kit Items (V2 one ruled list), body text is the kit's 14/20.
