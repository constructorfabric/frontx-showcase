import { createElement, type ReactElement, type ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Separator } from '@gears-frontx/ui-kit';
import { Card, Heading, Link, Text } from '@gears-frontx/kit-candidates';

import { SectionFrame } from '../SectionFrame/SectionFrame';
import styles from './KitShowcase.module.css';

export interface KitTile {
  title: string;
  /** The element the tile's link renders as (an anchor or the router's link, with its destination and no children); the link covers the tile. */
  link: ReactElement;
  /** A live sample of what the tile links to, built from kit components; it stays inert. */
  sample: ReactNode;
}

export interface KitTileGroup {
  title: string;
  tiles: readonly KitTile[];
}

export interface KitShowcaseProps {
  /** The heading's id. */
  id: string;
  label?: string;
  /** The section title; a newline breaks the line. */
  title: string;
  lead?: string;
  /** The link under the lead: its label and the element it renders as. */
  action?: { label: string; link: ReactElement };
  groups: readonly KitTileGroup[];
}

/*
 * A catalogue of live samples: the section frame with the label, the title, the lead and the link, then titled groups of tiles four across (three under 900px, two under 640px). Each tile is a kit card with an inert sample over a ruled link that covers the whole tile.
 */
// @cpt-dod:cpt-template-site-blocks-dod-section-blocks-kit-showcase:p1
// @cpt-algo:cpt-template-site-blocks-algo-section-blocks-kit-showcase:p1
export function KitShowcase({ id, label, title, lead, action, groups }: KitShowcaseProps) {
  // @cpt-begin:cpt-template-site-blocks-algo-section-blocks-kit-showcase:p1:inst-frame
  const link = action ? (
    <Link render={action.link} className={styles.link}>
      {action.label}
      <ArrowUpRight aria-hidden="true" className={styles.icon} />
    </Link>
  ) : undefined;
  return (
    <div className={styles.band}>
      <SectionFrame id={id} label={label} title={title} lead={lead} action={link}>
        {/* @cpt-begin:cpt-template-site-blocks-algo-section-blocks-kit-showcase:p1:inst-groups */}
        <div className={styles.groups}>
          {groups.map((group) => (
            <div key={group.title}>
              <Heading size="heading-1" render={createElement('h3')} className={styles.groupTitle}>
                {group.title}
              </Heading>
              <ul className={styles.grid}>
                {group.tiles.map((tile) => (
                  <li key={tile.title} className={styles.cell}>
                    {/* @cpt-begin:cpt-template-site-blocks-algo-section-blocks-kit-showcase:p1:inst-tile */}
                    <Card className={styles.tile}>
                      <div className={styles.sample} inert>
                        {tile.sample}
                      </div>
                      <Separator />
                      <Link variant="inherit" render={tile.link} className={styles.tileLink}>
                        {tile.title}
                        <ArrowUpRight aria-hidden="true" className={styles.icon} />
                      </Link>
                    </Card>
                    {/* @cpt-end:cpt-template-site-blocks-algo-section-blocks-kit-showcase:p1:inst-tile */}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* @cpt-end:cpt-template-site-blocks-algo-section-blocks-kit-showcase:p1:inst-groups */}
      </SectionFrame>
    </div>
  );
  // @cpt-end:cpt-template-site-blocks-algo-section-blocks-kit-showcase:p1:inst-frame
}

/*
 * The layout pieces a tile's sample is built with around kit components, so a sample registry needs no stylesheet of its own: a column, a wrapping row, a row spread to both ends, a caption with an optional value, three placeholder lines, and a part a narrow tile leaves out.
 */
// @cpt-begin:cpt-template-site-blocks-algo-section-blocks-kit-showcase:p1:inst-sample-parts
// @cpt-begin:cpt-template-site-blocks-algo-section-blocks-kit-showcase:p1:inst-sample-layout
/** A sample's column of parts, at most 225px wide; its first part keeps its own width. */
export function SampleStack({ children }: { children: ReactNode }) {
  return <div className={styles.stack}>{children}</div>;
}

/** A row of a sample's parts that wraps. */
export function SampleRow({ children }: { children: ReactNode }) {
  return <div className={styles.row}>{children}</div>;
}

/** A row of a sample's parts spread to both ends of the sample. */
export function SampleSpread({ children }: { children: ReactNode }) {
  return <div className={styles.spread}>{children}</div>;
}

// @cpt-end:cpt-template-site-blocks-algo-section-blocks-kit-showcase:p1:inst-sample-layout

// @cpt-begin:cpt-template-site-blocks-algo-section-blocks-kit-showcase:p1:inst-sample-caption
/** A sample's small caption, with an optional value at the far end. */
export function SampleCaption({ label, value }: { label: string; value?: string }) {
  return (
    <Text variant="meta" tone="muted" render={createElement('span')} className={styles.caption}>
      {label}
      {value ? <span>{value}</span> : null}
    </Text>
  );
}

// @cpt-end:cpt-template-site-blocks-algo-section-blocks-kit-showcase:p1:inst-sample-caption

// @cpt-begin:cpt-template-site-blocks-algo-section-blocks-kit-showcase:p1:inst-sample-fill
/** Three placeholder lines of decreasing length; the children are the kit's skeletons. */
export function SampleLines({ children }: { children: ReactNode }) {
  return <div className={styles.lines}>{children}</div>;
}

/** A part of a sample that a tile under 152px of sample width leaves out, so the sample never clips at the kit's sizes. */
export function SampleOptional({ children }: { children: ReactNode }) {
  return <span className={styles.optional}>{children}</span>;
}
// @cpt-end:cpt-template-site-blocks-algo-section-blocks-kit-showcase:p1:inst-sample-fill
// @cpt-end:cpt-template-site-blocks-algo-section-blocks-kit-showcase:p1:inst-sample-parts

