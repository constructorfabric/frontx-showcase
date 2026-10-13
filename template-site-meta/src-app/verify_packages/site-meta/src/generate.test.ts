// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { checkRules } from './generate.ts';
import { buildPageMap, type ScreenExtension } from './site.ts';
import { CONFIG, EXTENSIONS, ORIGIN } from './test-support/fixtures.ts';

const rulesFor = (extensions: ScreenExtension[]) => checkRules(extensions, buildPageMap(CONFIG, ORIGIN, 'screen', extensions));

describe('seo rules', () => {
  it('hold for well-formed metadata', () => {
    expect(rulesFor(EXTENSIONS)).toEqual([]);
  });

  it('require a seo block, a title and a 50 to 160 character description', () => {
    const [catalogue, home, contacts] = EXTENSIONS as [ScreenExtension, ScreenExtension, ScreenExtension];
    const errors = rulesFor([
      { ...catalogue, seo: { ...catalogue.seo, description: 'Too short.' } },
      { ...home, seo: undefined },
      { ...contacts, seo: { title: 'Contacts', description: 'x'.repeat(161) } },
    ]);
    expect(errors).toEqual([
      'catalogue-mfe /catalogue: seo description is 10 characters; it must be 50 to 160',
      'site-home-mfe /home: the screen extension has no seo block',
      'inbox-contacts-mfe /inbox-contacts: seo description is 161 characters; it must be 50 to 160',
    ]);
  });

  it('refuse two pages with one title, and a route key that is not a path inside the screen', () => {
    const [catalogue, home] = EXTENSIONS as [ScreenExtension, ScreenExtension];
    const errors = rulesFor([
      { ...catalogue, seo: { ...catalogue.seo, routes: { '/components/card': { title: 'UI Kit', description: 'A card page with a description that is long enough.' }, 'week': { title: 'Week', description: 'A week page with a description that is long enough too.' } } } },
      home,
    ]);
    expect(errors).toContain('2 pages share the title "UI Kit - FrontX"');
    expect(errors.some((error) => error.includes('seo.routes "week"'))).toBe(true);
  });
});
