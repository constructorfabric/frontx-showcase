import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { COMPONENTS, FAMILIES, FOUNDATIONS, componentsOf } from './catalog';
import en from './screens/catalogue/i18n/en.json';
import { KIT_VERSION, typeDefinitionsUrl } from './frame/kitVersion';

const strings: Record<string, string> = en;

describe('catalog', () => {
  it('places every component in exactly one family, with a family name and a one-line description', () => {
    expect(COMPONENTS.filter((entry) => entry.family === undefined).map((entry) => entry.slug)).toEqual([]);
    expect(FAMILIES.flatMap((family) => componentsOf(family)).length).toBe(COMPONENTS.length);
    for (const family of FAMILIES) expect(strings[`family.${family}`], family).toBeTruthy();
    for (const entry of COMPONENTS) expect(strings[`description.${entry.slug}`], entry.slug).toBeTruthy();
  });

  it('names every page from the screen strings, so a page without a name is caught here and not on the page', () => {
    for (const entry of [...FOUNDATIONS, ...COMPONENTS]) expect(strings[entry.labelKey], entry.labelKey).toBeTruthy();
    expect(strings['label.input-otp']).toBe('Input OTP');
  });

  it("links type definitions the installed kit actually ships for every component", () => {
    const kitDir = path.dirname(createRequire(import.meta.url).resolve('@gears-frontx/ui-kit/package.json'));
    for (const entry of COMPONENTS) {
      const url = typeDefinitionsUrl(entry.slug);
      expect(url).toContain(`@gears-frontx/ui-kit@${KIT_VERSION}/`);
      const file = path.join(kitDir, url.split(`@${KIT_VERSION}/`)[1] ?? '');
      expect(fs.existsSync(file), file).toBe(true);
    }
  });

  it('reads the example source', async () => {
    const button = COMPONENTS.find((entry) => entry.slug === 'button');
    expect(await button?.loadSource()).toContain("from '@gears-frontx/ui-kit'");
  });
});
