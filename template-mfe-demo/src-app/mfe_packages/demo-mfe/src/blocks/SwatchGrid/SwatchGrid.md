# SwatchGrid

The palette as swatches painted with their token pairs.

## When to use

- The Current Theme screen.

## When not to use

- Showing a palette's values as text: use a DescriptionList.

## Props

`swatches` (`{ token, name }[]`, token one of the seven pairs of `SWATCH_TOKENS`).

## Parts and layout

A two-column list; each swatch paints its pair and captions it. The paint and type of a swatch are rows of the exemptions ledger (the kit has no swatch component).

## Replaces

The Current Theme screen's `.swatches`, `.swatch` and its seven colour classes.
