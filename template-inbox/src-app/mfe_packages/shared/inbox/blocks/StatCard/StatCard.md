# StatCard

The dashboard's stat cards: kit `Card`s around a figure, its breakdown and a chart. One component per arrangement the dashboard draws, so a card names its arrangement and passes content only.

- **Parts**:
  - `StatKpiCard`: the figure with its delta `Badge`, a muted label (kit candidate `Text`), a sparkline hidden from assistive technology, and one more figure in a ruled `CardFooter`. Props `value`, `delta`, `label`, `chart`, `footer{label, value}`.
  - `StatHeroCard`: a titled card led by a 40px figure and its delta, the breakdown as a kit candidate `DescriptionList` (horizontal, sm, figures at the row end) and a chart. Props `title`, `value`, `delta`, `stats[{label, value}]`, `chart`.
  - `StatChartCard`: a titled card that is one 16rem chart. Props `title`, `chart`.
  - `StatSummaryCard`: three figures across (kit `ItemMedia` icon, the figure, a muted label), a 3rem trend and one action spanning the footer. Props `title`, `figures[{icon, value, label}]`, `chart`, `action`.
  - `StatTrendCard`: a header control (`CardAction`), a 40px figure, a muted line and a 17rem chart. Props `title`, `action`, `value`, `description`, `chart`.
  - `StatBreakdownCard`: a 40px figure, a muted line and a 15rem chart that breaks it down. Props `title`, `value`, `description`, `chart`.
  - `StatDonutCard`: a 140px donut over a legend listing each segment's dot, label, count and share. Props `title`, `chart`, `legend[{id, label, count, percent, color?}]`.
- **Layout**: flex columns on kit space tokens; each chart box sizes the chart inside it. The summary's figures stack below the dashboard's narrow width (44rem of screen).
- **Visual declarations** (`styles-exemptions.json`): the big-figure type steps (28px KPI, 40px hero, the summary's heading-1 size, tabular figures), the chart boxes' heights and `aspect-ratio: auto` (the kit ChartContainer fixes 16 / 9 and has no size), the KPI footer's top rule, the legend's dot shape and colour, its count weight and tabular figures. They wait for a stat typography role on `CardTitle`, a `size` and `aspect` on `ChartContainer`, and a list layout with value columns on `ChartLegendContent`.
- **Used by**: `KpiCard`, `ContactsByStageCard`, `ResolvedPerDayCard`, `NewContactsCard`, `SummaryCard`, `RecordsCreatedCard`, `StageFunnelCard`, `ConversionBySourceCard`.
- **Test**: `inbox-contacts-mfe/src/shared-inbox/blocks/StatCard.test.tsx`.
