# BridgeInfoCard

What a screen reads from its bridge, as a titled card of label and value pairs.

## When to use

- The bridge information of the Hello World, Profile and Current Theme screens.

## When not to use

- Records the visitor edits: use `Field` parts.

## Props

`title`, `rows` (`{ label, value }[]`).

## Parts and layout

Kit `Card`, `CardHeader`, `CardContent`; candidate `CardTitle` rendered as `h2`; candidate `DescriptionList` (small size) with each value on the mono variant, which wraps a long identifier anywhere. No stylesheet.

## Replaces

The four copies of the bridge information card (`.definitions`, `.term`, `.value`, `.sectionTitle`).
