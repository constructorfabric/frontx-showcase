import type { ReactNode } from 'react';
import { box, cylinder, plane, polygon, polyline, ring, segment, type Point, type View } from './iso';
import styles from './HairlineFigure.module.css';

/** The figures of the family: `hub` a host tile wired to the tiles around it, `riffle` a tray of upright cards, `turntable` a dial carrying blocks, `rebuild` a tree of tiles, `loupe` a lens over a ruled sheet, `rest` three plates at rest on posts. */
export type HairlineStock = 'hub' | 'riffle' | 'turntable' | 'rebuild' | 'loupe' | 'rest';

export interface HairlineFigureProps {
  stock: HairlineStock;
  /** One sentence for assistive technology. Without it the figure is decoration and hidden from them. */
  label?: string;
}

type Tone = 'hi' | 'edge';

// @cpt-begin:cpt-template-site-brand-algo-brand-art-hairline-figure:p1:inst-shapes
/** A box with its two visible sides shaded and its top on the plate colour, outlined in the tone. */
function Box({ view, at, size, z0 = 0, tone = 'edge' }: { view: View; at: [number, number]; size: [number, number, number]; z0?: number; tone?: Tone }) {
  const faces = box(view, at[0], at[1], size[0], size[1], size[2], z0);
  const stroke = tone === 'hi' ? styles.hi : styles.edge;
  return (
    <g className={stroke}>
      <path className={styles.side} d={faces.right} />
      <path className={styles.side} d={faces.left} />
      <path className={styles.face} d={faces.top} />
    </g>
  );
}

function Cylinder({ view, at, r, h, z0 = 0, tone = 'edge' }: { view: View; at: [number, number]; r: number; h: number; z0?: number; tone?: Tone }) {
  const shape = cylinder(view, at[0], at[1], r, h, z0);
  return (
    <g className={tone === 'hi' ? styles.hi : styles.edge}>
      <path className={styles.side} d={shape.side} />
      <path className={styles.face} d={shape.top} />
    </g>
  );
}

function Line({ view, from, to, kind = 'mid' }: { view: View; from: Point; to: Point; kind?: 'mid' | 'lo' | 'dash' | 'hi' }) {
  const className = kind === 'dash' ? `${styles.mid} ${styles.dash}` : styles[kind];
  return <path className={className} d={segment(view, from, to)} />;
}

// @cpt-end:cpt-template-site-brand-algo-brand-art-hairline-figure:p1:inst-shapes

// @cpt-begin:cpt-template-site-brand-algo-brand-art-hairline-figure:p1:inst-hub
/** The host tile in the middle of a floor grid, wired to the eight tiles around it. */
function Hub() {
  const view: View = { ox: 200, oy: 162, unit: 17 };
  const grid: ReactNode[] = [];
  for (let step = -6; step <= 6; step += 2) {
    grid.push(<Line key={`x${step}`} view={view} from={[step, -6, 0]} to={[step, 6, 0]} kind="lo" />);
    grid.push(<Line key={`y${step}`} view={view} from={[-6, step, 0]} to={[6, step, 0]} kind="lo" />);
  }
  const around: Array<[number, number]> = [
    [-4.4, -4.4],
    [-0.7, -5],
    [-5, -0.7],
    [3.2, -3.9],
    [-3.9, 3.2],
    [3.6, 0.2],
    [0.2, 3.6],
    [3.2, 3.2],
  ];
  return (
    <>
      {grid}
      {around.map(([x, y]) => (
        <Line key={`w${x}${y}`} view={view} from={[0, 0, 0.35]} to={[x + 0.7, y + 0.7, 0.2]} kind="dash" />
      ))}
      <g className={styles.lift}>
        {around
          .slice()
          .sort((a, b) => a[0] + a[1] - (b[0] + b[1]))
          .map(([x, y]) => (
            <Box key={`t${x}${y}`} view={view} at={[x, y]} size={[1.4, 1.4, 0.45]} />
          ))}
      </g>
      <g className={styles.liftStrong}>
        <Box view={view} at={[-1.7, -1.7]} size={[3.4, 3.4, 0.75]} tone="hi" />
        <path className={styles.hi} d={plane(view, -0.85, -0.85, 1.7, 1.7, 0.75)} />
      </g>
    </>
  );
}
// @cpt-end:cpt-template-site-brand-algo-brand-art-hairline-figure:p1:inst-hub

// @cpt-begin:cpt-template-site-brand-algo-brand-art-hairline-figure:p1:inst-riffle
/** A tray of upright cards, fanned from the back to the front. */
function Riffle() {
  const view: View = { ox: 200, oy: 204, unit: 24 };
  const tray = box(view, -4.4, -2.6, 8.8, 5.2, 1.3);
  const cards = [-3.3, -2.4, -1.5, -0.6, 0.3, 1.2, 2.1, 3];
  return (
    <>
      <path className={`${styles.side} ${styles.edge}`} d={plane(view, -4.4, -2.6, 8.8, 5.2, 0)} />
      <path
        className={styles.mid}
        d={polyline(view, [
          [-4.4, 2.6, 1.3],
          [-4.4, -2.6, 1.3],
          [4.4, -2.6, 1.3],
        ])}
      />
      <g className={styles.riffle}>
        {cards.map((x, index) => {
          const top = 4.2 + (index % 3) * 0.35;
          const tab = -2 + (index % 4) * 0.9;
          const front = index === cards.length - 1;
          return (
            <g key={x} className={styles.card}>
              <path
                className={`${styles.face} ${front ? styles.hi : styles.edge}`}
                d={polygon(view, [
                  [x, -2.2, 0.4],
                  [x, 2.2, 0.4],
                  [x, 2.2, top],
                  [x, tab + 1.2, top],
                  [x, tab + 0.9, top + 0.45],
                  [x, tab + 0.1, top + 0.45],
                  [x, tab - 0.2, top],
                  [x, -2.2, top],
                ])}
              />
              {front
                ? [1.1, 1.8, 2.5, 3.2].map((z) => <Line key={z} view={view} from={[x, -1.6, z]} to={[x, 1.4 - (z % 1), z]} kind="lo" />)
                : null}
            </g>
          );
        })}
      </g>
      <g className={styles.edge}>
        <path className={styles.face} d={tray.right} />
        <path className={styles.face} d={tray.left} />
        <path className={styles.hi} d={polygon(view, [
          [-1.6, 2.6, 0.45],
          [0.4, 2.6, 0.45],
          [0.4, 2.6, 0.85],
          [-1.6, 2.6, 0.85],
        ])} />
      </g>
    </>
  );
}
// @cpt-end:cpt-template-site-brand-algo-brand-art-hairline-figure:p1:inst-riffle

// @cpt-begin:cpt-template-site-brand-algo-brand-art-hairline-figure:p1:inst-turntable
/** A dial with a ticked rim carrying a few blocks and a column. */
function Turntable() {
  const view: View = { ox: 200, oy: 176, unit: 25 };
  const dial = cylinder(view, 0, 0, 5.6, 0.7);
  const ticks: ReactNode[] = [];
  for (let degree = 0; degree < 360; degree += 15) {
    const angle = (degree * Math.PI) / 180;
    const inner = degree % 45 === 0 ? 4.7 : 5.05;
    ticks.push(<Line key={degree} view={view} from={[inner * Math.cos(angle), inner * Math.sin(angle), 0.7]} to={[5.4 * Math.cos(angle), 5.4 * Math.sin(angle), 0.7]} kind="mid" />);
  }
  return (
    <>
      <g className={styles.edge}>
        <path className={styles.side} d={dial.side} />
        <path className={styles.face} d={dial.top} />
      </g>
      <path className={styles.lo} d={ring(view, 0, 0, 3.9, 0.7)} />
      {ticks}
      <g className={styles.lift}>
        <Box view={view} at={[0.2, -3.3]} size={[1.3, 1.3, 1]} z0={0.7} />
        <Box view={view} at={[-3, -1.6]} size={[1.9, 1.9, 1.7]} z0={0.7} tone="hi" />
        <Box view={view} at={[-2.6, -1.2]} size={[1.1, 1.1, 0.9]} z0={2.4} tone="hi" />
      </g>
      <g className={styles.liftStrong}>
        <Cylinder view={view} at={[2.3, 0]} r={0.75} h={2.8} z0={0.7} />
      </g>
      <g className={styles.lift}>
        <Box view={view} at={[-1, 1.5]} size={[1.6, 1.1, 0.7]} z0={0.7} />
      </g>
    </>
  );
}
// @cpt-end:cpt-template-site-brand-algo-brand-art-hairline-figure:p1:inst-turntable

// @cpt-begin:cpt-template-site-brand-algo-brand-art-hairline-figure:p1:inst-rebuild
/** A tree of tiles: one at the top, two below it, five along the bottom. */
function Rebuild() {
  const view: View = { ox: 200, oy: 196, unit: 22 };
  const root: [number, number] = [-5, -5];
  const middle: Array<[number, number]> = [
    [-3.8, 0.2],
    [0.2, -3.8],
  ];
  const leaves: Array<[number, number]> = [
    [-3, 5],
    [-1, 3],
    [1, 1],
    [3, -1],
    [5, -3],
  ];
  const centre = ([x, y]: [number, number], size: number, z: number): Point => [x + size / 2, y + size / 2, z];
  return (
    <>
      {middle.map((node) => (
        <Line key={`r${node[0]}`} view={view} from={centre(root, 2, 0)} to={centre(node, 1.6, 0.5)} />
      ))}
      {leaves.map((leaf, index) => (
        <Line key={`l${leaf[0]}`} view={view} from={centre(middle[index < 2 ? 0 : index > 2 ? 1 : index % 2], 1.6, 0)} to={centre(leaf, 1.4, 0.45)} />
      ))}
      <g className={styles.liftStrong}>
        <Box view={view} at={root} size={[2, 2, 0.6]} tone="hi" />
      </g>
      <g className={styles.lift}>
        {middle.map((node) => (
          <Box key={`m${node[0]}`} view={view} at={node} size={[1.6, 1.6, 0.5]} />
        ))}
      </g>
      <g className={styles.rebuild}>
        {leaves.map((leaf) => (
          <g key={`b${leaf[0]}`} className={styles.card}>
            <Box view={view} at={leaf} size={[1.4, 1.4, 0.45]} />
          </g>
        ))}
      </g>
    </>
  );
}
// @cpt-end:cpt-template-site-brand-algo-brand-art-hairline-figure:p1:inst-rebuild

// @cpt-begin:cpt-template-site-brand-algo-brand-art-hairline-figure:p1:inst-loupe
/** A lens held over a ruled sheet on a thin stem, with its shadow on the sheet. */
function Loupe() {
  const view: View = { ox: 200, oy: 168, unit: 23 };
  const rules: ReactNode[] = [];
  for (let y = -2.6; y <= 3; y += 0.8) {
    rules.push(<Line key={y} view={view} from={[-4.3, y, 0.35]} to={[y > 1 ? 1.5 : 4.3, y, 0.35]} kind="lo" />);
  }
  return (
    <>
      <Box view={view} at={[-5, -3.5]} size={[10, 7, 0.35]} />
      {rules}
      <path className={`${styles.lo} ${styles.shade}`} d={ring(view, -0.6, -0.4, 2.1, 0.35)} />
      <g className={styles.liftStrong}>
        <Line view={view} from={[-0.6, -0.4, 0.35]} to={[-0.6, -0.4, 2.6]} kind="mid" />
        <path className={`${styles.face} ${styles.glass} ${styles.hi}`} d={ring(view, -0.6, -0.4, 2.3, 2.6)} />
        <path className={styles.edge} d={ring(view, -0.6, -0.4, 1.95, 2.6)} />
        <Line view={view} from={[-1.9, -0.9, 2.6]} to={[0.7, -0.9, 2.6]} kind="hi" />
        <Line view={view} from={[-1.9, 0.1, 2.6]} to={[0.7, 0.1, 2.6]} kind="hi" />
      </g>
    </>
  );
}
// @cpt-end:cpt-template-site-brand-algo-brand-art-hairline-figure:p1:inst-loupe

// @cpt-begin:cpt-template-site-brand-algo-brand-art-hairline-figure:p1:inst-rest
/** Three plates stacked on posts, the top one outlined in the accent. */
function Rest() {
  const view: View = { ox: 200, oy: 204, unit: 25 };
  const posts: Array<[number, number]> = [
    [-3.4, -2.4],
    [3.4, -2.4],
    [-3.4, 2.4],
    [3.4, 2.4],
  ];
  const levels = [0, 1.6, 3.2];
  return (
    <>
      {levels.map((z, level) => (
        <g key={z} className={level === 0 ? undefined : level === 1 ? styles.lift : styles.liftStrong}>
          {level > 0 ? posts.map(([x, y]) => <Cylinder key={`${x}${y}`} view={view} at={[x, y]} r={0.22} h={1.1} z0={z - 1.1} />) : null}
          <Box view={view} at={[-4.2, -3.2]} size={[8.4, 6.4, 0.5]} z0={z} tone={level === 2 ? 'hi' : 'edge'} />
        </g>
      ))}
      <path className={styles.mid} d={plane(view, -2.4, -1.6, 4.8, 3.2, 3.7)} />
    </>
  );
}
// @cpt-end:cpt-template-site-brand-algo-brand-art-hairline-figure:p1:inst-rest

const STOCKS: Record<HairlineStock, () => ReactNode> = {
  hub: Hub,
  riffle: Riffle,
  turntable: Turntable,
  rebuild: Rebuild,
  loupe: Loupe,
  rest: Rest,
};

// @cpt-dod:cpt-template-site-brand-dod-brand-art-figures:p1
// @cpt-algo:cpt-template-site-brand-algo-brand-art-hairline-figure:p1
/**
 * One line-art figure of the brand's hairline family: an isometric drawing on a 400 by 320 grid (5:4), outlined in a thin stroke that stays the same width at every size, filled with the plate colour and shaded on its sides. It fills the width of its slot. Parts of the figure lift when the figure or a link around it is hovered, unless the visitor asked for reduced motion.
 */
export function HairlineFigure({ stock, label }: HairlineFigureProps) {
  const Stock = STOCKS[stock];
  // @cpt-begin:cpt-template-site-brand-algo-brand-art-hairline-figure:p1:inst-name
  const named = label !== undefined;
  return (
    <svg
      className={styles.figure}
      viewBox="0 0 400 320"
      data-stock={stock}
      role={named ? 'img' : undefined}
      aria-label={label}
      aria-hidden={named ? undefined : true}
      focusable="false"
    >
      <Stock />
    </svg>
  );
  // @cpt-end:cpt-template-site-brand-algo-brand-art-hairline-figure:p1:inst-name
}
