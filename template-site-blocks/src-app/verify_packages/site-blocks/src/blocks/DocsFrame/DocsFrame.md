# DocsFrame

The frame of an inner page: the page column with the page intro, an optional tab bar across the pages of a section, optional content across the whole column, the body, and a footer line, one under the other.

## When to use

- Docs, templates and libraries pages without an "On this page" rail.

## When not to use

- A guide with a rail: use `DocsFrameWithRail`.

## Props

| Prop | Type | Content |
|------|------|---------|
| `intro` | `PageIntroProps` | The page intro's content |
| `nav` | `{ label, items }?` | The tab bar; each item has `id`, `label`, `current` and `render` (the anchor element, such as the router's link) |
| `wide` | `ReactNode?` | Content across the whole column above the body |
| `children` | `ReactNode` | The page body |
| `footer` | `ReactNode?` | A small line under the body, such as the plain-text twin link |

`DocsTabs` (the tab bar alone) is exported from the same entry.

## Kit parts

- `PageIntro`; the kit's `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem` and `NavigationMenuLink` (`active` on the current page, which sets `aria-current="page"`).

## Layout

- The page column (`--site-column`), 32 pixels between the tab bar, the wide content and the body, the page's bottom padding (`--site-page-pad-bottom`); the tab bar scrolls sideways when it does not fit.

## Design section

V2 inner pages (`/docs/`, `/templates/`, `/libraries/`): intro, `nav.docs-nav` and body. The tab bar is the kit's navigation menu: its pill links differ from V2's underlined tabs (accepted kit difference).

## Accessibility

- The page is an `article`; the tab bar is a navigation landmark named by its label.
