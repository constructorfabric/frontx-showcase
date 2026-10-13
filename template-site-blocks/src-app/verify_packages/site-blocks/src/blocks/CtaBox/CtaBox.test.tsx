import { render, screen, within } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { CtaBox } from './CtaBox';

const props = { title: 'Make it yours', text: 'Change the existing screen and rebuild it.', action: createElement('a', { href: '/first-change' }, 'Make your first change') };

describe('CtaBox', () => {
  it('renders a complementary region named by its h2, with the text and the action', () => {
    render(<CtaBox {...props} />);
    const region = screen.getByRole('complementary', { name: 'Make it yours' });
    expect(within(region).getByRole('heading', { level: 2, name: 'Make it yours' })).toBeTruthy();
    expect(within(region).getByText(/rebuild it/)).toBeTruthy();
    expect(within(region).getByRole('link', { name: 'Make your first change' }).getAttribute('href')).toBe('/first-change');
  });

  it('passes axe', async () => {
    const { container } = render(<CtaBox {...props} />);
    await expectNoAxeViolations(container);
  });
});
