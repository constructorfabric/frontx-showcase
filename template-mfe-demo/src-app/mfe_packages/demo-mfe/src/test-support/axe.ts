// Runs axe-core over rendered markup with the WCAG A and AA rules. Rules that need a layout engine (colour contrast) cannot run in jsdom and are left to the browser checks; a fragment is not a page, so the page-level rules (landmarks, one top-level heading) are out of this lane too.
import axe from 'axe-core';
import { expect } from 'vitest';

export async function expectNoAxeViolations(container: Element): Promise<void> {
  const result = await axe.run(container, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    rules: { 'color-contrast': { enabled: false } },
  });
  const found = result.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.html).join(' | ')}`);
  expect(found).toEqual([]);
}
