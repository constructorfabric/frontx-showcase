import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../test-support/axe';
import { WorkbenchFigure } from './WorkbenchFigure';

const props = {
  task: (
    <>
      Rename the Blank Home screen to <strong>Project overview</strong>.
    </>
  ),
  diff: { path: '_blank-mfe / screens / home / i18n / en.json', removed: '"title": "Blank Home"', added: '"title": "Project overview"' },
  result: { label: 'Preview', navLabel: 'Blank Home', title: 'Project overview', text: 'Your first change is running inside the Shell.' },
};

describe('WorkbenchFigure', () => {
  it('shows the task, the diff under its file path and the preview under its label', () => {
    const { getByText, getAllByRole, container } = render(<WorkbenchFigure {...props} />);
    expect(container.querySelector('blockquote')?.textContent).toBe('Rename the Blank Home screen to Project overview.');
    const figures = getAllByRole('figure');
    expect(figures.map((figure) => figure.querySelector('figcaption')?.textContent)).toEqual([props.diff.path, 'Preview']);
    expect(getByText(props.diff.removed)).toBeTruthy();
    expect(getByText(props.diff.added)).toBeTruthy();
    expect(getByText('Your first change is running inside the Shell.')).toBeTruthy();
    for (const icon of container.querySelectorAll('svg')) expect(icon.getAttribute('aria-hidden')).toBe('true');
  });

  it('passes axe in the light and the dark appearance', async () => {
    for (const theme of ['light', 'dark']) {
      const { container, unmount } = render(
        <div data-theme={theme}>
          <WorkbenchFigure {...props} />
        </div>,
      );
      await expectNoAxeViolations(container);
      unmount();
    }
  });
});
