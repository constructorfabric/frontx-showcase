# ReadingColumn

A column of cards held to a reading width.

## When to use

- The Profile and Current Theme screens, whose cards are records and forms.

## When not to use

- A full-width screen: put the cards straight into the ScreenFrame.

## Props

`children`.

## Parts and layout

A flex column, gap `--space-4`, at most 42rem wide (exemptions ledger: no width token).

## Replaces

`.column` (Profile, 42rem) and `.cards` (Current Theme, 56rem).
