import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createElement } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { Hero } from './Hero';
import HeroShowcase, { showcase } from './Hero.showcase';

const moduleCss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'Hero.module.css'), 'utf8');

const actions = [
  { label: 'Get started', link: createElement('a', { href: '/docs' }) },
  { label: 'View on GitHub', link: createElement('a', { href: 'https://example.org/source' }) },
];

describe('Hero', () => {
  it('announces every action as a link and none as a button (an anchor keeps the link role)', () => {
    const { container } = render(<Hero title="T" lead="L" actions={actions} />);
    expect(screen.queryAllByRole('button')).toEqual([]);
    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual(['Get started', 'View on GitHub']);
    expect(container.querySelectorAll('a[role]').length).toBe(0);
  });

  it('is a region named by the page title, the only level-one heading', () => {
    render(<Hero title={'Build complex apps.\nWith a shared foundation.'} lead="Lead" actions={actions} />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toBe('Build complex apps.\nWith a shared foundation.');
    expect(screen.getByRole('region', { name: heading.textContent ?? '' })).toBeTruthy();
  });

  it('renders the first action as the button link and the rest as text links, each with its destination', () => {
    render(<Hero title="T" lead="The lead" actions={actions} />);
    const start = screen.getByRole('link', { name: 'Get started' });
    expect(start.getAttribute('href')).toBe('/docs');
    expect(start.className).toMatch(/button/i);
    const source = screen.getByRole('link', { name: 'View on GitHub' });
    expect(source.getAttribute('href')).toBe('https://example.org/source');
    expect(source.className).not.toMatch(/button/i);
    expect(screen.getByText('The lead')).toBeTruthy();
  });

  it('renders the art slot under the text, and no art box without art', () => {
    const { container, rerender } = render(<Hero title="T" lead="L" actions={actions} art={<svg data-testid="art" />} />);
    expect(screen.getByTestId('art')).toBeTruthy();
    rerender(<Hero title="T" lead="L" actions={actions} />);
    expect(container.querySelector('svg[data-testid="art"]')).toBeNull();
  });

  it('declares no colour literal in its stylesheet', () => {
    expect(moduleCss).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
  });

  it('is a full-bleed fixture of the section group', () => {
    expect(showcase).toMatchObject({ group: 'section', fullBleed: true, ownsPageTitle: true });
  });

  it('passes axe as rendered by its showcase fixture', async () => {
    const { container } = render(
      <main>
        <HeroShowcase />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
