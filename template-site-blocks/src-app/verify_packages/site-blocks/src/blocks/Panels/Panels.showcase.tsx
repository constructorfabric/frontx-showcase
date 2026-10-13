import { createElement } from 'react';
import { buttonVariants } from '@gears-frontx/ui-kit';
import { Link } from '@gears-frontx/kit-candidates';
import { SectionHeading } from '../SectionHeading';
import { Panels } from './Panels';

export const showcase = { title: 'Panels', group: 'docs', summary: 'Ways in, explained: kit cards two to a row with a title, a sentence and links.' } as const;

export default function PanelsShowcase() {
  return (
    <>
      <SectionHeading id="showcase-other-ways" title="Other ways to use FrontX" />
      <Panels
        items={[
          { title: 'Understand the templates', text: 'Browse selected source files and run the composed example of each template.', actions: createElement('a', { href: '/?screen=templates', className: buttonVariants({ variant: 'outline' }) }, 'Explore templates') },
          {
            title: 'Work with an agent',
            text: 'Use a focused task with the first-change guide.',
            actions: [
              <Link key="task" href="/?screen=docs;route=first-change">
                Get the first-change task
              </Link>,
              <Link key="kit" href="/?screen=libs">
                AI Kit documentation
              </Link>,
            ],
          },
        ]}
      />
    </>
  );
}
