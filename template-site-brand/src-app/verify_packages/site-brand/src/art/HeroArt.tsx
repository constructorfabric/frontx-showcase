import { SlabDrawing } from './SlabDrawing';
import styles from './HeroArt.module.css';

export interface HeroArtProps {
  /** One sentence for assistive technology. Without it the art is decoration and hidden from them. */
  label?: string;
}

// @cpt-algo:cpt-template-site-brand-algo-brand-art-slab:p1
/**
 * The hero art: the application slab seen from above, cropped at the top by a window of fixed height and fading into the hero band at the bottom (`--hero-band`, resolved by the band around it; the brand blue when no band sets it), over a soft lilac and blue aura. It fills the width of its slot and runs a little past both sides, as the band's art row does. A light island in both site themes, like a product shot.
 */
export function HeroArt({ label }: HeroArtProps) {
  // @cpt-begin:cpt-template-site-brand-algo-brand-art-slab:p1:inst-hero-window
  return (
    <div className={styles.scene} data-theme="light" aria-hidden={label === undefined ? true : undefined}>
      <div className={styles.aura} />
      <div className={styles.window}>
        <div className={styles.tilt}>
          <SlabDrawing label={label} />
        </div>
      </div>
    </div>
  );
  // @cpt-end:cpt-template-site-brand-algo-brand-art-slab:p1:inst-hero-window
}
