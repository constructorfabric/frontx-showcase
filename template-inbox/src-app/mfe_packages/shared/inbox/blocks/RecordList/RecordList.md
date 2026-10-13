# RecordList

A list of records on a card: a contact's tickets or conversations. Each row is a kit `Item` (`sm`, `role="listitem"` inside the kit `ItemGroup` list) with an `ItemTitle` truncated to one line beside an optional meta note (kit candidate `Text`, `meta`, `muted`), an optional `ItemDescription` truncated to one line, and optional status in `ItemActions`.

- **Props**: content only: `items[{id, title, meta?, description?, trailing?}]`.
- **Layout**: the title line is a flex row (title shrinks, meta keeps its width); the description is one line with an ellipsis. The title rule works around the kit's ItemTitle `width: fit-content` truncation defect (`styles-exemptions.json`).
- **Used by**: `ContactDetail` (tickets, conversations).
- **Test**: `inbox-contacts-mfe/src/shared-inbox/blocks/RecordList.test.tsx`.
