import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { TemplateDetailFrame } from './TemplateDetailFrame';
import TemplateDetailFrameShowcase, { showcase } from './TemplateDetailFrame.showcase';

const moduleCss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'TemplateDetailFrame.module.css'), 'utf8');

describe('TemplateDetailFrame', () => {
  it('renders the intro, then the explorer across the column, then the body beside the facts, in that order', () => {
    const { container } = render(
      <TemplateDetailFrame intro={{ title: 'template-shell', lead: 'The host application.' }} explorer={<div data-testid="explorer" />} facts={<div data-testid="facts" />} footer={<a href="/twin">Plain text</a>}>
        <p data-testid="body">Body</p>
      </TemplateDetailFrame>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'template-shell' })).toBeTruthy();
    const order = ['explorer', 'body', 'facts'].map((id) => screen.getByTestId(id));
    expect(order[0]!.compareDocumentPosition(order[1]!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(order[1]!.compareDocumentPosition(order[2]!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByTestId('body').parentElement).not.toBe(screen.getByTestId('facts').parentElement);
    expect(container.querySelector('aside')?.contains(screen.getByTestId('facts'))).toBe(true);
    expect(screen.getByRole('link', { name: 'Plain text' })).toBeTruthy();
  });

  it('renders the body in one column and no aside without facts', () => {
    const { container } = render(
      <TemplateDetailFrame intro={{ title: 'T', lead: 'L' }} explorer={null}>
        Body
      </TemplateDetailFrame>,
    );
    expect(container.querySelector('aside')).toBeNull();
  });

  it('declares layout only, no colour literal', () => {
    expect(moduleCss).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|color\s*:|background/i);
  });

  it('is a page frame of the docs group that owns the page title', () => {
    expect(showcase).toMatchObject({ group: 'docs', ownsPageTitle: true });
  });

  it('passes axe as rendered by its showcase fixture', async () => {
    const { container } = render(
      <main>
        <TemplateDetailFrameShowcase />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
