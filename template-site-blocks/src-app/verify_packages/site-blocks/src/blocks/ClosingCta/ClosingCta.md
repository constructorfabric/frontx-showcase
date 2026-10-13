# ClosingCta

The landing page's closing band: the night colour across the full width, the title at the start and the actions in the end column on one row, then the visual across the column.

## When to use

- Once, at the bottom of the landing page.

## When not to use

- The next step at the end of a guide or a template page: use `CtaBox` or `CtaRule`.

## Props

| Prop | Type | Content |
|------|------|---------|
| `id` | `string` | The title's id |
| `title` | `string` | The closing title; a newline breaks the line |
| `actions` | `{ label, link }[]` | The first is the band's button, the rest are text links |
| `visual` | `ReactNode?` | The visual under the title row, drawn by brand art (`ClosingVisual`); it fills its box |

## Kit parts

- Title: kit candidate `Heading` (`h2`) on the display role at the brand's closing size.
- Button: the link element with the kit's `buttonVariants({ size: 'lg' })` (the brand blue, the kit's default variant; not the kit `Button` rendered as the link, which announces it as a button). Text links: kit candidate `Link` (`inherit`) with an arrow icon.

## Layout

- Page column, padding 52/24 (32/24 under 640px). The title beside a 340px actions column (380px over 1500px, 300px under 1200px), 60px apart, 24px above the visual; one column under 900px.
- Visual box: the column's width, `clamp(200px, 27vw, 340px)` high (42vw under 640px).

## Design section

V2 home closing banner: 1440x571 at 1440 (390x400 at 390), night `#10234b`, padding 52/24, H2 904 wide 57.6px (36px at 390), actions at x1032, visual 1304x340 (350x164 at 390).

## Accessibility

- A region named by its level-two title; the button is a link with the button's look.
