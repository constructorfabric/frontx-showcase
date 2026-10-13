import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { act, fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { CodeBlock, CodeBlockCopyButton, CodeBlockHeader, CodeBlockTitle } from './code-block';
import styles from './code-block.module.css';

const moduleCss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'code-block.module.css'), 'utf8');
const CODE = 'npm install\nnpm run dev';

function Example(props: { wrap?: boolean; timeout?: number; onCopy?: () => void; onError?: (error: unknown) => void }) {
  return (
    <CodeBlock code={CODE} language="sh" label="Install and start" wrap={props.wrap}>
      <CodeBlockHeader>
        <CodeBlockTitle>Terminal</CodeBlockTitle>
        <CodeBlockCopyButton copyLabel="Copy" copiedLabel="Copied" timeout={props.timeout} onCopy={props.onCopy} onError={props.onError} />
      </CodeBlockHeader>
    </CodeBlock>
  );
}

let writeText: ReturnType<typeof vi.fn>;

beforeEach(() => {
  writeText = vi.fn(() => Promise.resolve());
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('CodeBlock', () => {
  it('renders pre > code with the exact text and the language as data', () => {
    const { container } = render(<Example />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain(styles.codeBlock);
    expect(root.getAttribute('data-language')).toBe('sh');
    const code = container.querySelector('pre > code');
    expect(code?.textContent).toBe(CODE);
  });

  it('makes the scroll region focusable and named when it does not wrap', () => {
    render(<Example />);
    const region = screen.getByRole('region', { name: 'Install and start' });
    expect(region.tagName).toBe('PRE');
    expect(region.getAttribute('tabindex')).toBe('0');
  });

  it('drops the region and the tab stop when it wraps', () => {
    const { container } = render(<Example wrap />);
    const pre = container.querySelector('pre') as HTMLElement;
    expect(pre.hasAttribute('tabindex')).toBe(false);
    expect(pre.hasAttribute('role')).toBe(false);
    expect(pre.className).toContain(styles.wrap);
  });

  it('applies the size classes', () => {
    const { container } = render(<CodeBlock code="x" label="x" size="sm" />);
    expect((container.firstElementChild as HTMLElement).className).toContain(styles.sizeSm);
  });

  it('renders the title through render', () => {
    render(
      <CodeBlock code="x" label="x">
        <CodeBlockHeader>
          <CodeBlockTitle render={createElement('h3')}>package.json</CodeBlockTitle>
        </CodeBlockHeader>
      </CodeBlock>,
    );
    const title = screen.getByRole('heading', { level: 3, name: 'package.json' });
    expect(title.className).toContain(styles.codeBlockTitle);
  });

  it('copies the code, flips its label, announces once and flips back after the timeout', async () => {
    vi.useFakeTimers();
    const onCopy = vi.fn();
    render(<Example timeout={1000} onCopy={onCopy} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    });
    expect(writeText).toHaveBeenCalledWith(CODE);
    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Copied' })).toBeDefined();
    expect(screen.getByRole('status').textContent).toBe('Copied');
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole('button', { name: 'Copy' })).toBeDefined();
    expect(screen.getByRole('status').textContent).toBe('');
  });

  it('reports a rejected write through onError and keeps its label', async () => {
    const failure = new Error('denied');
    writeText.mockImplementation(() => Promise.reject(failure));
    const onError = vi.fn();
    render(<Example onError={onError} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    });
    expect(onError).toHaveBeenCalledWith(failure);
    expect(screen.getByRole('button', { name: 'Copy' })).toBeDefined();
  });

  it('reports a missing clipboard through onError', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    const onError = vi.fn();
    render(<Example onError={onError} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    });
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('refuses a copy button outside a CodeBlock', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<CodeBlockCopyButton />)).toThrow(/inside a CodeBlock/);
  });

  it('paints from tokens only', () => {
    expect(moduleCss).toMatch(/\.codeBlock\s*\{[^}]*background-color:\s*var\(--card\);/);
    expect(moduleCss).toMatch(/\.codeBlock\s*\{[^}]*border-radius:\s*var\(--radius-lg\);/);
    expect(moduleCss).toMatch(/font-family:\s*var\(--font-mono\);/);
    expect(moduleCss).toMatch(/\.pre:focus-visible\s*\{[^}]*var\(--ring\)/);
    expect(moduleCss).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  it('passes axe, scrolling and wrapping', async () => {
    const { container } = render(
      <div>
        <Example />
        <Example wrap />
      </div>,
    );
    await expectNoAxeViolations(container);
  });
});
