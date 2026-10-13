import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { PageHeader } from './PageHeader';
import PageHeaderShowcase from './PageHeader.showcase';

describe('PageHeader', () => {
  it("renders the screen's title as its one level-one heading", () => {
    render(<PageHeader title="Current Theme" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Current Theme' })).toBeTruthy();
    expect(screen.getAllByRole('heading')).toHaveLength(1);
  });

  it('renders the description under the title when given', () => {
    render(<PageHeader title="Profile" description="Welcome back." />);
    expect(screen.getByText('Welcome back.').tagName).toBe('P');
  });

  it('renders the actions after the description', () => {
    render(<PageHeader title="Widgets Host" description="Three widgets." actions={<button type="button">Ping alpha</button>} />);
    const description = screen.getByText('Three widgets.');
    const action = screen.getByRole('button', { name: 'Ping alpha' });
    expect(description.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('passes axe as rendered by its showcase fixture', async () => {
    const { container } = render(
      <main>
        <PageHeaderShowcase />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
