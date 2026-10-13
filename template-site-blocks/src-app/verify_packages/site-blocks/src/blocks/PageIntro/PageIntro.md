# PageIntro

The opening of an inner page: an optional back link, the page title, the lead held to a readable measure, and short facts with icons under it. It carries the page's top padding and the space to what follows.

## When to use

- At the top of every inner page; `DocsFrame` and `DocsFrameWithRail` render it from their `intro` prop.

## When not to use

- On the landing page: the hero is its own block.

## Props

| Prop | Type | Content |
|------|------|---------|
| `title` | `string` | The page's only level-one heading |
| `lead` | `string` | The lead under the title |
| `back` | `ReactNode?` | A link back to the parent page, above the title |
| `meta` | `{ icon, text }[]?` | Short facts under the lead; the icon is hidden from assistive technology by the caller |

## Kit parts

- Title: kit candidate `Heading` (`h1`) on the display role, its role tokens set to the brand's page size (`--site-text-page-*`).
- Lead and facts: kit candidate `Text` (muted, or the page ink when facts follow; facts on the meta role).

## Layout

- Padding `--site-intro-pad-top` and `--site-intro-pad-bottom` (56 and 38 at 1440, 32 and 26 under 640 pixels); 18 pixels above and below the title; the lead at most 660 pixels wide; facts 24 pixels under the lead in a wrapping row.

## Design section

V2 `header.page-intro` on the inner pages (templates, docs, libraries).

## Accessibility

- Exactly one `h1` per page; the facts are a list.
