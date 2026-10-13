import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { ReadingColumn } from './ReadingColumn';
import ReadingColumnShowcase from './ReadingColumn.showcase';

describe('ReadingColumn', () => {
  it('stacks its children in one element', () => {
    const { container } = render(
      <ReadingColumn>
        <p>First</p>
        <p>Second</p>
      </ReadingColumn>,
    );
    expect(container.childElementCount).toBe(1);
    expect(container.firstElementChild?.children).toHaveLength(2);
    expect(screen.getByText('Second')).toBeTruthy();
  });

  it('passes axe as rendered by its showcase fixture', async () => {
    const { container } = render(
      <main>
        <ReadingColumnShowcase />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
