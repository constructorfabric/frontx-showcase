import { render, screen, within } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { GuideStep, type GuideStepProps } from './GuideStep';

const base: GuideStepProps = {
  id: 'workspace',
  number: 1,
  title: 'Create a clean workspace',
  lead: 'Run these steps in the same terminal.',
  copyLabel: 'Copy',
  copiedLabel: 'Copied',
};

describe('GuideStep', () => {
  it('is a section named by its heading, and the number stays out of the heading name', () => {
    render(<GuideStep {...base} />);
    const section = screen.getByRole('region', { name: 'Create a clean workspace' });
    const heading = within(section).getByRole('heading', { level: 2, name: 'Create a clean workspace' });
    expect(heading.id).toBe('workspace');
    const marker = within(section).getByText('1');
    expect(marker.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(heading.contains(marker)).toBe(false);
  });

  it('renders the command in a code block with its title and a copy button, wrapping long lines instead of scrolling them', () => {
    const { container } = render(<GuideStep {...base} code={{ title: 'Workspace', code: 'mkdir my-app\ncd my-app' }} />);
    expect(screen.getByText('Workspace')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Copy' })).toBeTruthy();
    expect(screen.queryByRole('region', { name: 'Workspace' })).toBeNull();
    const pre = container.querySelector('pre');
    expect(pre?.textContent).toBe('mkdir my-app\ncd my-app');
    expect(pre?.hasAttribute('tabindex')).toBe(false);
  });

  it('lists the files as list items with name, text and path', () => {
    render(
      <GuideStep
        {...base}
        files={[
          { path: 'src/screens/home/HomeScreen.tsx', name: 'HomeScreen.tsx', text: 'Screen layout.' },
          { path: 'src/screens/home/i18n/en.json', name: createElement('a', { href: '#en' }, 'i18n/en.json'), text: 'English text.' },
        ]}
      />,
    );
    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0] as HTMLElement).getByText('HomeScreen.tsx')).toBeTruthy();
    expect(within(items[0] as HTMLElement).getByText('src/screens/home/HomeScreen.tsx')).toBeTruthy();
    expect(within(items[1] as HTMLElement).getByRole('link', { name: 'i18n/en.json' })).toBeTruthy();
  });

  it('names the expected result for assistive technology without showing the label', () => {
    render(<GuideStep {...base} expected={{ label: 'Expected result:', text: 'A new workspace.' }} />);
    const line = screen.getByText('A new workspace.', { exact: false });
    expect(line.textContent).toContain('Expected result: A new workspace.');
  });

  it('renders a plain note as text and a titled note with its own heading', () => {
    const { rerender } = render(<GuideStep {...base} note="Keep the terminal open." />);
    expect(screen.getByText('Keep the terminal open.')).toBeTruthy();
    rerender(<GuideStep {...base} note={{ title: 'Next', items: ['Open the site.', 'Pick a screen.'] }} />);
    expect(screen.getByRole('heading', { level: 3, name: 'Next' })).toBeTruthy();
    expect(screen.getByText('Pick a screen.')).toBeTruthy();
  });

  it('places the result drawing and the links the caller passes', () => {
    render(<GuideStep {...base} result={<figure aria-label="Expected screen" />} links={<a href="#more">More</a>} />);
    expect(screen.getByRole('figure', { name: 'Expected screen' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'More' })).toBeTruthy();
  });

  it('has no axe violations with every part present', async () => {
    const { container } = render(
      <GuideStep
        {...base}
        code={{ title: 'Workspace', code: 'mkdir my-app' }}
        files={[{ path: 'mfe.json', name: 'mfe.json', text: 'Registration.' }]}
        expected={{ label: 'Expected result:', text: 'A new workspace.' }}
        note={{ title: 'Next', items: ['Open the site.'] }}
        links={<a href="#more">More</a>}
      />,
    );
    await expectNoAxeViolations(container);
  });
});
