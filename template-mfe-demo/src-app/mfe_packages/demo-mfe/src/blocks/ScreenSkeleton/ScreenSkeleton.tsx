import { Skeleton } from '@gears-frontx/ui-kit';
import { SkeletonCard } from '../SkeletonCard';
import styles from './ScreenSkeleton.module.css';

// @cpt-dod:cpt-template-mfe-demo-dod-screen-entries-screen-blocks:p2
// @cpt-algo:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2
// @cpt-begin:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2:inst-skeletons
/*
 * The placeholder of a whole demo screen while its strings load: a title and a line over a placeholder card. It sits in a ScreenFrame that announces the loading state, so every shape is hidden from assistive technology.
 */
export function ScreenSkeleton() {
  return (
    <>
      <div className={styles.header}>
        <Skeleton aria-hidden="true" className={styles.title} />
        <Skeleton aria-hidden="true" className={styles.line} />
      </div>
      <SkeletonCard />
    </>
  );
}
// @cpt-end:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2:inst-skeletons
