/**
 * The clock every seed dataset is written against.
 *
 * Instants are resolved once, at module load, as offsets back from
 * `ANCHOR_MS`. That is what keeps the lists reading "1h" and "4d" on any run
 * day instead of drifting further from the day the content was written.
 *
 * Every instant is an ISO string, the transcript's included: how an instant
 * reads on screen is the formatters' concern (`ui/format.ts`), in the
 * screens' locale, never the data's.
 */

/**
 * The anchor every offset below is measured back from: the moment the
 * package's copy of this module loads. Each screen package bundles its own
 * copy, so each screen's anchor is the moment that screen loaded.
 */
// @cpt-dod:cpt-template-inbox-dod-data-seed-clock:p2
// @cpt-algo:cpt-template-inbox-algo-data-seed-anchor:p2
// @cpt-begin:cpt-template-inbox-algo-data-seed-anchor:p2:inst-resolve-once
export const ANCHOR_MS = Date.now();
// @cpt-end:cpt-template-inbox-algo-data-seed-anchor:p2:inst-resolve-once

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

// @cpt-begin:cpt-template-inbox-algo-data-seed-anchor:p2:inst-offset-instants
export const minutesAgo = (minutes: number): string =>
  new Date(ANCHOR_MS - minutes * MINUTE_MS).toISOString();

export const hoursAgo = (hours: number): string =>
  new Date(ANCHOR_MS - hours * HOUR_MS).toISOString();

export const daysAgo = (days: number): string => hoursAgo(days * 24);
// @cpt-end:cpt-template-inbox-algo-data-seed-anchor:p2:inst-offset-instants
