import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Card as KitCard, CardContent, CardHeader, CardTitle as KitCardTitle } from '@gears-frontx/ui-kit';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { Card, CardTitle } from './card';
import styles from './card.module.css';

const moduleCss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'card.module.css'), 'utf8');

function html(node: Parameters<typeof render>[0]): string {
  const { container, unmount } = render(node);
  const markup = container.innerHTML;
  unmount();
  return markup;
}

describe('Card and CardTitle with render', () => {
  it('renders exactly the kit markup without render', () => {
    expect(html(<Card size="sm" id="c">Body</Card>)).toBe(html(<KitCard size="sm" id="c">Body</KitCard>));
    expect(html(<Card>Body</Card>)).toBe(html(<KitCard>Body</KitCard>));
    expect(html(<CardTitle typography="panel">Title</CardTitle>)).toBe(html(<KitCardTitle typography="panel">Title</KitCardTitle>));
  });

  it('renders the card as a link with the kit classes and the interactive state', () => {
    render(
      <Card size="sm" render={createElement('a', { href: '/guides/setup' })}>
        <CardHeader>
          <CardTitle render={createElement('h3')}>Setup guide</CardTitle>
        </CardHeader>
        <CardContent>From install to the first screen.</CardContent>
      </Card>,
    );
    const link = screen.getByRole('link', { name: /Setup guide/ });
    const kitClasses = html(<KitCard size="sm" />).match(/class="([^"]*)"/)?.[1] ?? '';
    for (const kitClass of kitClasses.split(' ')) expect(link.className).toContain(kitClass);
    expect(link.className).toContain(styles.interactive);
    const title = screen.getByRole('heading', { level: 3, name: 'Setup guide' });
    const kitTitleClasses = html(<KitCardTitle />).match(/class="([^"]*)"/)?.[1] ?? '';
    for (const kitClass of kitTitleClasses.split(' ')) expect(title.className).toContain(kitClass);
    expect(title.className).toContain(styles.renderedTitle);
  });

  it('adds no data attributes of its own when rendered', () => {
    render(<Card size="sm" render={createElement('a', { href: '/' })}>x</Card>);
    const link = screen.getByRole('link');
    expect(Array.from(link.attributes).map((attribute) => attribute.name).sort()).toEqual(['class', 'href']);
  });

  it('paints hover and focus only on an interactive root, from tokens', () => {
    expect(moduleCss).toMatch(/\.interactive:where\(a\[href\], button\):hover\s*\{[^}]*border-color:\s*var\(--ring\);/);
    expect(moduleCss).toMatch(/\.interactive:where\(a\[href\], button\):focus-visible\s*\{[^}]*box-shadow:\s*inset 0 0 0 var\(--ring-inset\) var\(--ring\);/);
    expect(moduleCss).toMatch(/forced-colors:\s*active/);
    expect(moduleCss).toMatch(/:where\(\.renderedTitle\)\s*\{[^}]*margin:\s*0;/);
    expect(moduleCss).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  it('passes axe as a link card with a heading', async () => {
    const { container } = render(
      <Card render={createElement('a', { href: '/guides/setup' })}>
        <CardHeader>
          <CardTitle render={createElement('h3')}>Setup guide</CardTitle>
        </CardHeader>
        <CardContent>From install to the first screen.</CardContent>
      </Card>,
    );
    await expectNoAxeViolations(container);
  });
});
