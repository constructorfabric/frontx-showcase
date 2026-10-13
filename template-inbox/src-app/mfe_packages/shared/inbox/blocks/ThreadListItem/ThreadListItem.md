# ThreadListItem

One row of a conversation or mail list: a kit `Item` rendered as a button (`aria-current` on the open row), the avatar in `ItemMedia`, the title and the time on the first line, the preview and the row's marks on the second.

- **Parts**: `ThreadListItem`; the marks `ThreadListItemPin` and `ThreadListItemStar` (lucide icons named for assistive technology) and `ThreadListItemUnread` (the kit `Badge` with its block padding dropped so it never sets the line's height; the kit's compact `xs` count would set 10px text inside the row's button, under the 12px floor). The time is the kit candidate `Text` meta role.
- **Props**: content and behaviour only: `avatar`, `title`, `time`, `preview`, `titleMarks`, `previewMarks`, `selected`, `read`, `onSelect`.
- **Layout**: two lines that keep their marks at the end and cut their text with an ellipsis.
- **Visual declarations** (`styles-exemptions.json`): the 10px row padding, the selected row's border, the title's body size and 600 weight, the preview's meta size, the read row's regular weight and muted colour, the pin's muted colour, the star's 14px size and warning colour. They wait for an Item density step, an `isActive` row state, a title `tone`, and the fix of the ItemTitle `width: fit-content` truncation defect (upstream draft kit-bugs/03).
- **Used by**: `ConversationList` (chat), `MailList` (mail), inside `ListPaneGroup`.
- **Test**: `inbox-contacts-mfe/src/shared-inbox/blocks/ThreadListItem.test.tsx`.
