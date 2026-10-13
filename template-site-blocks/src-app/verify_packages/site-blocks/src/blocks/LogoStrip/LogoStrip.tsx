import type { ReactElement } from 'react';
import { Heading, Link } from '@gears-frontx/kit-candidates';

import styles from './LogoStrip.module.css';

export interface LogoStripLogo {
  /** The company's name: the logo's alternative text, and so the link's name. */
  name: string;
  /** The logo's image address (a data URI or a file URL), shown in its own colours. */
  image: string;
  /** The logo's size in pixels; on a narrow cell it scales down and keeps its proportions. */
  width: number;
  height: number;
  /** The element the logo's link renders as (an anchor or the router's link, with its destination and no children). */
  link: ReactElement;
}

export interface LogoStripProps {
  /** The heading's id. */
  id: string;
  title: string;
  logos: readonly LogoStripLogo[];
}

/*
 * The teams that use the product: a band held to the page column, the title centred over a row of four equal cells (two columns under 640px), each a company logo in its own colours that links to the company's site.
 */
// @cpt-dod:cpt-template-site-blocks-dod-section-blocks-logo-strip:p1
// @cpt-algo:cpt-template-site-blocks-algo-section-blocks-logo-strip:p1
export function LogoStrip({ id, title, logos }: LogoStripProps) {
  // @cpt-begin:cpt-template-site-blocks-algo-section-blocks-logo-strip:p1:inst-band
  return (
    <section aria-labelledby={id}>
      <div className={styles.column}>
        <Heading id={id} size="display">
          {title}
        </Heading>
        {/* @cpt-begin:cpt-template-site-blocks-algo-section-blocks-logo-strip:p1:inst-logos */}
        <ul className={styles.logos}>
          {logos.map((logo) => (
            <li key={logo.name} className={styles.cell}>
              {/* @cpt-begin:cpt-template-site-blocks-algo-section-blocks-logo-strip:p1:inst-logo */}
              <Link render={logo.link} className={styles.link}>
                <img src={logo.image} alt={logo.name} width={logo.width} height={logo.height} className={styles.logo} />
              </Link>
              {/* @cpt-end:cpt-template-site-blocks-algo-section-blocks-logo-strip:p1:inst-logo */}
            </li>
          ))}
        </ul>
        {/* @cpt-end:cpt-template-site-blocks-algo-section-blocks-logo-strip:p1:inst-logos */}
      </div>
    </section>
  );
  // @cpt-end:cpt-template-site-blocks-algo-section-blocks-logo-strip:p1:inst-band
}
