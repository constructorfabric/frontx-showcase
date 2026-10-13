import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { render, screen } from '@testing-library/react';
import { ExternalLink } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { VisuallyHidden } from './visually-hidden';
import styles from './visually-hidden.module.css';

const here = dirname(fileURLToPath(import.meta.url));
const moduleCss = readFileSync(join(here, 'visually-hidden.module.css'), 'utf8');
const utilitiesCss = readFileSync(join(here, '..', '..', 'utilities.css'), 'utf8');

const DECLARATIONS = ['position: absolute;', 'width: 1px;', 'height: 1px;', 'padding: 0;', 'overflow: hidden;', 'clip-path: inset(50%);', 'white-space: nowrap;', 'border: 0;'];

describe('VisuallyHidden', () => {
  it('renders a span whose text stays in the accessibility tree', () => {
    render(
      <a href="/docs">
        <ExternalLink aria-hidden="true" />
        <VisuallyHidden>Open the docs</VisuallyHidden>
      </a>,
    );
    const link = screen.getByRole('link', { name: 'Open the docs' });
    const hidden = screen.getByText('Open the docs');
    expect(hidden.tagName).toBe('SPAN');
    expect(hidden.className).toContain(styles.visuallyHidden);
    expect(link.contains(hidden)).toBe(true);
  });

  it('swaps the element through render', () => {
    render(
      <table>
        <VisuallyHidden render={<caption />}>Members</VisuallyHidden>
        <tbody>
          <tr>
            <td>Ada</td>
          </tr>
        </tbody>
      </table>,
    );
    expect(screen.getByRole('table', { name: 'Members' })).toBeDefined();
    expect(screen.getByText('Members').tagName).toBe('CAPTION');
  });

  it('carries the visually hidden declarations in its module and in the sr-only utility', () => {
    const component = /\.visuallyHidden\s*\{([^}]*)\}/.exec(moduleCss)?.[1] ?? '';
    const utility = /\.sr-only\s*\{([^}]*)\}/.exec(utilitiesCss)?.[1] ?? '';
    for (const declaration of DECLARATIONS) {
      expect(component).toContain(declaration);
      expect(utility).toContain(declaration);
    }
  });

  it('passes axe as the name of an icon-only link', async () => {
    const { container } = render(
      <a href="/docs">
        <ExternalLink aria-hidden="true" />
        <VisuallyHidden>Open the docs</VisuallyHidden>
      </a>,
    );
    await expectNoAxeViolations(container);
  });
});
