# CardGrid

The dashboard's board and the arrangements its card rows take. One component per arrangement, so a row says which one it is by name rather than by a ratio prop.

- **Parts**: `CardBoard` (the page pane's scrolling body: a column of rows, `--space-6` padding and gap, every row at its content height), `CardRowQuad` (four equal cards), `CardRowTrio` (a slightly wider card and two more, stretched to one height), `CardRowWideNarrow` (1.6 to 1, each at its own height), `CardRowNarrowWide` (1 to 2, each at its own height), `CardStrip` (four equal items inside one card, `--space-4` apart).
- **Props**: content only: `children`.
- **Layout**: grids on kit space tokens; below the dashboard's wide width (76rem of screen) the quad and the strip take two per line and every other row one column; below its narrow width (44rem) everything is one column. Container queries on the frame's `inbox-screen`, never the viewport.
- **Visual declarations**: none.
- **Used by**: `DashboardScreen`, `KpiRow`, `WorkloadStrip`.
- **Test**: `inbox-contacts-mfe/src/shared-inbox/blocks/CardGrid.test.tsx`.
