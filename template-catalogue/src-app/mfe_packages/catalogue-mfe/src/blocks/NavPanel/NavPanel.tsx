import { createElement, type MouseEventHandler, type ReactNode, type Ref } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Text } from '@gears-frontx/kit-candidates';
import { BlockAnchor, type AnchorRender } from '../anchor';
import styles from './NavPanel.module.css';

// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props
export interface NavPanelProps {
  /** The accessible name of the panel's navigation. */
  label: string;
  testId?: string;
  ref?: Ref<HTMLElement>;
  /** The panel's groups and its foot. */
  children: ReactNode;
}
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props

/**
 * The navigation panel beside the page: it sticks under the shell's header and fills the rest of the viewport, scrolling its own rows.
 */
// @cpt-flow:cpt-template-catalogue-flow-catalogue-screen-navigate:p1
// @cpt-algo:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1
// @cpt-dod:cpt-template-catalogue-dod-catalogue-screen-blocks:p1
export function NavPanel({ label, testId, ref, children }: NavPanelProps) {
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-render-panel
  return (
    <nav ref={ref} className={styles.panel} aria-label={label} data-testid={testId}>
      {children}
    </nav>
  );
  // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-render-panel
}

// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props
export interface NavPanelGroupProps {
  /** The id of the group's label, which names the group. */
  id: string;
  title: string;
  /** The group's rows. */
  children: ReactNode;
}
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props

/** A labelled group of rows. A group, not a section: inside the navigation landmark a named section would be a region of its own. */
export function NavPanelGroup({ id, title, children }: NavPanelGroupProps) {
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-render-panel
  return (
    <div role="group" className={styles.group} aria-labelledby={id}>
      {/* @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-text */}
      <div className={styles.groupLabel}>
        <Text variant="micro" tone="muted" render={createElement('h2', { id })}>
          {title}
        </Text>
      </div>
      {/* @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-text */}
      <ul className={styles.list}>{children}</ul>
    </div>
  );
  // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-render-panel
}

// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props
export interface NavPanelRowProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  /** Draws the row on the router's link instead of a plain anchor. */
  render?: AnchorRender;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  /** The row of the open page: `aria-current="page"` and the current ink. */
  current?: boolean;
  /** The open section's own row: it carries the fill. */
  sectionCurrent?: boolean;
  testId?: string;
  ref?: Ref<HTMLAnchorElement>;
}
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props

/** One row of the panel: an icon and a label, linking a page. The open section's row carries the fill; the open page's row the current ink. */
export function NavPanelRow({ icon: Icon, label, href, render, onClick, current = false, sectionCurrent = false, testId, ref }: NavPanelRowProps) {
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-mark-current-row
  return (
    <li>
      {/* @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-link */}
      <BlockAnchor
        ref={ref}
        href={href}
        render={render}
        onClick={onClick}
        className={styles.row}
        // @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-mark-state
        aria-current={current ? 'page' : undefined}
        data-section-current={sectionCurrent ? '' : undefined}
        // @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-mark-state
        data-testid={testId}
      >
        {/* @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-link */}
        <Icon aria-hidden="true" className={styles.icon} />
        <span>{label}</span>
      </BlockAnchor>
    </li>
  );
  // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-mark-current-row
}

// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props
export interface NavPanelFootProps {
  label: string;
  version: string;
  note: string;
}
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props

/** The panel's foot: what the catalogue is built with, its version and a note on the demo data. */
export function NavPanelFoot({ label, version, note }: NavPanelFootProps) {
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-render-panel
  return (
    <div className={styles.foot}>
      {/* @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-text */}
      <Text variant="meta" tone="muted" render={<span />}>
        {label}
      </Text>
      <Text variant="mono" tone="muted" render={<code />}>
        {version}
      </Text>
      <Text variant="meta" tone="muted" render={<small />}>
        {note}
      </Text>
      {/* @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-text */}
    </div>
  );
  // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-render-panel
}
