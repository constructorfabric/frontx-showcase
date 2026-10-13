# PresenceAvatar

A person's avatar with a presence dot: the kit `Avatar` with an `AvatarFallback` in the identity tone and initials derived from the name, and an `AvatarBadge` named by the presence label (`role="img"`).

- **Props**: content only: `name`, `presence` (`online`, `away`, `offline`), `size` (the kit Avatar's own size), `t`.
- **Visual declarations** (`styles-exemptions.json`): the dot's colour per presence (`--success`, `--warning`, `--muted-foreground`). They wait for a `tone` on the kit's `AvatarBadge` (the axis `AvatarFallback` and `StatusDot` already have).
- **Used by**: the conversation list and thread, the customer details panel, the contacts directory and a contact's page, the dashboard's activity table.
- **Test**: `inbox-contacts-mfe/src/shared-inbox/blocks/PresenceAvatar.test.tsx`.
