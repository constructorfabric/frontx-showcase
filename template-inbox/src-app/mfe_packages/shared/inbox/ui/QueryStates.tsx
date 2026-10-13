import { CircleAlertIcon } from 'lucide-react';
import { Alert, AlertAction, AlertDescription, Button, Spinner } from '@gears-frontx/ui-kit';
import { AlertTitle } from '@gears-frontx/kit-candidates';
import type { ApiQueryResult } from '@gears-frontx/react';
import type { Translate } from '../i18n/translate';
import { PaneState } from '../blocks/PaneState';
import { ScreenHeading } from './ScreenHeading';

/** The part of a `useApiQuery` result a screen's first paint depends on. */
type GatedQuery = Pick<ApiQueryResult<unknown, Error>, 'data' | 'isLoading' | 'isFetching' | 'error' | 'refetch'>;

export type FirstPaint = {
  /** Some query the first paint needs has failed and holds no answer. Wins over `loading`. */
  failed: boolean;
  /** Some query the first paint needs has not answered yet. */
  loading: boolean;
  /** Asks every failed query again. */
  retry: () => void;
};

/**
 * Whether a screen can paint, from every query that paint needs.
 *
 * A screen gates on all of them together rather than on the first one it
 * happens to read: painting as soon as one answers shows the others' empty
 * states for a moment, and a failure anywhere would otherwise read as "no
 * data" instead of as an error.
 *
 * A failed query asked again keeps its error until the new answer arrives
 * (`isLoading` is only the first request's), so a query that failed and is
 * fetching again counts as loading, not failed: Retry shows the loading
 * state, then the screen or the error once more.
 *
 * Only a query without an answer gates. Every mount refetches in the
 * background (a FrontX limitation: useApiQuery overrides the cache's
 * staleTime with undefined) and the shared client refetches on window
 * focus; when such a refetch fails, TanStack keeps the last answer and sets
 * the error, and the screen keeps showing that answer rather than turning
 * into the error pane.
 */
// @cpt-algo:cpt-template-inbox-algo-screen-frame-first-paint:p1
// @cpt-flow:cpt-template-inbox-flow-screen-frame-load-states:p1
// @cpt-dod:cpt-template-inbox-dod-screen-frame-failure-isolation:p1
// @cpt-begin:cpt-template-inbox-flow-screen-frame-load-states:p1:inst-decide-first-paint
export const firstPaintOf = (queries: readonly GatedQuery[]): FirstPaint => {
  // @cpt-begin:cpt-template-inbox-algo-screen-frame-first-paint:p1:inst-collect-gating
  const unanswered = queries.filter((query) => query.data === undefined);
  const retrying = (query: GatedQuery) => query.error !== null && query.isFetching;
  const failedQueries = unanswered.filter((query) => query.error !== null && !query.isFetching);
  // @cpt-end:cpt-template-inbox-algo-screen-frame-first-paint:p1:inst-collect-gating
  // @cpt-begin:cpt-template-inbox-algo-screen-frame-first-paint:p1:inst-return-first-paint
  return {
    failed: failedQueries.length > 0,
    loading: unanswered.some((query) => query.isLoading || retrying(query)),
    retry: () => {
      for (const query of failedQueries) void query.refetch();
    },
  };
  // @cpt-end:cpt-template-inbox-algo-screen-frame-first-paint:p1:inst-return-first-paint
};
// @cpt-end:cpt-template-inbox-flow-screen-frame-load-states:p1:inst-decide-first-paint

/** The placeholder a pane shows until its data has arrived: a busy status around the kit's spinner. */
export function LoadingPane() {
  // @cpt-begin:cpt-template-inbox-flow-screen-frame-load-states:p1:inst-show-loading
  return (
    <PaneState role="status" aria-busy>
      {/* The pane is the live region; the glyph itself announces nothing. */}
      <Spinner size="lg" role="presentation" aria-hidden="true" />
    </PaneState>
  );
  // @cpt-end:cpt-template-inbox-flow-screen-frame-load-states:p1:inst-show-loading
}

/**
 * What a pane shows instead of its content when a query it needs has failed.
 * Its title is the screen's heading while it stands in for the screen, so a
 * route change still has a heading to move focus to.
 */
export function LoadErrorPane({ onRetry, t }: { onRetry: () => void; t: Translate }) {
  // @cpt-begin:cpt-template-inbox-flow-screen-frame-load-states:p1:inst-show-load-error
  return (
    <PaneState>
      <Alert variant="destructive">
        <CircleAlertIcon />
        <AlertTitle render={<ScreenHeading />}>{t('load_error_title')}</AlertTitle>
        <AlertDescription>{t('load_error_description')}</AlertDescription>
        <AlertAction>
          <Button size="sm" variant="outline" onClick={onRetry}>
            {t('retry')}
          </Button>
        </AlertAction>
      </Alert>
    </PaneState>
  );
  // @cpt-end:cpt-template-inbox-flow-screen-frame-load-states:p1:inst-show-load-error
}
