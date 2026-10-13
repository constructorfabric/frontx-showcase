import { render, screen, within } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { CtaRule } from './CtaRule';

const props = { title: 'Start with Shell + MFE.', text: 'Run the host and its included screens together.', action: createElement('a', { href: '/get-started' }, 'Run the quickstart') };

describe('CtaRule', () => {
  it('renders a complementary region named by its h2 under a separator, with the action', () => {
    render(<CtaRule {...props} />);
    const region = screen.getByRole('complementary', { name: 'Start with Shell + MFE.' });
    expect(within(region).getByRole('heading', { level: 2 })).toBeTruthy();
    expect(within(region).getByRole('link', { name: 'Run the quickstart' })).toBeTruthy();
    expect(within(region).getByRole('separator')).toBeTruthy();
  });

  it('passes axe', async () => {
    const { container } = render(<CtaRule {...props} />);
    await expectNoAxeViolations(container);
  });
});
