import { createElement } from 'react';
import { Heading, Text } from '@gears-frontx/kit-candidates';

import styles from './SectionHeading.module.css';

export interface SectionHeadingProps {
  /** The heading's id, the target of an "On this page" jump. */
  id: string;
  title: string;
  /** A one-line lead under the title. */
  lead?: string;
  /** A short label at the row's end that names what the section's cards add up to; the title then takes the smaller heading role. */
  label?: string;
}

/*
 * The title of a section of an inner page, with its one-line lead or a label at the row's end. The heading is a jump target: focusable by script, clear of the sticky header when scrolled to.
 */
// @cpt-dod:cpt-template-site-blocks-dod-docs-blocks-section-heading:p1
// @cpt-algo:cpt-template-site-blocks-algo-docs-blocks-section-heading:p1
export function SectionHeading({ id, title, lead, label }: SectionHeadingProps) {
  // @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-section-heading:p1:inst-role
  // A labelled heading names a group of cards and steps down one role on the kit's ramp.
  const size = label ? 'heading-1' : 'display';
  // @cpt-end:cpt-template-site-blocks-algo-docs-blocks-section-heading:p1:inst-role
  // @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-section-heading:p1:inst-render
  return (
    <header className={label ? `${styles.header} ${styles.labelled}` : styles.header}>
      <Heading id={id} size={size} tabIndex={-1} className={styles.title}>
        {title}
      </Heading>
      {label ? (
        <Text variant="meta" tone="muted" render={createElement('span')}>
          {label}
        </Text>
      ) : null}
      {lead ? (
        <Text className={styles.lead}>
          {lead}
        </Text>
      ) : null}
    </header>
  );
  // @cpt-end:cpt-template-site-blocks-algo-docs-blocks-section-heading:p1:inst-render
}
