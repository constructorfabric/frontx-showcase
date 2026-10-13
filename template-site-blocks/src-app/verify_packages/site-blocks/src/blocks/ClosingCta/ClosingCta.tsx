import { cloneElement, type ReactElement, type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { buttonVariants } from '@gears-frontx/ui-kit';
import { Heading, Link } from '@gears-frontx/kit-candidates';

import styles from './ClosingCta.module.css';

export interface ClosingCtaAction {
  label: string;
  /** The element the action renders as: an anchor or the application's router link, with its destination and no children. */
  link: ReactElement;
}

export interface ClosingCtaProps {
  /** The heading's id. */
  id: string;
  /** The closing title; a newline breaks the line. */
  title: string;
  /** The first action is the band's button, the rest are text links beside it. */
  actions: readonly ClosingCtaAction[];
  /** The visual across the column under the title row, drawn by brand art; it fills the box the band gives it. */
  visual?: ReactNode;
}

/*
 * The landing page's closing band: the night colour across the full width, the title at the start and the actions in a 340px end column on one row, then the visual across the column.
 */
// @cpt-dod:cpt-template-site-blocks-dod-section-blocks-closing-cta:p1
// @cpt-algo:cpt-template-site-blocks-algo-section-blocks-closing-cta:p1
export function ClosingCta({ id, title, actions, visual }: ClosingCtaProps) {
  // @cpt-begin:cpt-template-site-blocks-algo-section-blocks-closing-cta:p1:inst-actions
  const [primary, ...links] = actions;
  const actionRow = (
    <div className={styles.actions}>
      {primary ? (
        cloneElement(primary.link as ReactElement<{ className?: string; children?: ReactNode }>, {
          className: [(primary.link.props as { className?: string }).className, buttonVariants({ size: 'lg' }), styles.button].filter(Boolean).join(' '),
          children: (
            <>
              {primary.label}
              <ArrowRight aria-hidden="true" className={styles.buttonIcon} />
            </>
          ),
        })
      ) : null}
      {links.map((action) => (
        <Link key={action.label} variant="inherit" render={action.link} className={styles.link}>
          {action.label}
          <ArrowUpRight aria-hidden="true" className={styles.linkIcon} />
        </Link>
      ))}
    </div>
  );
  // @cpt-end:cpt-template-site-blocks-algo-section-blocks-closing-cta:p1:inst-actions
  // @cpt-begin:cpt-template-site-blocks-algo-section-blocks-closing-cta:p1:inst-band
  return (
    <section className={styles.band} aria-labelledby={id}>
      <div className={styles.layout}>
        {/* @cpt-begin:cpt-template-site-blocks-algo-section-blocks-closing-cta:p1:inst-title */}
        <Heading id={id} size="display" className={styles.title}>
          {title}
        </Heading>
        {/* @cpt-end:cpt-template-site-blocks-algo-section-blocks-closing-cta:p1:inst-title */}
        {actionRow}
        {/* @cpt-begin:cpt-template-site-blocks-algo-section-blocks-closing-cta:p1:inst-visual */}
        {visual ? <div className={styles.visual}>{visual}</div> : null}
        {/* @cpt-end:cpt-template-site-blocks-algo-section-blocks-closing-cta:p1:inst-visual */}
      </div>
    </section>
  );
  // @cpt-end:cpt-template-site-blocks-algo-section-blocks-closing-cta:p1:inst-band
}
