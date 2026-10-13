import type { ReactElement, ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { Separator } from '@gears-frontx/ui-kit';
import { Link, Text } from '@gears-frontx/kit-candidates';

import { SectionFrame } from '../SectionFrame/SectionFrame';
import styles from './ChangeStory.module.css';

export interface ChangeStoryProps {
  /** The heading's id. */
  id: string;
  /** The section title; a newline breaks the line. */
  title: string;
  lead?: string;
  /** The link under the lead: its label and the element it renders as. */
  action?: { label: string; link: ReactElement };
  /** The workbench, drawn by brand art: the task given to an agent, the diff and the preview of the result, in the light or dark palette of the page. */
  workbench: ReactNode;
}

/*
 * A change told as one workbench: a rule across the page column, then the section frame with the title, the lead, the link and the workbench drawing across the column, in that order in the markup at every width. On a wide screen the stylesheet places the link at the title row's far end.
 */
// @cpt-dod:cpt-template-site-blocks-dod-section-blocks-change-story:p1
// @cpt-algo:cpt-template-site-blocks-algo-section-blocks-change-story:p1
export function ChangeStory({ id, title, lead, action, workbench }: ChangeStoryProps) {
  // @cpt-begin:cpt-template-site-blocks-algo-section-blocks-change-story:p1:inst-link
  const link = action ? (
    <Link render={action.link} className={styles.link}>
      {action.label}
      <ArrowRight aria-hidden="true" className={styles.linkIcon} />
    </Link>
  ) : undefined;
  // @cpt-end:cpt-template-site-blocks-algo-section-blocks-change-story:p1:inst-link
  // @cpt-begin:cpt-template-site-blocks-algo-section-blocks-change-story:p1:inst-frame
  return (
    <div className={styles.rhythm}>
      <div className={styles.rule}>
        <Separator />
      </div>
      <SectionFrame id={id} title={title}>
        {/* @cpt-begin:cpt-template-site-blocks-algo-section-blocks-change-story:p1:inst-workbench */}
        <div className={styles.body}>
          {lead ? (
            <Text tone="muted" className={styles.lead}>
              {lead}
            </Text>
          ) : null}
          {link}
          <div className={styles.workbench}>{workbench}</div>
        </div>
        {/* @cpt-end:cpt-template-site-blocks-algo-section-blocks-change-story:p1:inst-workbench */}
      </SectionFrame>
    </div>
  );
  // @cpt-end:cpt-template-site-blocks-algo-section-blocks-change-story:p1:inst-frame
}
