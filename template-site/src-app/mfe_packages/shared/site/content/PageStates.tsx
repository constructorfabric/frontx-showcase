import { createElement, type ReactNode } from 'react';
import { Alert, AlertDescription, Empty, EmptyActions, EmptyDescription, EmptyHeader, Spinner } from '@gears-frontx/ui-kit';
import { EmptyTitle } from '@gears-frontx/kit-candidates';

// @cpt-dod:cpt-template-site-dod-screen-frame-page-states:p1
/** A page while its strings or data load: the kit's spinner, named for assistive technology. */
export function PageLoading({ label }: { label?: string }) {
  return <Spinner label={label} />;
}

/** A page whose data failed to load: the kit's destructive alert. */
export function PageError({ message }: { message: string }) {
  return (
    <Alert variant="destructive" role="alert">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export interface PageNotFoundProps {
  title: string;
  text: string;
  /** The link back into the screen. */
  link: ReactNode;
}

/** The page for an address inside a screen that names no page: the kit's empty state, its title the page's only level-one heading. */
export function PageNotFound({ title, text, link }: PageNotFoundProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle render={createElement('h1')}>{title}</EmptyTitle>
        <EmptyDescription>{text}</EmptyDescription>
      </EmptyHeader>
      <EmptyActions>{link}</EmptyActions>
    </Empty>
  );
}
