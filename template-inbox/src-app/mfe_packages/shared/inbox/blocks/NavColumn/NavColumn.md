# NavColumn

A screen's secondary column: the chat's channels, the mail's mailboxes, the contacts directory's filters. A 12rem column beside the list on a wide screen that folds to zero width, and the kit's `Sheet` over the screen below the inline-column width (`SCREEN_BREAKPOINTS_REM.inlineColumn`).

- **Parts**: header (title on the kit candidate `Heading` at the heading-2 role, or the kit `SheetTitle` in the sheet; the screen's `actions`; the sheet's close `Button`), a `nav` holding a kit `ItemGroup` of `Item` rows rendered as buttons (`ItemMedia` icon, `ItemTitle`, `ItemActions` with a secondary `Badge` count). Each row sits in a `role="listitem"` box with `display: contents`, so the kit's list has list items and the rows stay its flex children.
- **Props**: content and behaviour only: `state` (from `useSidebarToggle`), `label`, `title`, `actions`, `items[{id, label, icon?, count}]`, `selectedId`, `onSelect`, `closeLabel`, `hidden`.
- **Visual declarations** (`styles-exemptions.json`): the column's `--sidebar` surface, its inline-end border and width transition, the sheet frame's surface, the header's bottom rule, the selected row's `--border-strong` border, the row's 10px inline padding. They wait for the kit's `Sidebar` to sit in a bounded container (a static position and a container-driven sheet), an Item size step between `xs` and `sm`, and an `isActive` row state.
- **Used by**: `FolderSidebar` (chat), `MailboxSidebar` (mail), `ContactFilterSidebar` (contacts).
- **Test**: `inbox-contacts-mfe/src/shared-inbox/blocks/NavColumn.test.tsx`.
