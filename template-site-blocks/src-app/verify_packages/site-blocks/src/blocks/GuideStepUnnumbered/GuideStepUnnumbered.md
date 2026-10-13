# GuideStepUnnumbered

The closing section of a guide, drawn as a step without a number: a rule above, the title, the lead and a row of links.

## When to use

- The last section of a guide that is not a step of the procedure (keeping track of changes, where to go next).
- A numbered step: use `GuideStep`.

## Props

| Prop | Content |
| --- | --- |
| `id` | The heading's id, the target of an "On this page" jump |
| `title`, `lead` | The heading and the text under it |
| `links` | The row of links after the lead |

## Roles to kit parts

| Part | Built from |
| --- | --- |
| Rule above | ui-kit `Separator` |
| Title, lead | kit candidates `Heading` (`heading-1`, an `h2`), `Text` (muted) |

## States

None.

## V2 section

`section.quickstart-step` "Keep track of your changes" on `/docs/first-change/`: rule, 23px title, lead, one text link. The title is on the kit's `heading-1` role and the lead on the kit's 14/20 body.
