import { describe, expect, it } from 'vitest';
import { outlineKeys, parseOutline } from '@site-shared/content/outline';
import outlineJson from './outline.generated.json';
import guide from './guide.json';
import strings from '../screens/templates/i18n/en.json';

const outline = parseOutline(outlineJson);

describe('templates outline', () => {
  it('names a strings key that exists for every text it reads from the strings', () => {
    expect(outlineKeys(outline).filter((key) => !(key in strings))).toEqual([]);
  });

  it('has the index and a page for every template the guide lists, in the guide order', () => {
    const listed = guide.groups.flatMap((group) => group.templates);
    expect(outline.pages.map((page) => page.route)).toEqual(['/', ...listed.map((slug) => `/${slug}`)]);
  });

  it("states each template's version as its manifest declares it", () => {
    for (const page of outline.pages.slice(1)) {
      const facts = page.entries.find((entry) => entry.type === 'facts');
      expect(facts?.type === 'facts' && facts.items.map((item) => item.value).some((value) => /^\d+\.\d+\.\d+/.test(value)), page.route).toBe(true);
    }
  });

  it('features only the groups the guide marks, so the pages of the other templates stay off the index', () => {
    const index = outline.pages[0];
    const linked = index.entries.flatMap((entry) => (entry.type === 'template-pair' || entry.type === 'template-row' ? entry.items.map((item) => ('route' in item.href ? item.href.route : '')) : []));
    const featured = guide.groups.filter((group) => 'featured' in group && group.featured).flatMap((group) => group.templates);
    expect(linked).toEqual(featured.map((slug) => `/${slug}`));
    expect(featured.length).toBeLessThan(guide.groups.flatMap((group) => group.templates).length);
  });
});
