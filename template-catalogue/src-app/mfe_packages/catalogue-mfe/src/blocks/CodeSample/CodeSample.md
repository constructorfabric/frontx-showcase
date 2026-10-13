# CodeSample

A titled block of source or commands with a copy button, at most 32rem high: an example's source in the Code tab, the install line under "Use in your app".

## When to use

For a file or a command the visitor reads and copies whole.

## Props

| Prop | Content |
|------|---------|
| `title` | The caption, also the name of the scroll region |
| `code` | The text shown and copied |
| `copyLabel`, `copiedLabel` | The copy button's labels |

## Parts and roles

The kit-candidate `CodeBlock` family (`CodeBlockHeader`, `CodeBlockTitle`, `CodeBlockCopyButton`): long lines scroll in the focusable `pre` region, the copy is announced through the block's status region. The height limit waits for a CodeBlock height option (row of `styles-exemptions.json`).

## Reproduces

The V2 showcase's command block and code view.
