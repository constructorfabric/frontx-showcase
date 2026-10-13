import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoAxeViolations } from '../../test-support/axe';
import SectionTabsShowcase from './SectionTabs.showcase';

describe('SectionTabs', () => {
  it('names its navigation, links every section and marks the current one', async () => {
    const { container } = render(<SectionTabsShowcase />);
    const links = within(screen.getByRole('navigation', { name: 'UI Kit sections' })).getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual(['Components', 'Foundations']);
    expect(links.map((link) => link.getAttribute('aria-current'))).toEqual(['page', null]);
    await expectNoAxeViolations(container);
  });
});
