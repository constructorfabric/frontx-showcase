# PageHeader

The head of a demo screen.

## When to use

- The title of every screen, with its description and, for the nested widgets screen, its ping buttons.

## When not to use

- A card title: use `CardTitle` with `render`.

## Props

`title` (the one `h1`), `description?`, `actions?` (rendered in an ActionRow).

## Parts and layout

A flex column, gap `--space-2`. Title: kit candidate `Heading` on the heading-1 role rendered as `h1`. Description: kit candidate `Text`, muted.

## Replaces

The `.intro` / `.title` / `.description` rules of every screen and the Widgets Host header.
