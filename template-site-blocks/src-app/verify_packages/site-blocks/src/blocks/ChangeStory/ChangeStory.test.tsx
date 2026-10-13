import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createElement } from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { ChangeStory } from './ChangeStory';
import ChangeStoryShowcase, { showcase } from './ChangeStory.showcase';

const moduleCss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'ChangeStory.module.css'), 'utf8');

describe('ChangeStory', () => {
  it('is a region named by its title, with the lead, the link and the workbench under the header', () => {
    render(
      <ChangeStory
        id="change"
        title="A small change."
        lead="Give your agent a focused task."
        action={{ label: 'Follow the first change', link: createElement('a', { href: '/first-change' }) }}
        workbench={<svg data-testid="workbench" />}
      />,
    );
    const region = screen.getByRole('region', { name: 'A small change.' });
    expect(within(region).getByText('Give your agent a focused task.')).toBeTruthy();
    expect(within(region).getByRole('link', { name: /Follow the first change/ }).getAttribute('href')).toBe('/first-change');
    const lead = within(region).getByText('Give your agent a focused task.');
    const action = within(region).getByRole('link', { name: /Follow the first change/ });
    const workbench = within(region).getByTestId('workbench');
    expect(lead.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(action.compareDocumentPosition(workbench) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('paints no surface of its own, so no light panel stays light in the dark theme (the drawing carries its light and dark palette)', () => {
    expect(moduleCss).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
    expect(moduleCss).not.toMatch(/background(-color)?\s*:|(^|[^-])color\s*:/m);
  });

  it('opens with a rule above the band and sets its rhythm on the section tokens', () => {
    const { container } = render(<ChangeStory id="c" title="T" workbench={null} />);
    expect(container.querySelector('[role="separator"]')).toBeTruthy();
    expect(moduleCss).toMatch(/--site-section-pad-top:/);
  });

  it('is a full-bleed fixture of the section group', () => {
    expect(showcase).toMatchObject({ group: 'section', fullBleed: true });
  });

  it('passes axe as rendered by its showcase fixture', async () => {
    const { container } = render(
      <main>
        <ChangeStoryShowcase />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
