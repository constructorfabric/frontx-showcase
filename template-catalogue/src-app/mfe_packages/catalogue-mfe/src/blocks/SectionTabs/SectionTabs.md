# SectionTabs

The catalogue's section bar: one link per section (Components, Foundations), centred on a bottom rule, the current section underlined.

## When to use

Once, as the `sections` slot of `CatalogueFrame`.

## Props

| Prop | Content |
|------|---------|
| `label` | The accessible name of the bar's `nav` |
| `tabs[]` | `id`, `label`, `href` or `render` (the router's link), `current` (`page` when the tab's own page is open, `true` when a page of its section is), `testId` |

## Parts and roles

A `nav` of links: the sections are pages with their own addresses, so the kit's `Tabs` (a tab list over panels) does not fit, and the kit's `NavigationMenu` draws pill links, not an underlined bar. The link look is a kit gap recorded in `styles-exemptions.json`.

## Reproduces

The V2 showcase tab bar: 47px high, links 13px, 32px apart (26px on a phone), the current one underlined 2px in the primary colour.
