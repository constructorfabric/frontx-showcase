import type { AnchorHTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import type { ChildMfeBridge } from '@gears-frontx/react';
import { Link } from '@gears-frontx/routing-tanstack';
import type { Href } from '../content/outline';
import { jumpToHeading } from './jump';
import { openScreen } from './openScreen';

// @cpt-flow:cpt-template-site-flow-site-links-jump-to-heading:p2
/** Whether a click is a plain primary click the screen may handle itself; any other click keeps the browser's own link behaviour. */
export function isPlainClick(event: { button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean; defaultPrevented: boolean }): boolean {
  // @cpt-begin:cpt-template-site-flow-site-links-jump-to-heading:p1:inst-if-modified-click
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.defaultPrevented;
  // @cpt-end:cpt-template-site-flow-site-links-jump-to-heading:p1:inst-if-modified-click
}

export interface SiteLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: Href;
  bridge: ChildMfeBridge;
  /** The link's content; a block that takes the link as its `render` element puts its own content in. */
  children?: ReactNode;
  'data-testid'?: string;
}

// @cpt-algo:cpt-template-site-algo-site-links-select-link-form:p1
// @cpt-dod:cpt-template-site-dod-site-links-screen-links:p1
/**
 * A link in a site screen:
 * - a heading of the current page jumps to it and moves focus there;
 * - a path inside the current screen is a routing-tanstack `Link`;
 * - another screen is a link element with no address that opens the screen through the screen domain's `mount_ext`, followed by the typed action that shows its page (`openScreen.ts`); it is focusable and opens on Enter as on a click;
 * - an external address opens as such.
 */
export function SiteLink({ to, bridge, children, onClick, onKeyDown, ...rest }: SiteLinkProps) {
  // @cpt-begin:cpt-template-site-algo-site-links-select-link-form:p1:inst-external-link
  if ('url' in to) {
    return (
      <a rel="noopener" {...rest} href={to.url} onClick={onClick} onKeyDown={onKeyDown}>
        {children}
      </a>
    );
  }
  // @cpt-end:cpt-template-site-algo-site-links-select-link-form:p1:inst-external-link
  // @cpt-begin:cpt-template-site-algo-site-links-select-link-form:p1:inst-anchor-link
  if ('anchor' in to) {
    const id = to.anchor;
    // @cpt-begin:cpt-template-site-flow-site-links-jump-to-heading:p1:inst-render-anchor-link
    return (
      <a
        {...rest}
        href={`#${id}`}
        onKeyDown={onKeyDown}
        onClick={(event) => {
          // A block or kit part that renders the link as its own element (`render`) passes its handlers through; the caller's click handler runs first.
          onClick?.(event);
          // @cpt-begin:cpt-template-site-flow-site-links-jump-to-heading:p1:inst-if-modified-click
          // @cpt-begin:cpt-template-site-flow-site-links-jump-to-heading:p1:inst-return-modified
          if (!isPlainClick(event)) return;
          // @cpt-end:cpt-template-site-flow-site-links-jump-to-heading:p1:inst-return-modified
          // @cpt-end:cpt-template-site-flow-site-links-jump-to-heading:p1:inst-if-modified-click
          // @cpt-begin:cpt-template-site-flow-site-links-jump-to-heading:p1:inst-jump
          event.preventDefault();
          jumpToHeading(event.currentTarget, id);
          // @cpt-end:cpt-template-site-flow-site-links-jump-to-heading:p1:inst-jump
        }}
      >
        {children}
      </a>
    );
    // @cpt-end:cpt-template-site-flow-site-links-jump-to-heading:p1:inst-render-anchor-link
  }
  // @cpt-end:cpt-template-site-algo-site-links-select-link-form:p1:inst-anchor-link
  // @cpt-begin:cpt-template-site-algo-site-links-select-link-form:p1:inst-route-link
  if (!('extension' in to)) {
    return (
      <Link {...rest} to={to.route} onClick={onClick} onKeyDown={onKeyDown}>
        {children}
      </Link>
    );
  }
  // @cpt-end:cpt-template-site-algo-site-links-select-link-form:p1:inst-route-link
  // @cpt-begin:cpt-template-site-algo-site-links-select-link-form:p1:inst-screen-link
  return (
    <ScreenLink {...rest} to={to} bridge={bridge} onClick={onClick} onKeyDown={onKeyDown}>
      {children}
    </ScreenLink>
  );
  // @cpt-end:cpt-template-site-algo-site-links-select-link-form:p1:inst-screen-link
}

interface ScreenLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: Extract<Href, { extension: string }>;
  bridge: ChildMfeBridge;
  children?: ReactNode;
}

// @cpt-flow:cpt-template-site-flow-site-links-open-other-screen:p1
/** A link to another screen: no address, the link role, in the tab order, and opened by a primary click or Enter through the screen domain. */
function ScreenLink({ to, bridge, children, onClick, onKeyDown, ...rest }: ScreenLinkProps) {
  const open = () => {
    // @cpt-begin:cpt-template-site-flow-site-links-open-other-screen:p1:inst-open-in-place
    openScreen(bridge, to);
    // @cpt-end:cpt-template-site-flow-site-links-open-other-screen:p1:inst-open-in-place
  };
  // @cpt-begin:cpt-template-site-flow-site-links-open-other-screen:p1:inst-render-screen-link
  return (
    <a
      role="link"
      {...rest}
      // A block or kit part that renders the link as its own element passes its props through, an unset tab index among them; the link stays in the tab order unless the part sets one.
      tabIndex={rest.tabIndex ?? 0}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        // @cpt-begin:cpt-template-site-flow-site-links-open-other-screen:p1:inst-if-activated
        if (event.defaultPrevented || event.button !== 0) return;
        // @cpt-end:cpt-template-site-flow-site-links-open-other-screen:p1:inst-if-activated
        event.preventDefault();
        open();
      }}
      onKeyDown={(event: KeyboardEvent<HTMLAnchorElement>) => {
        onKeyDown?.(event);
        // @cpt-begin:cpt-template-site-flow-site-links-open-other-screen:p1:inst-if-activated
        // A held key repeats and an input method confirms its composition with Enter (Safari reports that Enter as key code 229 rather than through isComposing); neither is a request to open the screen.
        if (event.defaultPrevented || event.key !== 'Enter' || event.repeat || event.nativeEvent.isComposing || event.keyCode === 229) return;
        // @cpt-end:cpt-template-site-flow-site-links-open-other-screen:p1:inst-if-activated
        event.preventDefault();
        open();
      }}
    >
      {children}
    </a>
  );
  // @cpt-end:cpt-template-site-flow-site-links-open-other-screen:p1:inst-render-screen-link
}
