import { createElement, type ReactNode } from 'react';
import { Heading, Text } from '@gears-frontx/kit-candidates';

import styles from './PageIntro.module.css';

export interface PageIntroFact {
  /** A small icon before the fact, hidden from assistive technology by the caller. */
  icon: ReactNode;
  text: string;
}

export interface PageIntroProps {
  /** The page's only level-one heading. */
  title: string;
  lead: string;
  /** A link back to the parent page, above the title. */
  back?: ReactNode;
  /** Short facts under the lead, each with its icon. */
  meta?: readonly PageIntroFact[];
}

/*
 * The opening of an inner page: an optional back link, the page title on the brand's page display size, the lead held to a readable measure, and short facts under it. The intro carries the page's top padding and the space to what follows.
 */
// @cpt-dod:cpt-template-site-blocks-dod-docs-blocks-page-intro:p1
// @cpt-algo:cpt-template-site-blocks-algo-docs-blocks-page-intro:p1
export function PageIntro({ title, lead, back, meta }: PageIntroProps) {
  // @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-page-intro:p1:inst-facts
  const facts = meta && meta.length > 0 ? meta : undefined;
  // @cpt-end:cpt-template-site-blocks-algo-docs-blocks-page-intro:p1:inst-facts
  // @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-page-intro:p1:inst-render
  return (
    <header className={styles.intro}>
      {back ? <div className={styles.back}>{back}</div> : null}
      <Heading size="display" render={createElement('h1')} className={styles.title}>
        {title}
      </Heading>
      {/* A lead followed by facts reads as part of the title block and takes the page's text colour. */}
      <Text tone={facts ? 'default' : 'muted'} className={styles.lead}>
        {lead}
      </Text>
      {facts ? (
        <ul className={styles.meta}>
          {facts.map((item) => (
            <li key={item.text} className={styles.fact}>
              <span className={styles.icon}>{item.icon}</span>
              <Text variant="meta" tone="muted" render={createElement('span')}>
                {item.text}
              </Text>
            </li>
          ))}
        </ul>
      ) : null}
    </header>
  );
  // @cpt-end:cpt-template-site-blocks-algo-docs-blocks-page-intro:p1:inst-render
}
