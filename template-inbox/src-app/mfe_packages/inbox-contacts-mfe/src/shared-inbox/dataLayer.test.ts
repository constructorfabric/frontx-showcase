import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * The inbox reads, writes and keeps state through FrontX's own layers, never through a copy of them: `useApiQuery` and `useApiMutation` of `@gears-frontx/react` over the shared query cache, the shell's `RestMockPlugin` switched by the framework's `mock()`, and FrontX slices with their actions and effects for what a screen keeps across mounts. A source scan over the shared folder and every inbox package present pins that, so a home-grown hook, mock plugin or module-level store cannot come back unnoticed. The packages are found, not listed: a project that drops a screen keeps this suite.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const packagesRoot = path.resolve(here, '../../..');
const sharedRoot = path.join(packagesRoot, 'shared/inbox');

/**
 * The inbox screen packages present under `root` (`inbox-*-mfe` folders with a `src/`), and those of them that keep state of their own (a `src/slices/` folder).
 * @param root - the folder holding the packages and `shared/inbox/`
 */
function inboxPackages(root: string): { all: string[]; stateful: string[] } {
  const all = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^inbox-[a-z-]+-mfe$/.test(entry.name) && fs.existsSync(path.join(root, entry.name, 'src')))
    .map((entry) => entry.name)
    .sort();
  return { all, stateful: all.filter((name) => fs.existsSync(path.join(root, name, 'src/slices'))) };
}

const packages = inboxPackages(packagesRoot);

const listSources = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'node_modules' || entry.name === 'dist' ? [] : listSources(full);
    return /\.(ts|tsx)$/.test(entry.name) && !/\.test\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });

const sources = [sharedRoot, ...packages.all.map((name) => path.join(packagesRoot, name, 'src'))].flatMap(listSources);
const read = (file: string): string => fs.readFileSync(file, 'utf8');
const relative = (file: string): string => path.relative(packagesRoot, file);

describe('the inbox data and state layers', () => {
  it('finds the sources it scans', () => {
    expect(packages.all.length).toBeGreaterThan(0);
    expect(sources.length).toBeGreaterThan(20);
  });

  it('scans the packages a project kept, without failing on one it dropped', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'inbox-packages-'));
    try {
      for (const dir of ['shared/inbox/api', 'inbox-chat-mfe/src/slices', 'inbox-contacts-mfe/src', 'inbox-notes-mfe']) fs.mkdirSync(path.join(root, dir), { recursive: true });
      expect(inboxPackages(root)).toEqual({ all: ['inbox-chat-mfe', 'inbox-contacts-mfe'], stateful: ['inbox-chat-mfe'] });
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('keeps no query hooks, mock plugin or store factory of its own', () => {
    for (const removed of ['api/queries.ts', 'api/RestMockPlugin.ts', 'ui/createStore.ts']) {
      expect(fs.existsSync(path.join(sharedRoot, removed)), removed).toBe(false);
    }
    const offenders = sources.filter((file) =>
      /function\s+use(ApiQuery|ApiMutation)\b|class\s+RestMockPlugin\b|function\s+createStore\b/.test(read(file))
    );
    expect(offenders.map(relative)).toEqual([]);
  });

  it('reads and writes through the query hooks of @gears-frontx/react, without opting out of the shared cache', () => {
    const users = sources.filter((file) => /\buseApi(Query|Mutation)\(/.test(read(file)));
    expect(users.length).toBeGreaterThanOrEqual(4);
    for (const file of users) {
      expect(read(file), relative(file)).toMatch(/import\s*\{[^}]*\buseApi(Query|Mutation)\b[^}]*\}\s*from\s*'@gears-frontx\/react'/);
    }
    expect(sources.filter((file) => /staleTime:\s*0\b/.test(read(file))).map(relative)).toEqual([]);
  });

  it("declares every service's mocks on the shell's RestMockPlugin", () => {
    const services = sources.filter((file) => /extends BaseApiService\b/.test(read(file)));
    // One service per `*ApiService.ts` of the shared folder's and each present package's `api/` folder.
    const apiDirs = [path.join(sharedRoot, 'api'), ...packages.all.map((name) => path.join(packagesRoot, name, 'src/api'))].filter((dir) => fs.existsSync(dir));
    const declared = apiDirs.flatMap((dir) => fs.readdirSync(dir).filter((name) => /ApiService\.ts$/.test(name)).map((name) => path.join(dir, name)));
    expect(services.map(relative).sort()).toEqual(declared.map(relative).sort());
    for (const file of services) {
      expect(read(file), relative(file)).toMatch(/import\s*\{\s*RestMockPlugin\s*\}\s*from\s*'@gears-frontx\/frontx-template-shell'/);
    }
  });

  it('keeps screen state in FrontX slices registered with their effects, not in module-level stores', () => {
    const stores = sources.filter((file) => /export const \w+Store\s*=/.test(read(file)) || /from '@inbox-shared\/ui\/createStore'/.test(read(file)));
    expect(stores.map(relative)).toEqual([]);
    expect(packages.stateful.length).toBeGreaterThan(0);
    for (const name of packages.stateful) {
      const init = read(path.join(packagesRoot, name, 'src/init.ts'));
      expect(init, name).toMatch(/registerSlice\(\w+Slice,\s*init\w+Effects\)/);
      for (const layer of ['slices', 'actions', 'effects', 'events']) {
        expect(fs.existsSync(path.join(packagesRoot, name, 'src', layer)), `${name}/src/${layer}`).toBe(true);
      }
    }
  });
});
