# PagePane

A screen's main pane when the screen has no list beside it: the contacts directory, a contact's page, the dashboard.

- **Parts**: `PagePane` (the column, `hidden` while another page of the screen stands in front of it), `PagePaneHeader` (the header row), `PagePaneBody` (the body that scrolls inside the pane's `--space-4` padding). A screen whose body is its own arrangement (the dashboard's card board) puts that block in place of `PagePaneBody`.
- **Header slots** (content only): `leading` (toggle, back button, avatar), `heading` (the screen's `ScreenHeading`, or the kit candidate `Heading` rendered as text while another page holds the one `h1`), `subheading` (a count under the heading, kit candidate `Text variant="meta" tone="muted"`), `after` (a badge or a label on the heading's line), `search` (a field at the end; a header with one wraps), `actions`.
- **Layout**: a flex column filling the row; the header is one 3.5rem line, or wraps from 3.5rem when it carries a search field; the heading truncates.
- **Visual declarations**: the header's bottom rule (`styles-exemptions.json`, kit gap: no pane chrome in the kit).
- **Used by**: `ContactsScreen` (directory), `ContactDetail`, `DashboardScreen`.
- **Test**: `inbox-contacts-mfe/src/shared-inbox/blocks/PagePane.test.tsx`.
