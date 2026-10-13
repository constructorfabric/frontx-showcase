import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createElement } from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { KitShowcase, SampleCaption, SampleStack } from './KitShowcase';
import KitShowcaseShowcase, { showcase } from './KitShowcase.showcase';

const moduleCss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'KitShowcase.module.css'), 'utf8');

const groups = [
  {
    title: 'Input & interaction',
    tiles: [
      { title: 'Buttons', link: createElement('a', { href: '/button' }), sample: <button type="button">Create</button> },
      { title: 'Text fields', link: createElement('a', { href: '/input' }), sample: <input aria-label="Search" /> },
    ],
  },
  { title: 'Charts & trends', tiles: [{ title: 'Area charts', link: createElement('a', { href: '/chart' }), sample: null }] },
];

describe('KitShowcase', () => {
  it('is a region named by its title with a level-three title and a list of tiles per group', () => {
    render(<KitShowcase id="kit" label="FrontX UI Kit" title="One visual language." lead="Lead" action={{ label: 'Explore UI Kit', link: createElement('a', { href: '/kit' }) }} groups={groups} />);
    const region = screen.getByRole('region', { name: 'One visual language.' });
    expect(within(region).getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual(['Input & interaction', 'Charts & trends']);
    expect(within(region).getAllByRole('list')).toHaveLength(2);
    expect(within(region).getByRole('link', { name: /Explore UI Kit/ }).getAttribute('href')).toBe('/kit');
  });

  it('gives each tile one link named by its title, and keeps the live sample out of focus and the accessibility tree', () => {
    render(<KitShowcase id="kit" title="T" groups={groups} />);
    const link = screen.getByRole('link', { name: 'Buttons' });
    expect(link.getAttribute('href')).toBe('/button');
    const tile = link.closest('li')!;
    const sample = tile.querySelector('[inert]');
    expect(sample?.querySelector('button')).toBeTruthy();
    expect(tile.querySelectorAll('a')).toHaveLength(1);
  });

  it('lays sample parts out without CSS in the caller', () => {
    render(
      <SampleStack>
        <SampleCaption label="Uploading files" value="72%" />
      </SampleStack>,
    );
    expect(screen.getByText('Uploading files')).toBeTruthy();
    expect(screen.getByText('72%')).toBeTruthy();
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
        <KitShowcaseShowcase />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
