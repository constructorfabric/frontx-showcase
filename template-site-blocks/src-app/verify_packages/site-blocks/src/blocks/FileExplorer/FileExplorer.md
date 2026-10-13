# FileExplorer

A template's key files: Files and Example tabs with the source line beside them, then one frame split into the file rail and the viewer of the chosen file. The viewer's heading is the file's description; the path, the code with Copy, the line count and the legal links follow.

## When to use

- The key files of a template detail page.
- A single file excerpt in a guide: use `GuideStep` with `code`.

## Props

| Prop | Content |
| --- | --- |
| `id`, `title` | The explorer's visually hidden `h2`, the target of an "On this page" jump |
| `files` | `{ path, description, url?, lines, content }[]`; the first is chosen at start |
| `labels` | Every string the explorer shows, translated by the caller |
| `source` | `{ label, value }`: the line beside the tabs, such as the source commit |
| `example` | The Example tab's content; the tab exists only when it is given |
| `scope` | The line under the file list |
| `note` | What the footer says after each file's line count |
| `legal` | The links at the footer's end |

## Roles to kit parts

| Part | Built from |
| --- | --- |
| Tabs | ui-kit `Tabs`, `TabsList` (`line`, `sm`), `TabsTrigger`, `TabsContent` |
| Frame | kit candidates `Card` with its padding and gap taken back; ui-kit `Separator` between rail and viewer |
| Find box | ui-kit `Input` with a search icon |
| File rows | ui-kit `Button` (`secondary` for the chosen file, `ghost` for the others, `aria-pressed`) in a `nav` landmark named by the key files label |
| Headings and text | kit candidates `Heading` (`heading-2`, an `h3`), `Text` (`label`, `meta`, `mono`), `VisuallyHidden` |
| Code | kit candidates `CodeBlock` with its header and copy button |
| File link | kit candidates `Link` (`external`) |

## States

The chosen tab, the find query and the chosen file. An empty filter result shows the no-files text.

## V2 section

`section.template-explorer` on `/templates/shell/`: pill tabs with the source hash at the row's end, a 1304x680 frame (radius 16, shadow) with a 278px tinted rail of kit Buttons and a viewer whose header names the file's description. Differences from kit parts: the kit Tabs' `line` list (an underlined current tab; the default list insets its tab by 3px, under the design checker's 4px padding floor, a kit defect) instead of V2's white pill bar, the kit Card frame (radius 12, no shadow, no rail tint), the rail on the docs rail column (272px), and the code block framed inside the viewer instead of running edge to edge.
