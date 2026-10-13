import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { ScreenFrame } from './ScreenFrame';
import ScreenFrameShowcase from './ScreenFrame.showcase';

describe('ScreenFrame', () => {
  it("scopes the kit's tokens to the shell's theme", () => {
    const { container, rerender } = render(<ScreenFrame theme="dark">Body</ScreenFrame>);
    expect(container.firstElementChild?.getAttribute('data-theme')).toBe('dark');
    rerender(<ScreenFrame theme="solarized">Body</ScreenFrame>);
    expect(container.firstElementChild?.getAttribute('data-theme')).toBe('light');
  });

  it('takes the scope of its shadow host when given no theme', () => {
    const { container } = render(<ScreenFrame>Body</ScreenFrame>);
    expect(container.firstElementChild?.hasAttribute('data-theme')).toBe(false);
  });

  it('announces a loading frame as a busy status region', () => {
    render(<ScreenFrame theme="light" busy>Loading</ScreenFrame>);
    expect(screen.getByRole('status').getAttribute('aria-busy')).toBe('true');
  });

  it('is no live region when it is not loading', () => {
    render(<ScreenFrame theme="light">Body</ScreenFrame>);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('hands its element to the ref and passes data attributes through', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ScreenFrame ref={ref} data-testid="frame">
        Body
      </ScreenFrame>,
    );
    expect(ref.current).toBe(screen.getByTestId('frame'));
  });

  it('passes axe as rendered by its showcase fixture', async () => {
    const { container } = render(
      <main>
        <ScreenFrameShowcase />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
