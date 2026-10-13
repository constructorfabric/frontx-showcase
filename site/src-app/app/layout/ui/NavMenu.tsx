import { createContext, useContext, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger, NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@gears-frontx/ui-kit';
import styles from './NavMenu.module.css';

export interface NavMenuProps {
  label: string;
  /** `NavMenuItem`s and `NavGroup`s. */
  children?: ReactNode;
}

/** The header's navigation: a row of text links and link groups on the kit's NavigationMenu. Fills the kit gap "nav bar": the kit's menu has no plain link style and no active underline. */
// @cpt-algo:cpt-site-algo-shell-layout-navigation-page-frame:p1
export function NavMenu({ label, children }: NavMenuProps) {
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-menu
  if (children === undefined) return <nav className={styles.nav} aria-label={label} />;
  return (
    <NavigationMenu className={styles.nav} aria-label={label}>
      <NavigationMenuList className={styles.list}>{children}</NavigationMenuList>
    </NavigationMenu>
  );
  // @cpt-end:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-menu
}

export interface NavLinkProps {
  href: string;
  active: boolean;
  label: string;
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  'data-testid'?: string;
  /** Inside a group's list the link takes the list row style. */
  grouped?: boolean;
}

/** Closes the group a link sits in; outside a group it does nothing. */
const CloseGroup = createContext<() => void>(() => {});

/** One navigation link, with the active page marked; a link in a group closes the group's list when chosen. Fills the kit gap "nav link". */
// @cpt-algo:cpt-site-algo-shell-layout-navigation-group-disclosure:p1
export function NavLink({ href, active, label, onClick, 'data-testid': testId, grouped = false }: NavLinkProps) {
  const closeGroup = useContext(CloseGroup);
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-menu
  return (
    <NavigationMenuLink
      className={grouped ? styles.groupLink : styles.link}
      href={href}
      active={active}
      aria-current={active ? 'page' : undefined}
      data-testid={testId}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        // @cpt-begin:cpt-site-algo-shell-layout-navigation-group-disclosure:p1:inst-close-on-choice
        onClick(event);
        closeGroup();
        // @cpt-end:cpt-site-algo-shell-layout-navigation-group-disclosure:p1:inst-close-on-choice
      }}
    >
      {label}
    </NavigationMenuLink>
  );
  // @cpt-end:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-menu
}

/** A list entry of the navigation. */
export function NavMenuItem({ children }: { children: ReactNode }) {
  return <NavigationMenuItem>{children}</NavigationMenuItem>;
}

export interface NavGroupProps {
  label: string;
  active: boolean;
  /** The list closes whenever this value changes: the shell passes the mounted screen, so the list closes on a screen change from anywhere. */
  closeKey: string | undefined;
  'data-testid'?: string;
  /** `NavLink`s with `grouped`, each in an `<li>`. */
  children: ReactNode;
}

/** The links of a group's list, in order. */
function groupLinks(panel: HTMLElement | null): HTMLAnchorElement[] {
  return panel ? [...panel.querySelectorAll('a')] : [];
}

/**
 * A group of links behind a disclosure button (the navigation disclosure pattern): the kit's Collapsible, its panel drawn as a dropdown under the button. The kit's NavigationMenu popup is not used for it: it adds `aria-hidden` focus guards that take keyboard focus (axe `aria-hidden-focus`), a Base UI trait recorded as a kit defect. The list closes after a choice, on Escape (focus returns to the button), on a click or focus outside and on a screen change; ArrowDown and ArrowUp move through its links. Fills the kit gap "nav group".
 */
export function NavGroup({ label, active, closeKey, 'data-testid': testId, children }: NavGroupProps) {
  const [open, setOpen] = useState(false);
  const [openedFor, setOpenedFor] = useState(closeKey);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const focusFirst = useRef(false);

  // A screen change closes the list during render, so the new screen never shows it open for a frame.
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-group-disclosure:p1:inst-close-on-screen-change
  if (closeKey !== openedFor) {
    setOpenedFor(closeKey);
    setOpen(false);
  }
  // @cpt-end:cpt-site-algo-shell-layout-navigation-group-disclosure:p1:inst-close-on-screen-change

  useEffect(() => {
    // @cpt-begin:cpt-site-algo-shell-layout-navigation-group-disclosure:p1:inst-close-outside
    if (!open) return;
    if (focusFirst.current) {
      focusFirst.current = false;
      groupLinks(panelRef.current)[0]?.focus();
    }
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !event.composedPath().includes(rootRef.current)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
    // @cpt-end:cpt-site-algo-shell-layout-navigation-group-disclosure:p1:inst-close-outside
  }, [open]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // @cpt-begin:cpt-site-algo-shell-layout-navigation-group-disclosure:p1:inst-escape
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    // @cpt-end:cpt-site-algo-shell-layout-navigation-group-disclosure:p1:inst-escape
    // @cpt-begin:cpt-site-algo-shell-layout-navigation-group-disclosure:p1:inst-arrows
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    if (event.target === triggerRef.current) {
      if (event.key !== 'ArrowDown') return;
      event.preventDefault();
      if (open) groupLinks(panelRef.current)[0]?.focus();
      else {
        focusFirst.current = true;
        setOpen(true);
      }
      return;
    }
    const links = groupLinks(panelRef.current);
    const at = links.findIndex((link) => link === event.target);
    if (at === -1) return;
    event.preventDefault();
    const next = event.key === 'ArrowDown' ? at + 1 : at - 1;
    if (next < 0) triggerRef.current?.focus();
    else links[Math.min(next, links.length - 1)]?.focus();
    // @cpt-end:cpt-site-algo-shell-layout-navigation-group-disclosure:p1:inst-arrows
  };

  // @cpt-begin:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-menu
  return (
    <NavigationMenuItem>
      <Collapsible
        ref={rootRef}
        className={styles.group}
        open={open}
        onOpenChange={setOpen}
        onKeyDown={onKeyDown}
        onBlur={(event) => {
          // @cpt-begin:cpt-site-algo-shell-layout-navigation-group-disclosure:p1:inst-close-on-blur
          const next = event.relatedTarget;
          if (open && next instanceof Node && !event.currentTarget.contains(next)) setOpen(false);
          // @cpt-end:cpt-site-algo-shell-layout-navigation-group-disclosure:p1:inst-close-on-blur
        }}
      >
        <CollapsibleTrigger ref={triggerRef} className={styles.trigger} data-active={active ? '' : undefined} data-testid={testId}>
          {label}
          <ChevronDown className={styles.chevron} aria-hidden="true" />
        </CollapsibleTrigger>
        <CollapsibleContent ref={panelRef} className={styles.panel}>
          <ul className={styles.groupList}>
            <CloseGroup.Provider value={() => setOpen(false)}>{children}</CloseGroup.Provider>
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </NavigationMenuItem>
  );
  // @cpt-end:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-menu
}
