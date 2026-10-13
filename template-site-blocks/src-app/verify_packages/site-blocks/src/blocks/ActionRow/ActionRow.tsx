import type { ReactNode } from 'react';
import styles from './ActionRow.module.css';

export interface ActionRowProps {
  /** The actions, usually links drawn as buttons (`buttonVariants` on the link). */
  children: ReactNode;
}

// @cpt-dod:cpt-template-site-blocks-dod-docs-blocks-action-row:p1
// @cpt-algo:cpt-template-site-blocks-algo-docs-blocks-action-row:p1
/** A row of actions in a page's body: side by side with a gap, one under the other on a phone. */
export function ActionRow({ children }: ActionRowProps) {
  // @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-action-row:p1:inst-row
  return <div className={styles.row}>{children}</div>;
  // @cpt-end:cpt-template-site-blocks-algo-docs-blocks-action-row:p1:inst-row
}
