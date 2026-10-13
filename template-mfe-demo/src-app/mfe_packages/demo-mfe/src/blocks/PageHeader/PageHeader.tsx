import { createElement, type ReactNode } from 'react';
import { Heading, Text } from '@gears-frontx/kit-candidates';
import { ActionRow } from '../ActionRow';
import styles from './PageHeader.module.css';

// @cpt-dod:cpt-template-mfe-demo-dod-screen-entries-screen-blocks:p2
// @cpt-algo:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2
// @cpt-begin:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2:inst-page-header
export interface PageHeaderProps {
  /** The screen's title, its one level-one heading. */
  title: string;
  /** One paragraph under the title. */
  description?: string;
  /** Controls that act on the whole screen, in a row under the description. */
  actions?: ReactNode;
}

/*
 * The head of a demo screen: the title on the kit's heading-1 role, a muted description and an optional row of screen-wide actions.
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <Heading size="heading-1" render={createElement('h1')}>
        {title}
      </Heading>
      {description ? <Text tone="muted">{description}</Text> : null}
      {actions ? <ActionRow>{actions}</ActionRow> : null}
    </div>
  );
}
// @cpt-end:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2:inst-page-header
