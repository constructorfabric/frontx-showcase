import { SlabDrawing } from './SlabDrawing';
import styles from './ClosingVisual.module.css';

export interface ClosingVisualProps {
  /** One sentence for assistive technology. Without it the visual is decoration and hidden from them. */
  label?: string;
}

// @cpt-algo:cpt-template-site-brand-algo-brand-art-slab:p1
/**
 * The closing visual: the application slab, assembled and seen nearly front-on, centred in a wide frame under a soft light. It fills the width of its slot; its height follows the viewport (164px on a phone, 340px on a wide screen) unless the slot sets one. A light island in both site themes, drawn for the night band.
 */
export function ClosingVisual({ label }: ClosingVisualProps) {
  // @cpt-begin:cpt-template-site-brand-algo-brand-art-slab:p1:inst-closing-frame
  return (
    <div className={styles.frame} data-theme="light" aria-hidden={label === undefined ? true : undefined}>
      <div className={styles.light} />
      <div className={styles.stage}>
        <SlabDrawing label={label} className={styles.drawing} />
      </div>
    </div>
  );
  // @cpt-end:cpt-template-site-brand-algo-brand-art-slab:p1:inst-closing-frame
}
