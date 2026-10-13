# NavPanel

The catalogue's navigation panel: labelled groups of page rows and a foot with the kit version, sticky under the shell's header and scrolling its own rows.

## When to use

As the `panel` slot of `CatalogueFrame` on a wide screen.

## Parts and props

| Part | Props |
|------|-------|
| `NavPanel` | `label` (the `nav`'s name), `testId`, `ref` (the scroll container, for revealing the current row), `children` |
| `NavPanelGroup` | `id` (of its label, which names the `role="group"`), `title`, `children` (rows) |
| `NavPanelRow` | `icon`, `label`, `href` or `render` (the router's link), `onClick`, `current` (the open page), `sectionCurrent` (the open section's row, filled), `testId`, `ref` |
| `NavPanelFoot` | `label`, `version`, `note` |

## Parts and roles

Group labels are kit-candidate `Text` in the `micro` role rendered as `h2`, upper-cased; the foot is `Text` in the `meta` and `mono` roles. The row look waits for a kit navigation list row (the kit's `SidebarMenuButton` needs the whole `Sidebar` provider and its fixed layout); its declarations are rows of `styles-exemptions.json`.

## Reproduces

The V2 showcase sidebar: 224px wide, 28/18 padding, rows 36px high with 13px labels, the open section's row filled with the accent.
