import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PanelLeftIcon } from 'lucide-react';
import { Button, Input } from '@gears-frontx/ui-kit';
import { Heading, Text } from '@gears-frontx/kit-candidates';
import { PagePane, PagePaneBody, PagePaneHeader } from '@inbox-shared/blocks/PagePane';
import { expectNoAxeViolations } from './axe';

describe('PagePane', () => {
  it('renders the header slots in order and the body', async () => {
    const { container } = render(
      <PagePane>
        <PagePaneHeader
          leading={<Button variant="ghost" icon={<PanelLeftIcon />} aria-label="Toggle filters" />}
          heading={<Heading size="heading-2" render={createElement('h1')}>All contacts</Heading>}
          subheading={<Text variant="meta" tone="muted" render={<span />}>12 people</Text>}
          search={<Input type="search" aria-label="Search contacts" />}
        />
        <PagePaneBody>
          <p>Directory</p>
        </PagePaneBody>
      </PagePane>
    );
    const order = [
      screen.getByRole('button', { name: 'Toggle filters' }),
      screen.getByRole('heading', { level: 1, name: 'All contacts' }),
      screen.getByText('12 people'),
      screen.getByRole('searchbox', { name: 'Search contacts' }),
    ];
    for (let index = 1; index < order.length; index += 1) {
      expect(order[index - 1].compareDocumentPosition(order[index]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
    expect(screen.getByText('Directory')).toBeTruthy();
    await expectNoAxeViolations(container);
  });

  it('leaves the page while another page of the screen stands in front of it', () => {
    render(
      <PagePane hidden>
        <PagePaneHeader heading={<Heading size="heading-2" render={<span />}>All contacts</Heading>} />
      </PagePane>
    );
    expect(screen.getByText('All contacts').closest('[hidden]')).not.toBeNull();
    expect(screen.queryByRole('heading')).toBeNull();
  });
});
