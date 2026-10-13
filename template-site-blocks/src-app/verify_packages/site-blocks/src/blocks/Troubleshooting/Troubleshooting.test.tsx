import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { Troubleshooting } from './Troubleshooting';

const items = [
  { summary: 'The menu has no example screens', text: 'Restart with the example screens on.' },
  { summary: 'The old title is still visible', text: 'Check that you changed the English file.' },
];

describe('Troubleshooting', () => {
  it('is a section named by its heading with one closed question per item', () => {
    render(<Troubleshooting id="troubleshooting" title="If something looks different" items={items} />);
    const section = screen.getByRole('region', { name: 'If something looks different' });
    expect(within(section).getByRole('heading', { level: 2 }).id).toBe('troubleshooting');
    const triggers = within(section).getAllByRole('button');
    expect(triggers.map((button) => button.textContent)).toEqual(items.map((item) => item.summary));
    for (const trigger of triggers) expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens more than one answer at a time', () => {
    render(<Troubleshooting id="troubleshooting" title="If something looks different" items={items} />);
    const [first, second] = screen.getAllByRole('button') as [HTMLElement, HTMLElement];
    fireEvent.click(first);
    fireEvent.click(second);
    expect(first.getAttribute('aria-expanded')).toBe('true');
    expect(second.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Restart with the example screens on.')).toBeTruthy();
    expect(screen.getByText('Check that you changed the English file.')).toBeTruthy();
  });

  it('has no axe violations', async () => {
    const { container } = render(<Troubleshooting id="troubleshooting" title="If something looks different" items={items} />);
    await expectNoAxeViolations(container);
  });
});
