import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { renderThemeTs, renderTokensCss } from './generate.ts';
import { loadBrand, readKit } from './model.ts';
import { checkContrast, checkGenerated, checkKitNames, checkV2Record, checkValueRules } from './rules.ts';

const PACKAGE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const brand = loadBrand(fs.readFileSync(path.join(PACKAGE, 'src/brand.json'), 'utf8'));
// The kit stylesheet the project installs; in the template's own directory no kit is installed and the kit-dependent test is skipped (the project's brand:check runs it).
let kitCss: string | undefined;
try {
  kitCss = fs.readFileSync(createRequire(path.join(PACKAGE, 'package.json')).resolve('@gears-frontx/ui-kit/theme.css'), 'utf8');
} catch {
  kitCss = undefined;
}

describe('the shipped brand record', () => {
  it('follows the value rules and records V2 for every row', () => {
    expect(checkValueRules(brand)).toEqual([]);
    expect(checkV2Record(brand)).toEqual([]);
  });

  it('keeps a text and surface pair for every text token the site reads (28), and checks the dark resets', () => {
    expect(brand.pairs.light.length).toBeGreaterThanOrEqual(28);
    expect(brand.pairs.light).toContainEqual(['--secondary', '--secondary-foreground']);
    expect(brand.pairs.dark).toContainEqual(['--muted', '--site-label-foreground']);
  });

  it('generates the shipped tokens.css', () => {
    expect(fs.readFileSync(path.join(PACKAGE, 'src/tokens.css'), 'utf8')).toBe(renderTokensCss(brand));
  });

  it.skipIf(kitCss === undefined)('agrees with the installed kit: names, contrast and the generated theme.ts', () => {
    const kit = readKit(kitCss as string);
    expect(checkKitNames(brand, kit)).toEqual([]);
    expect(checkContrast(brand, kit)).toEqual([]);
    const themeTs = fs.readFileSync(path.join(PACKAGE, 'src/theme.ts'), 'utf8');
    expect(checkGenerated({ tokensCss: { expected: '', actual: '' }, themeTs: { expected: renderThemeTs(brand, kit), actual: themeTs } })).toEqual([]);
  });
});
