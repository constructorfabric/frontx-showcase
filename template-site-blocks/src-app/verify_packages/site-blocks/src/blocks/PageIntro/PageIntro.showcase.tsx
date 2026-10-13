import { Layers, Terminal } from 'lucide-react';

import { PageIntro } from './PageIntro';

export const showcase = { title: 'Page intro', group: 'docs', summary: 'The opening of an inner page: title, lead and short facts.', ownsPageTitle: true } as const;

export default function PageIntroShowcase() {
  return (
    <PageIntro
      title="Project templates."
      lead="Choose a starting shell, add a workspace for UI units, or bring design rules into an existing project."
      meta={[
        { icon: <Terminal aria-hidden="true" />, text: 'Node.js 24.14 · npm 10' },
        { icon: <Layers aria-hidden="true" />, text: 'CLI 0.3.0' },
      ]}
    />
  );
}
