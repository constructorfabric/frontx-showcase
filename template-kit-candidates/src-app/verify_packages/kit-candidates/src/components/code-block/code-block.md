# CodeBlock

A command or a file excerpt the application places on a screen: a frame with an optional header (`CodeBlockHeader` with `CodeBlockTitle` and `CodeBlockCopyButton`) over `pre > code`. Names follow the shadcn AI Elements code block family. No syntax highlighting; `language` is carried as `data-language` for a consumer that highlights on its own.

## When to use

- An install or start command with a copy button.
- A short file excerpt in a guide.

## When not to use

- A key or a shortcut: use `Kbd`.
- Code inside rendered prose: use the kit's `typeset.css`.
- A single path inside a line: use `Text` with `variant="mono"`.

## Props (kit level)

| Part | Prop | Type | Default |
|------|------|------|---------|
| `CodeBlock` | `code` | `string` - shown verbatim and copied | required |
| | `label` | `string` - the accessible name of the scroll region | required |
| | `language` | `string` - reflected as `data-language` | - |
| | `wrap` | `boolean` - wrap long lines instead of scrolling | `false` |
| | `size` | `'default' \| 'sm'` - body size or the mono role | `'default'` |
| `CodeBlockTitle` | `render` | `ReactElement` or callback | `div` |
| `CodeBlockCopyButton` | `copyLabel`, `copiedLabel` | `string` | `'Copy'`, `'Copied'` |
| | `timeout` | `number` - ms the button shows `copiedLabel` | `2000` |
| | `onCopy`, `onError` | callbacks | - |

`CodeBlockCopyButton` is a kit `Button` (`variant="ghost"`, `size="sm"`, an icon in the `icon` slot) and takes every other Button prop. The family ships `'use client'`.

## Accessibility

- Without `wrap` the `pre` is a focusable region named by `label`, so keyboard users can scroll it (axe `scrollable-region-focusable`); with `wrap` it is neither.
- A copy is announced once through a visually hidden status region.

## Examples

```tsx
import { CodeBlock, CodeBlockCopyButton, CodeBlockHeader, CodeBlockTitle } from '@gears-frontx/ui-kit';

<CodeBlock code={'npm install\nnpm run dev'} language="sh" label="Install and start">
  <CodeBlockHeader>
    <CodeBlockTitle>Terminal</CodeBlockTitle>
    <CodeBlockCopyButton copyLabel="Copy" copiedLabel="Copied" />
  </CodeBlockHeader>
</CodeBlock>
```

## Anti-patterns

- Do not pass the code as children: `code` is what renders and what is copied; children is the header.
- Do not render `CodeBlockCopyButton` outside a `CodeBlock`: it reads the code from it and refuses to render elsewhere.
