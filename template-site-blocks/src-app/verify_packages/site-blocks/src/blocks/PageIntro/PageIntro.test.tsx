import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { PageIntro } from './PageIntro';
import PageIntroShowcase from './PageIntro.showcase';

const moduleCss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'PageIntro.module.css'), 'utf8');

describe('PageIntro', () => {
  it('renders the page title as the one level-one heading and the lead', () => {
    render(<PageIntro title="Build with FrontX." lead="Start with a template." />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Build with FrontX.');
    expect(screen.getByText('Start with a template.')).toBeTruthy();
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('puts the back link above the title and the facts in a list under the lead', () => {
    render(<PageIntro title="T" lead="L" back={<a href="/templates">All templates</a>} meta={[{ icon: <svg aria-hidden="true" />, text: 'CLI 0.3.0' }]} />);
    const link = screen.getByRole('link', { name: 'All templates' });
    const heading = screen.getByRole('heading', { level: 1 });
    expect(link.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole('listitem').textContent).toBe('CLI 0.3.0');
  });

  it('takes the page padding from the layout tokens', () => {
    expect(moduleCss).toMatch(/padding:\s*var\(--site-intro-pad-top\)\s+0\s+var\(--site-intro-pad-bottom\)/);
    expect(moduleCss).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  it('passes axe as rendered by its showcase fixture', async () => {
    const { container } = render(
      <main>
        <PageIntroShowcase />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
