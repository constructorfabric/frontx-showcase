import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { TokenList } from './TokenList';
import TokenListShowcase from './TokenList.showcase';

describe('TokenList', () => {
  it('lists every token name, in order, as code', () => {
    render(<TokenList tokens={['--background', '--foreground', '--primary']} />);
    const items = screen.getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual(['--background', '--foreground', '--primary']);
    expect(items.every((item) => item.firstElementChild?.tagName === 'CODE')).toBe(true);
  });

  it('passes axe as rendered by its showcase fixture', async () => {
    const { container } = render(
      <main>
        <TokenListShowcase />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
