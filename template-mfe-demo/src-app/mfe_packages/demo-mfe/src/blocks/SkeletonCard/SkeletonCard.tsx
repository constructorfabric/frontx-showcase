import { Card, CardContent, Skeleton } from '@gears-frontx/ui-kit';
import styles from './SkeletonCard.module.css';

// @cpt-dod:cpt-template-mfe-demo-dod-screen-entries-screen-blocks:p2
// @cpt-algo:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2
// @cpt-begin:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2:inst-skeletons
export interface SkeletonCardProps {
  /** The card alone stands for content that is loading: it becomes a status region announced as busy. Leave it off inside a frame that already announces the state. */
  busy?: boolean;
}

/*
 * A card of three placeholder lines, the last one short, standing in for a card of text while it loads. The kit's Skeleton carries no size and no loading semantics of its own: the block sizes the lines and the caller (or `busy`) announces the state.
 */
export function SkeletonCard({ busy }: SkeletonCardProps) {
  return (
    <Card>
      <CardContent>
        <div className={styles.lines} role={busy ? 'status' : undefined} aria-busy={busy ? true : undefined}>
          <Skeleton aria-hidden="true" className={styles.line} />
          <Skeleton aria-hidden="true" className={styles.line} />
          <Skeleton aria-hidden="true" className={styles.lineShort} />
        </div>
      </CardContent>
    </Card>
  );
}
// @cpt-end:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2:inst-skeletons
