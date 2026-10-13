<!-- @cf:root-agents -->
```toml
cf-studio-path = ".cf-studio"
```

ALWAYS resolve and enforce prerequisites of skills/workflows/commands BEFORE applying user intent.
<!-- /@cf:root-agents -->

AI tooling and SDLC guidelines are provided by the Constructor Studio kit under `.cf-studio/`.

Treat `architecture/` as the authority on what this repository is and why: PRD for intent, DESIGN for structure, ADRs for decisions. Template territory is a top-level directory carrying a `frontx-template.json` manifest (`template-site/`, `template-catalogue/`, `template-inbox/`, `template-mfe-demo/`, `template-calendar-demo/`, `template-site-meta/`, `template-site-brand/`, `template-kit-candidates/`, `template-site-blocks/`); a template's artifact tree belongs under `<template>/architecture`. `@cpt-` markers in template territory bind only to that template's own artifact tree; a `cpt-frontx-*` marker anywhere binds nothing, no document here carries a `cpt-frontx-*` id, and none is added to code (`architecture/ADR/0001-template-territory-traceability.md`). Behaviour that consumers of a template rely on is also documented in its README and its AI guideline.

Screen code is committed only inside its template. `site/src-app/mfe_packages/` is a composition product of `npm run site:assemble`; never edit it there, edit the template and re-assemble.

The site's shell under `site/` is rebuilt on React and `@gears-frontx/ui-kit`; a change to a file of an applied official template is recorded in `scripts/shell-changes.mjs` (`npm run shell:changes -- --check`), and every other applied text file carries its long-dash adaptation (`npm run shell:changes -- --adapt`). Files named `*.generated.json` are written by `npm run site:data`; edit their sources, never the files. Build pages from ui-kit components first and style the rest with CSS Modules on the kit's tokens; no Tailwind.

Commit requirements (DCO sign-off with `git commit -s`, the `main` branch model) live in `CONTRIBUTING.md`; read it before your first commit.
