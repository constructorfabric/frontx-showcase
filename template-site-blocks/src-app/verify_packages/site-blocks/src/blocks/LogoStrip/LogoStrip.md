# LogoStrip

The teams that use the product: a band held to the page column, the title centred over a row of company logos in their own colours, each a link to the company's site.

## When to use

- The landing page's "Teams using FrontX" strip.

## When not to use

- Logos of the product itself or of its brand: use the brand's art and assets.
- Partners with a sentence each: use `Features` or kit `Card`s.

## Props

| Prop | Type | Content |
|------|------|---------|
| `id` | `string` | The title's id |
| `title` | `string` | The section title |
| `logos` | `{ name, image, width, height, link }[]` | `name` is the logo's alternative text and so the link's name; `image` the logo file's address; `width` and `height` its size in pixels; `link` the element the link renders as |

## Kit parts

- Title: kit candidate `Heading` (`h2`) on the kit's display role. Logo link: kit candidate `Link` holding the logo image.

## Layout

- The section rhythm tokens' block padding on the page column. The title centred, 32px over a row of four equal cells in a 908px measure; two columns under 640px with 32px between rows. Each cell centres its logo at the given size; a logo wider than its cell scales down and keeps its proportions.

## States

- A logo keeps the colours of its file: no card, background, filter or recolouring, on hover too, as the designer asked. The site shows the light theme; a dark theme would need light variants of the logos from their owners.

## Design section

V2 home "Teams using FrontX": section 1440x205 at 1440 under the AI section's rule, the title centred, four logos about 227px apart (Acronis 118x24, Virtuozzo 128x23, Constructor Tech 194x13, Aracor 108x25); 390x216 at 390 in two columns.

## Accessibility

- A region named by its level-two title; the logos are a list; each logo is an image whose alternative text is the company's name, inside its link, so the link is named by the company.
