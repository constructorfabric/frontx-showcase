import type { ReactNode } from 'react';
import { Outlet, useRouterState } from '@gears-frontx/routing-tanstack';
import { Empty, EmptyDescription, EmptyHeader } from '@gears-frontx/ui-kit';
import { EmptyTitle } from '@gears-frontx/kit-candidates';
import { PaneState } from '../blocks/PaneState';
import { useInboxT } from '../lifecycle/screenContext';
import { ScreenErrorBoundary } from '../lifecycle/ScreenErrorBoundary';
import { useRouteFocus } from '../lifecycle/useRouteFocus';
import { ScreenHeading } from './ScreenHeading';

export type ScreenNotFoundProps = {
  /** Names the screen's not-found page for tests, e.g. `chat-route-not-found`. */
  testId: string;
};

/**
 * An address inside a screen that names no page of it: every inbox screen's
 * route tree passes this as its root's `notFoundComponent`, so the page
 * renders in place of the screen, with the screen's one heading.
 */
// @cpt-flow:cpt-template-inbox-flow-screen-frame-not-found:p1
// @cpt-dod:cpt-template-inbox-dod-screen-frame-failure-isolation:p1
export function ScreenNotFound({ testId }: ScreenNotFoundProps) {
  // @cpt-begin:cpt-template-inbox-flow-screen-frame-not-found:p1:inst-render-not-found
  const t = useInboxT();
  return (
    <PaneState data-testid={testId}>
      <Empty>
        <EmptyHeader>
          <EmptyTitle render={<ScreenHeading />}>{t('page_not_found_title')}</EmptyTitle>
          <EmptyDescription>{t('page_not_found_description')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </PaneState>
  );
  // @cpt-end:cpt-template-inbox-flow-screen-frame-not-found:p1:inst-render-not-found
}

/**
 * The error boundary around a screen's pages, inside its router: a failure
 * caught on one page clears when the screen's own router renders another
 * (its matched pages inside the screen, never the page URL other occupants
 * share). The key is the matches, not the location: the location moves
 * first, and a reset then would render the broken page once more and keep
 * the alert. No route declares a TanStack `errorComponent`, so a page's
 * error reaches it.
 */
// @cpt-flow:cpt-template-inbox-flow-screen-frame-recover:p1
export function ScreenRouteBoundary({ children }: { children: ReactNode }) {
  // @cpt-begin:cpt-template-inbox-flow-screen-frame-recover:p1:inst-key-on-matches
  const t = useInboxT();
  const page = useRouterState({ select: (state) => state.matches.map((match) => match.id).join('|') });
  return (
    <ScreenErrorBoundary t={t} resetKey={page}>
      {children}
    </ScreenErrorBoundary>
  );
  // @cpt-end:cpt-template-inbox-flow-screen-frame-recover:p1:inst-key-on-matches
}

/** The root route component of a screen with several pages: its pages inside the route-level error boundary. */
export function ScreenRoot() {
  return (
    <ScreenRouteBoundary>
      <Outlet />
    </ScreenRouteBoundary>
  );
}

/**
 * The root route component of a screen with one page: the page at `/` and
 * nothing else. One page, so the focus key never changes; the call keeps the
 * screen on the same focus rule as the others should it grow a second route.
 */
export function SinglePageRoot() {
  useRouteFocus('');
  return (
    <ScreenRouteBoundary>
      <Outlet />
    </ScreenRouteBoundary>
  );
}
