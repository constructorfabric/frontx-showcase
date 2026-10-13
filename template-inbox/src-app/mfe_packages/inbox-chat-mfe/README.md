# inbox-chat-mfe

The inbox's Chat screen.

## Screens and routes

| Token | Menu | Port |
|---|---|---|
| `inbox-chat` | Chat | 3030 |

Routes inside the screen: `/` channels, conversations and the open thread; any other path renders the screen's not-found page. "View contact" opens the person's page in contacts through `openScreen`: the mount, then contacts' `show_contact` with the person's id. The route tree is `src/routes.tsx`; the lifecycle (`src/lifecycle.tsx`) extends `InboxScreenLifecycle` from `shared/inbox/lifecycle/`, which renders the tree through `<ExtensionRouter>` over the app in `src/init.ts`.

## Structure

`src/screens/chat/` (folders, conversation list, thread, composer, customer details, navigation, `i18n/`), `src/slices/`, `src/events/`, `src/actions/`, `src/effects/` (the chat's FrontX slice), `src/test-support/` (test helpers), `mfe.json` (manifest, entry, the screen extension with its `route`, menu entry and `seo`). Shared code comes from `../shared/inbox/` through the `@inbox-shared` alias.

## Run alone

Inside an assembled site: `npm run build`, `npm run preview` (port 3030), `npm run test:unit`, `npm run type-check`.
