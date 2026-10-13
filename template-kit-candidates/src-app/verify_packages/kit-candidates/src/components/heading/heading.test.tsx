import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { Heading, headingVariants } from './heading';
import styles from './heading.module.css';

const moduleCss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'heading.module.css'), 'utf8');

describe('Heading', () => {
  it('renders an h2 on the heading-1 role by default', () => {
    render(<Heading>Members</Heading>);
    const heading = screen.getByRole('heading', { level: 2, name: 'Members' });
    expect(heading.className).toContain(styles.heading);
    expect(heading.className).toContain(styles.sizeHeading1);
  });

  it.each([
    ['display', styles.sizeDisplay],
    ['heading-1', styles.sizeHeading1],
    ['heading-2', styles.sizeHeading2],
  ] as const)('applies the %s role class', (size, sizeClass) => {
    render(<Heading size={size}>Title</Heading>);
    expect(screen.getByRole('heading').className).toContain(sizeClass);
  });

  it('resolves an explicit null size to the default role', () => {
    render(<Heading size={null}>Title</Heading>);
    expect(screen.getByRole('heading').className).toContain(styles.sizeHeading1);
  });

  it('keeps the outline level and the look independent through render', () => {
    render(
      <Heading size="display" render={createElement('h1')}>
        Settings
      </Heading>,
    );
    const heading = screen.getByRole('heading', { level: 1, name: 'Settings' });
    expect(heading.className).toContain(styles.sizeDisplay);
  });

  it('merges a consumer class and forwards native props', () => {
    render(
      <Heading className={styles.heading} id="members">
        Members
      </Heading>,
    );
    expect(screen.getByRole('heading').getAttribute('id')).toBe('members');
  });

  it('exports the class builder it uses', () => {
    expect(headingVariants({ size: 'heading-2' })).toContain(styles.sizeHeading2);
  });

  it('sets each role from the ramp tokens only, with no margin', () => {
    expect(moduleCss).toMatch(/\.heading\s*\{[^}]*margin:\s*0;/);
    for (const [role, selector] of [['display', 'sizeDisplay'], ['heading-1', 'sizeHeading1'], ['heading-2', 'sizeHeading2']] as const) {
      const rule = new RegExp(`\\.${selector}\\s*\\{([^}]*)\\}`).exec(moduleCss)?.[1] ?? '';
      for (const property of ['size', 'line-height', 'weight', 'tracking']) expect(rule).toContain(`var(--text-${role}-${property})`);
    }
    expect(moduleCss).not.toMatch(/#[0-9a-f]{3,8}\b|\d+px/i);
  });

  it('passes axe as a document outline of three levels', async () => {
    const { container } = render(
      <main>
        <Heading size="display" render={createElement('h1')}>Settings</Heading>
        <Heading>Members</Heading>
        <Heading size="heading-2" render={createElement('h3')}>Invitations</Heading>
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
