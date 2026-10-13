import { createElement } from 'react';
import { WorkbenchFigure } from '@gears-frontx/site-brand/art/WorkbenchFigure';
import { ChangeStory } from './ChangeStory';

export const showcase = { title: 'Change story', group: 'section', summary: 'A change told as one workbench: the task given to an agent, the diff and the result, drawn by brand art under the section header.', fullBleed: true } as const;

export default function ChangeStoryShowcase() {
  return (
    <ChangeStory
      id="showcase-change-story"
      title="A small change. In the right place."
      lead="Give your agent a focused task, then review the file and the result."
      action={{ label: 'Follow the first change', link: createElement('a', { href: './?screen=docs;route=first-change' }) }}
      workbench={
        <WorkbenchFigure
          task={
            <>
              “Rename the Blank Home screen to <strong>Project overview.</strong> Keep the existing navigation and shared components.”
            </>
          }
          diff={{ path: 'src/screens/home/i18n/en.json', removed: '{"title": "Home", ...}', added: '{"title": "Project overview", ...}' }}
          result={{ label: 'Preview', navLabel: 'Blank Home', title: 'Project overview', text: 'Your first change is running inside the Shell.' }}
        />
      }
    />
  );
}
