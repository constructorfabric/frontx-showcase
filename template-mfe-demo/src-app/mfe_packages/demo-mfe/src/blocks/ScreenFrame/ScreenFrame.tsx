import type { ComponentPropsWithRef } from 'react';
import { kitThemeScopeFor } from '../../shared/kitThemeScope';
import styles from './ScreenFrame.module.css';

// @cpt-dod:cpt-template-mfe-demo-dod-screen-entries-screen-blocks:p2
// @cpt-algo:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2
// @cpt-begin:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2:inst-screen-frame
export interface ScreenFrameProps extends Omit<ComponentPropsWithRef<'div'>, 'className' | 'style'> {
  /** The shell's theme identifier; the frame scopes the kit's tokens to the matching kit scope. Absent, the frame takes the scope its shadow host carries. */
  theme?: string;
  /** The frame stands for content that is still loading: it becomes a status region announced as busy. */
  busy?: boolean;
}

/*
 * The root of a demo screen inside its shadow root: the column every section of the screen sits in, filling the host's height. With a theme it carries the kit's `data-theme` scope, whose kit rule also paints the frame's surface, text colour and typeface; without one it inherits them from the shadow host.
 */
export function ScreenFrame({ theme, busy, children, ...props }: ScreenFrameProps) {
  return (
    <div
      {...props}
      className={styles.frame}
      data-theme={theme === undefined ? undefined : kitThemeScopeFor(theme)}
      role={busy ? 'status' : undefined}
      aria-busy={busy ? true : undefined}
    >
      {children}
    </div>
  );
}
// @cpt-end:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2:inst-screen-frame
