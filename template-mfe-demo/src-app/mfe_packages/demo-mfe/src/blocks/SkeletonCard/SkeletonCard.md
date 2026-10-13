# SkeletonCard

A card of three placeholder lines while its text loads.

## When to use

- The Profile screen while its data loads, and inside ScreenSkeleton.

## When not to use

- A loading state with its own text: use `Spinner` with a label.

## Props

`busy?` (the card becomes a status region announced as busy; leave it off inside a busy ScreenFrame).

## Parts and layout

Kit `Card` and `Skeleton`; the lines are one `--space-4` high, the last 75% wide; every shape is hidden from assistive technology.

## Replaces

`.placeholders` / `.placeholderLine*` of the Hello World and Profile screens and the Current Theme screen's own pulse placeholders.
