import { createElement, useEffect, useRef, useState, type ReactNode } from 'react';
import { Card, CardContent, CardHeader } from '@gears-frontx/ui-kit';
import { CardTitle } from '@gears-frontx/kit-candidates';

import { DocsFrame, type DocsFrameProps } from '../DocsFrame/DocsFrame';
import { activeAnchor, jumpToHeading } from './railAnchors';
import styles from './DocsFrameWithRail.module.css';

export interface DocsRail {
  /** The rail's title, also the navigation landmark's name. */
  label: string;
  /** The page's section headings, in order; `id` is the heading's id. */
  items: readonly { id: string; title: string }[];
  /** A link under the list, such as the page's plain-text twin. */
  footer?: ReactNode;
}

export interface DocsFrameWithRailProps extends Omit<DocsFrameProps, 'footer'> {
  /** The "On this page" rail beside the body. */
  rail: DocsRail;
  /** Content above the rail in the same column, such as a facts card. */
  aside?: ReactNode;
}

/** How far under the viewport's top a heading counts as reached: the sticky site header plus a little air. */
const READING_LINE = 140;

/** The "On this page" rail: numbered jumps to the page's headings, which take keyboard focus on arrival, with the section in view marked current. */
function OnThisPage({ label, items, footer }: DocsRail) {
  const nav = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  // @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-rail-current:p1:inst-track-scroll
  useEffect(() => {
    const root = nav.current?.getRootNode();
    if (!(root instanceof ShadowRoot || root instanceof Document)) return undefined;
    const update = () => {
      const tops = items.map((item) => root.getElementById(item.id)?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY);
      setActive(activeAnchor(tops, READING_LINE));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [items]);
  // @cpt-end:cpt-template-site-blocks-algo-docs-blocks-rail-current:p1:inst-track-scroll

  // @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-docs-frame-with-rail:p1:inst-rail
  return (
    <nav ref={nav} aria-label={label}>
      <Card>
        <CardHeader>
          <CardTitle render={createElement('h2')}>{label}</CardTitle>
        </CardHeader>
        <CardContent className={styles.railBody}>
          <ol className={styles.list}>
            {items.map((item, index) => (
              <li key={item.id} className={styles.entry}>
                {/* @cpt-begin:cpt-template-site-blocks-flow-docs-blocks-jump-to-section:p1:inst-activate */}
                <button type="button" className={styles.item} aria-current={index === active ? 'location' : undefined} onClick={(event) => jumpToHeading(event.currentTarget, item.id)}>
                  <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
                  {item.title}
                </button>
                {/* @cpt-end:cpt-template-site-blocks-flow-docs-blocks-jump-to-section:p1:inst-activate */}
              </li>
            ))}
          </ol>
          {footer ? <div className={styles.railFooter}>{footer}</div> : null}
        </CardContent>
      </Card>
    </nav>
  );
  // @cpt-end:cpt-template-site-blocks-algo-docs-blocks-docs-frame-with-rail:p1:inst-rail
}

/*
 * The frame of a guide page: the docs frame with the body beside a sticky side column that holds optional content (such as facts) and the "On this page" rail. On narrow screens the side column moves above the body, full width.
 */
// @cpt-dod:cpt-template-site-blocks-dod-docs-blocks-docs-frame-with-rail:p1
// @cpt-algo:cpt-template-site-blocks-algo-docs-blocks-docs-frame-with-rail:p1
// @cpt-algo:cpt-template-site-blocks-algo-docs-blocks-rail-current:p1
// @cpt-flow:cpt-template-site-blocks-flow-docs-blocks-jump-to-section:p1
export function DocsFrameWithRail({ rail, aside, children, ...frame }: DocsFrameWithRailProps) {
  // @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-docs-frame-with-rail:p1:inst-columns
  return (
    <DocsFrame {...frame}>
      <div className={styles.columns}>
        <div className={styles.main}>{children}</div>
        <aside className={styles.side}>
          {aside}
          <OnThisPage {...rail} />
        </aside>
      </div>
    </DocsFrame>
  );
  // @cpt-end:cpt-template-site-blocks-algo-docs-blocks-docs-frame-with-rail:p1:inst-columns
}
