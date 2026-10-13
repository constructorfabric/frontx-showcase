# ArchitectureMap

How a product is put together, as a map: a rule across the page column, the section frame with the label, the title and the lead, and the map drawing under them.

## When to use

- The landing page's architecture section.

## When not to use

- A section without a drawing: use `SectionFrame` with its body.

## Props

| Prop | Type | Content |
|------|------|---------|
| `id` | `string` | The title's id |
| `label` | `string?` | The section label |
| `title` | `string` | The section title; a newline breaks the line |
| `lead` | `string?` | The lead beside the title |
| `map` | `ReactNode` | The map, drawn by brand art (`ArchitectureFigure`, labels as props) with its own accessible description |

## Kit parts

- Rule: kit `Separator`, held to the page column.
- Frame: `SectionFrame`.

## Layout

- Rhythm 52/64 (36/40 under 640px); the map takes the column's width and its own height.

## Design section

V2 home "One shell. Independent screens.": section 1304x848 at 1440 with a 1px top rule, padding 52/64, map 1304x559 (350x613 at 390).

## Accessibility

- A region named by its level-two title; the map carries its own accessible name and description (the art component's job).
