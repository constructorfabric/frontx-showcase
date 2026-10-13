import { createElement, type ReactElement } from 'react';
import { CardContent, CardDescription, CardHeader } from '@gears-frontx/ui-kit';
import { Card, CardTitle, Text } from '@gears-frontx/kit-candidates';
import styles from './CardTiles.module.css';

export interface CardTile {
  /** A short label above the title. */
  eyebrow?: string;
  title: string;
  text: string;
  /** The element the whole card renders as: an anchor or the application's router link, with its destination and no children. */
  link: ReactElement;
}

export interface CardTilesProps {
  items: readonly CardTile[];
}

// @cpt-dod:cpt-template-site-blocks-dod-docs-blocks-card-tiles:p1
// @cpt-algo:cpt-template-site-blocks-algo-docs-blocks-card-tiles:p1
/** A collection of related pages: small whole-card links in a grid that fits as many as the width allows. */
export function CardTiles({ items }: CardTilesProps) {
  return (
    // @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-card-tiles:p1:inst-grid
    <ul className={styles.grid}>
      {items.map((item) => (
        <li key={item.title} className={styles.cell}>
          {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-card-tiles:p1:inst-grid */}
          {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-card-tiles:p1:inst-tile */}
          <Card render={item.link} className={styles.card}>
            <CardHeader>
              {item.eyebrow ? (
                <Text variant="label" tone="muted" render={createElement('span')}>
                  {item.eyebrow}
                </Text>
              ) : null}
              <CardTitle render={createElement('h3')}>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{item.text}</CardDescription>
            </CardContent>
          </Card>
          {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-card-tiles:p1:inst-tile */}
        </li>
      ))}
    </ul>
  );
}
