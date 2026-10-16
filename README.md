# FrontX site

The official FrontX site, the templates it is built from, its demos and the demos' templates. Working name `frontx-site`; the proposed repository name is `frontx-showcase`.

The site is itself a FrontX application: template-shell, template-mfe and template-design-guardrails from gears-frontx-templates are applied to `site/` by the FrontX CLI, and every page is a screen of an MFE package that lives in one of this repository's templates. The shell is rebuilt on React and `@gears-frontx/ui-kit` to the site's look (a header with the navigation and the Demos entry, a footer, no Tailwind); `npm run shell:changes` lists every shell file the site changed, the candidate for template-shell.

## Layout

| Path | What it is |
|---|---|
| `site/` | The FrontX application. Shell files are applied by the FrontX CLI; the rebuilt layout, themes and assets are the site's own (`scripts/shell-changes.mjs` lists them), every other file stays as the shell ships it, apart from the long-dash adaptation every applied text file carries; `site/.frontx/provenance.json` records where they came from. |
| `template-site/` | The site's own sections: home, templates (an index and a page per template), docs (get started, first change) and libs (the libraries, routing, MFEs, the screen domain), written as entries over the blocks of template-site-blocks. |
| `template-catalogue/` | The ui-kit catalogue screen. |
| `template-inbox/` | The inbox demo, 4 screens: "Inbox: contacts", "Inbox: dashboard", "Inbox: chat" and "Inbox: mail". |
| `template-mfe-demo/` | The MFE mechanics demo, 4 screens ("MFE mechanics: isolation", "data loading", "shared state", "nested widgets") and 2 widget packages. |
| `template-calendar-demo/` | The "Calendar: coming soon" screen, a placeholder until a calendar kit is released. |
| `template-site-meta/` | The page metadata pipeline as one tooling package (`src-app/verify_packages/site-meta/`): the generator of the head, the discovery files, the web manifest and the plain-text twins, its check, and the head-sync runtime. |
| `template-site-brand/` | The site's brand as one package (`src-app/verify_packages/site-brand/`): the brand values over the kit's tokens from one source (`brand.json`), the typeface, the brand assets, the generated theme variables and the brand check (`brand:check`), delivered to the document through the shell's document-entry convention. |
| `template-kit-candidates/` | The primitives the kit lacks, as one package (`src-app/verify_packages/kit-candidates/`) in the kit's own layout and APIs, proposed to `@gears-frontx/ui-kit` and deleted when the kit releases them. |
| `template-site-blocks/` | The site's blocks as one package (`src-app/verify_packages/site-blocks/`): section-level compositions of kit components, kit candidates, brand art and the layout tokens, with layout-only styles and content-only props, plus a showcase screen (`/?screen=blocks`, kept out of the search index) that renders each block's fixture on its own route. |
| `scripts/` | Repository guards, the composition step (`site:assemble`), the generated site data (`site:data`) and the shell change list (`shell:changes`). |
| `deploy/` | The deploy stack of the container image built by `Dockerfile`: the image's server config, its smoke check, the compose file with the edge proxy and the signed deploy webhook (section "Deploy"). |
| `assets/` | The SVG source of the share image and `rasters.json`, the record that pins `site/public/og-image.png` to it (`seo:check` reads it). |
| `architecture/` | PRD and DESIGN of this repository. |

Screen code is committed only inside its template. `site/src-app/mfe_packages/` is produced by `npm run site:assemble` and is ignored by git, as template-shell's own `.gitignore` declares; so are the site copies of `site-meta`, `site-brand`, `kit-candidates` and `site-blocks` under `site/src-app/verify_packages/`, through the root `.gitignore`.

## Requirements

Node `>=24.14.0` (`.nvmrc` pins `25.1.0`) and npm `>=10`; lockfiles are written with npm 10.9.4 (the `packageManager` pin; install it with `npm install -g npm@10.9.4`). The npm registry is the public one (`.npmrc`), and every FrontX package is installed from it at an exact released version; a user-level npm config that routes `@gears-frontx` elsewhere must not apply, for example:

```bash
export NPM_CONFIG_USERCONFIG="$HOME/.config/frontx-site/npmrc"   # contains: registry=https://registry.npmjs.org/
```

## Quick start

```bash
npm ci           # repository tooling, including the FrontX CLI
npm run setup    # compose the templates into site/, then install the site
npm run dev      # host at http://localhost:5173/, which opens the home screen
```

Screens are addressed in the query string: `/?screen=<token>[;route=<path inside the screen>]`, for example `/?screen=docs;route=get-started`.

## Commands

| Command | Does |
|---|---|
| `npm run site:assemble` | Copy the templates' subtrees into `site/`; `-- --check` reports drift, `-- --watch` re-copies on edits |
| `npm run site:data` | Generate the templates screen's pages, the docs screen's version data and the libs screen's library data from their sources; `-- --check` reports drift |
| `npm run shell:changes` | List the site's changes to the files of the applied official templates; `-- --check` compares them and the long-dash adaptation with the pristine templates; `-- --adapt` writes the adaptation after a template upgrade |
| `npm run dev` | Build the MFE packages, serve them and start the host, which also serves the pages' plain-text twins |
| `npm run dev:smoke` | Run `npm run dev` until the host and every remote entry answer, then stop it |
| `npm run build` | Assemble, build the site, lay the MFE remotes out in `site/dist/mfe/` (`npm run site:dist`; the result works from any static server, at the root or under a sub-path), generate the SEO outputs, the web manifest and the plain-text twins; needs `origin` in `site.config.json`, or `SITE_ORIGIN` for a local preview (`SITE_ORIGIN=http://localhost:4173 npm run build`) |
| `npm run seo:check` | Page metadata rules, and that the generated outputs in `site/dist/` match the sources |
| `npm run type-check`, `npm run lint`, `npm run test:unit`, `npm run arch:deps` | Checks over the tooling and the site |
| `npm run templates:validate` | `frontx validate` and the uniform-shape rules for every template |
| `npm run catalogue:generate`, `npm run catalogue:check` | Generate the UI Kit catalogue's demo files from the kit demo at the locked gears-frontx commit; `catalogue:check` regenerates them in memory and reports a hand edit or a stale pin |
| `npm run policy:pins`, `npm run policy:own-styles`, `npm run policy:text` | Exact pins in every MFE package, at the released versions the site's application installs; CSS Modules only in template code, no CSS in compositions, block and shell chrome stylesheets layout on tokens apart from the rows of their exemptions ledgers, and no colour literal outside the brand; no long dash, design-tool vendor name, internal company domain or former product name in repository files (`policy:own-styles` and `policy:text` also run in `lint`) |
| `npm run verify:ui` | After `npm run build`: the design-defect checker of template-design-guardrails over every manifest page, block showcase route and the not-found screen at 1440 and 390 pixels against `npm run dev`; only a finding `scripts/design-verify-baseline.json` does not carry fails (`-- --no-baseline` for a full report) |
| `npm run verify:ui:baseline` | `-- check`: every finding the baseline carries names its reason; `-- build <findings.json>`: rebuild the baseline from a run without it, refusing a finding no rule knows |
| `npm run preview` | Serve `site/dist` at `http://localhost:4173`, the host and every MFE remote |

See `CONTRIBUTING.md` for the development loop and `architecture/DESIGN.md` for the design.

## Deploy

The site ships as one container image: `Dockerfile` builds `site/dist` on Node 24 with npm 10.9.4, and the image serves it with Caddy (`deploy/site/Caddyfile`) as a non-root user on port 8080, with a health check, compression, the security headers, the cache policy (hashed `assets/` files immutable, every other file revalidated) and the plain-text twins as `text/plain; charset=utf-8`. `SITE_ORIGIN` is a required build argument, baked into the sitemap, `robots.txt`, the canonical addresses and `llms.txt`, so an image serves one origin; the same image serves the site at the root or under a sub-path, since the proxy in front strips the prefix.

```bash
docker build --build-arg SITE_ORIGIN=http://localhost:8080 -t frontx-site:local .
docker run --rm -p 8080:8080 --read-only --tmpfs /data:uid=10001,gid=10001 --tmpfs /config:uid=10001,gid=10001 --cap-drop ALL --security-opt no-new-privileges frontx-site:local
```

`deploy/` holds the stack for a host: `docker-compose.yml` runs the image behind an edge Caddy (`deploy/Caddyfile`) and, later, the deploy webhook (`deploy/webhook/`), which takes GitHub's signed `workflow_run` delivery of a successful push run of the image workflow on `main` and pulls and restarts the site. Without a domain the stack runs locally: `docker compose -f deploy/docker-compose.yml up -d --build` serves `http://localhost:8080/` and the sub-path `http://localhost:8080/frontx/` (with `SITE_ORIGIN=http://localhost:8080/frontx` the canonical addresses match the sub-path). `.github/workflows/docker.yml` builds the image on every pull request to `main` and every push to `main` and checks it with `deploy/smoke.sh <image> <origin>`, which also runs locally.

What is commented out or gated, and the information that enables each part:

| Part | Enabled by |
|---|---|
| Publishing the image to GHCR (`latest` and the commit sha), the `publish` job of `.github/workflows/docker.yml` | The production origin as the repository variable `SITE_ORIGIN` (`https://<domain>`, with the sub-path if any); the job runs once it is set |
| The published image in `deploy/docker-compose.yml` (`site` service) | The image published as above, `ghcr.io/<owner>/<repository>` of the repository the workflow runs in |
| Public ports 80 and 443 (`edge` service) | The host: a server that runs the stack, with a DNS record of the domain pointing at it |
| The domain block with automatic TLS in `deploy/Caddyfile`, and the certificate notice address | The domain name and the operator's address; a sub-path variant (with `robots.txt` at the origin's root) is there too |
| The `webhook` service and its `/deploy-hook` route | The host, the domain, the published image, `DEPLOY_WEBHOOK_SECRET` in `deploy/.env` (`deploy/.env.example`) and the GitHub webhook registration: payload URL `https://<domain>/deploy-hook`, content type `application/json`, the same secret, the "Workflow runs" event only |
| The webhook's registry credentials | A private GHCR package: a Docker config with a token that can read packages, mounted read-only into the webhook, since its own Docker CLI pulls and a host login does not reach it |

## License

Apache-2.0, see `LICENSE` and `NOTICE`.
