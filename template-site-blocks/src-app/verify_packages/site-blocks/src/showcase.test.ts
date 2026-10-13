import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { collectShowcase, showcaseEntries, slugOf } from './showcase';

const Fixture = () => null;

describe('slugOf', () => {
  it('turns a block folder name into its route slug', () => {
    expect(slugOf('PathCards')).toBe('path-cards');
    expect(slugOf('DocsFrameWithRail')).toBe('docs-frame-with-rail');
    expect(slugOf('Facts')).toBe('facts');
  });
});

describe('collectShowcase', () => {
  it('reads each fixture module into an entry, sorted by group then title', () => {
    const entries = collectShowcase({
      './blocks/PathCards/PathCards.showcase.tsx': { default: Fixture, showcase: { title: 'Path cards', group: 'docs', summary: 'S' } },
      './blocks/SectionFrame/SectionFrame.showcase.tsx': { default: Fixture, showcase: { title: 'Section frame', group: 'section', summary: 'S' } },
      './blocks/CtaBox/CtaBox.showcase.tsx': { default: Fixture, showcase: { title: 'Call to action box', group: 'docs', summary: 'S' } },
    });
    expect(entries.map((entry) => entry.slug)).toEqual(['section-frame', 'cta-box', 'path-cards']);
    expect(entries[0]?.Fixture).toBe(Fixture);
  });

  it('fails loudly on a module that is not a fixture', () => {
    expect(() => collectShowcase({ './blocks/X/X.showcase.tsx': { default: Fixture } })).toThrow(/not a showcase fixture/);
  });
});

describe('showcaseEntries', () => {
  it('lists every block folder that ships a fixture, each slug once', () => {
    const slugs = showcaseEntries.map((entry) => entry.slug);
    expect(slugs).toEqual(expect.arrayContaining(['section-frame', 'page-intro', 'docs-frame', 'docs-frame-with-rail', 'section-heading']));
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('bundled block source', () => {
  // The FrontX MFE loader (@gears-frontx/mfes 0.3.1) finds a chunk's imports with a regular expression over its source text, so a string such as "import { App } from './App';" in a block or a fixture is fetched as a module and the whole showcase screen fails to load.
  it('holds no string that reads as a relative import', () => {
    const blocks = join(dirname(fileURLToPath(import.meta.url)), 'blocks');
    const offenders = readdirSync(blocks, { recursive: true, encoding: 'utf8' })
      .filter((file) => /\.tsx?$/.test(file) && !/\.test\.tsx?$/.test(file))
      .filter((file) => readFileSync(join(blocks, file), 'utf8').split('\n').some((line) => !/^\s*(import\b|export\b|\})/.test(line) && /from\s*\\?['"]\.\.?\//.test(line)));
    expect(offenders).toEqual([]);
  });
});
