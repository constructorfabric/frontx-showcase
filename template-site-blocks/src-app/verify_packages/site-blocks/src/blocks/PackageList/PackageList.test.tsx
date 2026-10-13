import { render, screen, within } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { PackageList } from './PackageList';

const packages = [
  {
    name: '@gears-frontx/ui-kit',
    title: 'UI Kit',
    text: 'React components and shared visual tokens.',
    install: { command: 'npm install @gears-frontx/ui-kit@0.4.0', title: 'Install UI Kit', label: 'Install command for UI Kit' },
    actions: [createElement('a', { key: 'open', href: '/kit' }, 'Open UI Kit'), createElement('a', { key: 'source', href: 'https://example.com' }, 'View source')],
    figure: createElement('svg', { 'data-testid': 'figure' }),
  },
  { name: '@gears-frontx/mfes', title: 'MFE runtime', text: 'Registration and loading.', actions: createElement('a', { href: 'https://example.com/mfes' }, 'View source') },
];

describe('PackageList', () => {
  it('renders one card per package with its name, an h2 title, its text and actions', () => {
    render(<PackageList packages={packages} copyLabel="Copy" copiedLabel="Copied" />);
    const cards = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(cards).toHaveLength(2);
    expect(within(cards[0]!).getByRole('heading', { level: 2, name: 'UI Kit' })).toBeTruthy();
    expect(within(cards[0]!).getByText('@gears-frontx/ui-kit').tagName).toBe('CODE');
    expect(within(cards[0]!).getAllByRole('link')).toHaveLength(2);
    expect(screen.getByTestId('figure').closest('[aria-hidden="true"]')).toBeTruthy();
  });

  it.each([undefined, null, false])('does not reserve a decorative slot when the figure is %s', (figure) => {
    const { container } = render(<PackageList packages={[{ ...packages[1]!, figure }]} copyLabel="Copy" copiedLabel="Copied" />);
    const title = screen.getByRole('heading', { name: 'MFE runtime' });
    const heading = title.parentElement!.parentElement!;
    expect(heading.children).toHaveLength(1);
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
    expect(screen.getByRole('link', { name: 'View source' })).toBeTruthy();
  });

  it('shows the install command with a copy button only where the package has one', () => {
    render(<PackageList packages={packages} copyLabel="Copy" copiedLabel="Copied" />);
    const cards = screen.getAllByRole('listitem');
    expect(within(cards[0]!).getByText('npm install @gears-frontx/ui-kit@0.4.0')).toBeTruthy();
    expect(within(cards[0]!).getByRole('button', { name: /Copy/ })).toBeTruthy();
    expect(within(cards[0]!).getByRole('region', { name: 'Install command for UI Kit' })).toBeTruthy();
    expect(within(cards[1]!).queryByRole('button')).toBeNull();
  });

  it('passes axe', async () => {
    const { container } = render(<PackageList packages={packages} copyLabel="Copy" copiedLabel="Copied" />);
    await expectNoAxeViolations(container);
  });
});
