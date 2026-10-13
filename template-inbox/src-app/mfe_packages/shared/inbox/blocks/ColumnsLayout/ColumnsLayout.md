# ColumnsLayout

A contact's page body: three columns of kit `Card`s (an 18rem start column, a flexible main column, a 16rem end column) that stack into one column on a screen narrower than the contact-columns width (`SCREEN_BREAKPOINTS_REM.contactColumns`, 60rem).

- **Props**: content only: `start`, `main`, `end`.
- **Layout**: a grid with `--space-4` gaps, each column a flex column of cards with `--space-4` between them. No visual declaration; the two column widths have rows in `styles-exemptions.json` (they make up the breakpoint table's 60rem).
- **Used by**: `ContactDetail`.
- **Test**: `inbox-contacts-mfe/src/shared-inbox/blocks/ColumnsLayout.test.tsx`.
