/**
 * The text alternative of a chart: its title and every point it plots, as one
 * sentence a screen reader reads in place of the drawing.
 *
 * A chart is pixels to assistive technology - Recharts draws an SVG with no
 * words in it - so each card's chart wrapper carries `role="img"` and this
 * summary as its label. The points are the same numbers the chart draws, so
 * the summary can never disagree with it; the wording comes from the
 * catalogue and the list is joined by `Intl.ListFormat` in the app's locale.
 */

import { locale, type Translate } from '@inbox-shared/i18n/translate';

/** One plotted point; a point with no label of its own (a bare trend) reads as its value. */
export type ChartPoint = { label: string; value: string };

const listFormat = new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' });

// @cpt-algo:cpt-template-inbox-algo-dashboard-chart-summary:p2
// @cpt-begin:cpt-template-inbox-algo-dashboard-chart-summary:p2:inst-summarize-points
export const chartSummary = (title: string, points: readonly ChartPoint[], t: Translate): string =>
  t('chart_summary', {
    title,
    points: listFormat.format(
      points.map((point) =>
        point.label === '' ? point.value : t('chart_point', { label: point.label, value: point.value })
      )
    ),
  });
// @cpt-end:cpt-template-inbox-algo-dashboard-chart-summary:p2:inst-summarize-points
