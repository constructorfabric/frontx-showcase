# Site styling

How every part of this site is styled: the shell under `site/src-app/app/` and every screen package under `site/src-app/mfe_packages/`, whichever template it comes from. Where template-shell's `mfe-package-contract` guideline describes the shell compiling Tailwind and screens relying on its utility classes, this guideline governs the site: the site's shell compiles no Tailwind, so a utility class renders nothing.

## Rules

- `@gears-frontx/ui-kit` components first. A screen or the shell's layout is assembled from kit components; where the kit has no primitive, a kit candidate of `@gears-frontx/kit-candidates` fills it, and a section-level arrangement is a block (template-site-blocks, or a template's own `blocks/` folder) whose CSS Module holds layout only, on tokens. Compositions (screens, pages, outline renderers, lifecycles) import no stylesheet and pass no `style` prop; the brand reaches every screen from the host's document (template-site-brand). Never a utility framework.
- CSS Modules only, on the kit's semantic tokens (`var(--space-4)`, `var(--muted-foreground)`, ...). No Tailwind (no utility classes, no `@apply`, no `@tailwind` or `@import "tailwindcss"`), no other utility framework, no inline style objects in components.
- No Tailwind dependency, preset or configuration file in any package; the shell has no `tailwind.config.ts` and no PostCSS Tailwind step.
- A screen's own stylesheet reaches its shadow root by the paths template-shell's `mfe-package-contract` guideline describes (host style adoption for kit CSS, `?inline` with `initializeStyles()` or manifest-attributed CSS Modules for the package's own CSS).
- The one exception: the kit demo files the catalogue generates (`catalogue-mfe/src/examples/`, `src/pages/` and `src/shared.tsx` of template-catalogue) keep the kit's own markup, inline styles and string class names. They are exempt from `policy:own-styles` by path, and change only through the generator's recorded adaptations (`catalogue-generation` guideline), never by a hand edit to meet these rules.

## Checks

- `npm run policy:own-styles` (part of the root `npm run lint`) refuses, in every template (apart from the generated kit demo files above) and in the shell files the site changed or added, a Tailwind import or directive, a Tailwind or PostCSS configuration file, `@apply`, and a class name written as a string literal instead of a CSS Module class.
