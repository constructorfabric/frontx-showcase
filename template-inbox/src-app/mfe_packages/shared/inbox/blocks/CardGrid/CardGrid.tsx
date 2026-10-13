import type { ReactNode } from 'react';
import styles from './CardGrid.module.css';

export type CardGridProps = {
  /** The cards of the row, in reading order. */
  children: ReactNode;
};

/**
 * The dashboard's board: the body of its page pane, a column of card rows
 * that scrolls on its own inside `--space-6` of padding, `--space-6` between
 * the rows. Every row keeps its content height: the pane scrolls rather than
 * squeezing a card.
 */
// @cpt-dod:cpt-template-inbox-dod-screen-frame-blocks:p2
export function CardBoard({ children }: CardGridProps) {
  return <div className={styles.board}>{children}</div>;
}

/** Four equal cards; two per line below the dashboard's wide width, one below its narrow width. */
export function CardRowQuad({ children }: CardGridProps) {
  return <div className={styles.rowQuad}>{children}</div>;
}

/** A leading card a little wider than the two after it, all three as tall as the tallest; one column below the wide width. */
export function CardRowTrio({ children }: CardGridProps) {
  return <div className={styles.rowTrio}>{children}</div>;
}

/** A wide card and a narrow one, each at its own height; one column below the wide width. */
export function CardRowWideNarrow({ children }: CardGridProps) {
  return <div className={styles.rowWideNarrow}>{children}</div>;
}

/** A narrow card and one twice as wide, each at its own height; one column below the wide width. */
export function CardRowNarrowWide({ children }: CardGridProps) {
  return <div className={styles.rowNarrowWide}>{children}</div>;
}

/** Four equal items inside one card (a strip of metrics); two per line below the wide width, one below the narrow width. */
export function CardStrip({ children }: CardGridProps) {
  return <div className={styles.strip}>{children}</div>;
}
