import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { adapt, APPLIED_TEMPLATES, compareChanges, diffShell, ownedAppliedFiles } from './shell-changes.mjs';

const EM = '\u2014';
const EN = '\u2013';

let root;

function write(file, content) {
  mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  writeFileSync(path.join(root, file), content);
}

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), 'shell-changes-'));
  write('shell/frontx-template.json', JSON.stringify({ ownershipBoundaries: { exclusiveSubtrees: ['src-app/app/', 'index.html', 'tailwind.config.ts'] } }));
  write('shell/index.html', '<title>FrontX</title>');
  write('shell/tailwind.config.ts', 'export default {};');
  write('shell/src-app/app/main.tsx', 'a');
  write('shell/src-app/app/keep.ts', 'same');
  write('site/index.html', '<title>FrontX</title>');
  write('site/src-app/app/main.tsx', 'b');
  write('site/src-app/app/keep.ts', 'same');
  write('site/src-app/app/layout/Header.tsx', 'new');
  write('site/src-app/app/node_modules/x/index.js', 'installed');
});

afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('diffShell', () => {
  it('finds the changed, added and removed files of the claimed subtrees, installs left out', () => {
    expect(diffShell(path.join(root, 'site'), path.join(root, 'shell'))).toEqual({
      changed: ['src-app/app/main.tsx'],
      added: ['src-app/app/layout/Header.tsx'],
      removed: ['tailwind.config.ts'],
      adapted: [],
      unadapted: [],
    });
  });

  it('tells an applied file that differs by the adaptations only from a changed one, and finds one that still lacks them', () => {
    write('shell/src-app/app/adapted.md', `a ${EM} b, 4${EN}8 px`);
    write('site/src-app/app/adapted.md', 'a - b, 4-8 px');
    write('shell/src-app/app/unadapted.md', `kept ${EM} as shipped`);
    write('site/src-app/app/unadapted.md', `kept ${EM} as shipped`);
    write('shell/src-app/app/edited.md', `a ${EM} b`);
    write('site/src-app/app/edited.md', 'a - b, and more');
    const result = diffShell(path.join(root, 'site'), path.join(root, 'shell'));
    expect(result.adapted).toEqual(['src-app/app/adapted.md']);
    expect(result.unadapted).toEqual(['src-app/app/unadapted.md']);
    expect(result.changed).toEqual(['src-app/app/edited.md', 'src-app/app/main.tsx']);
  });
});

describe('adapt', () => {
  it('turns both long dashes into a hyphen and leaves a binary file as it is', () => {
    expect(adapt(Buffer.from(`a ${EM} b ${EN} c`)).toString()).toBe('a - b - c');
    const binary = Buffer.from([0, 1, ...Buffer.from(EM)]);
    expect(adapt(binary).equals(binary)).toBe(true);
  });
});

describe('diffShell in a git checkout', () => {
  it('leaves out what .gitignore excludes, so a local cache or editor file is not an unrecorded addition', () => {
    execFileSync('git', ['init', '--quiet'], { cwd: root });
    write('.gitignore', '.DS_Store\n*.tsbuildinfo\n');
    write('site/src-app/app/layout/.DS_Store', 'finder');
    write('site/src-app/app/tsconfig.app.tsbuildinfo', '{}');
    write('site/src-app/app/layout/Menu.tsx', 'kept');
    const result = diffShell(path.join(root, 'site'), path.join(root, 'shell'));
    expect(result.added).toEqual(['src-app/app/layout/Header.tsx', 'src-app/app/layout/Menu.tsx']);
  });
});

describe('compareChanges', () => {
  it('names a change the list misses and a recorded change that is not there', () => {
    const actual = { changed: ['src-app/app/main.tsx'], added: [], removed: [] };
    expect(compareChanges(actual, { changed: ['index.html'], added: [], removed: [] })).toEqual([
      'site/src-app/app/main.tsx is changed against template-shell and not recorded in SHELL_CHANGES.changed',
      'SHELL_CHANGES.changed records site/index.html, which is not changed against template-shell',
    ]);
  });

  it('covers every file below a recorded folder entry, names an empty one and refuses an unadapted file', () => {
    const actual = { changed: [], added: [], removed: ['src-app/mfe_packages/demo-mfe/a.ts', 'src-app/mfe_packages/demo-mfe/b/c.ts'], adapted: [], unadapted: ['DESIGN.md'] };
    const template = { name: 'template-mfe', ledger: 'MFE_CHANGES' };
    expect(compareChanges(actual, { changed: [], added: [], removed: ['src-app/mfe_packages/demo-mfe/', 'src-app/mfe_packages/_blank-mfe/'] }, template)).toEqual([
      'MFE_CHANGES.removed records site/src-app/mfe_packages/_blank-mfe/, which is not removed against template-mfe',
      'site/DESIGN.md keeps text of template-mfe the adaptations change (long dashes become "-"); run npm run shell:changes -- --adapt',
    ]);
  });
});

describe('ownedAppliedFiles', () => {
  it('owns the changed and added applied files, never a removed one', () => {
    const owned = ownedAppliedFiles();
    expect(owned).toContain('site/src-app/app/layout/navigation.ts');
    for (const { changes } of APPLIED_TEMPLATES) for (const file of changes.removed) expect(owned).not.toContain(`site/${file}`);
  });
});
