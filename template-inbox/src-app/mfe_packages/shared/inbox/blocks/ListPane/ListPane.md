# ListPane

The list half of a list and detail screen: the chat's conversations, the mail's mails.

- **Parts**: `ListPane` (the `section` landmark: a header row with `leading` controls, the `heading`, the `count` on the kit candidate `Text` meta role, `actions`), `ListPaneNotice` (a row for a kit `Alert`), `ListPaneSearch` (a row whose one child, the kit `Input`, takes the whole row), `ListPaneToolbar` (a `summary` on the kit candidate `Text` label role at one end, a `control` at the other), `ListPaneTabs` (kit `Tabs` with the line `TabsList`, each panel filling the pane), `ListPaneBody` (the scrolling area), `ListPaneGroup` (an optional kit `SidebarGroupLabel` and a kit `ItemGroup` of rows, each in a `role="listitem"` box with `display: contents`).
- **Props**: content and behaviour only: `label`, `hidden` (the single-pane layout hides the list while an item is open), `leading`, `heading`, `count`, `actions`, the rows; `summary`, `control`; `value`, `onValueChange`, `tabs[{value, label, content}]`; `label` of a group.
- **Layout**: `flex: 0 1 22rem` beside the detail pane and the whole screen under the single-pane width (`@container inbox-screen (width < 36rem)`); a 3.5rem header row; the heading truncates; rows `--space-1` apart.
- **Visual declarations** (`styles-exemptions.json`): the pane's inline-end rule, the header's height and bottom rule, the 22rem basis. They wait for kit pane chrome.
- **Used by**: `ConversationList` (chat), `MailList` (mail).
- **Test**: `inbox-contacts-mfe/src/shared-inbox/blocks/ListPane.test.tsx`.
