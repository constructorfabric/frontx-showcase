import type { ComponentType } from 'react';

/** The groups of the showcase index: blocks of the landing page, and blocks of the inner pages. */
export type ShowcaseGroup = 'section' | 'docs';

/** What a block's `<Block>.showcase.tsx` exports besides its fixture component. */
export interface ShowcaseMeta {
  /** The block's name as the showcase lists it. */
  title: string;
  group: ShowcaseGroup;
  /** One sentence: what the block is. */
  summary: string;
  /** The fixture renders the page's level-one heading itself (a page frame); otherwise the showcase adds a visually hidden one. */
  ownsPageTitle?: boolean;
  /** The block is full-bleed by design (a band that holds its own content to the page column); otherwise the showcase renders the fixture inside the page column. */
  fullBleed?: boolean;
}

/** One block of the showcase: its route slug, its meta and its fixture. */
export interface ShowcaseEntry extends ShowcaseMeta {
  /** The block's folder name in kebab case, the showcase route of the block. */
  slug: string;
  Fixture: ComponentType;
}

interface ShowcaseModule {
  default?: ComponentType;
  showcase?: ShowcaseMeta;
}

/**
 * The route slug of a block folder: `PathCards` becomes `path-cards`.
 * @param folder - the block's folder name
 */
// @cpt-begin:cpt-template-site-blocks-algo-blocks-showcase-collect:p1:inst-slug
export function slugOf(folder: string): string {
  return folder.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}
// @cpt-end:cpt-template-site-blocks-algo-blocks-showcase-collect:p1:inst-slug

/**
 * Every block's showcase entry from its fixture modules, sorted by group then title; a module without a fixture component or meta fails loudly.
 * @param modules - fixture modules keyed by their path, as `import.meta.glob` returns them
 */
// @cpt-dod:cpt-template-site-blocks-dod-blocks-showcase-fixtures:p1
// @cpt-algo:cpt-template-site-blocks-algo-blocks-showcase-collect:p1
export function collectShowcase(modules: Readonly<Record<string, ShowcaseModule>>): ShowcaseEntry[] {
  // @cpt-begin:cpt-template-site-blocks-algo-blocks-showcase-collect:p1:inst-read-modules
  const entries = Object.entries(modules).map(([path, module]): ShowcaseEntry => {
    const folder = /\/blocks\/([^/]+)\/[^/]+\.showcase\.tsx$/.exec(path)?.[1];
    if (!folder || typeof module.default !== 'function' || !module.showcase) throw new Error(`site-blocks: ${path} is not a showcase fixture (a default component and a named \`showcase\` export)`);
    return { ...module.showcase, slug: slugOf(folder), Fixture: module.default };
  });
  // @cpt-end:cpt-template-site-blocks-algo-blocks-showcase-collect:p1:inst-read-modules
  // @cpt-begin:cpt-template-site-blocks-algo-blocks-showcase-collect:p1:inst-sort
  const order: Record<ShowcaseGroup, number> = { section: 0, docs: 1 };
  return entries.sort((a, b) => order[a.group] - order[b.group] || a.title.localeCompare(b.title));
  // @cpt-end:cpt-template-site-blocks-algo-blocks-showcase-collect:p1:inst-sort
}

/** Every block of the package that ships a showcase fixture. */
// @cpt-begin:cpt-template-site-blocks-algo-blocks-showcase-collect:p1:inst-glob
export const showcaseEntries: readonly ShowcaseEntry[] = collectShowcase(import.meta.glob<ShowcaseModule>('./blocks/*/*.showcase.tsx', { eager: true }));
// @cpt-end:cpt-template-site-blocks-algo-blocks-showcase-collect:p1:inst-glob
