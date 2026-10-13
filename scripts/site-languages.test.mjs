import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHELL_STRINGS = 'site/src-app/app/layout/i18n';
const SITE_PACKAGES = 'template-site/src-app/mfe_packages';

/** Every folder holding a site screen's locale files, relative to the repository root. */
function screenStringFolders() {
  const out = [];
  for (const pkg of fs.readdirSync(path.join(root, SITE_PACKAGES)).filter((name) => name.startsWith('site-'))) {
    const screens = path.join(SITE_PACKAGES, pkg, 'src/screens');
    if (!fs.existsSync(path.join(root, screens))) continue;
    for (const screen of fs.readdirSync(path.join(root, screens))) {
      const folder = path.join(screens, screen, 'i18n');
      if (fs.existsSync(path.join(root, folder))) out.push(folder);
    }
  }
  return out;
}

/** The `languages` the folders lack, as `folder/<code>.json` paths. */
export function missingLocales(languages, folders, exists) {
  return folders.flatMap((folder) => languages.map((code) => `${folder}/${code}.json`)).filter((file) => !exists(file));
}

describe('site languages', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));

  it('lists the page locale among the languages the header may offer', () => {
    expect(config.languages).toContain(config.locale);
  });

  it('lists only languages the shell layout and every site screen ship strings for', () => {
    const folders = [SHELL_STRINGS, ...screenStringFolders()];
    expect(folders.length).toBeGreaterThan(4);
    expect(missingLocales(config.languages, folders, (file) => fs.existsSync(path.join(root, file)))).toEqual([]);
  });

  it('names a locale file a folder lacks', () => {
    expect(missingLocales(['en', 'de'], ['a/i18n'], (file) => file.endsWith('en.json'))).toEqual(['a/i18n/de.json']);
  });
});
