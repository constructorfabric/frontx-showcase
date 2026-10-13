# How the catalogue's example files are produced

`src/examples/`, `src/pages/` and `src/shared.tsx` of `catalogue-mfe` are generated from the ui-kit demo of the pinned `@gears-frontx/ui-kit` release. They change only through the generator: a deliberate change is kept as a recorded adaptation (below), and `npm run generate:check` fails on any other difference from a fresh generation.

## The inputs

- `kit-demo/kit-demo.lock.json`: the kit version, the gears-frontx commit that version was published from, the demo files the catalogue takes and their SHA-256.
- The content rules in `scripts/generate-catalogue.mjs` (`CONTENT_RULES`): long dashes, the design tool's vendor name and internal mail domains, applied to every file.
- `kit-demo/adaptations/<file>.patch`: one strict unified diff per file the site changes beyond the content rules, with `Kind: mechanical` or `Kind: substantive` and a `Reason:` line.

## Changing an example, a foundation page or `shared.tsx`

1. Edit the generated file in the template (never the copy under `site/`).
2. Run `npm run generate -- --record src/<file>` in `catalogue-mfe/`: it stores the edit as the file's adaptation.
3. Fill in `Kind:` and `Reason:` of a new adaptation; generation refuses one without them.
4. Run `npm run generate:check`.

A change that belongs to every consumer of the kit (a bug fix, a missing accessible name) belongs in the kit's demo upstream; once a release carries it, the adaptation's hunk stops applying and is removed with `--record`.

## Moving to a new kit version

1. Pin the new `@gears-frontx/ui-kit` version in `package.json`.
2. Run `npm run generate -- --ref <commit>` with the gears-frontx commit that version was published from; the generator refuses a commit whose `packages/ui-kit/package.json` declares another version. It moves the lock to that commit and writes every file. A file whose adaptation no longer applies is written as the new source after the content rules, its `.patch` is left as it was, and the command lists it and exits 1.
3. For each listed file, redo the edit on the new source (the old `.patch` shows what it was), then run `npm run generate -- --record src/<file>`: it records the edit against the new commit and keeps the adaptation's `Kind:` and `Reason:`. `--ref <commit> --record` is accepted only once the lock names that commit, so a record never diffs against the old one. Then run `npm run generate:check`.
4. For a new example file: its `seo.routes` entry in `mfe.json`, its family in `FAMILY_OF`, its `label.<slug>` and `description.<slug>` in `src/screens/catalogue/i18n/en.json`; the catalog and manifest tests fail until they exist.

The generator uses Node built-ins and the package's own files only, fetches the demo files over HTTPS once per commit into `node_modules/.cache/catalogue-kit-demo/` (or reads a local checkout with `--source`), and never runs during a build. A fetched file is cached only when its SHA-256 matches the lock, written through a temporary file and a rename; a cached file that does not match is fetched again; a fetch that fails or answers other content names its address.
