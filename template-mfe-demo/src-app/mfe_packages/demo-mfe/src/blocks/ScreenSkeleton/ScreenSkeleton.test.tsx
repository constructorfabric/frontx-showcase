import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { ScreenSkeleton } from './ScreenSkeleton';
import ScreenSkeletonShowcase from './ScreenSkeleton.showcase';

describe('ScreenSkeleton', () => {
  it('draws a title and a line over a placeholder card, all hidden from assistive technology', () => {
    const { container } = render(<ScreenSkeleton />);
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(5);
    expect(container.textContent).toBe('');
  });

  it('passes axe as rendered by its showcase fixture', async () => {
    const { container } = render(
      <main>
        <ScreenSkeletonShowcase />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
