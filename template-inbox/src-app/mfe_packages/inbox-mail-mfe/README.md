# inbox-mail-mfe

The inbox's Mail screen.

## Screens and routes

| Token | Menu | Port |
|---|---|---|
| `inbox-mail` | Mail | 3040 |

Routes inside the screen: `/` mailboxes, the mail list and the reading pane; any other path renders the screen's not-found page. The route tree is `src/routes.tsx`; the lifecycle (`src/lifecycle.tsx`) extends `InboxScreenLifecycle` from `shared/inbox/lifecycle/`, which renders the tree through `<ExtensionRouter>` over the app in `src/init.ts`.

## Structure

`src/screens/mail/` (mailboxes, list, reading pane, composer, `i18n/`), `src/slices/`, `src/events/`, `src/actions/`, `src/effects/` (the mail's FrontX slice), `src/api/` (`MailApiService`, dataset, mock store), `src/test-support/` (test helpers), `mfe.json` (manifest, entry, the screen extension with its `route`, menu entry and `seo`). Shared code comes from `../shared/inbox/` through the `@inbox-shared` alias.

## Run alone

Inside an assembled site: `npm run build`, `npm run preview` (port 3040), `npm run test:unit`, `npm run type-check`.
