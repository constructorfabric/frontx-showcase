import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { AgentTask, type AgentTaskProps } from './AgentTask';

const props: AgentTaskProps = {
  id: 'agent-task',
  summary: 'Task for your coding agent',
  lead: 'Use this in the project from the quickstart.',
  code: { title: 'First-change agent task', code: 'Change the title of Blank Home.' },
  copyLabel: 'Copy',
  copiedLabel: 'Copied',
  twin: <a href="/task.md">Plain-text task</a>,
};

describe('AgentTask', () => {
  it('starts closed: only the summary shows, as a button that is not expanded', () => {
    render(<AgentTask {...props} />);
    const trigger = screen.getByRole('button', { name: 'Task for your coding agent' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText('Use this in the project from the quickstart.')).toBeNull();
  });

  it('opens on the summary and shows the lead, the task with copy and the plain-text link', () => {
    render(<AgentTask {...props} />);
    const trigger = screen.getByRole('button', { name: 'Task for your coding agent' });
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Use this in the project from the quickstart.')).toBeTruthy();
    expect(screen.getByText('First-change agent task')).toBeTruthy();
    expect(screen.getByText('Change the title of Blank Home.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Copy' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Plain-text task' })).toBeTruthy();
  });

  it('carries the id as the jump target of the whole card', () => {
    const { container } = render(<AgentTask {...props} />);
    expect(container.querySelector('#agent-task')?.contains(screen.getByRole('button', { name: 'Task for your coding agent' }))).toBe(true);
  });

  it('has no axe violations, closed and open', async () => {
    const { container } = render(<AgentTask {...props} />);
    await expectNoAxeViolations(container);
    fireEvent.click(screen.getByRole('button', { name: 'Task for your coding agent' }));
    await expectNoAxeViolations(container);
  });
});
