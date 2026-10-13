import type { ReactNode } from 'react';
import styles from './PaneState.module.css';

export type PaneStateProps = {
  /** What the pane says: a kit `Empty`, a kit `Alert`, a kit `Spinner`. */
  children: ReactNode;
  /** `status` for a loading pane, so assistive technology announces it. */
  role?: 'status';
  /** Set with `role="status"` while the pane stands in for data still loading. */
  'aria-busy'?: boolean;
  /** Names the pane for tests, e.g. `chat-route-not-found`. */
  'data-testid'?: string;
};

/**
 * The pane a screen, a list or a detail area shows instead of its content:
 * loading, a load error, an empty selection, a page the address does not
 * name. It fills the room its content would have taken and centres what it
 * says, so the layout around it does not move when the data arrives.
 */
// @cpt-dod:cpt-template-inbox-dod-screen-frame-blocks:p2
export function PaneState({ children, ...attributes }: PaneStateProps) {
  return (
    <div className={styles.pane} {...attributes}>
      {children}
    </div>
  );
}
