import type { MouseEvent } from 'react';
import styles from './SkipLink.module.css';

/**
 * The page's first focusable element: hidden until it takes focus, then it moves focus to the element `targetId` names, so a keyboard user passes the header in one step. Fills the kit gap "skip link".
 *
 * The click moves focus itself instead of following the fragment: following it would add a history entry for a focus move and leave `#content` in the address, which the framework router then copies verbatim through every later write (routing ADR 0003), so it would reach shared and bookmarked links. The screen's content sits in a shadow root, so the target is the shell's screen container in the document.
 */
// @cpt-algo:cpt-site-algo-shell-layout-navigation-page-frame:p1
export function SkipLink({ targetId, label }: { targetId: string; label: string }) {
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-skip-link
  const skip = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(targetId);
    if (!target) return;
    event.preventDefault();
    // The page stays where it is, as after V2's fragment jump under its sticky header; the next Tab brings its target into view.
    target.focus({ preventScroll: true });
  };
  return (
    <a className={styles.link} href={`#${targetId}`} onClick={skip}>
      {label}
    </a>
  );
  // @cpt-end:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-skip-link
}
