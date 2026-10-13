import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { DocsFrame } from './DocsFrame';
import DocsFrameShowcase from './DocsFrame.showcase';

const moduleCss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'DocsFrame.module.css'), 'utf8');

const intro = { title: 'Build with FrontX.', lead: 'Start here.' };

describe('DocsFrame', () => {
  it('renders the intro, then the body, in an article', () => {
    render(<DocsFrame intro={intro}>Body text</DocsFrame>);
    const article = screen.getByRole('article');
    expect(screen.getByRole('heading', { level: 1, name: 'Build with FrontX.' })).toBeTruthy();
    expect(article.textContent).toContain('Body text');
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('renders the tab bar as a named navigation whose current link is marked as the page', () => {
    render(
      <DocsFrame
        intro={intro}
        nav={{
          label: 'Docs pages',
          items: [
            { id: 'a', label: 'Overview', current: true, render: createElement('a', { href: '/docs' }) },
            { id: 'b', label: 'First change', current: false, render: createElement('a', { href: '/docs/first-change' }) },
          ],
        }}
      >
        Body
      </DocsFrame>,
    );
    const nav = screen.getByRole('navigation', { name: 'Docs pages' });
    expect(nav).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Overview' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'First change' }).getAttribute('aria-current')).toBeNull();
    expect(screen.getByRole('link', { name: 'First change' }).getAttribute('href')).toBe('/docs/first-change');
  });

  it('renders the wide content before the body and the footer after it', () => {
    render(
      <DocsFrame intro={intro} wide={<p>Wide</p>} footer={<a href="/twin.md">Plain text</a>}>
        <p>Body</p>
      </DocsFrame>,
    );
    const wide = screen.getByText('Wide');
    const body = screen.getByText('Body');
    const footer = screen.getByRole('link', { name: 'Plain text' });
    expect(wide.compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(body.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('holds the page to the page column from the layout tokens', () => {
    expect(moduleCss).toMatch(/width:\s*var\(--site-column\)/);
    expect(moduleCss).toMatch(/padding-bottom:\s*var\(--site-page-pad-bottom\)/);
  });

  it('passes axe as rendered by its showcase fixture', async () => {
    const { container } = render(
      <main>
        <DocsFrameShowcase />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
