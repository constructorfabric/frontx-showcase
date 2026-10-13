# TemplateDetailFrame

The frame of a template's page: the docs frame with the page intro, the file explorer across the column, then the body and the facts in two columns.

## When to use

- A template's detail page (key files explorer, what the template gives, "Before you start").

## When not to use

- A guide page with an "On this page" rail: use `DocsFrameWithRail`.
- Any other inner page: use `DocsFrame`.

## Props

| Prop | Type | Content |
|------|------|---------|
| `intro` | `PageIntroProps` | Title, lead, back link and facts of the page |
| `nav` | `DocsNav?` | The section's tab bar |
| `explorer` | `ReactNode` | The file explorer (`FileExplorer`), across the column |
| `children` | `ReactNode` | The page body, the wider column |
| `facts` | `ReactNode?` | The column beside the body, such as `Facts` |
| `footer` | `ReactNode?` | A small line under the columns, such as the plain-text twin link |

## Kit parts

- Frame: `DocsFrame` (intro, tab bar, wide content, footer). The facts column is an `aside`.

## Layout

- Body and facts: `1.4fr` and `1fr`, 55px apart, aligned to their tops; one column under 760px, the facts after the body. Without facts the body takes the column.

## Design section

V2 template detail pages (`/templates/shell/`): explorer 1304 wide, then the body beside "Before you start" (520 wide at x852).

## Accessibility

- One level-one heading (the intro's); the facts column is a complementary landmark.
