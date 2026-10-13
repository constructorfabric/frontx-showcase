import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoAxeViolations } from '../../test-support/axe';
import NavPanelShowcase from './NavPanel.showcase';

describe('NavPanel', () => {
  it('names the panel and each group by its label, and marks the open section and page', async () => {
    const { container } = render(<NavPanelShowcase />);
    const nav = screen.getByRole('navigation', { name: 'Catalogue' });
    const actions = within(nav).getByRole('group', { name: 'Actions' });
    expect(within(actions).getByRole('heading', { level: 2, name: 'Actions' })).toBeTruthy();
    expect(within(actions).getByRole('link', { name: 'Button' }).getAttribute('aria-current')).toBe('page');
    expect(within(nav).getByRole('link', { name: 'All components' }).hasAttribute('data-section-current')).toBe(true);
    expect(within(nav).getByText('0.4.0').tagName).toBe('CODE');
    await expectNoAxeViolations(container);
  });
});
