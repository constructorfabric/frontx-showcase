import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { Text, textVariants } from './text';
import styles from './text.module.css';

const moduleCss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'text.module.css'), 'utf8');

describe('Text', () => {
  it('renders a p on the body role in the default tone', () => {
    render(<Text data-testid="text">Invite people by email.</Text>);
    const text = screen.getByTestId('text');
    expect(text.tagName).toBe('P');
    expect(text.className).toContain(styles.text);
    expect(text.className).toContain(styles.variantBody);
    expect(text.className).toContain(styles.toneDefault);
  });

  it.each([
    ['body', styles.variantBody],
    ['label', styles.variantLabel],
    ['meta', styles.variantMeta],
    ['mono', styles.variantMono],
    ['micro', styles.variantMicro],
  ] as const)('applies the %s role class', (variant, variantClass) => {
    render(<Text data-testid="text" variant={variant}>x</Text>);
    expect(screen.getByTestId('text').className).toContain(variantClass);
  });

  it('applies the muted tone', () => {
    render(<Text data-testid="text" tone="muted">x</Text>);
    expect(screen.getByTestId('text').className).toContain(styles.toneMuted);
  });

  it('resolves explicit nulls to the defaults', () => {
    render(<Text data-testid="text" variant={null} tone={null}>x</Text>);
    const text = screen.getByTestId('text');
    expect(text.className).toContain(styles.variantBody);
    expect(text.className).toContain(styles.toneDefault);
  });

  it('swaps the element through render and keeps the class', () => {
    render(<Text variant="mono" render={<code />}>src/app/main.tsx</Text>);
    const code = screen.getByText('src/app/main.tsx');
    expect(code.tagName).toBe('CODE');
    expect(code.className).toContain(styles.variantMono);
  });

  it('exports the class builder it uses', () => {
    expect(textVariants({ variant: 'meta', tone: 'muted' })).toContain(styles.toneMuted);
  });

  it('paints from colour tokens and sets each role from the ramp tokens only', () => {
    for (const role of ['body', 'label', 'meta', 'mono', 'micro']) {
      const selector = `variant${role[0].toUpperCase()}${role.slice(1)}`;
      const rule = new RegExp(`\\.${selector}\\s*\\{([^}]*)\\}`).exec(moduleCss)?.[1] ?? '';
      for (const property of ['size', 'line-height', 'weight', 'tracking']) expect(rule).toContain(`var(--text-${role}-${property})`);
    }
    expect(moduleCss).toMatch(/\.toneDefault\s*\{\s*color:\s*var\(--foreground\);/);
    expect(moduleCss).toMatch(/\.toneMuted\s*\{\s*color:\s*var\(--muted-foreground\);/);
    expect(moduleCss).toMatch(/\.variantMono\s*\{[^}]*font-family:\s*var\(--font-mono\);/);
    expect(moduleCss).not.toMatch(/#[0-9a-f]{3,8}\b|\d+px/i);
  });

  it('passes axe', async () => {
    const { container } = render(
      <div>
        <Text>Invite people by email.</Text>
        <Text variant="meta" tone="muted" render={<span />}>Updated 2 hours ago</Text>
      </div>,
    );
    await expectNoAxeViolations(container);
  });
});
