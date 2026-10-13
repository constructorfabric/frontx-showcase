import type { ReactNode } from 'react';
import { Heading, Text } from '@gears-frontx/kit-candidates';

import styles from './SectionFrame.module.css';

export interface SectionFrameProps {
  /** The heading's id; the band is the region the heading names. */
  id: string;
  /** A short section label above the title. */
  label?: string;
  /** The section title; a newline breaks the line. */
  title: string;
  /** The lead beside the title. */
  lead?: string;
  /** A small line above the lead that says what the section's body is, such as an illustrative comparison. */
  note?: string;
  /** A link under the lead. */
  action?: ReactNode;
  /** The section's body under its header. */
  children: ReactNode;
}

/*
 * A full-bleed landing-page band that holds its content to the page column: the label and the section title at the start, the note, the lead and the action at the end, aligned to the title's last line, then the body. The band's block padding comes from the layout tokens, so a block that composes the frame sets its own rhythm on an ancestor.
 */
// @cpt-dod:cpt-template-site-blocks-dod-section-blocks-section-frame:p1
// @cpt-algo:cpt-template-site-blocks-algo-section-blocks-section-frame:p1
export function SectionFrame({ id, label, title, lead, note, action, children }: SectionFrameProps) {
  // @cpt-begin:cpt-template-site-blocks-algo-section-blocks-section-frame:p1:inst-aside
  const aside =
    lead || note || action ? (
      <div className={styles.aside}>
        {note ? (
          <Text variant="meta" tone="muted" className={styles.note}>
            {note}
          </Text>
        ) : null}
        {lead ? (
          <Text tone="muted" className={styles.lead}>
            {lead}
          </Text>
        ) : null}
        {action ? <div className={styles.action}>{action}</div> : null}
      </div>
    ) : null;
  // @cpt-end:cpt-template-site-blocks-algo-section-blocks-section-frame:p1:inst-aside
  // @cpt-begin:cpt-template-site-blocks-algo-section-blocks-section-frame:p1:inst-band
  return (
    <section className={styles.band} aria-labelledby={id}>
      <div className={styles.column}>
        {/* @cpt-begin:cpt-template-site-blocks-algo-section-blocks-section-frame:p1:inst-header */}
        <header className={styles.header}>
          <div className={styles.heading}>
            {label ? (
              <Text variant="meta" className={styles.label}>
                {label}
              </Text>
            ) : null}
            <Heading id={id} size="display" className={styles.title}>
              {title}
            </Heading>
          </div>
          {aside}
        </header>
        {/* @cpt-end:cpt-template-site-blocks-algo-section-blocks-section-frame:p1:inst-header */}
        {/* @cpt-begin:cpt-template-site-blocks-algo-section-blocks-section-frame:p1:inst-body */}
        {children}
        {/* @cpt-end:cpt-template-site-blocks-algo-section-blocks-section-frame:p1:inst-body */}
      </div>
    </section>
  );
  // @cpt-end:cpt-template-site-blocks-algo-section-blocks-section-frame:p1:inst-band
}
