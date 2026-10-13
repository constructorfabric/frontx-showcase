# inbox-contacts-mfe

The inbox's Contacts screen.

## Screens and routes

| Token | Menu | Port |
|---|---|---|
| `inbox-contacts` | Contacts | 3010 |

Routes inside the screen: `/` the directory (filters, search, sort, paging) and `/$contactId` a person's page over it; an unknown id shows the contact-not-found state, any other path the screen's not-found page. The route tree is `src/routes.tsx`; the lifecycle (`src/lifecycle.tsx`) extends `InboxScreenLifecycle` from `shared/inbox/lifecycle/`, which renders the tree through `<ExtensionRouter>` over the app in `src/init.ts`. Another screen opens a person's page with the screen's own `show_contact` action (payload `{ contact }`): the lifecycle registers its handler when it mounts, and `mfe.json` declares the action and its closed schema.

## Structure

`src/screens/contacts/` (directory, filters, detail, `i18n/`), `src/slices/`, `src/events/`, `src/actions/`, `src/effects/` (the directory's FrontX slice), `src/shared-inbox/` (the shared folder's tests), `src/test-support/` (test helpers), `mfe.json` (manifest, the `show_contact` action schema, entry, the screen extension with its `route`, menu entry and `seo`). Shared code comes from `../shared/inbox/` through the `@inbox-shared` alias.

## Run alone

Inside an assembled site: `npm run build`, `npm run preview` (port 3010), `npm run test:unit`, `npm run type-check`.
