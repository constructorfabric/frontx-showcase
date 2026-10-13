# Troubleshooting

What to check when a guide's result looks different: a titled list of symptoms, each opening its answer. Any number of answers stay open at once.

## When to use

- The end of a guide, for the few known ways the result can differ.
- A general list of questions with long answers is the same block.

## Props

| Prop | Content |
| --- | --- |
| `id` | The heading's id, the target of an "On this page" jump |
| `title` | The heading |
| `items` | `{ summary, text }[]`: the symptom and what to do about it |

## Roles to kit parts

| Part | Built from |
| --- | --- |
| Title | kit candidates `Heading` (`display`, an `h2`) |
| Rows | ui-kit `Accordion` (`multiple`), `AccordionItem`, `AccordionTrigger`, `AccordionContent` |
| Answer | kit candidates `Text` (muted) |

## States

Each row is closed or open; the kit Accordion holds the state.

## V2 section

`section.docs-troubleshooting` "If something looks different" on `/docs/first-change/`: a 24px title over three `details` rows ruled above. The kit accordion rows (rules between rows, a chevron at the end, 14px label weight) are accepted.
