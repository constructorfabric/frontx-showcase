# SectionHeading

The title of a section of an inner page, with its one-line lead, or with a label at the row's end that names what the section's cards add up to. The heading is the target of an "On this page" jump.

## When to use

- Between groups of content on docs, templates and libraries pages.

## When not to use

- On the landing page: `SectionFrame` carries the section header there.
- Inside a card or panel: use the part's own title.

## Props

| Prop | Type | Content |
|------|------|---------|
| `id` | `string` | The heading's id, the jump target |
| `title` | `string` | The section title |
| `lead` | `string?` | A one-line lead under the title |
| `label` | `string?` | A short label at the row's end; the title then takes the heading-1 role |

## Kit parts

- Title: kit candidate `Heading` (`h2`) on the display role, or the heading-1 role with a label.
- Lead and label: kit candidate `Text` (body with the lead line height; meta, muted).

## Layout

- 32 pixels above (24 for the first section of a column; 12 and 4 under 900 pixels); a labelled row wraps and stacks under 640 pixels.

## Design section

V2 section headings on `/docs/` ("Source & tools"), 24px bold in V2; the site uses the kit's ramp (decision: the kit's type scale plus two brand display sizes).

## Accessibility

- `tabindex="-1"` so a jump can focus it; it stops clear of the sticky header and shows the focus ring when the focus arrives by keyboard.
