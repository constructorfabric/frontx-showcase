# DocsFrameWithRail

The frame of a guide page: `DocsFrame` with the body beside a sticky side column that holds optional content (such as a facts card) and the "On this page" rail. The rail lists the page's sections, marks the one in view, and moves the view and the keyboard focus to the section a visitor picks.

## When to use

- Guides with several sections: get started, first change.

## When not to use

- Pages without sections to jump to: use `DocsFrame`.

## Props

| Prop | Type | Content |
|------|------|---------|
| `intro`, `nav`, `wide`, `children` | as `DocsFrame` | |
| `rail` | `{ label, items: { id, title }[], footer? }` | The rail's title (also the landmark's name), the section headings in order, a line under the list |
| `aside` | `ReactNode?` | Content above the rail in the same column |

## Kit parts

- `DocsFrame`; the kit's `Card`, `CardHeader`, `CardContent`; kit candidate `CardTitle` rendered as `h2`.
- The jump buttons draw the current-section marker the kit has no part for (rows of the exemptions ledger).

## Layout

- Body and side column (`--site-rail-column`, 272 pixels) 64 pixels apart; 235 and 30 under 1050 pixels; one column under 900 pixels with the side column first; the side column sticks under the header; the rail's list takes two columns under 560 pixels.

## States

- The current entry: the last section whose heading reached the reading line (140 pixels under the viewport's top), or the first while none has.

## Design section

V2 `/get-started/` and `/docs/first-change/` aside ("On this page", 272 wide at x1100).

## Accessibility

- The rail is a navigation landmark; the current entry carries `aria-current="location"`; a jump focuses the section heading (`tabindex="-1"`), so the next Tab continues from there.
