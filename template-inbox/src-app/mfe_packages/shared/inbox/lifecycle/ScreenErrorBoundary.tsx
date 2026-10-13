import { Component, type ErrorInfo, type ReactNode } from 'react';
import { CircleAlertIcon } from 'lucide-react';
import { Alert, AlertAction, AlertDescription, AlertTitle, Button } from '@gears-frontx/ui-kit';
import type { Translate } from '../i18n/translate';
import { PaneState } from '../blocks/PaneState';

export type ScreenErrorBoundaryProps = {
  children: ReactNode;
  t: Translate;
  /**
   * Clears a caught failure when it changes - the screen's root route passes
   * its own router location, so leaving the broken page for another one
   * renders that page normally instead of keeping the alert.
   */
  resetKey?: string;
};

type ScreenErrorBoundaryState = { failed: boolean; resetKey: string | undefined };

/**
 * What replaces a screen that failed to render: an alert with a way out,
 * instead of the blank shadow root React would otherwise leave.
 *
 * Every inbox screen has one inside its router, around its pages
 * (`ScreenRouteBoundary`), and its frame keeps one around the router itself,
 * so a crashing screen leaves the shell and its menu working and every other
 * screen one click away. "Try again" renders the screen afresh (enough for a failure that
 * depended on a moment's state); the page itself belongs to the host, so the
 * boundary never reloads it. Query failures
 * never reach here - the screens render their own error state for those - so
 * what lands here is a bug, and the console keeps its stack.
 */
// @cpt-dod:cpt-template-inbox-dod-screen-frame-failure-isolation:p1
// @cpt-flow:cpt-template-inbox-flow-screen-frame-recover:p1
// @cpt-state:cpt-template-inbox-state-screen-frame-error-boundary:p1
export class ScreenErrorBoundary extends Component<ScreenErrorBoundaryProps, ScreenErrorBoundaryState> {
  state: ScreenErrorBoundaryState = { failed: false, resetKey: this.props.resetKey };

  // @cpt-begin:cpt-template-inbox-flow-screen-frame-recover:p1:inst-catch-failure
  // @cpt-begin:cpt-template-inbox-state-screen-frame-error-boundary:p1:inst-to-failed
  static getDerivedStateFromError(): Partial<ScreenErrorBoundaryState> {
    return { failed: true };
  }
  // @cpt-end:cpt-template-inbox-flow-screen-frame-recover:p1:inst-catch-failure
  // @cpt-end:cpt-template-inbox-state-screen-frame-error-boundary:p1:inst-to-failed

  // @cpt-begin:cpt-template-inbox-state-screen-frame-error-boundary:p1:inst-reset-on-key
  static getDerivedStateFromProps(
    props: ScreenErrorBoundaryProps,
    state: ScreenErrorBoundaryState
  ): Partial<ScreenErrorBoundaryState> | null {
    return props.resetKey === state.resetKey ? null : { failed: false, resetKey: props.resetKey };
  }
  // @cpt-end:cpt-template-inbox-state-screen-frame-error-boundary:p1:inst-reset-on-key

  // @cpt-begin:cpt-template-inbox-flow-screen-frame-recover:p1:inst-log-failure
  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[inbox] A screen failed to render.', error, info.componentStack);
  }
  // @cpt-end:cpt-template-inbox-flow-screen-frame-recover:p1:inst-log-failure

  render() {
    // @cpt-begin:cpt-template-inbox-flow-screen-frame-recover:p1:inst-show-alert
    const { children, t } = this.props;
    if (!this.state.failed) return children;

    return (
      <PaneState>
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>{t('app_error_title')}</AlertTitle>
          <AlertDescription>{t('app_error_description')}</AlertDescription>
          <AlertAction>
            {/* @cpt-begin:cpt-template-inbox-state-screen-frame-error-boundary:p1:inst-try-again */}
            <Button size="sm" variant="outline" onClick={() => this.setState({ failed: false })}>
              {t('retry')}
            </Button>
            {/* @cpt-end:cpt-template-inbox-state-screen-frame-error-boundary:p1:inst-try-again */}
          </AlertAction>
        </Alert>
      </PaneState>
    );
    // @cpt-end:cpt-template-inbox-flow-screen-frame-recover:p1:inst-show-alert
  }
}
