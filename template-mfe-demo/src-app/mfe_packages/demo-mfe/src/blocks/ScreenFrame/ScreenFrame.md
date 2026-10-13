# ScreenFrame

The root of a demo screen inside its shadow root.

## When to use

- Every screen of `demo-mfe`, in each of its states (loading, error, page).

## When not to use

- A section inside a screen: use the blocks below or kit parts.

## Props

`theme?` (the shell's theme identifier; mapped to the kit's `light` or `dark` scope and set as `data-theme`), `busy?` (a status region announced as busy), `ref`, `children`; native `div` attributes such as `data-*` pass through.

## Parts and layout

A flex column, gap `--space-6`, padding `--space-8`, at least the host's height. With a theme, the kit's `[data-theme]` rule paints the surface, the text colour and the typeface; without one (the nested widgets screen, whose entry receives no theme), the frame inherits them from the shadow host.

## Replaces

Hello World, Profile, Current Theme and Widgets Host screens: the screen root (`.screen` in each former CSS Module).
