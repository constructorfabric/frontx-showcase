import type { ReactElement, ReactNode } from 'react';
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@gears-frontx/ui-kit';
import styles from './StartPaths.module.css';

export interface StartPath {
  /** A small icon before the title; decoration only. */
  icon?: ReactNode;
  title: string;
  text: string;
  /** The element the whole row renders as: an anchor or the application's router link, with its destination and no children. */
  link: ReactElement;
  /** The reader's current path. */
  current?: boolean;
}

export interface StartPathsProps {
  /** The accessible name of the navigation landmark. */
  label: string;
  items: readonly StartPath[];
}

// @cpt-dod:cpt-template-site-blocks-dod-docs-blocks-start-paths:p1
// @cpt-algo:cpt-template-site-blocks-algo-docs-blocks-start-paths:p1
/** The starting points of a guide: two whole-row links side by side in a named navigation, the reader's current path tinted. */
export function StartPaths({ label, items }: StartPathsProps) {
  return (
    // @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-start-paths:p1:inst-landmark
    <nav aria-label={label}>
      <ul className={styles.grid}>
        {items.map((item) => (
          <li key={item.title} className={styles.cell}>
            {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-start-paths:p1:inst-landmark */}
            {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-start-paths:p1:inst-row-link */}
            <Item render={item.link} variant={item.current ? 'muted' : 'outline'} aria-current={item.current ? 'true' : undefined} className={styles.row}>
              {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-start-paths:p1:inst-row-link */}
              {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-start-paths:p1:inst-row-content */}
              {item.icon ? (
                <ItemMedia variant="icon" aria-hidden="true">
                  {item.icon}
                </ItemMedia>
              ) : null}
              <ItemContent>
                <ItemTitle className={styles.title}>{item.title}</ItemTitle>
                <ItemDescription>{item.text}</ItemDescription>
              </ItemContent>
              <ItemActions aria-hidden="true">→</ItemActions>
              {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-start-paths:p1:inst-row-content */}
            </Item>
          </li>
        ))}
      </ul>
    </nav>
  );
}
