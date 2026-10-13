# ContactSummary

A person at a glance, centred: the avatar, the name, one muted line about them, an optional badge and an optional action.

- **Parts**: the caller's avatar (`PresenceAvatar`), the name on the kit candidate `Heading` at the heading-2 role rendered as text (not an outline heading), the meta line on the kit candidate `Text` (`meta`, `muted`), a kit `Badge`, a kit `Button`.
- **Props**: content only: `avatar`, `name`, `meta`, `badge?`, `action?`.
- **Layout**: a centred flex column with `--space-2` between the parts. No visual declaration.
- **Used by**: the chat's customer details panel (presence and "View contact"), a contact's page (email and type badge).
- **Test**: `inbox-contacts-mfe/src/shared-inbox/blocks/ContactSummary.test.tsx`.
