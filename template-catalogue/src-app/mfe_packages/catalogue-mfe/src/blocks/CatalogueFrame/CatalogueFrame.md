# CatalogueFrame

The catalogue screen's frame: the section bar across the top, then the navigation panel and the current page in two columns (panel 224px, the reference showcase's); under 48rem one column with the page select above the page.

## When to use

Once, around the catalogue's route outlet.

## Props

| Prop | Content |
|------|---------|
| `sections` | The section bar (`SectionTabs`) |
| `picker` | The page select a narrow screen shows (`PagePicker`) |
| `panel` | The navigation panel a wide screen shows (`NavPanel`) |
| `overlay` | What mounts after the layout, such as the screen's kit `Toaster` |
| `children` | The current page |

## Parts and roles

The page area is a plain element named by `data-testid="catalogue-page"`, not a `main`: the shell's layout holds the document's main landmark. `NARROW_QUERY` is the breakpoint of the stylesheet, for the composition that chooses between panel and select.

## Reproduces

The V2 showcase frame (`/showcase/`): tab bar, 224px sidebar, page column with 25/44/44 padding (20/16/32 on a phone).
