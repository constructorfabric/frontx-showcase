import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createElement } from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { LogoStrip } from './LogoStrip';
import LogoStripShowcase, { showcase } from './LogoStrip.showcase';

const moduleCss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'LogoStrip.module.css'), 'utf8');

const logos = [
  { name: 'Acme', image: 'data:image/svg+xml,%3Csvg%2F%3E', width: 118, height: 24, link: createElement('a', { href: 'https://acme.example/' }) },
  { name: 'Globex', image: '/logos/globex.svg', width: 194, height: 13, link: createElement('a', { href: 'https://globex.example/' }) },
];

describe('LogoStrip', () => {
  it('is a region named by its level-two title, with one list item per logo', () => {
    render(<LogoStrip id="teams" title="Teams using FrontX" logos={logos} />);
    const region = screen.getByRole('region', { name: 'Teams using FrontX' });
    expect(within(region).getByRole('heading', { level: 2 }).id).toBe('teams');
    expect(within(region).getAllByRole('listitem')).toHaveLength(2);
  });

  it('makes each logo one link to the company, named by the logo\'s alternative text', () => {
    render(<LogoStrip id="teams" title="T" logos={logos} />);
    expect(screen.getByRole('link', { name: 'Acme' }).getAttribute('href')).toBe('https://acme.example/');
    expect(screen.getByRole('link', { name: 'Globex' }).getAttribute('href')).toBe('https://globex.example/');
    expect(screen.getByRole('link', { name: 'Globex' }).textContent).toBe('');
  });

  it('shows each logo file as an image at its size', () => {
    render(<LogoStrip id="teams" title="T" logos={logos} />);
    const image = screen.getByRole('img', { name: 'Globex' });
    expect(image.getAttribute('src')).toBe('/logos/globex.svg');
    expect(image.getAttribute('width')).toBe('194');
    expect(image.getAttribute('height')).toBe('13');
  });

  it('keeps the logos\' own colours: its stylesheet paints nothing and declares no colour literal', () => {
    expect(moduleCss).not.toMatch(/\b(?:color|background(?:-color)?|filter|mask(?:-image)?|fill)\s*:/);
    expect(moduleCss).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
  });

  it('is a full-bleed fixture of the section group', () => {
    expect(showcase).toMatchObject({ group: 'section', fullBleed: true });
  });

  it('passes axe as rendered by its showcase fixture', async () => {
    const { container } = render(
      <main>
        <LogoStripShowcase />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
