import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { GuideStepUnnumbered } from './GuideStepUnnumbered';

describe('GuideStepUnnumbered', () => {
  it('is a section named by its heading, with the lead and the links and no number', () => {
    render(<GuideStepUnnumbered id="changes" title="Keep track of your changes" lead="The provenance file records the templates." links={<a href="#limits">Limits</a>} />);
    const section = screen.getByRole('region', { name: 'Keep track of your changes' });
    const heading = within(section).getByRole('heading', { level: 2 });
    expect(heading.id).toBe('changes');
    expect(heading.textContent).toBe('Keep track of your changes');
    expect(within(section).getByText('The provenance file records the templates.')).toBeTruthy();
    expect(within(section).getByRole('link', { name: 'Limits' })).toBeTruthy();
  });

  it('has no axe violations', async () => {
    const { container } = render(<GuideStepUnnumbered id="changes" title="Keep track of your changes" lead="Lead." links={<a href="#limits">Limits</a>} />);
    await expectNoAxeViolations(container);
  });
});
