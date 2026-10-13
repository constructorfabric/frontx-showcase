import { createElement } from 'react';
import { PathCards } from './PathCards';

export const showcase = { title: 'Path cards', group: 'docs', summary: 'The main paths through a section: three whole-card links with a figure beside the title.' } as const;

export default function PathCardsShowcase() {
  return (
    <PathCards
      items={[
        { title: 'Run Shell + MFE', text: 'Create the host, add the microfrontend workspace and run both together.', link: createElement('a', { href: '/?screen=docs;route=get-started' }) },
        { title: 'Make your first change', text: 'Find the screen files, change a title and rebuild the screen.', link: createElement('a', { href: '/?screen=docs;route=first-change' }) },
        { title: 'Use UI Kit in your app', text: 'Find component contracts and integration notes in the kit catalogue.', link: createElement('a', { href: '/?screen=catalogue' }) },
      ]}
    />
  );
}
