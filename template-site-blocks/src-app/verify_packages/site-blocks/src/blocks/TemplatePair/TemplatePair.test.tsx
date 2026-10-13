import { render, screen, within } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { TemplatePair } from './TemplatePair';

const items = [
  { title: 'Shell', text: 'A host for your web app.', link: createElement('a', { href: '/shell' }), figure: createElement('svg', { 'data-testid': 'shell-figure' }) },
  { title: 'MFE workspace', text: 'Add screens that run inside the host.', link: createElement('a', { href: '/mfe' }) },
] as const;

describe('TemplatePair', () => {
  it('renders the two templates as two whole-card links with h3 titles', () => {
    render(<TemplatePair items={items} />);
    const cards = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(cards).toHaveLength(2);
    const shell = screen.getByRole('link', { name: /Shell/ });
    expect(shell.getAttribute('href')).toBe('/shell');
    expect(within(shell).getByRole('heading', { level: 3, name: 'Shell' })).toBeTruthy();
  });

  it('keeps the joining sign and the figures out of the accessibility tree', () => {
    const { container } = render(<TemplatePair items={items} />);
    expect(screen.getByTestId('shell-figure').closest('[aria-hidden="true"]')).toBeTruthy();
    const sign = [...container.querySelectorAll('[aria-hidden="true"]')].find((node) => node.textContent === '+');
    expect(sign).toBeTruthy();
    expect(sign?.closest('ul')).toBeNull();
  });

  it('ends each title with a decorative arrow that leaves the heading its name', () => {
    render(<TemplatePair items={items} />);
    for (const name of ['Shell', 'MFE workspace']) {
      const heading = screen.getByRole('heading', { level: 3, name });
      const arrow = heading.querySelector('svg.lucide-arrow-up-right');
      expect(arrow?.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('passes axe', async () => {
    const { container } = render(<TemplatePair items={items} />);
    await expectNoAxeViolations(container);
  });
});
