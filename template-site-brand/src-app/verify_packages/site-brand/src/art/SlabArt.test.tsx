import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../test-support/axe';
import { ClosingVisual } from './ClosingVisual';
import { HeroArt } from './HeroArt';

describe.each([
  ['HeroArt', HeroArt],
  ['ClosingVisual', ClosingVisual],
] as const)('%s', (_name, Art) => {
  it('draws the application slab as a light island hidden from assistive technology without a label', async () => {
    const { container } = render(<Art />);
    const island = container.firstElementChild;
    expect(island?.getAttribute('data-theme')).toBe('light');
    expect(island?.getAttribute('aria-hidden')).toBe('true');
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 1200 540');
    expect(['chassis', 'nav', 'search', 'module', 'side', 'content'].map((part) => container.querySelector(`[data-part="${part}"]`) !== null)).toEqual([true, true, true, true, true, true]);
    await expectNoAxeViolations(container);
  });

  it('is an image with the given name when labelled', async () => {
    const { container, getByRole } = render(<Art label="An application assembled from its parts" />);
    expect(getByRole('img', { name: 'An application assembled from its parts' })).toBeTruthy();
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBeNull();
    await expectNoAxeViolations(container);
  });

  it('gives each drawing its own gradient ids', () => {
    const { container } = render(
      <>
        <Art />
        <Art />
      </>,
    );
    const ids = [...container.querySelectorAll('linearGradient')].map((gradient) => gradient.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
