# DetailPane

The detail half of a list and detail screen: the open conversation with its inspector panel, the open mail, or the empty state when nothing is open. It is the detail side of the list and detail split; the list side is `ListPane` and the side column `NavColumn`, all three children of the screen frame's row.

- **Props**: content and behaviour only: `children`, `hidden` (the single-pane layout hides it while nothing is open), `asideOpen` (an inspector panel sits beside the thread).
- **Layout**: fills the rest of the row; at least 24rem beside the list (`@container inbox-screen (width >= 36rem)`), 24rem plus the 19rem panel and its border from the chat-details width (`width >= 68rem`) while a panel is open. No visual declaration; the rem widths are the breakpoint table's.
- **Used by**: `ChatScreen`, `MailScreen`.
- **Test**: `inbox-contacts-mfe/src/shared-inbox/blocks/DetailPane.test.tsx`.
