import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { render, screen } from '@testing-library/react';
import { forwardRef, type ComponentProps } from 'react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { Link, linkVariants } from './link';
import styles from './link.module.css';

const moduleCss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'link.module.css'), 'utf8');

/** Stands in for an application router's link component: an anchor that takes `to`. */
const RouterLink = forwardRef<HTMLAnchorElement, ComponentProps<'a'> & { to: string }>(function RouterLink({ to, children, ...props }, ref) {
  return (
    <a ref={ref} href={`#${to}`} data-router="" {...props}>
      {children}
    </a>
  );
});

describe('Link', () => {
  it('renders an anchor in the default variant', () => {
    render(<Link href="/docs/setup">setup guide</Link>);
    const link = screen.getByRole('link', { name: 'setup guide' });
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/docs/setup');
    expect(link.className).toContain(styles.link);
    expect(link.className).toContain(styles.variantDefault);
  });

  it.each([
    ['default', styles.variantDefault],
    ['muted', styles.variantMuted],
    ['inherit', styles.variantInherit],
  ] as const)('applies the %s variant class', (variant, variantClass) => {
    render(<Link href="/" variant={variant}>x</Link>);
    expect(screen.getByRole('link').className).toContain(variantClass);
  });

  it('resolves an explicit null variant to the default', () => {
    render(<Link href="/" variant={null}>x</Link>);
    expect(screen.getByRole('link').className).toContain(styles.variantDefault);
  });

  it('hands the anchor to a router link through render', () => {
    render(<Link render={<RouterLink to="/settings" />}>Settings</Link>);
    const link = screen.getByRole('link', { name: 'Settings' });
    expect(link.hasAttribute('data-router')).toBe(true);
    expect(link.getAttribute('href')).toBe('#/settings');
    expect(link.className).toContain(styles.link);
  });

  it('opens an external link in a new tab with a hidden arrow', () => {
    render(<Link href="https://example.com" external>Example</Link>);
    const link = screen.getByRole('link', { name: 'Example' });
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    const icon = link.querySelector('svg');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps the caller\'s target and rel on an external link', () => {
    render(<Link href="https://example.com" external target="docs" rel="noopener">Example</Link>);
    const link = screen.getByRole('link');
    expect(link.getAttribute('target')).toBe('docs');
    expect(link.getAttribute('rel')).toBe('noopener');
  });

  it('adds no target, rel or icon to an internal link', () => {
    render(<Link href="/">Home</Link>);
    const link = screen.getByRole('link');
    expect(link.hasAttribute('target')).toBe(false);
    expect(link.hasAttribute('rel')).toBe(false);
    expect(link.querySelector('svg')).toBeNull();
  });

  it('exports the class builder it uses', () => {
    expect(linkVariants({ variant: 'muted' })).toContain(styles.variantMuted);
  });

  it('inherits the line it sits in and draws its states from tokens', () => {
    const base = /\.link\s*\{([^}]*)\}/.exec(moduleCss)?.[1] ?? '';
    expect(base).toContain('font: inherit;');
    expect(base).not.toMatch(/height|padding/);
    expect(moduleCss).toMatch(/\.link:focus-visible\s*\{[^}]*outline:\s*var\(--border-width-focus\) solid var\(--ring\);/);
    expect(moduleCss).toMatch(/\.variantDefault\s*\{\s*color:\s*var\(--link-foreground\);/);
    expect(moduleCss).toMatch(/\.variantMuted:hover\s*\{\s*color:\s*var\(--link-foreground\);/);
    expect(moduleCss).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  it('passes axe inside a sentence and as an external link', async () => {
    const { container } = render(
      <p>
        Read the <Link href="/docs/setup" variant="inherit">setup guide</Link> first, or visit{' '}
        <Link href="https://example.com" external>Example</Link>.
      </p>,
    );
    await expectNoAxeViolations(container);
  });
});
