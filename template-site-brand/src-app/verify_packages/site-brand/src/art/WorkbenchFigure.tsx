import type { ReactNode } from 'react';
import styles from './WorkbenchFigure.module.css';

export interface WorkbenchFigureProps {
  /** The task given to an agent, on the bar across the top; it may carry emphasis. */
  task: ReactNode;
  /** The diff at the left: the file's path as its heading, then the removed and the added line. */
  diff: { path: string; removed: string; added: string };
  /** The preview at the right: its heading, then a small window with the navigation entry, the changed title and the text under it. */
  result: { label: string; navLabel: string; title: string; text: string };
}

// @cpt-begin:cpt-template-site-brand-algo-brand-art-workbench-figure:p1:inst-icons
/** The small line icons of the workbench: a branch for the task, a file for the diff, a window for the preview. */
function Icon({ kind, className }: { kind: 'branch' | 'file' | 'window'; className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {kind === 'branch' ? (
        <>
          <circle cx="6" cy="18" r="2.5" />
          <circle cx="18" cy="6" r="2.5" />
          <path d="M6 4v11.5M18 8.5c0 5-6 4-11 7.5" />
        </>
      ) : kind === 'file' ? (
        <>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5M10 12l-2 2 2 2M14 12l2 2-2 2" />
        </>
      ) : (
        <>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 9h18M9 9v11" />
        </>
      )}
    </svg>
  );
}
// @cpt-end:cpt-template-site-brand-algo-brand-art-workbench-figure:p1:inst-icons

// @cpt-algo:cpt-template-site-brand-algo-brand-art-workbench-figure:p1
/**
 * A change told as one workbench: the task on a tinted bar across the top, then the diff beside a preview of the result, each panel under a one-row heading with an icon. Every surface and every text takes the workbench's own palette, light or dark with the page, so its text keeps its contrast in both site themes. It fills the width of its slot; on a phone the panels stack.
 */
export function WorkbenchFigure({ task, diff, result }: WorkbenchFigureProps) {
  return (
    <div className={styles.story}>
      {/* @cpt-begin:cpt-template-site-brand-algo-brand-art-workbench-figure:p1:inst-task */}
      <div className={styles.task}>
        <Icon kind="branch" className={styles.taskIcon} />
        <blockquote className={styles.taskText}>{task}</blockquote>
      </div>
      {/* @cpt-end:cpt-template-site-brand-algo-brand-art-workbench-figure:p1:inst-task */}
      <div className={styles.body}>
        {/* @cpt-begin:cpt-template-site-brand-algo-brand-art-workbench-figure:p1:inst-diff */}
        <figure className={`${styles.panel} ${styles.diffPanel}`}>
          <figcaption className={styles.heading}>
            <Icon kind="file" className={styles.headingIcon} />
            {diff.path}
          </figcaption>
          <pre className={styles.diff}>
            <code>
              <span className={styles.removed}>
                <span className={styles.sign} aria-hidden="true">
                  -
                </span>
                {diff.removed}
              </span>
              <span className={styles.added}>
                <span className={styles.sign} aria-hidden="true">
                  +
                </span>
                {diff.added}
              </span>
            </code>
          </pre>
        </figure>
        {/* @cpt-end:cpt-template-site-brand-algo-brand-art-workbench-figure:p1:inst-diff */}
        {/* @cpt-begin:cpt-template-site-brand-algo-brand-art-workbench-figure:p1:inst-preview */}
        <figure className={`${styles.panel} ${styles.previewPanel}`}>
          <figcaption className={styles.heading}>
            <Icon kind="window" className={styles.headingIcon} />
            {result.label}
          </figcaption>
          <div className={styles.window}>
            <div className={styles.rail}>
              <span className={styles.railLine} />
              <span className={styles.railLine} />
              <span className={styles.navItem}>{result.navLabel}</span>
            </div>
            <div className={styles.screen}>
              <p className={styles.screenTitle}>{result.title}</p>
              <p className={styles.screenText}>{result.text}</p>
              <span className={styles.line} />
              <span className={styles.lineShort} />
            </div>
          </div>
        </figure>
        {/* @cpt-end:cpt-template-site-brand-algo-brand-art-workbench-figure:p1:inst-preview */}
      </div>
    </div>
  );
}
