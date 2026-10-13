import { cloneElement, createElement, useId, type ReactElement, type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { buttonVariants } from '@gears-frontx/ui-kit';
import { Heading, Link, Text } from '@gears-frontx/kit-candidates';

import styles from './Hero.module.css';

export interface HeroAction {
  label: string;
  /** The element the action renders as: an anchor or the application's router link, with its destination and no children. */
  link: ReactElement;
}

export interface HeroProps {
  /** The page title, the page's only level-one heading; a newline breaks the line. */
  title: string;
  /** The one-paragraph definition beside the title. */
  lead: string;
  /** The first action is the band's button, the rest are text links beside it. */
  actions: readonly HeroAction[];
  /** The art row under the text, drawn by brand art; it fills the box the band gives it. */
  art?: ReactNode;
}

/*
 * The landing page's opening band: the brand blue across the full width, the page title at the start, the lead and the actions in the end column, and the art row under both, running off the band's bottom edge.
 */
// @cpt-dod:cpt-template-site-blocks-dod-section-blocks-hero:p1
// @cpt-algo:cpt-template-site-blocks-algo-section-blocks-hero:p1
export function Hero({ title, lead, actions, art }: HeroProps) {
  const titleId = useId();
  // @cpt-begin:cpt-template-site-blocks-algo-section-blocks-hero:p1:inst-actions
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
  // @cpt-end:cpt-template-site-blocks-algo-section-blocks-hero:p1:inst-actions
  // @cpt-begin:cpt-template-site-blocks-algo-section-blocks-hero:p1:inst-band
  return (
    <section className={styles.band} aria-labelledby={titleId}>
      <div className={styles.layout}>
        {/* @cpt-begin:cpt-template-site-blocks-algo-section-blocks-hero:p1:inst-title */}
        <Heading id={titleId} size="display" render={createElement('h1')} className={styles.title}>
          {title}
        </Heading>
        {/* @cpt-end:cpt-template-site-blocks-algo-section-blocks-hero:p1:inst-title */}
        {/* @cpt-begin:cpt-template-site-blocks-algo-section-blocks-hero:p1:inst-aside */}
        <div className={styles.aside}>
          <Text className={styles.lead}>{lead}</Text>
          {actionRow}
        </div>
        {/* @cpt-end:cpt-template-site-blocks-algo-section-blocks-hero:p1:inst-aside */}
        {/* @cpt-begin:cpt-template-site-blocks-algo-section-blocks-hero:p1:inst-art */}
        {art ? <div className={styles.art}>{art}</div> : null}
        {/* @cpt-end:cpt-template-site-blocks-algo-section-blocks-hero:p1:inst-art */}
      </div>
    </section>
  );
  // @cpt-end:cpt-template-site-blocks-algo-section-blocks-hero:p1:inst-band
}
