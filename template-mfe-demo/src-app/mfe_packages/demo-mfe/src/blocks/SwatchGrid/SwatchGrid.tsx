import styles from './SwatchGrid.module.css';

// @cpt-dod:cpt-template-mfe-demo-dod-screen-entries-screen-blocks:p2
// @cpt-algo:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2
// @cpt-begin:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2:inst-swatches
/** The seven colour pairs of the shell's palette a swatch can paint. */
export const SWATCH_TOKENS = ['background', 'foreground', 'primary', 'secondary', 'muted', 'accent', 'destructive'] as const;

export type SwatchToken = (typeof SWATCH_TOKENS)[number];

export interface Swatch {
  token: SwatchToken;
  /** The colour's name, as the screen's strings give it. */
  name: string;
}

export interface SwatchGridProps {
  swatches: readonly Swatch[];
}

/** The token pair a swatch paints: its surface and the text on it. The foreground swatch paints the pair in reverse. */
function pairOf(token: SwatchToken): string {
  if (token === 'foreground') return '--foreground / --background';
  if (token === 'background') return '--background / --foreground';
  return `--${token} / --${token}-foreground`;
}

/*
 * Swatches of the palette in a two-column grid, each painted with its token pair's current values and captioned with the pair's names. The kit has no swatch component, so the paint and the type of a swatch are rows of the exemptions ledger.
 */
export function SwatchGrid({ swatches }: SwatchGridProps) {
  return (
    <ul className={styles.grid}>
      {swatches.map((swatch) => (
        <li key={swatch.token} className={styles.swatch} data-token={swatch.token}>
          <span className={styles.name}>{swatch.name}</span>
          <code className={styles.pair}>{pairOf(swatch.token)}</code>
        </li>
      ))}
    </ul>
  );
}
// @cpt-end:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2:inst-swatches
