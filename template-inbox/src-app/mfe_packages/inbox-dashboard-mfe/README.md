# inbox-dashboard-mfe

The inbox's Dashboard screen.

## Screens and routes

| Token | Menu | Port |
|---|---|---|
| `inbox-dashboard` | Dashboard | 3020 |

Routes inside the screen: `/` the overview; any other path renders the screen's not-found page. The route tree is `src/routes.tsx`; the lifecycle (`src/lifecycle.tsx`) extends `InboxScreenLifecycle` from `shared/inbox/lifecycle/`, which renders the tree through `<ExtensionRouter>` over the app in `src/init.ts`.

## Structure

`src/screens/dashboard/` (cards, charts, selectors, `i18n/`), `src/api/` (`DashboardApiService`, dataset, mocks), `src/test-support/` (test helpers), `mfe.json` (manifest, entry, the screen extension with its `route`, menu entry and `seo`). Shared code comes from `../shared/inbox/` through the `@inbox-shared` alias.

## Run alone

Inside an assembled site: `npm run build`, `npm run preview` (port 3020), `npm run test:unit`, `npm run type-check`.
