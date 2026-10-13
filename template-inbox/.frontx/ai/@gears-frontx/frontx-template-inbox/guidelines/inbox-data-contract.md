# Guideline: The Inbox Screens' Data

The four inbox screens are separate microfrontend packages under `src-app/mfe_packages/`, and every MFE load evaluates its own copy of each module it bundles. This guideline covers where the services and seeds live, where each package keeps its mock backend state, how the screens read and write through FrontX's shared query cache, where each screen keeps its own state, and how a real backend replaces the mocks. Paths below are relative to `src-app/mfe_packages/`.

## Where the data lives

```
shared/inbox/api/                 imported as @inbox-shared/api/*, bundled into each package that imports it
  InboxApiService.ts              conversations, transcript, contacts and agent, baseURL /api/inbox
  mocks.ts                        inboxMockMap (a FrontX MockMap), keys prefixed with /api/inbox
  mockFailure.ts                  MockRequestError and refuseRequest, how a factory refuses a write
  dataset.ts                      the inbox seed: agent, channels, conversations, messages, contacts
  mockStore.ts                    the package's inbox mock state (readInboxMockState, resetInboxMockState)
  registry.ts                     registerInboxApi, getInboxApi
  seedClock.ts                    the package's anchor every seed instant is measured from
  constants.ts                    ids the screens share with the API (CHANNEL_GENERAL, BRAND, NO_TEAM_INBOX, TEAM_INBOXES)
  types.ts, dashboardTypes.ts     response contracts
inbox-dashboard-mfe/src/api/      DashboardApiService (/api/dashboard), dashboardMocks.ts, dashboardDataset.ts, registerDashboardApi
inbox-mail-mfe/src/api/           MailApiService (/api/mail), mailMocks.ts, mailDataset.ts, mailMockStore.ts, registerMailApi, constants.ts (MAILBOX_*)
inbox-{contacts,chat,mail}-mfe/src/
  slices/ events/ actions/ effects/   the screen's own state, in the template-mfe skeleton's layout
```

A service and its seed live in the package that reads them unless another screen reads them too: contacts, dashboard and chat share `InboxApiService` from `shared/inbox/api/`; the dashboard overview and mail each stay in their own package, so mail never bundles the inbox seed and contacts never bundles the mail one. Seed datasets are imported by mock maps and tests, never by a screen.

## Registration, one registrar per service

Each package calls the registrars of the services its screen reads in its `src/init.ts`, before it builds its app with `buildInboxScreenApp` (`shared/inbox/lifecycle/screenApp.ts`):

| Package | Registrars |
|---|---|
| `inbox-contacts-mfe` | `registerInboxApi` |
| `inbox-dashboard-mfe` | `registerInboxApi`, `registerDashboardApi` |
| `inbox-chat-mfe` | `registerInboxApi` |
| `inbox-mail-mfe` | `registerMailApi` |

A registrar registers its service with `apiRegistry` (idempotent). Each MFE load has its own `apiRegistry`, so each package registers for itself. A screen reads through the getter, never through `new`, with the hook of `@gears-frontx/react`:

```ts
import { useApiQuery } from '@gears-frontx/react';

const contactsQuery = useApiQuery(getInboxApi().getContacts);
```

Every service declares the shell's `RestMockPlugin` (`import { RestMockPlugin } from '@gears-frontx/frontx-template-shell'`) with its mock map and a 100 ms delay; the inbox ships no mock plugin of its own.

## One mock state per package

`shared/inbox/api/mockStore.ts` keeps the inbox mock state in a module variable. Every package that bundles it (chat, contacts, dashboard) has its own copy, created lazily from the same seed on its first read, holding `contacts`, `conversations`, `messages` and the counters for what the package created. It is kept across that screen's unmount and remount within the page, and reset by a page reload or by `resetInboxMockState()` in tests. It stands for the server only: what a screen has read lives in the shared query cache, and what a screen keeps for itself lives in its slice. Mail keeps its own state the same way in `inbox-mail-mfe/src/api/mailMockStore.ts`. The seed anchor in `seedClock.ts` is `ANCHOR_MS = Date.now()` when the package's copy of the module loads, so each screen measures "an hour ago" from its own load moment.

No package's mock state is put on a page-wide object or read by another package. A write (a reply, a note, a new conversation, a sent mail) is in the state of the package that made it, so that screen shows it once its own read has answered, across its views and its remounts. Another screen package answers from its own copy of the seed. The packages read the same endpoints under the same query keys (`[baseURL, method, path]`) in the host's one shared query cache (`queryCacheShared()`), and every mount refetches in the background, so reads also pass between packages through that cache: after chat posts a reply, the contacts screen first paints the cached answer chat filled, reply included, until its own mount refetch answers from its own copy of the seed and the reply disappears there; a return to chat can briefly paint contacts' answer until chat's refetch brings the reply back. A real backend gives one set of facts to every screen; the mocks do not simulate that. The dashboard's activity rows are built from the contacts of the dashboard package's own state on each request (`dashboardMocks.ts`), so every row names a person that package's contacts list holds.

## The shared query cache

The screens read with `useApiQuery` and write with `useApiMutation` of `@gears-frontx/react`. Each package's app joins the page's one QueryClient with `queryCacheShared()` (the shell owns it with `queryCache()`; `buildInboxScreenApp` adds it after `mock()`, see below), and a descriptor's key is `[baseURL, method, path]`, so every package that reads `GET /api/inbox/conversations` reads the same cache entry. A write names what it changed in its `onSuccess`, through the `queryCache` the hook hands it:

```ts
const sendMessage = useApiMutation<PostMessageResponse, Error, PostMessageRequest>({
  endpoint: service.postMessage,
  onSuccess: (response, request, _context, { queryCache }) => {
    void queryCache.invalidate(service.getMessages);
    void queryCache.invalidate(service.getConversations);
  },
});
```

An invalidated read is fetched again at once where a screen shows it and on the next mount everywhere else, in every package, and the page's shared fetch cache forgets it too. The writes and what they invalidate:

| Write | Invalidates |
|---|---|
| `POST /api/inbox/messages` (chat) | messages, conversations |
| `POST /api/inbox/conversations` (chat) | conversations, contacts |
| `POST /api/mail/mails` (mail) | mails |

A read nobody invalidated is answered from the cache at once (no loading state) and refreshed in the background, including after another package loaded for the first time: `mock()` announces its initial state with a mock toggle event, and a runtime's `queryCacheShared()` clears the page's whole QueryClient on every mock toggle it hears, so `buildInboxScreenApp` adds `mock()` first, and its initial toggle passes before the shared cache listens (a FrontX limitation of `queryCacheShared()`). Keep that order in a package that builds its app another way. A real mock switch at run time still clears the cache, as it should. `onSuccess` runs whether or not the screen that started the write is still mounted, so what the write means for the screen's slice (clearing the sent draft, adding a started conversation) lands either way; what it means for the mount itself (opening the started conversation, focusing its reply box) is guarded by the screen.

A screen gates its first paint on the queries it needs with `firstPaintOf` from `shared/inbox/ui/QueryStates.tsx` (`LoadErrorPane` on failure, `LoadingPane` while pending or while a failed query is asked again). Only a query without an answer gates: when a background refetch fails, the query keeps its last answer, and the screen keeps showing it.

## Each screen's own state

What a screen keeps across mounts and never sends to a service (the open channel, mailbox or conversation, search, sort, tabs, drafts, the details panel's changes, a created channel, the directory's filter) is a FrontX slice in the package's store, laid out the way template-mfe's skeleton lays it out:

| Package | Slice | Files |
|---|---|---|
| `inbox-contacts-mfe` | `inbox/contacts` | `src/slices/contactsSlice.ts`, `src/events/contactsEvents.ts`, `src/actions/contactsActions.ts`, `src/effects/contactsEffects.ts` |
| `inbox-chat-mfe` | `inbox/chat` | `src/slices/chatSlice.ts`, `src/events/chatEvents.ts`, `src/actions/chatActions.ts`, `src/effects/chatEffects.ts` |
| `inbox-mail-mfe` | `inbox/mail` | `src/slices/mailSlice.ts`, `src/events/mailEvents.ts`, `src/actions/mailActions.ts`, `src/effects/mailEffects.ts` |

Components read with `useAppSelector` and the slice's selector (`selectChat`, `selectContactsDirectory`, `selectMail`) and change state by calling an action; an action emits one `mfe/inbox-<screen>/...` event, and the effects, registered with the slice in `init.ts` (`registerSlice(chatSlice, initChatEffects)` after `build()`), are the only code that dispatches. The package's app and store live for the page, so the state survives the screen unmounting. Nothing about a screen's state is held in a module-level variable. The dashboard keeps no state of its own.

## The mock switch

Every package's app has the framework's `mock({ enabledByDefault: true })` (`buildInboxScreenApp` in `shared/inbox/lifecycle/screenApp.ts`), which switches on the `RestMockPlugin` of every service registered before `build()`. While on, the plugin answers a mapped `METHOD /path` with its factory's value as a 200 after the delay; an unmapped route passes through to the network. A factory refuses a write a backend would refuse by throwing `MockRequestError` with that status (`refuseRequest(400, ...)`), which rejects the call. Factories answer with clones, so nothing a screen does to a response reaches the state.

## The endpoints

| Endpoint | Answers |
|---|---|
| `GET /api/inbox/me` | the agent: name, presence, workspace |
| `GET /api/inbox/channels` | the seeded channels |
| `GET /api/inbox/conversations` | every conversation, including those started this page |
| `GET /api/inbox/messages` | every message, including those posted this page |
| `GET /api/inbox/contacts` | every contact with its detail payload |
| `POST /api/inbox/messages` | stores a reply or note (400 without a conversation, text or a `reply`/`note` kind, 404 for an unknown conversation) |
| `POST /api/inbox/conversations` | starts a conversation with an existing contact (400 without a channel or contact, 404 for an unknown contact) |
| `GET /api/dashboard/overview` | the whole dashboard in one response: KPI cards, charts, workload, funnel, conversion by source, top agents, activity rows |
| `GET /api/mail/mailboxes` | the mailboxes |
| `GET /api/mail/mails` | every mail, including those sent this page |
| `GET /api/mail/messages` | the earlier messages behind a mail's history toggle |
| `POST /api/mail/mails` | files a sent mail under Sent (400 without a recipient, or without both subject and body) |

Every read returns a whole collection: a mock factory is passed the request body only, so selection happens in the screen over a collection it holds. A new slice of data is a new collection endpoint, not a parameterised one. What the details panels change (assignee, priority, status, tags, spam, a new channel) lives in each screen's slice, not in the services; a new persisted change is a new mutation on the service and its mock map, invalidating the reads it changes.

## Replacing the mocks with a real backend

1. Serve the endpoints above, with the response types in `types.ts`, `dashboardTypes.ts` and `inbox-mail-mfe/src/api/mailTypes.ts`, at the services' base URLs (or change `baseURL` in each service's constructor).
2. In `buildInboxScreenApp` (`shared/inbox/lifecycle/screenApp.ts`), which every package's `src/init.ts` builds its app with, pass `mock({ enabledByDefault: false })`, or `mock()` to keep mocks on localhost only; keep it before `queryCacheShared()`.
3. Keep the registrars and the invalidations. A backend that pushes changes invalidates the reads they touch through FrontX's `queryCache` (`useQueryCache()` in a component, `invalidateQueryCacheForApp` outside one).

## Content rules

- Seed data is TypeScript registered through the mock maps; no fixture files, no content in markup.
- Seed instants are offsets from `ANCHOR_MS` (`minutesAgo`, `hoursAgo`, `daysAgo`) and are ISO strings; text is formatted at render by `shared/inbox/ui/format.ts`.
- Relations are ids (a contact's conversations as `{ id }`, an activity row's `ownerAgentId`); `inbox-contacts-mfe/src/shared-inbox/dataset.test.ts` checks the seed's referential integrity.
- Labels are ids resolved through the package catalogue (the dashboard's `screens/dashboard/datasetLabels.ts`, chart configs), so every screen reads in its language.
- Derive what can be derived (counts, totals, deltas, percents, initials) instead of storing it.
- Seed email addresses use reserved example domains and phone numbers the `555 01xx` range.
