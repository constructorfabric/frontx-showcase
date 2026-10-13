import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { collectSources } from './sources.ts';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'site-brand-sources-'));
const write = (file: string, text = '') => {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), text);
};
write('src-app/app/Header.module.css', 'a');
write('src-app/app/Header.tsx', 'b');
write('src-app/app/Header.test.tsx', 'c');
write('src-app/app/notes.md', 'd');
write('src-app/mfe_packages/x/node_modules/dep/index.js', 'e');
write('src-app/mfe_packages/x/dist/out.js', 'f');
write('src-app/verify_packages/site-brand/src/tokens.css', 'g');
write('src-app/verify_packages/other/src/tool.mjs', 'h');

afterAll(() => fs.rmSync(root, { recursive: true, force: true }));

describe('collectSources', () => {
  it('reads style and script sources under the roots, skipping tests, installs, build output and the excluded package', () => {
    const found = collectSources([path.join(root, 'src-app')], [path.join(root, 'src-app/verify_packages/site-brand')], root).map((source) => source.path);
    expect(found).toEqual(['src-app/app/Header.module.css', 'src-app/app/Header.tsx', 'src-app/verify_packages/other/src/tool.mjs']);
  });

  it('fails on a root that does not exist', () => {
    expect(() => collectSources([path.join(root, 'missing')], [], root)).toThrow(/missing/);
  });
});
