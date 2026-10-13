import { createElement, type ReactElement, type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Separator } from '@gears-frontx/ui-kit';
import { Heading, Link, Text } from '@gears-frontx/kit-candidates';

import styles from './GetStartedSteps.module.css';

export interface GetStartedStep {
  /** The step's figure, drawn by brand art; decoration only. */
  figure?: ReactNode;
  title: string;
  text: string;
  /** The element the step's title link renders as (an anchor or the router's link, with its destination and no children); the link covers the row. */
  link: ReactElement;
}

export interface GetStartedStepsProps {
  /** The heading's id. */
  id: string;
  /** The section title; a newline breaks the line. */
  title: string;
  lead?: string;
  /** The link under the lead: its label and the element it renders as. */
  action?: { label: string; link: ReactElement };
  steps: readonly GetStartedStep[];
}

/*
 * The way in, in order: a band of two columns 100px apart, centred on each other (one column under 640px). The title, the lead and the link on the start; on the end an ordered list of ruled rows, each a figure, a title link that covers the row, a sentence and an arrow.
 */
// @cpt-dod:cpt-template-site-blocks-dod-section-blocks-get-started-steps:p1
// @cpt-algo:cpt-template-site-blocks-algo-section-blocks-get-started-steps:p1
export function GetStartedSteps({ id, title, lead, action, steps }: GetStartedStepsProps) {
  // @cpt-begin:cpt-template-site-blocks-algo-section-blocks-get-started-steps:p1:inst-band
  return (
    <section className={styles.band} aria-labelledby={id}>
      <div className={styles.columns}>
        {/* @cpt-begin:cpt-template-site-blocks-algo-section-blocks-get-started-steps:p1:inst-header */}
        <header className={styles.header}>
          <Heading id={id} size="display" className={styles.title}>
            {title}
          </Heading>
          {lead ? (
            <Text tone="muted" className={styles.lead}>
              {lead}
            </Text>
          ) : null}
          {action ? (
            <Link render={action.link} className={styles.action}>
              {action.label}
              <ArrowUpRight aria-hidden="true" className={styles.actionIcon} />
            </Link>
          ) : null}
        </header>
        {/* @cpt-end:cpt-template-site-blocks-algo-section-blocks-get-started-steps:p1:inst-header */}
        {/* @cpt-begin:cpt-template-site-blocks-algo-section-blocks-get-started-steps:p1:inst-steps */}
        <ol className={styles.steps}>
          {steps.map((step) => (
            <li key={step.title} className={styles.step}>
              <div className={styles.row}>
                {/* @cpt-begin:cpt-template-site-blocks-algo-section-blocks-get-started-steps:p1:inst-step-figure */}
                <span className={styles.figure} aria-hidden="true">
                  {step.figure}
                </span>
                {/* @cpt-end:cpt-template-site-blocks-algo-section-blocks-get-started-steps:p1:inst-step-figure */}
                {/* @cpt-begin:cpt-template-site-blocks-algo-section-blocks-get-started-steps:p1:inst-step-copy */}
                <div className={styles.copy}>
                  <Heading size="heading-1" render={createElement('h3')}>
                    <Link variant="inherit" render={step.link} className={styles.stepLink}>
                      {step.title}
                    </Link>
                  </Heading>
                  <Text tone="muted">{step.text}</Text>
                </div>
                {/* @cpt-end:cpt-template-site-blocks-algo-section-blocks-get-started-steps:p1:inst-step-copy */}
                <ArrowRight aria-hidden="true" className={styles.arrow} />
              </div>
              {/* @cpt-begin:cpt-template-site-blocks-algo-section-blocks-get-started-steps:p1:inst-step-rule */}
              <Separator />
              {/* @cpt-end:cpt-template-site-blocks-algo-section-blocks-get-started-steps:p1:inst-step-rule */}
            </li>
          ))}
        </ol>
        {/* @cpt-end:cpt-template-site-blocks-algo-section-blocks-get-started-steps:p1:inst-steps */}
      </div>
    </section>
  );
  // @cpt-end:cpt-template-site-blocks-algo-section-blocks-get-started-steps:p1:inst-band
}
