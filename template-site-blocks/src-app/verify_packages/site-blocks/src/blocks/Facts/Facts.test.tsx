import { render, screen, within } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { Facts } from './Facts';

const facts = [
  { label: 'Template type', value: 'Application foundation' },
  { label: 'Requires', value: 'A new project' },
  { label: 'Source version', value: '0.1.0-alpha.5' },
];

describe('Facts', () => {
  it('renders a complementary region named by its h2 with each fact as a term and its value', () => {
    const { container } = render(<Facts title="Before you start" facts={facts} actions={createElement('a', { href: '/start' }, 'Run Shell + MFE')} />);
    const region = screen.getByRole('complementary', { name: 'Before you start' });
    expect(within(region).getByRole('heading', { level: 2 })).toBeTruthy();
    const terms = [...container.querySelectorAll('dl > div > dt')].map((node) => node.textContent);
    expect(terms).toEqual(['Template type', 'Requires', 'Source version']);
    expect(container.querySelector('dt + dd')?.textContent).toBe('Application foundation');
    expect(within(region).getByRole('link', { name: 'Run Shell + MFE' })).toBeTruthy();
  });

  it('renders without actions', () => {
    render(<Facts title="Before you start" facts={facts} />);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('passes axe', async () => {
    const { container } = render(<Facts title="Before you start" facts={facts} actions={createElement('a', { href: '/start' }, 'Run Shell + MFE')} />);
    await expectNoAxeViolations(container);
  });
});
