# ChipRow

A wrapping row of chips: the tags of a conversation (with the control that adds one) or of a contact.

- **Parts**: kit `Badge` chips (a removable chip is the Badge rendered as a button), a kit `Button` or `Input` that adds one.
- **Props**: content only: `children`.
- **Layout**: a wrapping flex row with `--space-1` between chips. No visual declaration. It stands in for a kit tags input (a `TagsInput` with chips, an add control and a read-only mode), which the kit does not have.
- **Used by**: `TagEditor` (chat details panel), a contact's page.
- **Test**: `inbox-contacts-mfe/src/shared-inbox/blocks/ChipRow.test.tsx`.
