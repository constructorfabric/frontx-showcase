# WidgetSlot

The column an extension domain mounts its widgets into.

## When to use

- The Widgets Host page.

## When not to use

- The shell's own screen domain, which the shell renders.

## Props

`registry`, `domainId`, `onAttached?` (behaviour only).

## Parts and layout

The framework's `ExtensionDomainSlot` laid out as a flex column, gap `--space-2`, allowed to shrink.

## Replaces

`.slot` of the Widgets Host page and the margins the widgets put around themselves.
