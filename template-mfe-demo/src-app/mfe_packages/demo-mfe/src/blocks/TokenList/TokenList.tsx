import { createElement } from 'react';
import { Text } from '@gears-frontx/kit-candidates';
import styles from './TokenList.module.css';

// @cpt-dod:cpt-template-mfe-demo-dod-screen-entries-screen-blocks:p2
// @cpt-algo:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2
// @cpt-begin:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2:inst-token-list
export interface TokenListProps {
  /** CSS custom property names, such as `--primary`. */
  tokens: readonly string[];
}

/*
 * A list of token names in two columns, each name in the monospace face.
 */
export function TokenList({ tokens }: TokenListProps) {
  return (
    <ul className={styles.list}>
      {tokens.map((token) => (
        <li key={token} className={styles.item}>
          <Text variant="mono" render={createElement('code')}>
            {token}
          </Text>
        </li>
      ))}
    </ul>
  );
}
// @cpt-end:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2:inst-token-list
