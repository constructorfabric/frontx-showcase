# PackageList

The packages a reader installs one by one: cards two to a row, each the package name and title (beside a figure when the package has one), a sentence, the install command with a copy button, and the package's links.

## When to use

- The libraries index.

## Props

| Prop | Type |
|------|------|
| `packages` | `{ figure?, name, title, text, install?, actions? }[]` - `install` is `{ command, title, label }` |
| `copyLabel`, `copiedLabel` | `string` - the copy button's label and its confirmation |

## Parts

| Role | Part |
|------|------|
| Card | kit `Card` (32px spacing; 24px under 760px) |
| Package name | kit-candidates `Text` (`label`, muted) rendered as `code` |
| Title | kit-candidates `CardTitle` rendered as `h2` |
| Sentence | kit `CardDescription` |
| Install command | kit-candidates `CodeBlock` with `CodeBlockHeader`, `CodeBlockTitle`, `CodeBlockCopyButton` |
| Actions | kit `CardFooter`, wrapping row |
| Figure | optional brand art in a decorative slot (112x90; 96x77 under 760px); no slot or reserved space when absent |

## Layout

Two columns with a 24px gap, cards aligned to the top; one column with a 32px gap under 760px.

## Reproduces

The designer site's library cards (`.guide-grid` of `.library-card`): 640x421 with an install command, 640x260 without, at 1440; 350 wide at 390.

## States

With no figure, the package name and title align with the card body. The showcase covers this text-only state; the unit fixture also covers a card with a figure.

The copy button's idle and copied labels come from `CodeBlockCopyButton`.
