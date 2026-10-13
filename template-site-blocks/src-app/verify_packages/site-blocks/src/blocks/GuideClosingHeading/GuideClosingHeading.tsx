import { Separator } from '@gears-frontx/ui-kit';
import { Heading, Text } from '@gears-frontx/kit-candidates';

import styles from './GuideClosingHeading.module.css';

export interface GuideClosingHeadingProps {
  /** The heading's id, the target of an "On this page" jump. */
  id: string;
  title: string;
  /** A one-line lead under the title. */
  lead?: string;
}

/*
 * The heading of a guide's closing section, such as where to go next: ruled off from the steps above by a kit separator, 32px under them and 38px above the title, the title on the kit display role, and its lead. The heading is a jump target: focusable by script, clear of the sticky header when scrolled to.
 */
// @cpt-dod:cpt-template-site-blocks-dod-docs-blocks-guide-closing-heading:p1
// @cpt-algo:cpt-template-site-blocks-algo-docs-blocks-guide-closing-heading:p1
export function GuideClosingHeading({ id, title, lead }: GuideClosingHeadingProps) {
  // @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-guide-closing-heading:p1:inst-render
  return (
    <header className={styles.header}>
      {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-guide-closing-heading:p1:inst-rule */}
      <Separator />
      {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-guide-closing-heading:p1:inst-rule */}
      <div className={styles.heading}>
        {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-guide-closing-heading:p1:inst-heading */}
        <Heading id={id} size="display" tabIndex={-1} className={styles.title}>
          {title}
        </Heading>
        {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-guide-closing-heading:p1:inst-heading */}
        {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-guide-closing-heading:p1:inst-lead */}
        {lead ? <Text tone="muted">{lead}</Text> : null}
        {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-guide-closing-heading:p1:inst-lead */}
      </div>
    </header>
  );
  // @cpt-end:cpt-template-site-blocks-algo-docs-blocks-guide-closing-heading:p1:inst-render
}
