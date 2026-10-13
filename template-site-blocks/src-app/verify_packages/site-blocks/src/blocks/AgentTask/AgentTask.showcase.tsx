import { Link } from '@gears-frontx/kit-candidates';

import { AgentTask } from './AgentTask';

export const showcase = { title: 'Agent task', group: 'docs', summary: 'A closed card with a task for a coding agent: the summary opens the lead, the task with Copy and its plain-text link.' } as const;

const task = [
  'Continue in the Shell + MFE project created by the FrontX quickstart (my-app).',
  '',
  'Rename the English Blank Home screen title to "Project overview" and its description to "Your first change is running inside the Shell." Edit only src-app/mfe_packages/_blank-mfe/src/screens/home/i18n/en.json.',
  '',
  'Run npm run type-check --workspace=@gears-frontx/blank-mfe and restart dev:all. Report the changed files and the command results.',
].join('\n');

export default function AgentTaskShowcase() {
  return (
    <AgentTask
      id="agent-task"
      summary="Task for your coding agent"
      lead="Use this in the existing project from the quickstart."
      code={{ title: 'First-change agent task', code: task }}
      twin={<Link href="#task-twin">Plain-text task</Link>}
      copyLabel="Copy"
      copiedLabel="Copied"
    />
  );
}
