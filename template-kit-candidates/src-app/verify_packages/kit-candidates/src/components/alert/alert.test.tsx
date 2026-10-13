import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Alert, AlertTitle as KitAlertTitle } from '@gears-frontx/ui-kit';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { AlertTitle } from './alert';
import styles from './alert.module.css';

const moduleCss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'alert.module.css'), 'utf8');

function html(node: Parameters<typeof render>[0]): string {
  const { container, unmount } = render(node);
  const markup = container.innerHTML;
  unmount();
  return markup;
}

describe('AlertTitle with render', () => {
  it('renders exactly the kit markup without render', () => {
    expect(html(<AlertTitle id="t">Title</AlertTitle>)).toBe(html(<KitAlertTitle id="t">Title</KitAlertTitle>));
  });

  it('renders the given heading element with the kit class and the reset', () => {
    render(<AlertTitle render={createElement('h2')}>Sync paused</AlertTitle>);
    const heading = screen.getByRole('heading', { level: 2, name: 'Sync paused' });
    const kitClasses = html(<KitAlertTitle />).match(/class="([^"]*)"/)?.[1] ?? '';
    for (const kitClass of kitClasses.split(' ')) expect(heading.className).toContain(kitClass);
    expect(heading.className).toContain(styles.renderedTitle);
    expect(Array.from(heading.attributes).map((attribute) => attribute.name)).toEqual(['class']);
  });

  it('resets the heading element without outranking the kit class', () => {
    expect(moduleCss).toMatch(/:where\(\.renderedTitle\)\s*\{[^}]*margin:\s*0;[^}]*font-size:\s*inherit;/);
  });

  it('passes axe inside its kit parent', async () => {
    const { container } = render(
      <Alert>
        <AlertTitle render={createElement('h2')}>Sync paused</AlertTitle>
      </Alert>,
    );
    await expectNoAxeViolations(container);
  });
});
