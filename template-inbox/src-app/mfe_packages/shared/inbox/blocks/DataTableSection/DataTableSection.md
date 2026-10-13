# DataTableSection

A kit `DataTable` with its toolbar, and the pieces its columns draw.

- **Parts**:
  - `DataTableSection`: the toolbar (an `h2` on the kit candidate `Heading` at the heading-2 role, the row count on a secondary kit `Badge`, a search field at the end of the line) over the table. Below the dashboard's narrow width (44rem of screen) the toolbar wraps and the field takes the whole line. Props `title`, `count`, `search`, `children`.
  - `DataTableHeaderLabel`: a column header's lucide icon and label, inside the kit's `DataTableSortButton`. Props `icon`, `children`.
  - `DataTableIdentityCell`: the avatar beside the name and an optional muted line (kit candidate `Text`), both truncating. Props `avatar`, `name`, `description?`. A kit `Item` would fit the role but adds its own padding and border to every row of the table.
- **Visual declarations** (`styles-exemptions.json`): the header icon's 14px size and `--subtle-foreground` colour (the kit's `DataTableSortButton` takes no icon); the search slot's 14rem width (the kit Input with an icon takes a class only on the inner input).
- **Used by**: `ActivityTable` (dashboard); `DataTableIdentityCell` also by `ContactsTable` (contacts).
- **Test**: `inbox-contacts-mfe/src/shared-inbox/blocks/DataTableSection.test.tsx`.
