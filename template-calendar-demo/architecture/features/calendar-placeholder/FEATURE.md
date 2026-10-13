# Feature: Calendar Placeholder Screen


<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Open the Calendar Screen](#open-the-calendar-screen)
  - [Follow the Shell's Theme and Language](#follow-the-shells-theme-and-language)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Package App](#package-app)
  - [Kit Token Node](#kit-token-node)
  - [Anchor Root Selectors](#anchor-root-selectors)
  - [Theme Scope](#theme-scope)
  - [Text Direction](#text-direction)
  - [Bridge for Route Components](#bridge-for-route-components)
  - [Screen Translations](#screen-translations)
- [4. States (CDSL)](#4-states-cdsl)
  - [No Feature-Owned State Machine](#no-feature-owned-state-machine)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Lasting Screen Frame](#lasting-screen-frame)
  - [Placeholder Content](#placeholder-content)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

- [x] `p1` - **ID**: `cpt-template-calendar-demo-featstatus-calendar-placeholder`
## 1. Feature Context

- [x] `p1` - `cpt-template-calendar-demo-feature-calendar-placeholder`

### 1.1 Overview

The calendar demo screen of `calendar-demo-mfe`: a lifecycle that mounts into the shell's shadow root with the UI kit's tokens, a frame that follows the shell's theme and language, and a one-page route tree whose placeholder page says the calendar demo is in development, with a not-found page for every other path.

### 1.2 Purpose

The calendar demo needs a stable address, a menu entry in the demos group and a page that is never indexed before its calendar kit is released. This feature delivers that screen and keeps its lasting frame (registration, mount, theme and direction, text loading, metadata declaration) apart from the placeholder content, so that the real demo later replaces only the content.

**Requirements**: `cpt-template-calendar-demo-fr-screen-registration`, `cpt-template-calendar-demo-fr-placeholder-page`, `cpt-template-calendar-demo-fr-not-found`, `cpt-template-calendar-demo-fr-host-theme-direction`, `cpt-template-calendar-demo-fr-page-text-per-language`, `cpt-template-calendar-demo-fr-page-metadata`, `cpt-template-calendar-demo-fr-self-contained`, `cpt-template-calendar-demo-fr-ai-guideline`, `cpt-template-calendar-demo-nfr-metadata-quality`, `cpt-template-calendar-demo-nfr-semantics`, `cpt-template-calendar-demo-nfr-kit-consistent-look`

**Principles**: `cpt-template-calendar-demo-principle-kit-first`, `cpt-template-calendar-demo-principle-metadata-once`, `cpt-template-calendar-demo-principle-package-local-helpers`, `cpt-template-calendar-demo-principle-stable-frame`

**Constraints**: `cpt-template-calendar-demo-constraint-host-prerequisites`, `cpt-template-calendar-demo-constraint-shadow-root`, `cpt-template-calendar-demo-constraint-one-router`, `cpt-template-calendar-demo-constraint-exact-pins`, `cpt-template-calendar-demo-constraint-two-kit-scopes`

**Components**: `cpt-template-calendar-demo-component-screen-manifest`, `cpt-template-calendar-demo-component-lifecycle`, `cpt-template-calendar-demo-component-kit-token-anchoring`, `cpt-template-calendar-demo-component-screen-frame`, `cpt-template-calendar-demo-component-pages`, `cpt-template-calendar-demo-component-screen-translations`, `cpt-template-calendar-demo-component-template-packaging`

**Scope**: the package `src-app/mfe_packages/calendar-demo-mfe/` (manifest, lifecycle, app, frame and its CSS Module, route tree, pages, translations hook, English strings), the template manifest and the AI bundle. Everything the screen declares lives in the package manifest; everything it runs is in the eight source files listed in the DECOMPOSITION entry.

**Out of scope**: any calendar function or calendar package; the kit's own `Calendar` and `Date Picker` components, which the catalogue screen shows; inner routes and languages other than English; writing the document head, generating the sitemap or the crawler files (the project's metadata pipeline); the host's menu, screen container and load-failure state; composing the template into the site.

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-calendar-demo-actor-visitor` | Opens the calendar screen or an address inside it and reads the page in the shell's theme, direction and language |
| `cpt-template-calendar-demo-actor-host-shell` | Mounts the screen's lifecycle into a shadow root it keeps across mounts and publishes the theme and language the frame follows |
| `cpt-template-calendar-demo-actor-metadata-pipeline` | Reads the page metadata declared on the screen extension; the screen itself writes no head |
| `cpt-template-calendar-demo-actor-template-consumer` | Copies the package and the AI bundle into a project with template-shell and template-mfe applied |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md)
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.1
- **ADRs**: `cpt-template-calendar-demo-adr-placeholder-until-kit-release`, `cpt-template-calendar-demo-adr-kit-tokens-in-shadow-root`
- **Interface**: `cpt-template-calendar-demo-interface-package-surface`
- **Sequences**: `cpt-template-calendar-demo-seq-open-screen`, `cpt-template-calendar-demo-seq-host-change`, `cpt-template-calendar-demo-seq-apply-template`
- **Dependencies**: None

## 2. Actor Flows (CDSL)

User-facing interactions that start with an actor (human or external system) and describe the end-to-end flow of a use case. Each flow has a triggering actor and shows how the system responds to actor actions.

**Use cases**: `cpt-template-calendar-demo-usecase-open-screen`, `cpt-template-calendar-demo-usecase-apply-template`

### Open the Calendar Screen

- [x] `p1` - **ID**: `cpt-template-calendar-demo-flow-calendar-placeholder-open-screen`

**Actor**: `cpt-template-calendar-demo-actor-visitor`

**Success Scenarios**:
- The visitor opens `/?screen=calendar`; the shell mounts the screen and the placeholder page shows in the shell's theme and direction.
- The visitor opens an address inside the screen other than its root; the not-found page shows with a link back to the placeholder.

**Error Scenarios**:
- The package app was built without the microfrontends plugin: rendering fails loudly instead of rendering a screen without a router.
- The remote cannot load at all: the shell's load-failure state applies (outside this feature).

**Steps**:
1. [x] - `p1` - Shell host loads the remote's `./lifecycle` module and mounts its default export, one lifecycle object with mount and unmount - `inst-export-entry`
2. [x] - `p1` - The lifecycle is a theme-aware React lifecycle bound to the package's own FrontX app - `inst-bind-app`
3. [x] - `p1` - On every mount the lifecycle keeps exactly one marked style node of the re-anchored kit tokens in the shadow root (algorithm Kit Token Node) - `inst-kit-token-node`
4. [x] - `p1` - The lifecycle renders the screen frame around the extension router over the package's registry and the screen's route tree, failing loudly when the app has no registry - `inst-render-frame`
5. [x] - `p1` - The route tree renders the placeholder page at `/` and the not-found page for every other path - `inst-route-tree`
6. [x] - `p1` - **IF** the page's strings are still loading, the page renders nothing - `inst-wait-strings`
7. [x] - `p1` - The placeholder page renders the kit's `Empty` with a calendar-clock icon hidden from assistive technology, its title rendered as the one `h1` with the page title, and the description naming the UI kit catalogue - `inst-render-placeholder`
8. [x] - `p1` - The not-found page renders the kit's `Empty` with its title rendered as the one `h1`, a description and the kit candidate link over the router link back to `/` - `inst-render-not-found`

### Follow the Shell's Theme and Language

- [x] `p1` - **ID**: `cpt-template-calendar-demo-flow-calendar-placeholder-host-change`

**Actor**: `cpt-template-calendar-demo-actor-host-shell`

**Success Scenarios**:
- The shell switches between a light and a dark theme; the frame and the shadow host switch the kit's scope without a reload.
- The shell switches to a right-to-left language; the frame and the shadow host switch direction and the page reloads its strings.

**Error Scenarios**:
- The shell has not published a string value for a property yet: the frame uses the fallback (`light`, `en`) until it does.

**Steps**:
1. [x] - `p1` - The frame reads the theme and language shared properties through the bridge, accepts only string values, uses the fallback while none is published, and subscribes to their changes for as long as it is mounted - `inst-follow-properties`
2. [x] - `p1` - The frame maps the theme onto the kit's light or dark scope (algorithm Theme Scope) and the language onto a direction (algorithm Text Direction) - `inst-map-scope-direction`
3. [x] - `p1` - After each commit the frame sets the direction and the scope on the shadow host, so kit overlays that open at the shadow root's top level resolve the same tokens - `inst-set-host`
4. [x] - `p1` - **RETURN** the frame element carrying the scope and the direction, with the bridge provided to the route components - `inst-return-frame`

## 3. Processes / Business Logic (CDSL)

Internal system functions and procedures that do not interact with actors directly. These are reusable building blocks called by Actor Flows or other processes.

### Package App

- [x] `p1` - **ID**: `cpt-template-calendar-demo-algo-calendar-placeholder-package-app`

**Input**: None (module evaluation of the entry)

**Output**: The package's one FrontX app

**Steps**:
1. [x] - `p1` - Build the app once at module load with the effects plugin, the plugin that joins the host's shared query cache and the microfrontends plugin over the GTS type system, so the screen owns a registry to build its router from - `inst-build-app`

### Kit Token Node

- [x] `p1` - **ID**: `cpt-template-calendar-demo-algo-calendar-placeholder-kit-token-node`

**Input**: The shadow root the shell mounts the screen into

**Output**: The shadow root holding exactly one style node with the kit's tokens

**Steps**:
1. [x] - `p1` - Rewrite the kit's token stylesheet for a shadow root once, at module load (algorithm Anchor Root Selectors) - `inst-rewrite-once`
2. [x] - `p1` - **IF** the shadow root already holds the marked style node, replace its text with the tokens and **RETURN** - `inst-reuse-node`
3. [x] - `p1` - **ELSE** create a style node marked with `data-kit-theme`, set its text to the tokens and append it to the shadow root - `inst-append-node`

### Anchor Root Selectors

- [x] `p1` - **ID**: `cpt-template-calendar-demo-algo-calendar-placeholder-anchor-root-selectors`

**Input**: The kit's token stylesheet text, minified or not

**Output**: The same stylesheet with every `:root` selector naming the shadow host

**Steps**:
1. [x] - `p1` - Define the compound tail that may follow `:root`: classes, ids, attribute selectors and pseudo-classes with an optional non-nested argument; pseudo-elements end the tail - `inst-tail-pattern`
2. [x] - `p1` - Strip every comment, so that each remaining `:root` is a selector - `inst-strip-comments`
3. [x] - `p1` - **FOR EACH** `:root` with its tail: a bare `:root` becomes `:host`, a `:root` with a tail becomes `:host(<tail>)`, and **RETURN** the rewritten text - `inst-rewrite-root`

### Theme Scope

- [x] `p1` - **ID**: `cpt-template-calendar-demo-algo-calendar-placeholder-theme-scope`

**Input**: The shell's theme identifier

**Output**: `light` or `dark`

**Steps**:
1. [x] - `p1` - Enumerate the shell's dark theme identifiers: `dark`, `dracula`, `dracula-large` - `inst-dark-set`
2. [x] - `p1` - **RETURN** `dark` for an enumerated identifier and `light` for any other, unknown identifiers included - `inst-return-scope`

### Text Direction

- [x] `p1` - **ID**: `cpt-template-calendar-demo-algo-calendar-placeholder-text-direction`

**Input**: A language code

**Output**: `ltr` or `rtl`

**Steps**:
1. [x] - `p1` - Enumerate the right-to-left languages: Arabic, Hebrew, Persian, Urdu - `inst-rtl-set`
2. [x] - `p1` - **RETURN** `rtl` when the code's primary subtag, lower-cased, is enumerated, else `ltr` - `inst-return-direction`

### Bridge for Route Components

- [x] `p1` - **ID**: `cpt-template-calendar-demo-algo-calendar-placeholder-route-bridge`

**Input**: A route component rendered inside the frame

**Output**: The mounted screen's bridge

**Steps**:
1. [x] - `p1` - **IF** no frame provides a bridge, fail loudly; **ELSE RETURN** the frame's bridge - `inst-read-bridge`

### Screen Translations

- [x] `p1` - **ID**: `cpt-template-calendar-demo-algo-calendar-placeholder-screen-translations`

**Input**: The page's string sets collected once at module level from its `i18n` folder, and the bridge

**Output**: A lookup function and a loading flag

**Steps**:
1. [x] - `p1` - Import the set of a language; **IF** the language has none, warn and import English; **IF** English is missing too, or an import fails, log an error and use an empty set - `inst-import-set`
2. [x] - `p1` - Track whether the page is mounted - `inst-track-mounted`
3. [x] - `p1` - Number every load; a load applies its strings and clears the loading flag only when it is still the latest load and the page is still mounted - `inst-numbered-load`
4. [x] - `p1` - Load the bridge's current language (English when none is published) and reload on every language change whose language or set map differs from the latest load; stop listening when the page unmounts - `inst-follow-language`
5. [x] - `p1` - Look a key up in the applied set; a missing key logs a warning and returns the key itself - `inst-lookup`
6. [x] - `p1` - **RETURN** the lookup and the loading flag - `inst-return-translations`

## 4. States (CDSL)

Include when entities have explicit lifecycle states.

### No Feature-Owned State Machine

Not applicable. The screen holds no entity with a lifecycle of its own: the placeholder renders static content, the theme scope and direction are values derived on each render, and the only kept state is the latest loaded string set, whose ordering rule is the numbered load of the Screen Translations algorithm. The mount and unmount lifecycle of the screen belongs to the shell's runtime.

## 5. Definitions of Done

Specific implementation tasks derived from flows and algorithms above.

### Lasting Screen Frame

- [x] `p1` - **ID**: `cpt-template-calendar-demo-dod-calendar-placeholder-screen-frame`

The system **MUST** expose one lifecycle module that the package manifest's single screen extension (token `calendar`, label "Calendar: coming soon", order 60, `demos` group) names as its entry; the lifecycle **MUST** build on the package's own app, keep one style node of the re-anchored kit tokens in the shadow root across mounts, and render a frame that sets the kit's scope and the text direction on itself and on the shadow host, follows the shell's theme and language and provides the bridge to route components. The package **MUST** import nothing outside its own directory.

**Implements**:
- `cpt-template-calendar-demo-flow-calendar-placeholder-open-screen`
- `cpt-template-calendar-demo-flow-calendar-placeholder-host-change`
- `cpt-template-calendar-demo-algo-calendar-placeholder-package-app`
- `cpt-template-calendar-demo-algo-calendar-placeholder-kit-token-node`
- `cpt-template-calendar-demo-algo-calendar-placeholder-anchor-root-selectors`
- `cpt-template-calendar-demo-algo-calendar-placeholder-theme-scope`
- `cpt-template-calendar-demo-algo-calendar-placeholder-text-direction`
- `cpt-template-calendar-demo-algo-calendar-placeholder-route-bridge`

**Constraints**: `cpt-template-calendar-demo-constraint-host-prerequisites`, `cpt-template-calendar-demo-constraint-shadow-root`, `cpt-template-calendar-demo-constraint-one-router`, `cpt-template-calendar-demo-constraint-two-kit-scopes`

**Touches**:
- Module: `./lifecycle` of the remote
- Entities: Entry, Screen extension

### Placeholder Content

- [x] `p1` - **ID**: `cpt-template-calendar-demo-dod-calendar-placeholder-content`

The system **MUST** render, at `/`, one placeholder page from the kit's `Empty` family with a decorative icon hidden from assistive technology and one `h1` equal to the declared title, and for every other path a not-found page with one `h1` and a link back to `/`; both pages **MUST** take their text from the screen's string sets with the latest-load rule and render nothing until the text is loaded, and **MUST** import no stylesheet: they are kit components and kit candidates, laid out by the screen frame's CSS Module on the kit's semantic tokens.

**Implements**:
- `cpt-template-calendar-demo-flow-calendar-placeholder-open-screen`
- `cpt-template-calendar-demo-algo-calendar-placeholder-screen-translations`

**Constraints**: `cpt-template-calendar-demo-constraint-one-router`, `cpt-template-calendar-demo-constraint-exact-pins`

**Touches**:
- API: `GET /?screen=calendar`, `GET /?screen=calendar;route=<path>`
- Entities: String set

## 6. Acceptance Criteria

- [x] The manifest declares exactly one screen extension of the shell's screen extension type with token `calendar`, the menu entry "Calendar: coming soon", icon `lucide:calendar`, order 60 and the demos nav group's id as its group, and carries no screen type schema.
- [x] The manifest declares page metadata once, with the title equal to the placeholder's heading text, a description of 50 to 160 characters, `indexable: false` and no per-route entries; no source file writes the document title or head tags.
- [x] At the screen root the placeholder page renders with exactly one level-one heading; any other path renders the not-found page with one level-one heading and a link back to the root.
- [x] However often the screen mounts into the same shadow root, the shadow root holds one kit token style node.
- [x] A dark shell theme gives the frame and the shadow host the kit's dark scope, any other theme the light scope; a right-to-left language sets `rtl` on both.
- [x] A language without strings falls back to English, and an earlier, slower language load never replaces the strings of the latest language.
- [x] The template manifest claims exactly the package directory and the AI bundle directory and no shared file; the package's dependencies are exact pins. These are checked by the hosting repository's template and pin checks, and the head and sitemap generated from the declared metadata by its metadata check.

**Test scenarios** (Vitest, in the package; run with `npm run test:unit` in the composed package):
- `src/lifecycle.test.tsx`: "is the theme-aware lifecycle, exported as the module default"; "puts the kit's token sheet into the shadow root once, however often it mounts"; "renders the package's route tree through the framework router over the package's own registry"; "scopes the kit's tokens to the shell's theme and follows the language's direction".
- `src/routes.test.tsx`: "renders the placeholder at the screen root, its title the one level-one heading"; "renders the screen's own not-found page for any other path, linking back to the root".
- `src/manifest.test.ts`: shared dependencies externalized in `vite.config.ts`; GTS ids and the one `./lifecycle` entry; the preview port; token and menu entry; the shell's screen type, the demos group's id and no schema of its own; metadata for the one page kept out of the index; title equal to the heading and description length.
- `src/shared/anchorKitThemeOnShadowHost.test.ts`: bare and compound `:root` rewrites, pseudo-elements kept outside `:host()`, idempotence, every `:root` of the pinned kit stylesheet in selector position, and the stated quoted-value limitation.
- `src/shared/kitThemeScope.test.ts`: dark themes onto the dark scope, light themes and unknown identifiers onto the light scope.
- `src/shared/useScreenTranslations.test.tsx`: current-language load, missing key, English fallback, reload on language change, unsubscribe on unmount, latest load wins.
