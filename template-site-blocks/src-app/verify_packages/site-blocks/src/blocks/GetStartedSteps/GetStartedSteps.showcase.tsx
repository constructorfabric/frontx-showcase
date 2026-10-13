import { createElement } from 'react';
import { HairlineFigure } from '@gears-frontx/site-brand/art/HairlineFigure';
import { GetStartedSteps } from './GetStartedSteps';

export const showcase = { title: 'Get started steps', group: 'section', summary: 'The way in, in order: the title, the lead and the link beside three ruled step rows, each one link.', fullBleed: true } as const;

export default function GetStartedStepsShowcase() {
  return (
    <GetStartedSteps
      id="showcase-get-started-steps"
      title={'A running app.\nThen your first change.'}
      lead="Install the templates, run Shell + MFE and make your first change."
      action={{ label: 'Read the getting started guide', link: createElement('a', { href: './?screen=docs;route=get-started' }) }}
      steps={[
        { figure: <HairlineFigure stock="rebuild" />, title: 'Install & assemble', text: 'Set up the Shell and its MFE workspace.', link: createElement('a', { href: './?screen=docs;route=get-started' }) },
        { figure: <HairlineFigure stock="loupe" />, title: 'Run it locally', text: 'Open the included example screens.', link: createElement('a', { href: './?screen=docs;route=get-started' }) },
        { figure: <HairlineFigure stock="rest" />, title: 'Make your first change', text: 'Edit a screen and see it in the running application.', link: createElement('a', { href: './?screen=docs;route=first-change' }) },
      ]}
    />
  );
}
