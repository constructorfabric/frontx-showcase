import { createElement } from 'react';
import { StartPaths } from './StartPaths';

export const showcase = { title: 'Start paths', group: 'docs', summary: 'The starting points of a guide as two whole-row links, the current one tinted.' } as const;

export default function StartPathsShowcase() {
  return (
    <StartPaths
      label="Ways to start"
      items={[
        { title: 'Start a new app', text: 'Run Shell + MFE, then change your first screen.', link: createElement('a', { href: '/?screen=docs;route=get-started' }), current: true },
        { title: 'Use in an existing app', text: 'Choose a library without adopting the full structure.', link: createElement('a', { href: '/?screen=libs' }) },
      ]}
    />
  );
}
