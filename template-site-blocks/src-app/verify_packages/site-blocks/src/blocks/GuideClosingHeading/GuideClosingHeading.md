# GuideClosingHeading

The heading of a guide's closing section, such as where to go next: ruled off from the steps above, the title on the kit's display role and its lead.

## When to use

- The last section of a guide page, after the numbered steps.

## When not to use

- Any other section of an inner page: use `SectionHeading`.

## Props

| Prop | Type | Content |
|------|------|---------|
| `id` | `string` | The heading's id, the target of an "On this page" jump |
| `title` | `string` | The section title |
| `lead` | `string?` | A one-line lead under the title |

## Kit parts

- Rule: kit `Separator`. Title: kit candidate `Heading` on the display role (26px, the design's closing heading size). Lead: kit candidate `Text` (muted).

## Layout

- 32px under the content above (8px here plus the column's 24px gap), 38px between the rule and the title.

## Design section

V2 get-started "more" section (`.quickstart-more`): a 1px top rule, 32px above it, 38px under it, H2 26px.

## Accessibility

- A level-two heading that takes focus by script (`tabIndex={-1}`) and stops clear of the sticky header.
