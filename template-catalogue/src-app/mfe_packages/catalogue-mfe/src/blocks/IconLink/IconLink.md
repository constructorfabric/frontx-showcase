# IconLink

A link of the catalogue's meta size with an icon before or after its text: the way back, the installation link, the download and type definitions links, the not-found page's link.

## When to use

Wherever a catalogue page links with an icon; plain text links inside a sentence use kit-candidate `Link` directly.

## Props

| Prop | Content |
|------|---------|
| `icon`, `trailingIcon` | The icons (lucide icons with `aria-hidden` and their `size`) |
| `testId` | On the anchor |
| `children` | The text, which alone names the link |
| every `Link` prop | `variant` (`default` or `muted`), `href`, `render` (the router's link), `download`, `rel`, `onClick` |

## Parts and roles

Kit-candidate `Link` inside `Text` in the `meta` role, so the link takes the 12px meta size; the colour, the underline on hover and the focus ring are the `Link`'s own.

## Reproduces

The V2 showcase's small links: "Installation & integration", "All components" back link, the guide's links.
