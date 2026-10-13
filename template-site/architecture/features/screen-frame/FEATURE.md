# Feature: Screen Package Frame

- [x] `p1` - **ID**: `cpt-template-site-featstatus-screen-frame`

<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Mount a Screen](#mount-a-screen)
  - [Follow the Host's Theme and Language](#follow-the-hosts-theme-and-language)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Anchor the Kit's Tokens on the Shadow Host](#anchor-the-kits-tokens-on-the-shadow-host)
  - [Map the Host Theme to the Kit's Scope](#map-the-host-theme-to-the-kits-scope)
  - [Resolve the Content Language](#resolve-the-content-language)
  - [Load a Screen's Strings](#load-a-screens-strings)
  - [Set Up the Home Package's App](#set-up-the-home-packages-app)
- [4. States (CDSL)](#4-states-cdsl)
  - [No Feature-Owned State Machine](#no-feature-owned-state-machine)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Kit Tokens Work in the Shadow Root](#kit-tokens-work-in-the-shadow-root)
  - [Theme and Language from the Host](#theme-and-language-from-the-host)
  - [One Lifecycle Form, Self-Contained Packages](#one-lifecycle-form-self-contained-packages)
  - [Page States from Kit Parts](#page-states-from-kit-parts)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

## 1. Feature Context

- [x] `p1` - `cpt-template-site-feature-screen-frame`

### 1.1 Overview

Every screen package of template-site (`site-home-mfe`, `site-templates-mfe`, `site-docs-mfe`, `site-libs-mfe`) has the same frame inside its shadow root and the same package form. The lifecycle rewrites the kit's root token rules onto the shadow host once at module load and keeps them in one style node per shadow root (the brand is not part of it: it reaches the shadow root from the host's document with the head styles the theme-aware base lifecycle adopts), renders the screen's route tree through `ExtensionRouter` over the package's own registry inside the screen frame, and, in the docs and templates packages, registers the screen's show action handler before `mount()` returns. The screen frame maps the host's theme id to the kit's light or dark token scope, renders in the host's language when the screen ships strings for it and in English otherwise, declares that language and its direction on the frame and on the shadow host, never on the host's document, and gives route components the bridge; the frame carries no styling of its own, the kit's `data-theme` scope paints it. The page states every screen shows while it loads, when its data fails and for a path it does not know are kit parts as they are: the kit's spinner, its destructive alert, and its empty state whose title is the page's level-one heading. The translation hook loads a screen's strings for the host's language with an English fallback and ignores a load that a newer one or an unmount has overtaken. The package form (manifest with exact FrontX pins and the exact versions of the named packages `@gears-frontx/site-blocks`, `@gears-frontx/kit-candidates` and `@gears-frontx/site-brand`, TypeScript and Vite configuration that externalizes the shared set and aliases only the template's own shared folder, the development page) and the template overlay (`frontx-template.json`, the template `README.md`, the AI bundle) keep the template self-contained on template-shell.

### 1.2 Purpose

A screen in a shadow root receives no document-level tokens, theme or language; the frame makes the kit work there and follows the host without touching the host's document, and one frame copied byte-identical into every package keeps the four screens alike. Code (paths relative to `template-site/src-app/mfe_packages/`): the theme helpers once for all four packages in `shared/site/theme/` (`anchorKitThemeOnShadowHost.ts`, `kitThemeScope.ts`, code-identical to template-mfe's per-package copies), the page states in `shared/site/content/PageStates.tsx`, and per package `site-*-mfe` `src/shared/` (`ScreenFrame.tsx`, `useScreenTranslations.ts`), `src/lifecycle.tsx`, `src/vite-env.d.ts`, and `site-home-mfe/src/init.ts`; the package and overlay files (`package.json`, `tsconfig.json`, `index.html`, `vite.config.ts`, `vitest.config.ts`, package `README.md`, the template root's `frontx-template.json`, `README.md` and `.frontx/`) are configuration and documents that carry no markers. The host's screen domain, menu and address, and the repository-level checks of the template shape and pins, are described in the [repository DESIGN](../../../../architecture/DESIGN.md).

**Requirements**: `cpt-template-site-fr-theme-language`, `cpt-template-site-nfr-self-contained`

**Principles**: `cpt-template-site-principle-host-owns-page`

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-site-actor-host` | Mounts the screen into a shadow root it keeps across mounts, passes the bridge, and broadcasts the theme and language shared properties |
| `cpt-template-site-actor-visitor` | Switches the theme or the language in the host and sees the screen follow |
| `cpt-template-site-actor-template-consumer` | Copies the packages and the overlay into a project with template-shell |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md), component "Screen frame", section 4.3 "Package shape"
- **Dependencies**: `cpt-template-site-feature-site-links` (the handler the lifecycle registers), `cpt-template-site-feature-data-services` (the content packages' lifecycles render over the app their setup creates)

## 2. Actor Flows (CDSL)

### Mount a Screen

- [x] `p1` - **ID**: `cpt-template-site-flow-screen-frame-mount-screen`

**Actor**: `cpt-template-site-actor-host`

**Success Scenarios**:
- The host mounts the screen: the shadow root holds one style node with the kit's tokens on the shadow host, the route tree renders inside the screen frame, and a screen that declares a show action has its handler registered before `mount()` returns.
- The host mounts the screen again into the same shadow root: the existing style node is refreshed instead of a second one being added.

**Error Scenarios**:
- The package's app was built without the microfrontends plugin: rendering throws, naming the package.

**Steps**:
1. [x] - `p1` - At module load, rewrite the kit's theme stylesheet for a shadow root (`cpt-template-site-algo-screen-frame-anchor-tokens`) and list the languages the screen ships from the paths of its locale files - `inst-prepare-module`
2. [x] - `p1` - Run the theme-aware base mount with the container, the bridge and the mount context, which initializes the styles and renders the content - `inst-base-mount`
3. [x] - `p1` - **IF** the shadow root already holds the marked token style node, replace its text - `inst-reuse-style-node`
4. [x] - `p1` - **ELSE** append one style node marked `data-kit-theme` with the rewritten tokens - `inst-create-style-node`
5. [x] - `p1` - **IF** the package's app has no registry, throw, naming the package - `inst-require-registry`
6. [x] - `p1` - **RETURN** the screen frame with the shipped languages around `ExtensionRouter` over the app's registry and the package's route tree - `inst-render-router`
7. [x] - `p1` - **IF** the screen declares a show action (docs `show_guide`, templates `show_template`), register its handler on the bridge with the package's app before `mount()` returns - `inst-register-show-action`

### Follow the Host's Theme and Language

- [x] `p2` - **ID**: `cpt-template-site-flow-screen-frame-follow-host`

**Actor**: `cpt-template-site-actor-visitor`

**Success Scenarios**:
- The visitor switches the host's theme: the frame's `data-theme` changes to the kit's light or dark scope.
- The visitor switches the host's language to one the screen ships: the frame and the shadow host declare it with its direction; to any other language, they declare English and left-to-right.

**Error Scenarios**:
- The host has broadcast no string value yet: the theme reads as light and the language as English.
- A route component asks for the bridge outside the frame: it throws.

**Steps**:
1. [x] - `p2` - Read the theme shared property with `light` as fallback and the language shared property with English as fallback, follow each change the host broadcasts, and read again when the bridge changes - `inst-read-shared-properties`
2. [x] - `p2` - Resolve the content language and its direction (`cpt-template-site-algo-screen-frame-content-language`) - `inst-resolve-language`
3. [x] - `p2` - **IF** the frame sits in a shadow root whose host is an element, set that host's `lang` and `dir`; never the host document's - `inst-declare-on-host`
4. [x] - `p2` - **RETURN** the frame with the kit's token scope for the theme (`cpt-template-site-algo-screen-frame-theme-scope`), the language and the direction, providing the bridge to route components - `inst-render-frame`
5. [x] - `p2` - A route component reads the bridge from the frame; **IF** there is none, throw - `inst-bridge-context`

## 3. Processes / Business Logic (CDSL)

### Anchor the Kit's Tokens on the Shadow Host

- [x] `p1` - **ID**: `cpt-template-site-algo-screen-frame-anchor-tokens`

**Input**: A stylesheet, minified or not (the kit's `theme.css`).

**Output**: The stylesheet with every `:root` selector naming the shadow host.

**Steps**:
1. [x] - `p1` - Strip every comment, so every remaining `:root` is a selector - `inst-strip-comments`
2. [x] - `p1` - Rewrite a bare `:root` to `:host`, and a `:root` with a compound tail of classes, ids, attribute selectors or pseudo-classes to `:host(<tail>)`, leaving pseudo-elements outside - `inst-rewrite-root`
3. [x] - `p1` - **RETURN** the rewritten stylesheet - `inst-return-stylesheet`

### Map the Host Theme to the Kit's Scope

- [x] `p1` - **ID**: `cpt-template-site-algo-screen-frame-theme-scope`

**Input**: The host theme id.

**Output**: `light` or `dark`.

**Steps**:
1. [x] - `p1` - Hold the host theme ids whose palette is dark: `dark`, `dracula`, `dracula-large` - `inst-dark-themes`
2. [x] - `p1` - **RETURN** `dark` for a dark host theme and `light` for any other id, an unknown one included - `inst-return-scope`

### Resolve the Content Language

- [x] `p2` - **ID**: `cpt-template-site-algo-screen-frame-content-language`

**Input**: The paths of the screen's locale files; the host's language.

**Output**: The shipped languages; the language the text is in and its direction.

**Steps**:
1. [x] - `p2` - Take each language from the locale file paths `.../i18n/<language>.json`, once each - `inst-shipped-languages`
2. [x] - `p2` - **RETURN** the host's language when the screen ships it, else English - `inst-pick-language`
3. [x] - `p2` - **RETURN** right-to-left for Arabic, Hebrew, Persian and Urdu by the primary subtag, left-to-right otherwise - `inst-direction`

### Load a Screen's Strings

- [x] `p2` - **ID**: `cpt-template-site-algo-screen-frame-load-translations`

**Input**: The screen's language module map and the bridge.

**Output**: A lookup function and a loading flag.

**Steps**:
1. [x] - `p2` - Track whether the screen is mounted - `inst-track-mounted`
2. [x] - `p2` - Read the host's language with English as fallback and load it unless the same language and module map are already loaded - `inst-initial-load`
3. [x] - `p2` - Follow the host's language changes and load each new one - `inst-follow-language`
4. [x] - `p2` - Stop following on unmount - `inst-unsubscribe`
5. [x] - `p2` - Start a load: record the language and the module map, number the request and set loading - `inst-start-load`
6. [x] - `p2` - **IF** the language has a module, import it - `inst-import-language`
7. [x] - `p2` - **ELSE** warn and import the English module - `inst-fallback-english`
8. [x] - `p2` - **IF** neither module exists, report an error and use no strings - `inst-no-english`
9. [x] - `p2` - **CATCH** a failed import: report it and use no strings - `inst-catch-import`
10. [x] - `p2` - **IF** a newer load started or the screen unmounted, drop the result - `inst-ignore-stale`
11. [x] - `p2` - Apply the strings and clear loading - `inst-apply-strings`
12. [x] - `p2` - Look a key up in the strings; a missing key warns and comes back as the key itself - `inst-translate`
13. [x] - `p2` - **RETURN** the lookup and the loading flag - `inst-return-translations`

### Set Up the Home Package's App

- [x] `p2` - **ID**: `cpt-template-site-algo-screen-frame-home-app`

**Input**: None.

**Output**: The home package's FrontX app, built once when the entry first loads.

**Steps**:
1. [x] - `p2` - Start the app with the effects plugin - `inst-add-effects`
2. [x] - `p2` - Join the host's shared query client - `inst-join-query-cache`
3. [x] - `p2` - Add the microfrontends plugin with the GTS type system, which gives the app the registry the route tree is built from - `inst-add-microfrontends`
4. [x] - `p2` - **RETURN** the built app - `inst-build-app`

## 4. States (CDSL)

### No Feature-Owned State Machine

Not applicable. Mounting and unmounting are the host's and FrontX's lifecycle; the frame derives its theme scope, language and direction from the current shared properties on every render, and the translation hook keeps only the number of its latest load, which is a guard, not a state with transitions of its own.

## 5. Definitions of Done

### Kit Tokens Work in the Shadow Root

- [x] `p1` - **ID**: `cpt-template-site-dod-screen-frame-shadow-tokens`

The system **MUST** rewrite the kit's root token rules onto the shadow host, keep them in one style node per shadow root however often the screen mounts, leave the brand out of that node (it arrives from the host's document), and select the kit's light or dark scope from the host theme id.

**Implements**:
- `cpt-template-site-algo-screen-frame-anchor-tokens`
- `cpt-template-site-algo-screen-frame-theme-scope`
- `cpt-template-site-flow-screen-frame-mount-screen`

**Constraints**: `cpt-template-site-constraint-shadow-root`

**Touches**:
- API: none
- DB: none
- Entities: none

**Tests**: `site-docs-mfe/src/site-theme/anchorKitThemeOnShadowHost.test.ts` ("rewrites every root selector of a minified stylesheet, where no selector starts a line", "moves a compound tail inside :host() rather than leaving it in the compound", "finds every root in the pinned kit stylesheet in selector position, and as many as it pins"), `site-docs-mfe/src/site-theme/kitThemeScope.test.ts` ("maps every dark host theme onto the kit dark scope", "falls back to the light scope for an unregistered identifier") and each package's `src/lifecycle.test.tsx` ("anchors the kit's tokens on the shadow host, once however often it mounts", "carries the kit's theme alone, no brand token").

### Theme and Language from the Host

- [x] `p2` - **ID**: `cpt-template-site-dod-screen-frame-theme-language`

The system **MUST** follow the host's theme and language shared properties, render in a shipped language or in English, declare the language and its direction on the frame and the shadow host and never on the host's document, and ignore a translation load that a newer one or an unmount has overtaken.

**Implements**:
- `cpt-template-site-flow-screen-frame-follow-host`
- `cpt-template-site-algo-screen-frame-content-language`
- `cpt-template-site-algo-screen-frame-load-translations`

**Constraints**: `cpt-template-site-constraint-shadow-root`

**Touches**:
- API: the host's theme and language shared properties
- DB: none
- Entities: none

**Tests**: each package's `src/lifecycle.test.tsx` ("scopes the kit's tokens to the shell's theme, and declares the language its text is in on the shadow host", "is the shell language when the screen ships it, with its direction, and the source language otherwise") and `src/shared/useScreenTranslations.test.tsx` ("reloads translations when the bridge language changes", "keeps the strings of the latest language when an earlier load settles after it", "warns and falls back to en when the requested language module is absent").

### One Lifecycle Form, Self-Contained Packages

- [x] `p1` - **ID**: `cpt-template-site-dod-screen-frame-lifecycle`

The system **MUST** give every package the same lifecycle, exported as the Module Federation default, that renders the route tree through `ExtensionRouter` over the package's own registry and, where the screen declares a show action, registers its handler in `mount()`, reach shared code only through the `@site-shared` alias to the template's own shared folder, and build the home package's app with the microfrontends plugin; the package manifests pin every FrontX package exactly and the build externalizes the shared set, routing included.

**Implements**:
- `cpt-template-site-flow-screen-frame-mount-screen`
- `cpt-template-site-algo-screen-frame-home-app`

**Constraints**: `cpt-template-site-constraint-one-router`, `cpt-template-site-constraint-overlay`

**Touches**:
- API: the Module Federation entry (`mount`, `unmount`); the template manifest `frontx-template.json`
- DB: none
- Entities: none

**Tests**: each package's `src/lifecycle.test.tsx` ("registers its show_guide handler on the bridge when it mounts, passing the mount context on to the base mount" in docs, "registers its show_template handler ..." in templates, "registers no action handler when it mounts and renders: the home screen declares no action" and its libs counterpart, "is the theme-aware lifecycle, exported as the module default", "renders the package's route tree through the framework router over the package's own registry") and `src/manifest.test.ts` ("declares shared dependencies the template-mfe way: none in mfe.json, the shared set externalized in vite.config.ts", "serves the remote from the port the package previews on"). The overlay and the exact pins are checked by the hosting repository's template and pin checks.

### Page States from Kit Parts

- [x] `p1` - **ID**: `cpt-template-site-dod-screen-frame-page-states`

The system **MUST** show a screen's loading, error and not-found states with kit parts and no styling of the screen's own: the kit's spinner named for assistive technology while strings or data load, the kit's destructive alert with the screen's error text when data cannot be read, and the kit's empty state with the not-found title as the page's one level-one heading, its text and a link back into the screen.

**Implements**:
- `cpt-template-site-flow-screen-frame-mount-screen`

**Constraints**: `cpt-template-site-constraint-shadow-root`

**Touches**:
- API: none
- DB: none
- Entities: none

**Tests**: `site-templates-mfe/src/screens/templates/TemplatesPage.test.tsx` ("renders the screen's not-found page for an unknown template"); each package's `src/routes.test.tsx` (the not-found cases).

## 6. Acceptance Criteria

- [x] Each package's shadow root holds exactly one token style node after any number of mounts, with no `:root` selector and no brand token in it.
- [x] A dark host theme gives the kit's dark scope, any other id the light scope.
- [x] The frame and the shadow host declare the shipped language with its direction, or English when the host's language is not shipped; the host's document keeps its own attributes.
- [x] A slower translation load that settles after a newer one leaves the newer strings on screen.
- [x] The docs and templates packages register their show action handler before `mount()` returns, home and libs register none, and every package renders its route tree over its own registry.
- [x] The `src/shared/` folder and the base lifecycle form are the same in all four packages, with the `mount()` override that registers a show action in docs and templates only, and all four take the theme helpers from the one copy in `shared/site/theme/`.
- [x] No screen frame or page state imports a stylesheet of its own.

Not applicable to this feature, with reasons: security (no input beyond the host's shared properties, no visitor data), performance (the token rewrite runs once per module load), operations (no service of its own; the host serves the remotes).
