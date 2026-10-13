import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { SkeletonCard } from './SkeletonCard';
import SkeletonCardShowcase from './SkeletonCard.showcase';

describe('SkeletonCard', () => {
  it('draws three placeholder lines in a card', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(3);
  });

  it('is no live region by default, since a loading frame around it announces the state', () => {
    render(<SkeletonCard />);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('announces itself as a busy status region when it alone stands for the loading content', () => {
    render(<SkeletonCard busy />);
    expect(screen.getByRole('status').getAttribute('aria-busy')).toBe('true');
  });

  it('passes axe as rendered by its showcase fixture', async () => {
    const { container } = render(
      <main>
        <SkeletonCardShowcase />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
