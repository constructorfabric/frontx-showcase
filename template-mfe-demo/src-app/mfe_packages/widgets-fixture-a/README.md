# widgets-fixture-a

A widget for the Widgets Host's `widgets` domain. Its one entry is wired as two extension instances, `widget-alpha` and `widget-beta`; each instance is loaded as its own module copy (shown by a random value per copy).

## Widgets and routes

| Extension | Domain route | Widget routes |
|---|---|---|
| `widget-alpha` | `widgets=widget-alpha` | `/` (instance information, last ping, a button that mounts Hello World in the shell's screen domain) and a not-found page |
| `widget-beta` | `widgets=widget-beta` | same |

The entry declares the `widget_ping` action: the Widgets Host's ping buttons send it, and the handler records the time in the widget's own `last-ping` search parameter through the app's navigation facade. Widgets are not pages and declare no `seo`.

## Structure

`mfe.json` (manifest, `widget_ping` schema, entry, two extensions), `src/routes.tsx` (the route tree and its pages: each instance a kit `Item` with an outline, reading the tokens the Widgets Host carries), `src/lifecycle.tsx` (app with `microfrontends()`, ping handler, one React tree per mounted instance), tests beside the sources.

## Run alone

Inside an assembled site: `npm run build`, `npm run preview` (port 3201), `npm run test:unit`, `npm run type-check`.
