# widgets-fixture-b

A widget for the Widgets Host's `widgets` domain, mounted concurrently with widgets-fixture-a's two instances.

## Widgets and routes

| Extension | Domain route | Content |
|---|---|---|
| `widget-b` | `widgets=widget-b` | A framed note; no internal routes |

Widgets are not pages and declare no `seo`.

## Structure

`mfe.json` (manifest, entry, one extension), `src/lifecycle.tsx` (the widget as a kit `Item` on the muted surface, reading the tokens the Widgets Host carries), tests beside the sources.

## Run alone

Inside an assembled site: `npm run build`, `npm run preview` (port 3202), `npm run test:unit`, `npm run type-check`.
