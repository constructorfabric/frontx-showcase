# ChangeStory

A change told as one workbench: a rule across the page column, the section frame with the title, the lead and the link, then the workbench drawing (the task given to an agent, the diff and the result) across the column.

## When to use

- The landing page's "first change" section.

## When not to use

- A guide step with code: use `GuideStep`.
- The copyable agent task of a guide: use `AgentTask`.

## Props

| Prop | Type | Content |
|------|------|---------|
| `id` | `string` | The title's id |
| `title` | `string` | The section title |
| `lead` | `string?` | The lead under the title |
| `action` | `{ label, link }?` | The link after the lead |
| `workbench` | `ReactNode` | The task, the diff and the preview, drawn by brand art (`WorkbenchFigure`, labels as props) |

## Kit parts

- Rule: kit `Separator`. Frame: `SectionFrame`. Link: kit candidate `Link` with an arrow icon.
- The workbench is a drawing with text, so it is brand art (decision D4), not kit parts.

## Layout

- Rhythm 48/64 (32/40 under 640px). The markup reads the title, the lead, the link, then the drawing at every width. On a wide screen the link sits at the title row's far end; the lead sits under the title (620px at most, 16px under it) and 32px above the drawing; the drawing takes the column's width. Under 640px the parts stack in the markup's order: the lead 16px under the title, the link 16px under the lead, the drawing 32px under the link.

## States

- Light and dark: the block paints no surface; the drawing takes its light or dark palette with the page, so the task panel never stays light in the dark theme.

## Design section

V2 home "A small change. In the right place.": section 1304x530 at 1440 with a 1px top rule, padding 48/64; workbench 1304x299 with two panels 651x228 (350x441 at 390).

## Accessibility

- A region named by its level-two title; the drawing's task is a quotation (the art component's markup).
