import { describe, expect, it } from 'vitest';
import { OutlineError, outlineKeys, parseOutline, resolveText } from '@site-shared/content/outline';
import { arrangeEntries } from '@site-shared/content/OutlinePage';
import outlineJson from './outline.json';
import strings from '../screens/docs/i18n/en.json';
import versions from '../data/versions.generated.json';

const outline = parseOutline(outlineJson);
const translate = (key: string) => (strings as Record<string, string>)[key] ?? key;

describe('docs outline', () => {
  it('names a strings key that exists for every text it reads from the strings', () => {
    const missing = outlineKeys(outline).filter((key) => !(key in strings));
    expect(missing).toEqual([]);
  });

  it('fills every placeholder of every text and command from the version data and the page address', () => {
    // The page adds the site's address for the agent task's guide links; the plain-text twins add the published one.
    const vars = { ...versions.vars, siteOrigin: 'https://example.test' };
    const texts: string[] = [];
    const collect = (value: unknown): void => {
      if (typeof value === 'string') texts.push(resolveText(value, translate, vars));
      else if (Array.isArray(value)) value.forEach(collect);
      else if (value && typeof value === 'object') Object.values(value).forEach(collect);
    };
    collect(outline.pages);
    expect(texts.filter((text) => /\{[A-Za-z][A-Za-z0-9]*\}/.test(text))).toEqual([]);
  });

  it('opens the get-started page with its starting points and link line across the whole column, the rest beside the rail', () => {
    const page = outline.pages.find((candidate) => candidate.route === '/get-started');
    const arranged = arrangeEntries(page?.entries ?? []);
    expect(arranged.frame).toBe('docs');
    expect(arranged.wide.map((entry) => entry.type)).toEqual(['start-paths', 'links']);
    expect(arranged.main[0]?.type).toBe('status');
  });

  it('reads each arrangement as its own entry type, with no drawing options', () => {
    const types = outline.pages.flatMap((page) => page.entries.map((entry) => entry.type));
    expect(types).toEqual(expect.arrayContaining(['path-cards', 'start-paths', 'guide-closing-heading', 'step-unnumbered', 'cta-box', 'panels', 'agent-task', 'troubleshooting']));
    for (const field of ['layout', 'variant', 'tone', 'compact', 'ruled', 'numbered', 'prose']) expect(JSON.stringify(outlineJson)).not.toContain(`"${field}"`);
  });

  it('refuses an unknown entry type, a retired drawing option and a figure the brand does not draw, naming the field', () => {
    const outlineWith = (entry: unknown) => ({ screen: 'docs', strings: 'x', pages: [{ route: '/', title: 'x', lead: 'x', entries: [entry] }] });
    expect(() => parseOutline(outlineWith({ type: 'cards', items: [] }))).toThrow(/entries\[0\]: unknown entry type cards/);
    expect(() => parseOutline(outlineWith({ type: 'panels', tone: 'solid', items: [] }))).toThrow(/entries\[0\]\.tone: a drawing option/);
    const feature = { figure: 'spiral', title: 'x', text: 'x', link: { label: 'x', href: { route: '/' } } };
    expect(() => parseOutline(outlineWith({ type: 'features', id: 'f', title: 'x', items: [feature] }))).toThrow(/items\[0\]\.figure: expected one of/);
    expect(() => parseOutline({ screen: 'docs', strings: 'x', pages: [{ route: '/', title: 'x', lead: 'x', blocks: [] }] })).toThrow(OutlineError);
  });

  it('reads a link to another screen as its extension id and an optional typed action, and refuses a screen named by its address token, a route beside an extension and a link with two targets', () => {
    const outlineWith = (href: unknown) => ({ screen: 'docs', strings: 'x', pages: [{ route: '/', title: 'x', lead: 'x', entries: [{ type: 'links', lead: 'x', items: [{ label: 'x', href }] }] }] });
    const linkOf = (href: unknown) => {
      const [entry] = parseOutline(outlineWith(href)).pages[0]?.entries ?? [];
      return entry?.type === 'links' ? entry.items[0]?.href : undefined;
    };
    expect(linkOf({ extension: 'ext.catalogue' })).toEqual({ extension: 'ext.catalogue' });
    expect(linkOf({ extension: 'ext.catalogue', action: { type: 'show_component', payload: { component: 'button' } } })).toEqual({ extension: 'ext.catalogue', action: { type: 'show_component', payload: { component: 'button' } } });
    expect(() => parseOutline(outlineWith({ screen: 'catalogue', route: 'components/button' }))).toThrow(/a link names another screen by its extension id/);
    expect(() => parseOutline(outlineWith({ url: 'https://example.invalid/', screen: 'catalogue' }))).toThrow(/a link names another screen by its extension id/);
    expect(() => parseOutline(outlineWith({ extension: 'ext.catalogue', route: '/components/button' }))).toThrow(/never by a route/);
    expect(() => parseOutline(outlineWith({ url: 'https://example.invalid/', extension: 'ext.catalogue' }))).toThrow(/a link has one target, not url and extension/);
    expect(() => parseOutline(outlineWith({ extension: 'ext.catalogue', action: { type: 'show_component', payload: { component: 1 } } }))).toThrow(/action\.payload\.component: expected/);
  });

  it('runs the commands with the CLI and the template source-specs the site itself uses', () => {
    const start = outline.pages.find((page) => page.route === '/get-started');
    const commands = start?.entries.flatMap((entry) => (entry.type === 'step' && entry.code ? entry.code.lines : [])).map((line) => resolveText(line, translate, versions.vars));
    expect(commands).toContain(`npm exec --yes --package=@gears-frontx/cli@${versions.vars.cliVersion} -- frontx install ${versions.vars.shellSpec}`);
    expect(commands).toContain(`npm exec --yes --package=@gears-frontx/cli@${versions.vars.cliVersion} -- frontx add ${versions.vars.mfeIdentity} ./my-app`);
  });
});
