import kitPackage from '@gears-frontx/ui-kit/package.json';

/** The installed kit version, which every install line, the type definitions links and the navigation panel name. */
export const KIT_VERSION: string = kitPackage.version;

/** Where the installed kit version publishes a component's type definitions. */
export function typeDefinitionsUrl(slug: string, version: string = KIT_VERSION): string {
  return `https://unpkg.com/@gears-frontx/ui-kit@${version}/dist/components/${slug}/${slug}.d.ts`;
}
