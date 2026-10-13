# PagePicker

The page select of a narrow screen: a muted caption and the kit's `NativeSelect` across the rest of the row, in place of the navigation panel.

## When to use

As the `picker` slot of `CatalogueFrame` when `NARROW_QUERY` matches.

## Props

| Prop | Content |
|------|---------|
| `id` | The select's id, named by the caption |
| `label` | The caption |
| `value`, `onChange` | The chosen page and the change handler |
| `testId` | On the select |
| `children` | The kit's `NativeSelectOptGroup` and `NativeSelectOption` elements |

## Parts and roles

The caption is kit-candidate `Text` in the `label` role (12px, the kit's control text floor) rendered as a `label`; the select is the kit's `NativeSelect`.

## Reproduces

The V2 showcase's phone select row (16px padding, 12px apart).
