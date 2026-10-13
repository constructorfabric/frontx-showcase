import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createElement } from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { ClosingCta } from './ClosingCta';
import ClosingCtaShowcase, { showcase } from './ClosingCta.showcase';

const moduleCss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'ClosingCta.module.css'), 'utf8');

const actions = [
  { label: 'Get started', link: createElement('a', { href: '/get-started' }) },
  { label: 'View on GitHub', link: createElement('a', { href: 'https://example.org/source' }) },
];

describe('ClosingCta', () => {
  it('announces every action as a link and none as a button (an anchor keeps the link role)', () => {
    const { container } = render(<ClosingCta id="cta" title="T" actions={actions} />);
    expect(screen.queryAllByRole('button')).toEqual([]);
    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual(['Get started', 'View on GitHub']);
    expect(container.querySelectorAll('a[role]').length).toBe(0);
  });

  it('is a region named by its level-two title, with the button link, the text link and the visual', () => {
    render(<ClosingCta id="cta" title={'Start with FrontX.\nKeep your app yours.'} actions={actions} visual={<svg data-testid="visual" />} />);
    const region = screen.getByRole('region', { name: 'Start with FrontX.\nKeep your app yours.' });
    expect(within(region).getByRole('heading', { level: 2 }).id).toBe('cta');
    const start = within(region).getByRole('link', { name: 'Get started' });
    expect(start.className).toMatch(/button/i);
    const source = within(region).getByRole('link', { name: 'View on GitHub' });
    expect(source.className).not.toMatch(/button/i);
    expect(within(region).getByTestId('visual')).toBeTruthy();
  });

  it('declares no colour literal: the night band and its ink are brand tokens', () => {
    expect(moduleCss).toMatch(/var\(--site-night\)/);
    expect(moduleCss).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
  });

  it('is a full-bleed fixture of the section group', () => {
    expect(showcase).toMatchObject({ group: 'section', fullBleed: true });
  });

  it('passes axe as rendered by its showcase fixture', async () => {
    const { container } = render(
      <main>
        <ClosingCtaShowcase />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
