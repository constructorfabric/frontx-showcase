import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createElement } from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { Features } from './Features';
import FeaturesShowcase, { showcase } from './Features.showcase';

const moduleCss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'Features.module.css'), 'utf8');

const items = [
  { title: 'App Shell', text: 'Navigation and routing.', action: { label: 'Explore the Shell', link: createElement('a', { href: '/shell' }) }, figure: <svg data-testid="figure-shell" /> },
  { title: 'Screen templates', text: 'A starting point for screens.', action: { label: 'Explore screen templates', link: createElement('a', { href: '/mfe' }) } },
];

describe('Features', () => {
  it('is a region named by its title with one list item per feature, each a level-three title, its text and its link', () => {
    render(<Features id="groundwork" title="The groundwork, already connected." items={items} />);
    const region = screen.getByRole('region', { name: 'The groundwork, already connected.' });
    const rows = within(region).getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(within(rows[0]!).getByRole('heading', { level: 3, name: 'App Shell' })).toBeTruthy();
    expect(within(rows[0]!).getByText('Navigation and routing.')).toBeTruthy();
    expect(within(rows[0]!).getByRole('link', { name: /Explore the Shell/ }).getAttribute('href')).toBe('/shell');
  });

  it('shows a feature figure as decoration, and leaves the figure out when none is given', () => {
    render(<Features id="g" title="T" items={items} />);
    const figure = screen.getByTestId('figure-shell');
    expect(figure.closest('[aria-hidden="true"]')).toBeTruthy();
    const rows = screen.getAllByRole('listitem');
    expect(rows[1]!.querySelector('[aria-hidden="true"] svg')).toBeNull();
  });

  it('sets its rhythm on the section tokens and declares no colour literal', () => {
    expect(moduleCss).toMatch(/--site-section-pad-top:/);
    expect(moduleCss).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
  });

  it('is a full-bleed fixture of the section group', () => {
    expect(showcase).toMatchObject({ group: 'section', fullBleed: true });
  });

  it('passes axe as rendered by its showcase fixture', async () => {
    const { container } = render(
      <main>
        <FeaturesShowcase />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
