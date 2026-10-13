import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TagIcon } from 'lucide-react';
import { Input } from '@gears-frontx/ui-kit';
import { DataTableHeaderLabel, DataTableIdentityCell, DataTableSection } from '@inbox-shared/blocks/DataTableSection';
import { expectNoAxeViolations } from './axe';

describe('DataTableSection', () => {
  it('heads the table with an h2, the row count and the search field', async () => {
    const { container } = render(
      <DataTableSection title="Recent activity" count="26" search={<Input type="search" aria-label="Search activity" />}>
        <table>
          <thead>
            <tr>
              <th>
                <DataTableHeaderLabel icon={<TagIcon aria-hidden="true" />}>Kind</DataTableHeaderLabel>
              </th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Chat</td>
              <td>
                <DataTableIdentityCell avatar={<span aria-hidden="true">AL</span>} name="Ada Lovelace" description="Analytical" />
              </td>
            </tr>
          </tbody>
        </table>
      </DataTableSection>
    );
    const heading = screen.getByRole('heading', { level: 2, name: 'Recent activity' });
    expect(heading.parentElement?.textContent).toContain('26');
    expect(screen.getByRole('searchbox', { name: 'Search activity' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Kind' })).toBeTruthy();
    expect(screen.getByText('Ada Lovelace')).toBeTruthy();
    expect(screen.getByText('Analytical')).toBeTruthy();
    await expectNoAxeViolations(container);
  });
});
