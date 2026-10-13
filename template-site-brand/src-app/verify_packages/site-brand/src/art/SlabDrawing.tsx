import { useId } from 'react';
import styles from './SlabDrawing.module.css';

export interface SlabDrawingProps {
  /** One sentence for assistive technology; without it the drawing is not named. */
  label?: string;
  /** The stylesheet class the art that frames the drawing gives it. */
  className?: string;
}

// @cpt-algo:cpt-template-site-brand-algo-brand-art-slab:p1
/**
 * The application slab of the brand art: matte clay panels (chassis, navigation rail, search bar, a raised module card, side cards and content rows) with indigo accents and a lilac glow under the module, on a 1200 by 540 drawing. The hero shows it tilted and cropped; the closing visual shows it front-on. Its parts carry classes the framing art animates.
 */
export function SlabDrawing({ label, className }: SlabDrawingProps) {
  // @cpt-begin:cpt-template-site-brand-algo-brand-art-slab:p1:inst-slab-ids
  // Gradient ids are document-wide inside a shadow root, so each drawing names its own.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const clay = `${uid}-clay`;
  const card = `${uid}-card`;
  const indigo = `${uid}-indigo`;
  const named = label !== undefined;
  // @cpt-end:cpt-template-site-brand-algo-brand-art-slab:p1:inst-slab-ids
  return (
    <svg
      className={className ? `${styles.svg} ${className}` : styles.svg}
      viewBox="0 0 1200 540"
      role={named ? 'img' : undefined}
      aria-label={label}
      aria-hidden={named ? undefined : true}
      focusable="false"
    >
      <defs>
        <linearGradient id={clay} x1="0" y1="0" x2="0" y2="1">
          <stop className={styles.clayTop} offset="0" />
          <stop className={styles.clayBottom} offset="1" />
        </linearGradient>
        <linearGradient id={card} x1="0" y1="0" x2="0" y2="1">
          <stop className={styles.cardTop} offset="0" />
          <stop className={styles.cardBottom} offset="1" />
        </linearGradient>
        <linearGradient id={indigo} x1="0" y1="0" x2="1" y2="1">
          <stop className={styles.indigoA} offset="0" />
          <stop className={styles.indigoB} offset="1" />
        </linearGradient>
      </defs>

      {/* @cpt-begin:cpt-template-site-brand-algo-brand-art-slab:p1:inst-slab-frame */}
      <g className={`${styles.part} ${styles.chassis}`} data-part="chassis">
        <rect className={styles.edge} x="0" y="18" width="1200" height="520" rx="56" />
        <rect className={styles.slab} x="0" y="0" width="1200" height="520" rx="56" fill={`url(#${clay})`} />
        <rect className={styles.well} x="332" y="146" width="696" height="200" rx="30" />
        <rect className={styles.divider} x="318" y="40" width="2" height="480" />
      </g>

      <g className={`${styles.part} ${styles.nav}`} data-part="nav">
        <rect className={styles.barSoft} x="72" y="46" width="170" height="14" rx="7" />
        <g className={styles.lift}>
          <rect x="44" y="104" width="190" height="52" rx="12" fill={`url(#${indigo})`} />
          <rect className={styles.onAccent} x="98" y="124" width="82" height="10" rx="5" />
        </g>
        {[0, 1, 2, 3].map((row) => (
          <g key={row}>
            <rect className={styles.chip} x={44 - row * 6} y={196 + row * 62} width="24" height="24" rx="7" />
            <rect className={styles.bar} x={84 - row * 6} y={202 + row * 62} width={row % 2 === 0 ? 120 : 140} height="12" rx="6" />
          </g>
        ))}
      </g>

      {/* @cpt-end:cpt-template-site-brand-algo-brand-art-slab:p1:inst-slab-frame */}
      {/* @cpt-begin:cpt-template-site-brand-algo-brand-art-slab:p1:inst-slab-cards */}
      <g className={`${styles.part} ${styles.lift} ${styles.search}`} data-part="search">
        <rect className={styles.card} x="352" y="38" width="650" height="64" rx="18" fill={`url(#${card})`} />
        <circle className={styles.searchRing} cx="394" cy="70" r="11" />
        <rect className={styles.searchHandle} x="403" y="80" width="12" height="4" rx="2" transform="rotate(45 403 80)" />
        <rect className={styles.bar} x="428" y="64" width="270" height="12" rx="6" />
      </g>

      <g className={`${styles.part} ${styles.module}`} data-part="module">
        <rect className={styles.glow} x="350" y="170" width="664" height="176" rx="26" />
        <g className={styles.liftStrong}>
          <rect className={styles.card} x="356" y="164" width="652" height="158" rx="20" fill={`url(#${card})`} />
          <rect className={styles.tile} x="396" y="198" width="76" height="76" rx="18" />
          {[0, 1, 2, 3].map((index) => (
            <rect key={index} className={styles.onAccent} x={414 + (index % 2) * 22} y={216 + Math.floor(index / 2) * 22} width="14" height="14" rx="4" />
          ))}
          <rect className={styles.bar} x="512" y="206" width="300" height="12" rx="6" />
          <rect className={styles.barSoft} x="512" y="240" width="270" height="10" rx="5" />
          <rect className={styles.pill} x="876" y="214" width="84" height="42" rx="10" />
          <rect className={styles.onAccent} x="902" y="232" width="32" height="7" rx="3.5" />
        </g>
      </g>

      <g className={`${styles.part} ${styles.lift} ${styles.side}`} data-part="side">
        <rect className={styles.card} x="1048" y="38" width="124" height="116" rx="20" fill={`url(#${card})`} />
        <rect className={styles.bar} x="1074" y="72" width="72" height="9" rx="4.5" />
        <rect className={styles.pill} x="1074" y="100" width="40" height="9" rx="4.5" />
        <rect className={styles.card} x="1048" y="240" width="124" height="130" rx="20" fill={`url(#${card})`} />
        <rect className={styles.bar} x="1076" y="262" width="68" height="8" rx="4" />
        <rect className={styles.chip} x="1080" y="326" width="16" height="16" rx="5" />
        <rect className={styles.chip} x="1108" y="318" width="18" height="24" rx="5" />
        <rect className={styles.pill} x="1138" y="302" width="14" height="40" rx="5" />
      </g>

      <g className={`${styles.part} ${styles.content}`} data-part="content">
        {[0, 1].map((row) => (
          <g key={row}>
            <rect className={styles.chip} x={356} y={390 + row * 56} width="22" height="22" rx="7" />
            <rect className={styles.bar} x={408} y={395 + row * 56} width={row === 0 ? 240 : 270} height="12" rx="6" />
            <rect className={styles.barSoft} x={880} y={396 + row * 56} width="110" height="10" rx="5" />
          </g>
        ))}
      </g>
      {/* @cpt-end:cpt-template-site-brand-algo-brand-art-slab:p1:inst-slab-cards */}
    </svg>
  );
}
