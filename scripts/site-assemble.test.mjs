import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { STATE_FILE, assemble, computeDrift, listFiles, main } from './site-assemble.mjs';

/** How long a watch test waits for the watcher to react to a file-system event. */
const WATCH_EVENT_BUDGET_MS = 20000;

let root;

/**
 * @param {string} rel
 * @param {string} content
 */
function write(rel, content) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

/** @param {string} rel */
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
/** @param {string} rel */
const exists = (rel) => fs.existsSync(path.join(root, rel));

/**
 * @param {string} name
 * @param {string[]} subtrees
 */
function template(name, subtrees) {
  write(`template-${name}/frontx-template.json`, JSON.stringify({ name: `@gears-frontx/frontx-template-${name}`, ownershipBoundaries: { exclusiveSubtrees: subtrees, sharedFiles: [] } }));
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(tmpdir(), 'site-assemble-'));
  fs.mkdirSync(path.join(root, 'site', 'src-app'), { recursive: true });
  template('home', ['src-app/mfe_packages/home-mfe/', '.frontx/ai/@gears-frontx/frontx-template-home/']);
  write('template-home/src-app/mfe_packages/home-mfe/package.json', '{"name":"home"}');
  write('template-home/src-app/mfe_packages/home-mfe/src/a.ts', 'export const a = 1;\n');
  write('template-home/src-app/mfe_packages/home-mfe/node_modules/x/index.js', 'ignored');
  write('template-home/src-app/mfe_packages/home-mfe/dist/out.js', 'ignored');
  write('template-home/.frontx/ai/@gears-frontx/frontx-template-home/extension.json', '{}');
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe('listFiles', () => {
  it('skips installs and build output', () => {
    expect(listFiles(path.join(root, 'template-home/src-app/mfe_packages/home-mfe'))).toEqual(['package.json', 'src/a.ts']);
  });
});

describe('assemble', () => {
  it('copies claimed subtrees without node_modules and dist, and records sha256 per file', () => {
    const result = assemble(root);
    expect(result.errors).toEqual([]);
    expect(result.written).toEqual([
      '.frontx/ai/@gears-frontx/frontx-template-home/extension.json',
      'src-app/mfe_packages/home-mfe/package.json',
      'src-app/mfe_packages/home-mfe/src/a.ts',
    ]);
    expect(read('site/src-app/mfe_packages/home-mfe/src/a.ts')).toBe('export const a = 1;\n');
    expect(exists('site/src-app/mfe_packages/home-mfe/node_modules')).toBe(false);
    expect(exists('site/src-app/mfe_packages/home-mfe/dist')).toBe(false);
    const state = JSON.parse(read(path.join('site', STATE_FILE)));
    expect(Object.keys(state.files)).toHaveLength(3);
    expect(state.files['src-app/mfe_packages/home-mfe/src/a.ts']).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is idempotent and propagates template edits', () => {
    assemble(root);
    expect(assemble(root).written).toEqual([]);
    write('template-home/src-app/mfe_packages/home-mfe/src/a.ts', 'export const a = 2;\n');
    expect(assemble(root).written).toEqual(['src-app/mfe_packages/home-mfe/src/a.ts']);
    expect(read('site/src-app/mfe_packages/home-mfe/src/a.ts')).toBe('export const a = 2;\n');
  });

  it('restores a site copy edited by hand', () => {
    assemble(root);
    write('site/src-app/mfe_packages/home-mfe/src/a.ts', 'edited');
    expect(assemble(root).written).toEqual(['src-app/mfe_packages/home-mfe/src/a.ts']);
    expect(read('site/src-app/mfe_packages/home-mfe/src/a.ts')).toBe('export const a = 1;\n');
  });

  it('removes what it created when no template claims it any more, and keeps build output only while claimed', () => {
    assemble(root);
    write('site/src-app/mfe_packages/home-mfe/dist/out.js', 'built');
    fs.rmSync(path.join(root, 'template-home/src-app/mfe_packages/home-mfe/src/a.ts'));
    expect(assemble(root).removed).toEqual(['src-app/mfe_packages/home-mfe/src/a.ts']);
    expect(exists('site/src-app/mfe_packages/home-mfe/src')).toBe(false);
    expect(exists('site/src-app/mfe_packages/home-mfe/dist/out.js')).toBe(true);
    fs.rmSync(path.join(root, 'template-home'), { recursive: true });
    const result = assemble(root);
    expect(result.removed).toContain('src-app/mfe_packages/home-mfe/package.json');
    expect(exists('site/src-app/mfe_packages/home-mfe')).toBe(false);
    expect(exists('site/.frontx/ai/@gears-frontx/frontx-template-home')).toBe(false);
  });

  it('refuses to overwrite a path it did not create', () => {
    write('site/src-app/mfe_packages/home-mfe/package.json', '{"name":"foreign"}');
    const result = assemble(root);
    expect(result.errors.join('\n')).toMatch(/refusing to overwrite site\/src-app\/mfe_packages\/home-mfe\/package.json/);
    expect(read('site/src-app/mfe_packages/home-mfe/package.json')).toBe('{"name":"foreign"}');
    expect(exists(path.join('site', STATE_FILE))).toBe(false);
  });

  it('refuses a foreign file inside a claimed subtree', () => {
    assemble(root);
    write('site/src-app/mfe_packages/home-mfe/src/extra.ts', 'x');
    expect(assemble(root).errors.join('\n')).toMatch(/home-mfe\/src\/extra.ts is inside a claimed subtree but in no template/);
  });

  it('leaves paths outside the claimed subtrees alone', () => {
    write('site/src-app/mfe_packages/_blank-mfe/package.json', '{}');
    write('site/src-app/app/main.tsx', 'shell');
    expect(assemble(root).errors).toEqual([]);
    expect(read('site/src-app/mfe_packages/_blank-mfe/package.json')).toBe('{}');
    expect(read('site/src-app/app/main.tsx')).toBe('shell');
  });

  it('reports a path two templates claim', () => {
    template('other', ['src-app/mfe_packages/home-mfe/']);
    write('template-other/src-app/mfe_packages/home-mfe/package.json', '{}');
    expect(assemble(root).errors.join('\n')).toMatch(/claimed by both template-home and template-other/);
  });
});

describe('computeDrift', () => {
  it('is empty right after assembling', () => {
    assemble(root);
    expect(computeDrift(root)).toEqual({ drift: [], errors: [] });
  });

  it('reports drift both ways', () => {
    assemble(root);
    write('site/src-app/mfe_packages/home-mfe/src/a.ts', 'edited');
    write('site/src-app/mfe_packages/home-mfe/src/extra.ts', 'x');
    write('template-home/src-app/mfe_packages/home-mfe/src/new.ts', 'new');
    write('site/src-app/mfe_packages/home-mfe/dist/ignored.js', 'built');
    const kinds = Object.fromEntries(computeDrift(root).drift.map((d) => [d.path, d.kind]));
    expect(kinds).toEqual({
      'src-app/mfe_packages/home-mfe/src/a.ts': 'differs from template',
      'src-app/mfe_packages/home-mfe/src/extra.ts': 'not in any template',
      'src-app/mfe_packages/home-mfe/src/new.ts': 'missing in site',
    });
  });
});

describe('computeDrift over the composition directory', () => {
  it('reports every entry of mfe_packages/ and shared/ that no template claims, except the state file', () => {
    template('inbox', ['src-app/mfe_packages/shared/inbox/']);
    write('template-inbox/src-app/mfe_packages/shared/inbox/index.ts', 'export {};\n');
    assemble(root);
    write('site/src-app/mfe_packages/_blank-mfe/package.json', '{}');
    write('site/src-app/mfe_packages/README.md', 'readme');
    write('site/src-app/mfe_packages/shared/old/index.ts', 'old');
    write('site/src-app/mfe_packages/shared/notes.md', 'notes');
    write('site/src-app/mfe_packages/.DS_Store', 'junk');
    const unclaimed = computeDrift(root).drift.filter((d) => d.kind === 'no template claims this entry').map((d) => d.path);
    expect(unclaimed).toEqual([
      'src-app/mfe_packages/_blank-mfe/',
      'src-app/mfe_packages/README.md',
      'src-app/mfe_packages/shared/notes.md',
      'src-app/mfe_packages/shared/old/',
    ]);
    /** @type {string[]} */
    const errors = [];
    expect(main(['--check'], { rootDir: root, log: () => {}, logError: (l) => errors.push(l) })).toBe(1);
    expect(errors.join('\n')).toMatch(/site\/src-app\/mfe_packages\/_blank-mfe\/: no template claims this entry/);
  });
});

describe('a malformed template manifest', () => {
  it('fails a run and --check with a clear message instead of a stack', () => {
    write('template-home/frontx-template.json', '{ not json');
    for (const argv of [[], ['--check']]) {
      /** @type {string[]} */
      const errors = [];
      expect(main(argv, { rootDir: root, log: () => {}, logError: (l) => errors.push(l) })).toBe(1);
      expect(errors.join('\n')).toMatch(/JSON/);
      expect(errors.join('\n')).toMatch(/fix the template/);
    }
  });

  it('does not stop --watch, which re-assembles once the manifest is fixed', async () => {
    write('template-home/frontx-template.json', '{ not json');
    /** @type {string[]} */
    const errors = [];
    /** @type {string[]} */
    const lines = [];
    /** @type {() => void} */
    let stop = () => {};
    expect(main(['--watch'], { rootDir: root, log: (l) => lines.push(l), logError: (l) => errors.push(l), onWatch: (s) => (stop = s) })).toBeUndefined();
    try {
      expect(errors.join('\n')).toMatch(/fix the template/);
      expect(lines).toContain('site:assemble --watch: watching the templates; Ctrl+C to stop');
      // macOS FSEvents drops a write made right after fs.watch returns (seen in full test runs: the callback never fired), so the fix is re-written on every poll until the watcher has seen one; a watcher that never re-assembles still fails.
      await expect
        .poll(
          () => {
            template('home', ['src-app/mfe_packages/home-mfe/', '.frontx/ai/@gears-frontx/frontx-template-home/']);
            return exists('site/src-app/mfe_packages/home-mfe/src/a.ts');
          },
          { timeout: WATCH_EVENT_BUDGET_MS, interval: 250 },
        )
        .toBe(true);
    } finally {
      stop();
    }
  }, WATCH_EVENT_BUDGET_MS + 5000);
});

describe('main', () => {
  it('returns non-zero for --check on drift and names the file', () => {
    assemble(root);
    write('site/src-app/mfe_packages/home-mfe/package.json', '{"name":"home"}x');
    /** @type {string[]} */
    const errors = [];
    expect(main(['--check'], { rootDir: root, log: () => {}, logError: (l) => errors.push(l) })).toBe(1);
    expect(errors.join('\n')).toMatch(/site\/src-app\/mfe_packages\/home-mfe\/package.json: differs from template/);
    expect(main([], { rootDir: root, log: () => {}, logError: () => {} })).toBe(0);
    expect(main(['--check'], { rootDir: root, log: () => {}, logError: () => {} })).toBe(0);
  });
});
