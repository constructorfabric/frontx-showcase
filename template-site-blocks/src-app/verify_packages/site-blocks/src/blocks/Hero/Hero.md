# Hero

The landing page's opening band: the brand blue across the full width, the page title at the start, the lead and the actions in the end column, and the art row under both, running off the band's bottom edge.

## When to use

- Once, at the top of the landing page.

## When not to use

- On an inner page: use `PageIntro` inside `DocsFrame`.
- For the closing call to action: use `ClosingCta`.

## Props

| Prop | Type | Content |
|------|------|---------|
| `title` | `string` | The page title, the page's only level-one heading; a newline breaks the line |
| `lead` | `string` | The one-paragraph definition beside the title |
| `actions` | `{ label, link }[]` | The first is the band's button, the rest are text links; `link` is the element the action renders as (an anchor or the router's link) with its destination and no children |
| `art` | `ReactNode?` | The art row, drawn by brand art (`HeroArt`); it fills its box |

## Kit parts

- Title: kit candidate `Heading` (`h1`) on the display role, its role tokens set to the brand's hero size (`--site-text-hero-*`).
- Lead: kit candidate `Text`.
- Button: the link element with the kit's `buttonVariants({ size: 'lg' })` (not the kit `Button` rendered as the link, which announces it as a button), inverted on the band through the kit's `--button-*` recolour hooks.
- Text links: kit candidate `Link` (`inherit`), with an arrow icon.

## Layout

- Page column; the title beside a 340px end column (380px over 1500px, 300px under 1200px), 60px apart, 32px above the art row; one column under 900px.
- Art box: the column's width; the art (`HeroArt`) sets its own window height (`clamp(280px, 28vw, 440px)`, 34vw under 900px, 43vw under 640px). The band has no bottom padding and clips its overflow, so the art runs off its bottom edge.

## Design section

V2 home hero: band 1440x652 at 1440 (390x508 at 390), H1 65.52/72.07 w600 -3.276px white (36.66px at 390), aside 340 wide at x1032, two actions 155x49, art row 1304x403 (350x168 at 390).

## Accessibility

- The band is a `section` labelled by the page's level-one heading.
- The button is a link (an anchor with the button's look), so it keeps the link role and its destination.
