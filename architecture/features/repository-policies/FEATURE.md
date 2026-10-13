# Feature: Repository policies


<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Run a repository policy](#run-a-repository-policy)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Derive the expected pins](#derive-the-expected-pins)
  - [Check one package's pins](#check-one-packages-pins)
  - [Check every template package](#check-every-template-package)
  - [Check the site-owned styles](#check-the-site-owned-styles)
  - [Check one file's styles](#check-one-files-styles)
  - [Classify a styled file](#classify-a-styled-file)
  - [Check one file against the layer rules](#check-one-file-against-the-layer-rules)
  - [Check a composition](#check-a-composition)
  - [Check a block or chrome stylesheet](#check-a-block-or-chrome-stylesheet)
  - [Check an exemptions ledger](#check-an-exemptions-ledger)
  - [Check colour literals](#check-colour-literals)
  - [Check the text rules](#check-the-text-rules)
- [4. States (CDSL)](#4-states-cdsl)
  - [No Lifecycle to Model](#no-lifecycle-to-model)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Exact pins in every template package](#exact-pins-in-every-template-package)
  - [CSS Modules on the kit's tokens, no Tailwind](#css-modules-on-the-kits-tokens-no-tailwind)
  - [No CSS in compositions, layout-only blocks](#no-css-in-compositions-layout-only-blocks)
  - [Brand and text rules over the repository](#brand-and-text-rules-over-the-repository)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

- [x] `p3` - **ID**: `cpt-site-featstatus-repository-policies`

## 1. Feature Context

- [x] `p3` - `cpt-site-feature-repository-policies`

### 1.1 Overview

Three policy commands check the whole repository and only report: `policy:pins` holds every screen and non-screen package of every template to the exact versions the site installs, `policy:own-styles` holds the code the site owns to CSS Modules on the kit's tokens with no Tailwind anywhere in the shell's build and to the three-layer rule (compositions carry no CSS, block and shell chrome stylesheets are layout on tokens apart from the rows of their exemptions ledgers, a colour literal stands only in the brand), and `policy:text` holds every text file git would record to the long-dash rule and the files the project owns to the other brand and text rules. Four repository tests hold rules that span templates: the plain-text twin path rule's two copies give one answer (`scripts/twin-paths.test.mjs`), every screen package registers its mock plugin before the shared query cache (`scripts/mock-plugin-order.test.mjs`), every copy of template-mfe's kit theme helpers (`anchorKitThemeOnShadowHost.ts`, `kitThemeScope.ts`) in any template is code-identical to the copy template-mfe ships in the CLI inventory, apart from its comments and markers (`scripts/kit-theme-helpers.test.mjs`), and the site's language list matches the locale files that exist (`scripts/site-languages.test.mjs`); being tests, they carry no markers and have no numbered instruction here. `npm run lint` also runs `brand:check`, the brand check template-site-brand delivers with its package (single source, contrast, V2 record, head colours); its rules are specified in that template's own tree.

### 1.2 Purpose

The pins, the styling rule and the brand and text rules hold only if CI checks them. A template package that pins a version the site did not test installs something nothing checked; a utility class or a Tailwind dependency brings a second styling system into the shell; a stylesheet in a page or a non-layout declaration in a block moves look and feel out of the kit, its candidates and the brand, where no one sees it wait for a kit release; a long dash, a design-tool vendor name, an internal company domain or the former product name breaks the repository's content rules. The styling and text policies take the applied files the site changed or added from the shell change ledger, so the applied files the site left as they ship stay out of their scope; only the long-dash rule reaches those too, since every applied file carries the ledger's long-dash adaptation.

**Requirements**: `cpt-site-nfr-styling`, `cpt-site-nfr-content-rules`

**Principles**: `cpt-site-principle-registry-shaped`

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-site-actor-site-developer` | Runs the policies locally or through `npm run lint`, and in CI, and fixes what they report |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md), section 2.1 (registry-shaped template content), section 2.2 (no Tailwind, brand and content rules), section 3.2 (repository guards component), section 4.2.2 (styling and pins)
- **ADR**: [ADR 0008, exact registry pins](../../ADR/0008-exact-registry-pins.md)
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md), entry 2.7
- **Dependencies**: `cpt-site-feature-template-composition`, `cpt-site-feature-shell-change-ledger`
- **Code**: `scripts/policy-pins.mjs`, `scripts/policy-own-styles.mjs`, `scripts/style-rules.mjs`, `scripts/policy-text.mjs`

## 2. Actor Flows (CDSL)

### Run a repository policy

- [x] `p3` - **ID**: `cpt-site-flow-repository-policies-run-policy`

**Actor**: `cpt-site-actor-site-developer`

**Use case**: `cpt-site-usecase-change-screen`

**Success Scenarios**:
- The developer or CI runs `npm run policy:pins`, `npm run policy:own-styles` or `npm run policy:text` (the last two also through `npm run lint`); with no finding the command prints how many files or packages it checked and exits with success.

**Error Scenarios**:
- A finding exists: the command prints each finding with the policy's name, the file and, where it applies, the line, and exits with a failure.

**Steps**:
1. [x] - `p3` - The developer runs a policy command; it runs the policy over the repository root - `inst-run-policy`
2. [x] - `p3` - **IF** the policy reports findings, print each one under the policy's name and exit with a failure - `inst-if-findings`
3. [x] - `p3` - **ELSE** print how many files or packages the policy checked - `inst-report-checked`

## 3. Processes / Business Logic (CDSL)

### Derive the expected pins

- [x] `p3` - **ID**: `cpt-site-algo-repository-policies-expected-pins`

**Input**: `site/package.json`, the shell's workspace packages under `site/packages/`, the packages this repository's templates deliver under `src-app/verify_packages/`, `site/package-lock.json`.

**Output**: The expected version and its source for every governed package, and the errors of the sources themselves.

**Steps**:
1. [x] - `p3` - Read the version of every shell workspace package - `inst-read-workspaces`
2. [x] - `p3` - Read the name and version of every `@gears-frontx/*` package a template of this repository delivers under `src-app/verify_packages/` - `inst-read-template-packages`
3. [x] - `p3` - **FOR EACH** direct `@gears-frontx/*` dependency of the site application that is neither the shell nor a workspace: **IF** a template delivers it, record an error when its spec differs from the template package's version; **ELSE** take its version as the ecosystem pin, and **IF** it is not an exact registry version, record an error - `inst-ecosystem-set`
4. [x] - `p3` - Add the shell itself and every workspace package at their own versions - `inst-shell-pins`
5. [x] - `p3` - **FOR EACH** package a template delivers: **IF** it takes the name of the shell or of a workspace, record an error; **ELSE** add it at its own version, with its `package.json` as the source - `inst-template-pins`
6. [x] - `p3` - Add the shared toolchain (React, Vite, Vitest, TypeScript, the federation and React plugins, the query library) at the shell's own versions - `inst-toolchain-pins`
7. [x] - `p3` - **IF** the site lock file does not resolve the kit at its pinned version, record an error; add the kit's own dependencies an MFE package may pin at the versions the lock records for the kit - `inst-kit-own-pins`
8. [x] - `p3` - **RETURN** the pins and the source errors - `inst-return-pins`

### Check one package's pins

- [x] `p3` - **ID**: `cpt-site-algo-repository-policies-check-package`

**Input**: A template package's `package.json`, the expected pins, the site lock file's packages and the package's composed path under `site/`.

**Output**: The package's pin violations.

**Steps**:
1. [x] - `p3` - **FOR EACH** dependency and development dependency - `inst-for-each-dependency`
   1. [x] - `p3` - **IF** the policy governs it and its spec differs from the pin, report the spec, the pin and the pin's source - `inst-if-governed-differs`
   2. [x] - `p3` - **IF** it is an ecosystem package the policy does not govern, report it - `inst-if-ungoverned-ecosystem`
   3. [x] - `p3` - **IF** it is any other package, look up the version the site lock resolves for the composed package, its own nested copy first, else the root copy; **IF** none resolves report that the site install must run; **ELSE IF** the spec differs report it - `inst-if-other-dependency`
2. [x] - `p3` - **RETURN** the violations - `inst-return-violations`

### Check every template package

- [x] `p3` - **ID**: `cpt-site-algo-repository-policies-check-templates`

**Input**: The repository root.

**Output**: Every pin violation and the number of packages checked.

**Steps**:
1. [x] - `p3` - Derive the expected pins - `inst-derive-pins`
2. [x] - `p3` - **FOR EACH** template the shared discovery finds, list the `package.json` of every screen package under `src-app/mfe_packages/` and every non-screen package under `src-app/verify_packages/`, without the shared folder and dot entries - `inst-list-packages`
3. [x] - `p3` - Read the site lock file's packages - `inst-read-lock`
4. [x] - `p3` - **FOR EACH** package file, check its pins against the lock entry of its composed path under `site/` - `inst-check-each`
5. [x] - `p3` - **RETURN** the source errors with every package's violations, and the number of packages - `inst-return-pin-result`

### Check the site-owned styles

- [x] `p3` - **ID**: `cpt-site-algo-repository-policies-check-styles`

**Input**: The repository root, the shell files the ledger lists as changed or added.

**Output**: Every styling violation, the number of files checked and the number of exempt files.

**Steps**:
1. [x] - `p3` - Read the exemptions ledgers of the block folders and the shell chrome that exist, and the layout custom properties: the names the blocks' layout tokens file declares and every name a block or chrome stylesheet reads - `inst-read-ledgers`
2. [x] - `p3` - **FOR EACH** shell file the site changed or added that exists and is a source or style file, check it as site-owned code and against the layer rules - `inst-check-owned-shell`
3. [x] - `p3` - **FOR EACH** other file of the shell's build, skipping build output and the composed copies: refuse a Tailwind or PostCSS config at any depth; check a `package.json` outside the shell's workspace libraries for Tailwind packages; check any other source or style file the site does not own for Tailwind wiring only - `inst-check-shell-build`
4. [x] - `p3` - **FOR EACH** file of every template: **IF** it is a generated demo file exempt by path, count it and skip it; **ELSE** check it as site-owned code, a source or style file against the layer rules, and a `package.json` for Tailwind packages - `inst-check-templates`
5. [x] - `p3` - **FOR EACH** ledger read, check its rows - `inst-check-ledgers`
6. [x] - `p3` - **RETURN** the violations and the counts - `inst-return-style-result`

### Check one file's styles

- [x] `p3` - **ID**: `cpt-site-algo-repository-policies-check-file-styles`

**Input**: A repository-relative path and the file's text.

**Output**: The file's styling violations.

**Steps**:
1. [x] - `p3` - **IF** the file is a Tailwind or PostCSS config, report it - `inst-if-config-file`
2. [x] - `p3` - **IF** the file is not a source or style file **RETURN** - `inst-if-not-source`
3. [x] - `p3` - **IF** it is a script, report every string literal with class text passed to a class name helper, except a comparison operand - `inst-helper-strings`
4. [x] - `p3` - **FOR EACH** line, report a Tailwind import; in a style file a Tailwind directive or `@apply`; in a component file a class name given as a string literal or as a template literal with text outside its interpolations - `inst-line-rules`
5. [x] - `p3` - **RETURN** the violations - `inst-return-file-violations`

### Classify a styled file

- [x] `p3` - **ID**: `cpt-site-algo-repository-policies-classify-file`

**Input**: A repository-relative path.

**Output**: The file's class under the layer rules and, for a block or shell chrome file, its ledger and its path in that ledger.

**Steps**:
1. [x] - `p3` - **IF** it is a test file or under a `test-support` folder **RETURN** test - `inst-if-test`
2. [x] - `p3` - **IF** it is under the kit candidates package's sources **RETURN** kit candidate; under the brand package's sources **RETURN** brand; **IF** it is the blocks' layout tokens file or their document entry **RETURN** layout tokens - `inst-if-own-rules`
3. [x] - `p3` - **IF** it is under a blocks folder (template-site-blocks, the inbox's shared blocks, template-mfe-demo's and template-catalogue's) **RETURN** block with that folder's ledger; **IF** it is a screen frame outside a blocks folder (the inbox's lifecycle frame, the calendar's screen frame) **RETURN** frame, which has no ledger - `inst-if-block`
4. [x] - `p3` - **IF** it is under the shell's `layout/` or `mfe/` folder or is `globals.css` **RETURN** shell chrome with the chrome ledger in `layout/` - `inst-if-chrome`
5. [x] - `p3` - **ELSE RETURN** composition - `inst-else-composition`

### Check one file against the layer rules

- [x] `p3` - **ID**: `cpt-site-algo-repository-policies-check-layers`

**Input**: A repository-relative path, the file's text, the ledgers and the layout custom properties.

**Output**: The file's layer violations.

**Steps**:
1. [x] - `p3` - Classify the file - `inst-classify`
2. [x] - `p3` - **IF** it is a composition: a stylesheet is a violation; a script is checked as a composition - `inst-if-composition`
3. [x] - `p3` - **IF** it is a block, frame or shell chrome stylesheet, check it against its ledger; **IF** it is the layout tokens file, report every declaration that is not a custom property - `inst-if-ruled`
4. [x] - `p3` - Check its colour literals and **RETURN** the violations - `inst-colours`

### Check a composition

- [x] `p3` - **ID**: `cpt-site-algo-repository-policies-check-composition`

**Input**: A composition's path and text.

**Output**: Its violations.

**Steps**:
1. [x] - `p3` - With comments blanked, report every module specifier that names a stylesheet (static and dynamic imports, `require`, `import.meta.glob` patterns), except the kit's `theme.css?inline` in a file that names `anchorKitThemeOnShadowHost` and the shell's document entries (`main.tsx` with the kit theme and `globals.css`, `documentEntries.ts` with the `document.css` glob) - `inst-stylesheet-imports`
2. [x] - `p3` - **IF** it is a component file, report every `style` prop and every `className` whose value is neither a kit variants call nor the component's own forwarded `className` - `inst-style-props`
3. [x] - `p3` - **RETURN** the violations - `inst-return-composition`

### Check a block or chrome stylesheet

- [x] `p3` - **ID**: `cpt-site-algo-repository-policies-check-ruled-stylesheet`

**Input**: A block, frame or shell chrome stylesheet's path and text, its ledger rows and its path in the ledger, the layout custom properties.

**Output**: The declarations that need a ledger row and have none.

**Steps**:
1. [x] - `p3` - **FOR EACH** declaration with its rule's selector (rules inside media and container queries included): **IF** its property is a layout property (box, position, flex and grid, overflow, containment, scroll margins, the list marker reset, or a layout custom property: a layout token, a name a block or chrome stylesheet reads, the kit Card's spacing hook) and its value is made of tokens, keywords, unitless numbers, `0`, percentages, `fr` and strings through the layout functions, skip it - `inst-for-each-declaration`
2. [x] - `p3` - **IF** no ledger row names the file, the selector and the property, report the declaration with its line - `inst-if-covered`
3. [x] - `p3` - **RETURN** the reports - `inst-return-ruled`

### Check an exemptions ledger

- [x] `p3` - **ID**: `cpt-site-algo-repository-policies-check-ledger`

**Input**: A ledger's rows (any of its shapes: `rows` or `exemptions`, a `file` or a catalogue `block`, one property or several), a reader for the files its rows name.

**Output**: Its stale and unreasoned rows.

**Steps**:
1. [x] - `p3` - **FOR EACH** row, read its file's declarations once - `inst-for-each-row`
2. [x] - `p3` - **IF** the file does not exist, or the selector is gone, or a property the row names is no longer declared on that selector, report the row; for a row on a block script, the CSS Module class and the inline style property must still appear in it - `inst-if-stale`
3. [x] - `p3` - **IF** the row names no kit gap or defect it waits for, report it - `inst-if-no-reason`
4. [x] - `p3` - **RETURN** the reports - `inst-return-ledger`

### Check colour literals

- [x] `p3` - **ID**: `cpt-site-algo-repository-policies-check-colours`

**Input**: A repository-relative path and the file's text.

**Output**: The hex colour literals that stand outside the brand.

**Steps**:
1. [x] - `p3` - **IF** the file is `brand.json`, a file generated from it (`tokens.css`, `theme.ts`), a brand art stylesheet (its palettes are held by the brand's own palette test) or a test file, **RETURN** none - `inst-if-colour-source`
2. [x] - `p3` - In a stylesheet, report every hex colour in a declaration value except a mask's stops; in a script, every 3, 6 or 8 digit hex colour inside a string, comments blanked - `inst-find-colours`
3. [x] - `p3` - **RETURN** the reports - `inst-return-colours`

### Check the text rules

- [x] `p3` - **ID**: `cpt-site-algo-repository-policies-check-text`

**Input**: The repository root, the applied files the ledger lists as changed or added.

**Output**: Every text finding and the number of files checked.

**Steps**:
1. [x] - `p3` - List the files git would record, tracked and new but not ignored; outside a git checkout walk the tree without the excluded directories - `inst-list-files`
2. [x] - `p3` - **IF** a file lies in installs or build output, skip it - `inst-if-out-of-dash-scope`
3. [x] - `p3` - **IF** a file is out of the owned scope (Studio's folder, the policy's own rule and test files, or a file under `site/` the project does not own) check it against the long-dash rules only - `inst-if-out-of-scope`
4. [x] - `p3` - **IF** the file is missing, not a regular file or binary, skip it - `inst-if-binary`
5. [x] - `p3` - Check every line against the file's rules (long dashes everywhere; the design-tool vendor name, the internal company domains and workspace name and the former product name in the owned scope), skipping a lock file's integrity and resolved lines - `inst-check-lines`
6. [x] - `p3` - **RETURN** the findings and the number of files checked - `inst-return-text-result`

## 4. States (CDSL)

### No Lifecycle to Model

Each policy reads the repository once and reports; no entity it checks has a lifecycle the policy drives.

## 5. Definitions of Done

### Exact pins in every template package

- [x] `p3` - **ID**: `cpt-site-dod-repository-policies-exact-pins`

The system **MUST** fail when a dependency of a template's screen or non-screen package differs from the site application's ecosystem pin, the applied shell's workspace version, the version of a package a template of this repository delivers, the shell's toolchain version, the kit's own dependency version, or, for any other dependency, the version the site lock resolves for that package; when the site application itself pins an ecosystem package with anything but an exact version, or a template-delivered package at another version than the template's; and when a template package takes the name of the shell or of a shell workspace.

**Implements**:
- `cpt-site-flow-repository-policies-run-policy`
- `cpt-site-algo-repository-policies-expected-pins`
- `cpt-site-algo-repository-policies-check-package`
- `cpt-site-algo-repository-policies-check-templates`

**Touches**:
- API: `npm run policy:pins`
- Entities: Template, Screen MFE package, Template-delivered package, Ecosystem package

### CSS Modules on the kit's tokens, no Tailwind

- [x] `p3` - **ID**: `cpt-site-dod-repository-policies-own-styles`

The system **MUST** fail on a Tailwind import, directive, `@apply`, config or package, or a string-literal class name, in template files and in the shell files the site changed or added, and on Tailwind wiring anywhere in the shell's build, while the generated catalogue demo files stay exempt by path.

**Implements**:
- `cpt-site-flow-repository-policies-run-policy`
- `cpt-site-algo-repository-policies-check-styles`
- `cpt-site-algo-repository-policies-check-file-styles`

**Constraints**: `cpt-site-constraint-no-tailwind`

**Touches**:
- API: `npm run policy:own-styles`, `npm run lint`
- Entities: Template, Shell change ledger

### No CSS in compositions, layout-only blocks

- [x] `p3` - **ID**: `cpt-site-dod-repository-policies-layers`

The system **MUST** fail on a stylesheet import, a `style` prop or a foreign `className` in a composition (the kit theme anchored by the theme helper and the shell's document entries aside), on a stylesheet outside a block, a kit candidate, the brand and the shell chrome, on a declaration in a block, screen frame or shell chrome stylesheet that is not layout on tokens and has no exemptions ledger row, on a non-custom-property declaration in the blocks' layout tokens file, on a ledger row whose file, selector or property is gone or which names no kit gap or defect, and on a hex colour literal outside `brand.json`, its generated files and the brand art palettes.

**Implements**:
- `cpt-site-flow-repository-policies-run-policy`
- `cpt-site-algo-repository-policies-check-styles`
- `cpt-site-algo-repository-policies-classify-file`
- `cpt-site-algo-repository-policies-check-layers`
- `cpt-site-algo-repository-policies-check-composition`
- `cpt-site-algo-repository-policies-check-ruled-stylesheet`
- `cpt-site-algo-repository-policies-check-ledger`
- `cpt-site-algo-repository-policies-check-colours`

**Constraints**: `cpt-site-constraint-no-tailwind`

**Touches**:
- API: `npm run policy:own-styles`, `npm run lint`
- Entities: Template, Shell change ledger

### Brand and text rules over the repository

- [x] `p3` - **ID**: `cpt-site-dod-repository-policies-text-rules`

The system **MUST** fail on a long dash in any text file git would record outside installs and build output, and on a design-tool vendor name, an internal company domain (any mail address, subdomain or address on it, the company's public homepage written exactly as `https://constructor.tech/` excepted), the company-specific workspace name or the former product name in any such file outside Studio's folder and the applied files the site left as they ship, while allowing the Constructor Fabric brand.

**Implements**:
- `cpt-site-flow-repository-policies-run-policy`
- `cpt-site-algo-repository-policies-check-text`

**Constraints**: `cpt-site-constraint-content-rules`

**Touches**:
- API: `npm run policy:text`, `npm run lint`
- Entities: Shell change ledger

## 6. Acceptance Criteria

- [x] `npm run policy:pins` passes on the repository and fails on a differing pin, a range, an ecosystem package outside the set, a `file:` spec in the site application and any other dependency that differs from the site lock's nested or root resolution, across screen and non-screen packages; it pins a `@gears-frontx/*` package a template delivers under `src-app/verify_packages/` at that package's own version, for other template packages and for the site application, and refuses a template package under the shell's or a workspace's name (`scripts/policy-pins.test.mjs`).
- [x] `npm run policy:own-styles` passes on the repository and fails on string-literal class names, utility strings passed to class name helpers, Tailwind imports, directives, `@apply`, configs and packages, in templates, in the site-owned shell files and in the shell's build, while exempting only the generated demo files (`scripts/policy-own-styles.test.mjs`).
- [x] `npm run policy:own-styles` holds the layer rule: it classifies every styled file, fails on a stylesheet import, `style` prop or foreign `className` in a composition while accepting the anchored kit theme and the shell's document entries, fails on a non-layout or literal-valued declaration no ledger row covers in a block, frame or chrome stylesheet while accepting layout tokens, block-local custom properties and the kit Card's spacing hook, fails on a stale or unreasoned ledger row in every ledger shape, and fails on a hex colour outside the brand while accepting brand.json, its generated files, art palettes, mask stops, id selectors, order numbers and comments (`scripts/style-rules.test.mjs`, `scripts/policy-own-styles.test.mjs`).
- [x] `npm run policy:text` passes on the repository, names file and line of every finding, accepts the Constructor Fabric brand and the company homepage `https://constructor.tech/` while refusing a mail address, a subdomain or another address on that domain, refuses a long dash in a Studio file and in an applied file the site left as it ships, and skips lock file hash lines, installs, build output, other rules' out-of-scope paths and binary files (`scripts/policy-text.test.mjs`).
- [x] The cross-template repository tests pass: twin paths, mock plugin order, kit theme helpers, site languages (`scripts/twin-paths.test.mjs`, `scripts/mock-plugin-order.test.mjs`, `scripts/kit-theme-helpers.test.mjs`, `scripts/site-languages.test.mjs`); the helpers test reports a copy whose code drifted from template-mfe's and fails with a hint when template-mfe is not in the inventory.
