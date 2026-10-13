import { useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react';

/*
 * A route change asks for the new screen's heading to take focus, so a
 * keyboard or screen-reader user lands at the top of what just opened rather
 * than on the menu item they pressed. The request is a counter rather than
 * a callback because the heading may not exist yet - a screen shows its
 * loading state first - and whichever heading mounts or re-renders next
 * answers it once.
 */
let requested = 0;
let answered = 0;
const listeners = new Set<() => void>();

/** Forgets every request and answer. For tests, between cases. */
export const resetScreenHeadingFocus = (): void => {
  requested = 0;
  answered = 0;
};

// @cpt-algo:cpt-template-inbox-algo-screen-frame-heading-focus:p1
// @cpt-dod:cpt-template-inbox-dod-screen-frame-heading-focus:p1
// @cpt-begin:cpt-template-inbox-algo-screen-frame-heading-focus:p1:inst-request-focus
export const requestScreenHeadingFocus = (): void => {
  requested += 1;
  for (const listener of listeners) listener();
};
// @cpt-end:cpt-template-inbox-algo-screen-frame-heading-focus:p1:inst-request-focus

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const readRequested = () => requested;

/** Whether the element lays out at least one box with a visible width. */
const rendersVisibleBox = (element: Element): boolean =>
  Array.from(element.getClientRects()).some((rect) => rect.width > 0);

export type ScreenHeadingProps = {
  children?: ReactNode;
  /** The type the heading takes: a kit title's class when it renders a kit candidate's title (`render`), the heading role's when it renders the kit candidate `Heading`. */
  className?: string;
};

/**
 * The one visible `h1` of a screen, in the place its pane header already puts
 * its title. A screen whose narrow layout hides the list pane renders a
 * second one in the pane that takes its place (the open thread, the mail
 * being read), so a visible `h1` exists in either layout. `tabIndex={-1}`
 * makes it focusable from script without adding it to the tab order.
 *
 * It draws nothing of its own: a pane header passes it as the element of the
 * kit candidate `Heading` (`render={<ScreenHeading />}`), an empty state or an
 * alert as the element of the kit candidate `EmptyTitle` or `AlertTitle`, and
 * the type comes with the class those components give it.
 */
export function ScreenHeading({ children, className }: ScreenHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const request = useSyncExternalStore(subscribe, readRequested, readRequested);

  useEffect(() => {
    // @cpt-begin:cpt-template-inbox-algo-screen-frame-heading-focus:p1:inst-answer-request
    const heading = ref.current;
    if (request === answered || heading === null) return;
    const answer = (): boolean => {
      // A heading that renders no box - inside a hidden subtree (a screen
      // keeping its list mounted behind a detail page) or a pane a narrow
      // layout sets to `display: none` - leaves the request to the visible
      // one. So does one whose box is squeezed to zero width: it is laid
      // out, but nothing of it shows, and focus on it would land on nothing
      // visible.
      if (request !== requested || request === answered || !rendersVisibleBox(heading)) return false;
      answered = request;
      heading.focus();
      return true;
    };
    // @cpt-end:cpt-template-inbox-algo-screen-frame-heading-focus:p1:inst-answer-request
    // @cpt-begin:cpt-template-inbox-algo-screen-frame-heading-focus:p1:inst-wait-for-box
    if (answer() || typeof ResizeObserver === 'undefined') return;
    // Not visible yet is not the same as never visible: a screen's first
    // layout can squeeze a pane to nothing until its stylesheet has loaded.
    // The request stays open for this heading until it gets a box, another
    // heading answers it, or a newer request replaces it.
    const observer = new ResizeObserver(() => {
      if (answer() || request !== requested || request === answered) observer.disconnect();
    });
    observer.observe(heading);
    return () => observer.disconnect();
    // @cpt-end:cpt-template-inbox-algo-screen-frame-heading-focus:p1:inst-wait-for-box
  }, [request]);

  return (
    <h1 ref={ref} className={className} tabIndex={-1}>
      {children}
    </h1>
  );
}
