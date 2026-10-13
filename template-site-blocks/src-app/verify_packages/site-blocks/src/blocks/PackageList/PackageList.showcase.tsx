import { createElement } from 'react';
import { buttonVariants } from '@gears-frontx/ui-kit';
import { PackageList } from './PackageList';

export const showcase = { title: 'Package list', group: 'docs', summary: 'Packages a reader installs one by one: cards with the name, a sentence, the install command and links.' } as const;

const source = (href: string) => createElement('a', { key: 'source', href, className: buttonVariants({ variant: 'outline' }) }, 'View source');

export default function PackageListShowcase() {
  return (
    <PackageList
      copyLabel="Copy"
      copiedLabel="Copied"
      packages={[
        {
          name: '@gears-frontx/ui-kit',
          title: 'UI Kit',
          text: 'React components and shared visual tokens. Use individual components or the whole set.',
          install: { command: 'npm install @gears-frontx/ui-kit@0.4.0', title: 'Install UI Kit', label: 'Install command for UI Kit' },
          actions: [createElement('a', { key: 'open', href: '/?screen=catalogue', className: buttonVariants({ variant: 'default' }) }, 'Open UI Kit'), source('https://github.com/constructorfabric/gears-frontx/tree/main/packages/ui-kit')],
        },
        { name: '@gears-frontx/mfes', title: 'MFE runtime', text: 'Registration, loading and host communication for independently built screens.', actions: source('https://github.com/constructorfabric/gears-frontx/tree/main/packages/mfes') },
        { name: '@gears-frontx/api', title: 'API services', text: 'Communication protocols and a service registry.', actions: source('https://github.com/constructorfabric/gears-frontx/tree/main/packages/api') },
        { name: '@gears-frontx/gts-plugin', title: 'GTS provider', text: 'Typed definitions and validation for runtime extensions.', actions: source('https://github.com/constructorfabric/gears-frontx/tree/main/packages/gts-plugin') },
      ]}
    />
  );
}
