import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoAxeViolations } from '../../test-support/axe';
import PageFrameShowcase from './PageFrame.showcase';

describe('PageFrame', () => {
  it('holds the page in an article', async () => {
    const { container } = render(<PageFrameShowcase />);
    expect(screen.getByTestId('showcase-page').tagName).toBe('ARTICLE');
    await expectNoAxeViolations(container);
  });
});
