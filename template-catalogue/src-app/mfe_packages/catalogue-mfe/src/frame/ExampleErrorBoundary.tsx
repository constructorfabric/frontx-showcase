import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert, AlertDescription } from '@gears-frontx/ui-kit';

interface Props {
  /** Shown before the error message, e.g. "This example crashed:". */
  label: string;
  children: ReactNode;
}

/**
 * Contains a crash to the page that caused it. Keyed by slug at the call site, so moving to another page mounts a fresh boundary instead of replaying a stale error.
 */
// @cpt-state:cpt-template-catalogue-state-catalogue-screen-example-boundary:p1
// @cpt-dod:cpt-template-catalogue-dod-catalogue-screen-failure-containment:p1
export class ExampleErrorBoundary extends Component<Props, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  // @cpt-begin:cpt-template-catalogue-state-catalogue-screen-example-boundary:p1:inst-enter-failed
  static getDerivedStateFromError(error: unknown): { error: Error } {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('[catalogue] example page crashed:', error, info.componentStack);
  }
  // @cpt-end:cpt-template-catalogue-state-catalogue-screen-example-boundary:p1:inst-enter-failed

  render() {
    // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-browse-component:p1:inst-contain-crash
    if (this.state.error) {
      return (
        <Alert variant="destructive" data-testid="example-error">
          <AlertDescription>
            {this.props.label} {this.state.error.message}
          </AlertDescription>
        </Alert>
      );
    }
    // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-browse-component:p1:inst-contain-crash
    return this.props.children;
  }
}
