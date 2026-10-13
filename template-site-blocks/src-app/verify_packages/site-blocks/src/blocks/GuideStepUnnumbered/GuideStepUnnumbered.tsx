import type { ReactNode } from 'react';
import { Separator } from '@gears-frontx/ui-kit';
import { Heading, Text } from '@gears-frontx/kit-candidates';

import styles from './GuideStepUnnumbered.module.css';

export interface GuideStepUnnumberedProps {
  /** The heading's id, the target of an "On this page" jump. */
  id: string;
  title: string;
  lead: string;
  /** Links after the lead, in one row. */
  links?: ReactNode;
}

/*
 * The closing section of a guide, drawn as a step without a number: ruled off above, the title, the lead and a row of links.
 */
// @cpt-dod:cpt-template-site-blocks-dod-docs-blocks-guide-step-unnumbered:p1
// @cpt-algo:cpt-template-site-blocks-algo-docs-blocks-guide-step-unnumbered:p1
export function GuideStepUnnumbered({ id, title, lead, links }: GuideStepUnnumberedProps) {
  return (
    <section className={styles.step} aria-labelledby={id}>
      <Separator />
      <div className={styles.body}>
        {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-guide-step-unnumbered:p1:inst-heading */}
        <Heading id={id} size="heading-1" tabIndex={-1} className={styles.title}>
          {title}
        </Heading>
        <Text tone="muted">{lead}</Text>
        {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-guide-step-unnumbered:p1:inst-heading */}
        {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-guide-step-unnumbered:p1:inst-links */}
        {links ? <div className={styles.links}>{links}</div> : null}
        {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-guide-step-unnumbered:p1:inst-links */}
      </div>
    </section>
  );
}
