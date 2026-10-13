# Kit candidates

`@gears-frontx/kit-candidates` holds components that two proposed `@gears-frontx/ui-kit` pull requests add, with exactly the names and props those pull requests propose. Use them as if they were kit components; when the kit releases them, the import specifier changes to `@gears-frontx/ui-kit` and this package is deleted.

## What is here

| Import | From pull request | Use for |
|--------|-------------------|---------|
| `Heading` (`size`: display, heading-1, heading-2; `render` for h1 to h6) | A | Headings between kit components |
| `Text` (`variant`: body, label, meta, mono, micro; `tone`: default, muted; `render`) | A | Paragraphs, meta lines, mono paths |
| `Link` (`variant`: default, muted, inherit; `external`; `render` for the router link) | A | Links inside text and short lines |
| `VisuallyHidden` (`render`), `sr-only` in `@gears-frontx/kit-candidates/utilities.css` | A | Text for assistive technology only |
| `CodeBlock`, `CodeBlockHeader`, `CodeBlockTitle`, `CodeBlockCopyButton` | B | Commands and file excerpts with a copy action |
| `DescriptionList`, `DescriptionItem`, `DescriptionTerm`, `DescriptionDetails` | B | Name and value pairs |
| `Card`, `CardTitle`, `EmptyTitle`, `AlertTitle` with `render` | B | A card that navigates as a whole; titles as headings |

`Card`, `CardTitle`, `EmptyTitle` and `AlertTitle` are wrappers of the kit's parts under the kit's names: import these four from `@gears-frontx/kit-candidates` and every other part of their families (`CardHeader`, `CardContent`, `Empty`, `Alert` and the rest) from `@gears-frontx/ui-kit`. Each component folder has a card (`<name>.md`) and a contract overlay (`<name>.contract.yaml`) in the kit's format.

## Rules

- A kit component first. A candidate only where the kit has no part, and never a local copy of a candidate.
- Do not add a prop, a variant or a component that the two pull requests do not propose: the package must stay equal to them, or the release stops being an import change. A new need is a new kit proposal, not a candidate edit.
- Typography: the kit's type ramp plus at most two brand display sizes. A brand display size is a brand token override of the ramp, not a new `Heading` size.
- Use the part's own title inside a kit component (`CardTitle`, `EmptyTitle`, `AlertTitle`, `DialogTitle`, `ItemTitle`) and `Heading` between components.
- In-text navigation is `Link`, never `buttonVariants({ variant: 'link' })`; an icon-only `Button` takes `icon` and `aria-label`, not `VisuallyHidden`.
- A `Card` rendered as a link or a button holds no other link or button.
- Styling is the kit's tokens; the package has no colour, size or spacing of its own.

## Release

When the kit releases pull request A or B: change `@gears-frontx/kit-candidates` imports of the released components to `@gears-frontx/ui-kit`, remove the dependency from each consuming package, and delete this template (or the released half of it) with its architecture tree.
