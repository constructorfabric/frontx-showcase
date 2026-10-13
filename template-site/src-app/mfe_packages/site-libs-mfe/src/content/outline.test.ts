import { describe, expect, it } from 'vitest';
import { outlineKeys, parseOutline, resolveText } from '@site-shared/content/outline';
import manifest from '../../mfe.json';
import outlineJson from './outline.json';
import strings from '../screens/libs/i18n/en.json';
import data from '../data/libraries.generated.json';

const outline = parseOutline(outlineJson);
const translate = (key: string) => (strings as Record<string, string>)[key] ?? key;

describe('libs outline', () => {
  it('names a strings key that exists for every text it reads from the strings, and uses every key the strings hold', () => {
    const used = new Set(outlineKeys(outline));
    expect([...used].filter((key) => !(key in strings))).toEqual([]);
    // The chrome, state and library-list keys are read by the screen's own components, not by the outline.
    const own = /^(tabs|chrome|libraries\.(install|shell|pkg))\.|^(loading|error|not_found_\w+|libraries\.(install|sourceView|openKit))$/;
    expect(Object.keys(strings).filter((key) => !used.has(key) && !own.test(key))).toEqual([]);
  });

  it('fills every placeholder of every text and command from the libs data', () => {
    const texts: string[] = [];
    const collect = (value: unknown): void => {
      if (typeof value === 'string') texts.push(resolveText(value, translate, data.vars));
      else if (Array.isArray(value)) value.forEach(collect);
      else if (value && typeof value === 'object') Object.values(value).forEach(collect);
    };
    collect(outline.pages);
    // The one braces-around-a-name text that is not a placeholder is the JSX of the ExtensionRouter example, whose props are named like their variables.
    const jsxProps = new Set(['registry', 'routeTree']);
    const unfilled = texts.flatMap((text) => [...text.matchAll(/\{([A-Za-z][A-Za-z0-9]*)\}/g)].map((match) => match[1] ?? '')).filter((name) => !jsxProps.has(name));
    expect(unfilled).toEqual([]);
    expect(Object.keys(data.vars)).not.toEqual(expect.arrayContaining([...jsxProps]));
  });

  it('pages for the screen root and the three summaries, in the order of the tab bar', () => {
    expect(outline.pages.map((page) => page.route)).toEqual(['/', '/routing', '/mfes', '/screen-domain']);
  });

  it("shows the screen's own extension from mfe.json, so the page cannot drift from the manifest", () => {
    const page = outline.pages.find((entry) => entry.route === '/screen-domain');
    const block = page?.entries.find((entry) => entry.type === 'code' && entry.code.title === 't:domain.extension.example');
    const { seo: _seo, ...extension } = manifest.extensions[0] as (typeof manifest.extensions)[number] & { seo?: unknown };
    expect(block && block.type === 'code' ? JSON.parse(block.code.lines.join('\n')) : undefined).toEqual(extension);
  });

  it("links each summarized package's sources at the FrontX repository's commit it was published from, in the organization's repositories only", () => {
    const blobs = [data.vars.routingBlobUrl, data.vars.routingTanstackBlobUrl, data.vars.mfesBlobUrl];
    const prefix = 'https://github.com/constructorfabric/gears-frontx/blob/';
    for (const url of blobs) expect(url?.startsWith(prefix) && url.slice(prefix.length)).toMatch(/^[0-9a-f]{40}$/);
    for (const url of [...blobs, data.vars.shellSourceUrl]) expect(url).toContain('https://github.com/constructorfabric/');
  });
});
