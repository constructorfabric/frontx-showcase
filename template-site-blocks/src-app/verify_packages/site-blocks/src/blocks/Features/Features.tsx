import { createElement, type ReactElement, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { Heading, Link, Text } from '@gears-frontx/kit-candidates';

import { SectionFrame } from '../SectionFrame/SectionFrame';
import styles from './Features.module.css';

export interface Feature {
  /** The feature's figure, drawn by brand art; decoration only. */
  figure?: ReactNode;
  title: string;
  text: string;
  /** The feature's link: its label and the element it renders as (an anchor or the router's link, with its destination and no children). */
  action: { label: string; link: ReactElement };
}

export interface FeaturesProps {
  /** The heading's id. */
  id: string;
  title: string;
  items: readonly Feature[];
}

/*
 * What a product gives, three across: each feature a figure over its title, a sentence and a link; on a phone the figure sits beside the text. The band is a section frame with the groundwork rhythm.
 */
// @cpt-dod:cpt-template-site-blocks-dod-section-blocks-features:p1
// @cpt-algo:cpt-template-site-blocks-algo-section-blocks-features:p1
export function Features({ id, title, items }: FeaturesProps) {
  // @cpt-begin:cpt-template-site-blocks-algo-section-blocks-features:p1:inst-frame
  return (
    <div className={styles.rhythm}>
      <SectionFrame id={id} title={title}>
        {/* @cpt-begin:cpt-template-site-blocks-algo-section-blocks-features:p1:inst-items */}
        <ul className={styles.grid}>
          {items.map((item) => (
            <li key={item.title} className={styles.item}>
              {/* @cpt-begin:cpt-template-site-blocks-algo-section-blocks-features:p1:inst-figure */}
              <span className={styles.figure} aria-hidden="true">
                {item.figure}
              </span>
              {/* @cpt-end:cpt-template-site-blocks-algo-section-blocks-features:p1:inst-figure */}
              {/* @cpt-begin:cpt-template-site-blocks-algo-section-blocks-features:p1:inst-copy */}
              <div className={styles.copy}>
                <Heading size="heading-1" render={createElement('h3')}>
                  {item.title}
                </Heading>
                <Text tone="muted" className={styles.text}>
                  {item.text}
                </Text>
                <Link render={item.action.link} className={styles.link}>
                  {item.action.label}
                  <ArrowRight aria-hidden="true" className={styles.linkIcon} />
                </Link>
              </div>
              {/* @cpt-end:cpt-template-site-blocks-algo-section-blocks-features:p1:inst-copy */}
            </li>
          ))}
        </ul>
        {/* @cpt-end:cpt-template-site-blocks-algo-section-blocks-features:p1:inst-items */}
      </SectionFrame>
    </div>
  );
  // @cpt-end:cpt-template-site-blocks-algo-section-blocks-features:p1:inst-frame
}
