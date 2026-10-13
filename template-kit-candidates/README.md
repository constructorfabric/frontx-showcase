# template-kit-candidates

Kit candidates as a FrontX template: one workspace package, `@gears-frontx/kit-candidates`, with the components that two proposed `@gears-frontx/ui-kit` pull requests add, in the kit's own folder layout and with the API those pull requests propose. A project uses them as kit components until the kit releases them; then the import specifier changes to `@gears-frontx/ui-kit` and the template is deleted whole.

## What it contributes

One workspace package, `src-app/verify_packages/kit-candidates/` (`@gears-frontx/kit-candidates`): TypeScript and CSS Modules source, no build step; the consuming screen package's build bundles it. It lands in the shell's workspace root for template-delivered packages, so the shell's install, type-check and `test:unit` reach it without wiring. Its AI bundle, `.frontx/ai/@gears-frontx/frontx-template-kit-candidates/`, carries one guideline: what is here, the rules for using it and the release step.

- From the first pull request: `Heading`, `Text`, `Link`, `VisuallyHidden`, and the `sr-only` class in `@gears-frontx/kit-candidates/utilities.css`.
- From the second: `CodeBlock` with `CodeBlockHeader`, `CodeBlockTitle` and `CodeBlockCopyButton`; `DescriptionList` with `DescriptionItem`, `DescriptionTerm` and `DescriptionDetails`; `render` on `Card`, `CardTitle`, `EmptyTitle` and `AlertTitle`, as wrappers of the kit's parts under the kit's names.

Each component folder holds `<name>.tsx`, `<name>.module.css`, `<name>.md`, `<name>.contract.yaml`, `<name>.contract.test.ts`, `<name>.test.tsx` and `public.ts`, as the kit's folders do. The compiled `.contract.json` is produced by the kit's contract compiler when the component is proposed upstream; here the contract test checks the overlay on its own.

## Prerequisites

A project with template-shell applied (its `src-app/verify_packages/*` workspace root). The package pins `@gears-frontx/ui-kit` `0.4.0`, `@base-ui/react` `1.6.0`, `class-variance-authority` `0.7.1` and `lucide-react` `1.33.0` (the kit's own versions), and takes `react` and `react-dom` `19.2.4` as peers, exactly. A consumer imports the kit's `theme.css` once, as template-shell does.

## Screens and routes

None. The package contributes no screen and no route; screen packages and the shell import its components.

## SEO metadata

None. The package renders no page and declares no metadata.

## Develop

Edit the files here, never the copy under `site/`. From the repository root:

```bash
npm run site:assemble                                                 # copy into site/
npm install --prefix site                                             # once, after a dependency change
npm run test:unit --workspace=@gears-frontx/kit-candidates --prefix site
npm run type-check --workspace=@gears-frontx/kit-candidates --prefix site
```

`npm run site:assemble -- --check` reports any difference between this template and the site copy. A consuming package adds `"@gears-frontx/kit-candidates": "0.1.0-alpha.0"` to its `dependencies` and imports from `@gears-frontx/kit-candidates`.

## Moving into another project

Copy `src-app/verify_packages/kit-candidates/` and `.frontx/ai/@gears-frontx/frontx-template-kit-candidates/` into a project that has template-shell applied and run `npm install`. The package references nothing outside its own directory. When the kit releases the components, change the imports to `@gears-frontx/ui-kit` and delete both directories.
