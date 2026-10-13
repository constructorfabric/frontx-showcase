import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../test-support/axe';
import { HairlineFigure, type HairlineStock } from './HairlineFigure';
import { TemplateFigure } from './TemplateFigure';

const STOCKS: HairlineStock[] = ['hub', 'riffle', 'turntable', 'rebuild', 'loupe', 'rest'];

describe('HairlineFigure', () => {
  it.each(STOCKS)('draws the %s figure on the 400 by 320 grid, hidden as decoration without a label', (stock) => {
    const { container } = render(<HairlineFigure stock={stock} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 400 320');
    expect(svg?.getAttribute('data-stock')).toBe(stock);
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('role')).toBeNull();
    expect(svg?.querySelectorAll('path').length).toBeGreaterThan(5);
    // Every path's data is finite numbers, so the drawing never carries NaN from the geometry.
    for (const path of svg?.querySelectorAll('path') ?? []) expect(path.getAttribute('d')).not.toMatch(/NaN|Infinity/);
  });

  it('is an image with the given name when labelled', async () => {
    const { container, getByRole } = render(<HairlineFigure stock="hub" label="A host tile wired to the tiles around it" />);
    expect(getByRole('img', { name: 'A host tile wired to the tiles around it' })).toBeTruthy();
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBeNull();
    await expectNoAxeViolations(container);
  });

  it('passes axe as decoration', async () => {
    const { container } = render(
      <div>
        {STOCKS.map((stock) => (
          <HairlineFigure key={stock} stock={stock} />
        ))}
      </div>,
    );
    await expectNoAxeViolations(container);
  });
});

describe('TemplateFigure', () => {
  it('draws the shell as the hub, the screens as the riffle and the guardrails as the loupe', () => {
    const stockOf = (template: 'shell' | 'screens' | 'guardrails') => render(<TemplateFigure template={template} />).container.querySelector('svg')?.getAttribute('data-stock');
    expect([stockOf('shell'), stockOf('screens'), stockOf('guardrails')]).toEqual(['hub', 'riffle', 'loupe']);
  });

  it('passes its label through', () => {
    const { getByRole } = render(<TemplateFigure template="shell" label="The shell" />);
    expect(getByRole('img', { name: 'The shell' })).toBeTruthy();
  });
});
