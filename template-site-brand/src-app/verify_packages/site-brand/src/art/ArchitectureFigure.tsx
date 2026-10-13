import { cloneElement, type ReactElement, type ReactNode } from 'react';
import styles from './ArchitectureFigure.module.css';

/** An anchor or the application's router link, with its destination and no children; the figure gives it its class and its text. */
export type FigureLink = ReactElement;

type LinkProps = { className?: string; children?: ReactNode; 'aria-label'?: string };

export interface ArchitectureSource {
  /** The short line above the title. */
  note: string;
  /** The title; a newline breaks the line. */
  title: string;
  link: FigureLink;
}

export interface ArchitectureScreen {
  title: string;
  /** Added after the title to the link's accessible name, to say where the block's link goes. */
  hint?: string;
  link: FigureLink;
}

export interface ArchitectureFigureProps {
  /** The figure's accessible name: one sentence for the whole picture. */
  label: string;
  /** The shared component library, top left (top left on a phone too). */
  kit: ArchitectureSource;
  /** The design rules, bottom left (top right on a phone). */
  rules: ArchitectureSource;
  /** The host application at the right, holding the screens: its title link and the link along its bottom edge. */
  shell: { title: string; link: FigureLink; templates: { label: string; link: FigureLink } };
  /** The two screens inside the shell; the second takes the lilac accent. */
  screens: readonly [ArchitectureScreen, ArchitectureScreen];
  /** The labels on the wires from the kit and from the rules. */
  wires: { kit: string; rules: string };
}

/** The link with the figure's class and text; a name, when given, starts with the visible text and says where the link goes. */
function link(target: FigureLink, className: string, children: ReactNode, name?: string) {
  return cloneElement(target as ReactElement<LinkProps>, name === undefined ? { className, children } : { className, children, 'aria-label': name });
}

/** An arrow pointing up and to the right, drawn in the text colour. */
function Arrow({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7.5 16.5 16.5 7.5M9 7.5h7.5V15" />
    </svg>
  );
}

// @cpt-begin:cpt-template-site-brand-algo-brand-art-architecture-figure:p1:inst-wires
/** The wires on the wide canvas (1120 by 480) and on a phone's tall canvas (360 by 630): the kit's wire forks to both screens, the rules' dashed wire runs into the shell. */
function Wires({ tall }: { tall: boolean }) {
  return (
    <svg className={tall ? styles.wiresTall : styles.wiresWide} viewBox={tall ? '0 0 360 630' : '0 0 1120 480'} aria-hidden="true" focusable="false">
      {tall ? (
        <>
          <path className={styles.wire} d="M96 156V176Q96 192 80 192H60Q44 192 44 208V337Q44 353 60 353H82" />
          <path className={styles.wire} d="M44 268V438Q44 454 60 454H82" />
          <path className={styles.guidance} d="M268 156V196Q268 212 252 212H244Q236 212 236 220V252" />
          <circle className={styles.junction} cx="44" cy="268" r="4" />
          {[
            [96, 156],
            [82, 353],
            [82, 454],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} className={styles.terminal} cx={cx} cy={cy} r="4" />
          ))}
          <circle className={`${styles.terminal} ${styles.terminalRules}`} cx="268" cy="156" r="4" />
          <circle className={`${styles.terminal} ${styles.terminalRules}`} cx="236" cy="252" r="4" />
        </>
      ) : (
        <>
          <path className={styles.wire} d="M310 160H372Q392 160 392 180V206Q392 226 412 226H570" />
          <path className={styles.wire} d="M392 200V308Q392 328 412 328H570" />
          <path className={styles.guidance} d="M310 344H352Q372 344 372 364V378Q372 398 392 398H508" />
          <circle className={styles.junction} cx="392" cy="200" r="4" />
          {[
            [310, 160],
            [570, 226],
            [570, 328],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} className={styles.terminal} cx={cx} cy={cy} r="5" />
          ))}
          <circle className={`${styles.terminal} ${styles.terminalRules}`} cx="310" cy="344" r="5" />
          <circle className={`${styles.terminal} ${styles.terminalRules}`} cx="508" cy="398" r="5" />
        </>
      )}
    </svg>
  );
}
// @cpt-end:cpt-template-site-brand-algo-brand-art-architecture-figure:p1:inst-wires

// @cpt-algo:cpt-template-site-brand-algo-brand-art-architecture-figure:p1
/**
 * "One shell, independent screens" as a map: the UI kit and the design rules at the left, wired into a shell holding two screens. Every block is a link with real text, so the map reads and navigates like the rest of the page; the wires and the patterns are decoration. The blocks sit on a canvas of fixed proportions, wide on a large screen and tall on a phone, so they keep their places at every width. A light island in both site themes, like the hero art; it fills the width of its slot.
 */
export function ArchitectureFigure({ label, kit, rules, shell, screens, wires }: ArchitectureFigureProps) {
  // @cpt-begin:cpt-template-site-brand-algo-brand-art-architecture-figure:p1:inst-source-blocks
  // A source block's title is its one link; the link's hit area covers the block, so the small note above the title stays plain text.
  const source = (block: ArchitectureSource, className: string) => (
    <div className={`${styles.block} ${className}`}>
      <span className={styles.blockTop}>
        <span className={styles.small}>{block.note}</span>
        <Arrow className={styles.blockArrow} />
      </span>
      {link(block.link, `${styles.blockTitle} ${styles.stretch}`, block.title)}
      <span className={styles.pattern} aria-hidden="true" />
    </div>
  );
  // @cpt-end:cpt-template-site-brand-algo-brand-art-architecture-figure:p1:inst-source-blocks
  // @cpt-begin:cpt-template-site-brand-algo-brand-art-architecture-figure:p1:inst-named-figure
  return (
    <figure className={styles.map} aria-label={label} data-theme="light">
      <div className={styles.canvas}>
        {/* @cpt-end:cpt-template-site-brand-algo-brand-art-architecture-figure:p1:inst-named-figure */}
        {/* @cpt-begin:cpt-template-site-brand-algo-brand-art-architecture-figure:p1:inst-shell */}
        <div className={styles.shell}>
          {link(
            shell.link,
            styles.shellTitle,
            <>
              {shell.title}
              <Arrow className={styles.shellArrow} />
            </>,
          )}
          {link(
            shell.templates.link,
            styles.templatesLink,
            <>
              {shell.templates.label}
              <Arrow className={styles.templatesArrow} />
            </>,
          )}
        </div>
        {/* @cpt-end:cpt-template-site-brand-algo-brand-art-architecture-figure:p1:inst-shell */}
        <Wires tall={false} />
        <Wires tall />
        {source(kit, styles.kit)}
        {source(rules, styles.rules)}
        {/* @cpt-begin:cpt-template-site-brand-algo-brand-art-architecture-figure:p1:inst-screens */}
        {screens.map((screen, index) => (
          <div key={screen.title} className={`${styles.block} ${styles.screen} ${index === 0 ? styles.screenA : styles.screenB}`}>
            {link(screen.link, `${styles.screenTitle} ${styles.stretch}`, screen.title, screen.hint ? `${screen.title}: ${screen.hint}` : undefined)}
            <Arrow className={styles.screenArrow} />
            <span className={styles.pattern} aria-hidden="true" />
          </div>
        ))}
        {/* @cpt-end:cpt-template-site-brand-algo-brand-art-architecture-figure:p1:inst-screens */}
        <span className={styles.reuse}>{wires.kit}</span>
        <span className={styles.rulesLabel}>{wires.rules}</span>
      </div>
    </figure>
  );
}
