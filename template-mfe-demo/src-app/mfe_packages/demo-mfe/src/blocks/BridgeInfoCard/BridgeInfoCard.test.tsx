import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { BridgeInfoCard } from './BridgeInfoCard';
import BridgeInfoCardShowcase from './BridgeInfoCard.showcase';

const rows = [
  { label: 'Domain ID:', value: 'gts.frontx.mfes.ext.domain.v1~frontx.screensets.layout.screen.v1' },
  { label: 'Current Theme:', value: 'light' },
];

describe('BridgeInfoCard', () => {
  it('titles the card with a level-two heading', () => {
    render(<BridgeInfoCard title="Bridge Info" rows={rows} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Bridge Info' })).toBeTruthy();
  });

  it('keeps each label with its value in a description list', () => {
    const { container } = render(<BridgeInfoCard title="Bridge Info" rows={rows} />);
    const list = container.querySelector('dl');
    expect(list).not.toBeNull();
    const terms = Array.from(list!.querySelectorAll('dt')).map((term) => term.textContent);
    const values = Array.from(list!.querySelectorAll('dd')).map((value) => value.textContent);
    expect(terms).toEqual(['Domain ID:', 'Current Theme:']);
    expect(values).toEqual([rows[0]!.value, 'light']);
    expect(within(list as HTMLElement).getByText('light').tagName).toBe('DD');
  });

  it('passes axe as rendered by its showcase fixture', async () => {
    const { container } = render(
      <main>
        <BridgeInfoCardShowcase />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
