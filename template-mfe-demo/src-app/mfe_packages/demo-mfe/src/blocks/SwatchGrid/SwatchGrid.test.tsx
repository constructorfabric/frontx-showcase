import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { SwatchGrid, SWATCH_TOKENS } from './SwatchGrid';
import SwatchGridShowcase from './SwatchGrid.showcase';

describe('SwatchGrid', () => {
  it('names the seven colour pairs a swatch can paint', () => {
    expect(SWATCH_TOKENS).toEqual(['background', 'foreground', 'primary', 'secondary', 'muted', 'accent', 'destructive']);
  });

  it('renders one swatch per item, in order, with its name and its token pair caption', () => {
    render(
      <SwatchGrid
        swatches={[
          { token: 'primary', name: 'Primary' },
          { token: 'muted', name: 'Muted' },
        ]}
      />,
    );
    const items = screen.getAllByRole('listitem');
    expect(items.map((item) => item.getAttribute('data-token'))).toEqual(['primary', 'muted']);
    expect(items[0]?.textContent).toBe('Primary--primary / --primary-foreground');
    expect(items[1]?.textContent).toBe('Muted--muted / --muted-foreground');
  });

  it('captions the foreground swatch with the pair it paints in reverse', () => {
    render(<SwatchGrid swatches={[{ token: 'foreground', name: 'Foreground' }]} />);
    expect(screen.getByText('--foreground / --background')).toBeTruthy();
  });

  it('passes axe as rendered by its showcase fixture', async () => {
    const { container } = render(
      <main>
        <SwatchGridShowcase />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
