import { describe, expect, it } from 'vitest';
import { renderThemeTs, renderTokensCss } from './generate.ts';
import { loadBrand, readKit } from './model.ts';
import { checkContrast, checkGenerated, checkHead, checkKitNames, checkOneSource, checkUse, checkV2Record, checkValueRules, runChecks, type CheckInput } from './rules.ts';
import { GOOD_CONFIG, GOOD_SOURCES, KIT_CSS, goodBrandJson } from '../test-support/fixtures.ts';

type Row = Record<string, unknown>;
type Json = { light: { overrides: Row[]; tokens: Row[] }; dark: Row & { tokens: Row[] }; pairs: { light: string[][] }; head: { themeColor: Row }; [key: string]: unknown };

/** A brand record from the good fixture after `edit` changed a copy of its JSON. */
function brandWith(edit: (json: Json) => void = () => {}) {
  const json = structuredClone(goodBrandJson()) as unknown as Json;
  edit(json);
  return loadBrand(JSON.stringify(json));
}

function input(over: Partial<CheckInput> = {}): CheckInput {
  const brand = over.brand ?? brandWith();
  const kit = readKit(KIT_CSS);
  return {
    brand,
    kit,
    generated: { tokensCss: { expected: renderTokensCss(brand), actual: renderTokensCss(brand) }, themeTs: { expected: renderThemeTs(brand, kit), actual: renderThemeTs(brand, kit) } },
    sources: GOOD_SOURCES,
    config: GOOD_CONFIG,
    ...over,
  };
}

const light = (json: Json) => json.light;
const override = (json: Json, token: string) => light(json).overrides.find((row) => row.token === token)!;

describe('brand check on a conforming project', () => {
  it('passes every rule', () => {
    expect(runChecks(input())).toEqual([]);
  });
});

describe('rule 1: generated files equal what brand.json generates', () => {
  it('fails when tokens.css or theme.ts was edited by hand', () => {
    const base = input();
    const edited = { ...base.generated, tokensCss: { expected: base.generated.tokensCss.expected, actual: base.generated.tokensCss.expected.replace('#0756f5', '#0000ff') } };
    expect(checkGenerated({ ...edited, themeTs: { expected: 'a', actual: 'b' } })).toEqual([expect.stringMatching(/tokens\.css .*brand:generate/), expect.stringMatching(/theme\.ts .*brand:generate/)]);
  });

  it('fails when the guideline table drifted, and ignores a guideline that is absent', () => {
    const base = input().generated;
    expect(checkGenerated({ ...base, guideline: { expected: 'x', actual: 'y' } })).toEqual([expect.stringMatching(/brand\.md/)]);
    expect(checkGenerated(base)).toEqual([]);
  });
});

describe('rule 2: overrides name kit tokens, brand tokens do not', () => {
  it('fails on an override the kit does not declare and on a brand token the kit declares', () => {
    const brand = brandWith((json) => {
      light(json).overrides.push({ token: '--primary-glow', value: '#0756f5', v2: '#0756f5', role: 'x' });
      light(json).tokens.push({ token: '--radius', value: '#0756f5', v2: '#0756f5', role: 'x' });
    });
    expect(checkKitNames(brand, readKit(KIT_CSS))).toEqual([expect.stringMatching(/--primary-glow.*not declare/), expect.stringMatching(/--radius.*kit declares/)]);
  });
});

describe('rule 3: the create-theme value rules', () => {
  it('fails on a colour fragment and on a value that is not a full colour', () => {
    const brand = brandWith((json) => {
      override(json, '--foreground').value = '220 40% 17%';
      light(json).tokens[0].value = 'blueish';
    });
    expect(checkValueRules(brand).join('\n')).toMatch(/--foreground.*fragment[\s\S]*--site-nav-foreground.*full CSS colour/);
  });

  it('fails on a hover token that is not derived from its base and on a literal alpha colour', () => {
    const brand = brandWith((json) => {
      override(json, '--primary-hover').value = '#0546cc';
      override(json, '--primary').value = '#0756f580';
    });
    expect(checkValueRules(brand).join('\n')).toMatch(/--primary .*alpha[\s\S]*--primary-hover.*color-mix/);
  });

  it('fails on a re-wrapped token and on a palette without its appearance', () => {
    const brand = brandWith((json) => {
      override(json, '--foreground').value = 'hsl(var(--primary))';
      json.dark.appearance = 'night';
    });
    expect(checkValueRules(brand).join('\n')).toMatch(/dark palette.*appearance[\s\S]*--foreground.*re-wraps/);
  });
});

describe('rule 4: contrast 4.5:1 in both appearances', () => {
  it('fails on a light pair under 4.5:1', () => {
    const brand = brandWith((json) => {
      light(json).tokens[0].value = '#aab4c8';
    });
    expect(checkContrast(brand, readKit(KIT_CSS))).toEqual([expect.stringMatching(/light --background\/--site-nav-foreground 2\.\d\d/)]);
  });

  it('fails on a dark reset under 4.5:1 against the kit dark palette', () => {
    const brand = brandWith((json) => {
      json.dark.tokens[0].value = '#1e293b';
    });
    expect(checkContrast(brand, readKit(KIT_CSS))).toEqual([expect.stringMatching(/dark --background\/--site-nav-foreground 1\.\d\d/)]);
  });

  it('reports a pair it cannot resolve instead of passing it', () => {
    const brand = brandWith((json) => {
      json.pairs.light.push(['--nowhere', '--site-nav-foreground']);
    });
    expect(checkContrast(brand, readKit(KIT_CSS))).toEqual([expect.stringMatching(/--nowhere/)]);
  });
});

describe('rule 5: every row records its V2 value, and a difference has a reason', () => {
  it('passes values equal after normalizing hex case, short hex and rem', () => {
    expect(checkV2Record(brandWith())).toEqual([]);
  });

  it('fails on a difference without a reason and on a row without a V2 value', () => {
    const brand = brandWith((json) => {
      delete override(json, '--primary-hover').reason;
      delete override(json, '--foreground').v2;
    });
    expect(checkV2Record(brand)).toEqual([expect.stringMatching(/--primary-hover.*no reason/), expect.stringMatching(/--foreground.*no V2 value/)]);
  });

  it('fails on a head colour that differs from V2 without a reason', () => {
    const brand = brandWith((json) => {
      json.head.themeColor.value = '#0756f5';
    });
    expect(checkV2Record(brand)).toEqual([expect.stringMatching(/themeColor.*no reason/)]);
  });
});

describe('rule 6: every brand token is read somewhere', () => {
  it('fails on a brand token no source reads', () => {
    const sources = GOOD_SOURCES.filter((source) => !source.path.startsWith('site/Hero'));
    expect(checkUse(brandWith(), sources)).toEqual([expect.stringMatching(/--site-text-hero-size/), expect.stringMatching(/--site-night/)]);
  });

  it('counts a read in the package art, which the other rules do not scan', () => {
    const sources = GOOD_SOURCES.filter((source) => !source.path.startsWith('site/Hero'));
    const art = [{ path: 'src/art/Slab.module.css', text: '.slab {\n  font-size: var(--site-text-hero-size);\n  color: var(--site-night);\n}\n' }];
    expect(checkUse(brandWith(), sources, art)).toEqual([]);
    expect(runChecks(input({ sources, artSources: art }))).toEqual([]);
  });
});

describe('rule 7: the brand is declared in one place', () => {
  it('fails on a brand token or an overridden kit token declared in a source, CSS or TS', () => {
    const sources = [...GOOD_SOURCES, { path: 'site/copy.css', text: '.x {\n  --primary: #0000ff;\n}\n' }, { path: 'site/Copy.tsx', text: "const style = { '--site-night': '#000' };\n" }];
    expect(checkOneSource(brandWith(), sources)).toEqual(['site/copy.css:2 declares --primary, which only brand.json declares', 'site/Copy.tsx:1 declares --site-night, which only brand.json declares']);
  });

  it('ignores reads, comments and kit tokens the brand does not override', () => {
    const sources = [{ path: 'a.css', text: '/* --primary: x; */\n.a { color: var(--primary); --secondary: #fff; }\n' }];
    expect(checkOneSource(brandWith(), sources)).toEqual([]);
  });
});

describe('rule 8: head colours equal the brand record', () => {
  it('fails on a differing or missing site config value, and without a site config', () => {
    expect(checkHead(brandWith(), { themeColor: '#0065e3' })).toEqual([expect.stringMatching(/themeColor #0065e3.*#2852ed/), expect.stringMatching(/backgroundColor/)]);
    expect(checkHead(brandWith(), undefined)).toEqual([expect.stringMatching(/no site config/)]);
  });
});
