import type { ReactNode } from 'react';

import { DocsFrame, type DocsNav } from '../DocsFrame/DocsFrame';
import type { PageIntroProps } from '../PageIntro/PageIntro';
import styles from './TemplateDetailFrame.module.css';

export interface TemplateDetailFrameProps {
  /** The page intro: title, lead, back link and facts. */
  intro: PageIntroProps;
  /** The tab bar across the pages of a section, under the intro. */
  nav?: DocsNav;
  /** The file explorer, across the whole column under the intro. */
  explorer: ReactNode;
  /** The page's body, the wider of the two columns under the explorer. */
  children: ReactNode;
  /** The facts beside the body, such as a "Before you start" card; they follow the body on narrow screens. */
  facts?: ReactNode;
  /** A small line under the columns, such as the link to the page's plain-text twin. */
  footer?: ReactNode;
}

/*
 * The frame of a template's page: the docs frame with the file explorer across the column, then the body and the facts in two columns (the body the wider one, 55px apart; one column under 760px, the facts after the body).
 */
// @cpt-dod:cpt-template-site-blocks-dod-docs-blocks-template-detail-frame:p1
// @cpt-algo:cpt-template-site-blocks-algo-docs-blocks-template-detail-frame:p1
export function TemplateDetailFrame({ intro, nav, explorer, children, facts, footer }: TemplateDetailFrameProps) {
  // @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-template-detail-frame:p1:inst-columns
  return (
    <DocsFrame intro={intro} nav={nav} wide={explorer} footer={footer}>
      <div className={facts ? styles.columns : styles.single}>
        <div className={styles.main}>{children}</div>
        {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-template-detail-frame:p1:inst-facts */}
        {facts ? <aside className={styles.facts}>{facts}</aside> : null}
        {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-template-detail-frame:p1:inst-facts */}
      </div>
    </DocsFrame>
  );
  // @cpt-end:cpt-template-site-blocks-algo-docs-blocks-template-detail-frame:p1:inst-columns
}
