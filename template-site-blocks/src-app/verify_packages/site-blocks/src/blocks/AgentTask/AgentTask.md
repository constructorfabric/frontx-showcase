# AgentTask

A task to hand to a coding agent, closed until the reader opens it: a card whose summary line opens the lead, the task's text with Copy and a link to its plain-text copy.

## When to use

- A ready-made prompt in a guide that the reader copies into a coding agent.
- A command the reader runs: use `GuideStep` with `code`.

## Props

| Prop | Content |
| --- | --- |
| `id` | The card's id, the target of an "On this page" jump |
| `summary` | The line that opens the task |
| `lead` | The sentence over the task |
| `code` | `{ title, code }`: the task's text, wrapped (it is prose) and copied whole |
| `twin` | The link to the task's plain-text copy |
| `copyLabel`, `copiedLabel` | The copy button's labels |

## Roles to kit parts

| Part | Built from |
| --- | --- |
| Frame | kit candidates `Card` with ui-kit `CardHeader`, `CardContent` |
| Open and close | ui-kit `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` |
| Summary | kit candidates `CardTitle` as a `span` inside the trigger, a chevron that points down when open |
| Lead | kit candidates `Text` (muted) |
| Task | kit candidates `CodeBlock` (`wrap`) with its header and copy button |

## States

Closed (the summary only, `aria-expanded="false"`) and open (`aria-expanded="true"`, the body rendered). It starts closed.

## V2 section

`details.agent-task` on `/docs/first-change/`: a 968px card (radius 12, surface tint) whose summary opens a 926x426 copy card and a "Plain-text task" link. The kit Card paints the card colour instead of the surface tint and the summary is on the card title role (16px, V2 14px).
