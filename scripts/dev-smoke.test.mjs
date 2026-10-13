import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DEV_NPX_TOOLS, composedPackages, findNpxInstallNotice, missingNpxTools, remoteEntryUrls } from './dev-smoke.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let root;

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), 'dev-smoke-'));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('missingNpxTools', () => {
  it('names every tool site/node_modules/.bin does not provide', () => {
    mkdirSync(path.join(root, 'site', 'node_modules', '.bin'), { recursive: true });
    writeFileSync(path.join(root, 'site', 'node_modules', '.bin', 'tsx'), '');
    expect(missingNpxTools(root)).toEqual(['concurrently']);
  });
});

describe('composedPackages', () => {
  it('reads each package port from its mfe.json, skipping folders without one', () => {
    const packages = path.join(root, 'site', 'src-app', 'mfe_packages');
    mkdirSync(path.join(packages, 'b-mfe'), { recursive: true });
    mkdirSync(path.join(packages, 'a-mfe'), { recursive: true });
    mkdirSync(path.join(packages, 'shared'), { recursive: true });
    writeFileSync(path.join(packages, 'b-mfe', 'mfe.json'), JSON.stringify({ manifest: { remoteEntry: 'http://localhost:3020/assets/remoteEntry.js' } }));
    writeFileSync(path.join(packages, 'a-mfe', 'mfe.json'), JSON.stringify({ manifest: { remoteEntry: 'http://localhost:3010/assets/remoteEntry.js' } }));
    expect(composedPackages(root)).toEqual([
      { name: 'a-mfe', port: 3010 },
      { name: 'b-mfe', port: 3020 },
    ]);
  });
});

describe('remoteEntryUrls', () => {
  it('joins each served publicPath with its remote entry file', () => {
    const manifests = [
      { manifest: { name: 'homeMfe', metaData: { publicPath: 'http://localhost:3050/', remoteEntry: { name: 'remoteEntry.js', path: '' } } } },
      { manifest: { name: 'nested', metaData: { publicPath: 'http://localhost:3060/', remoteEntry: { name: 'remoteEntry.js', path: 'static/' } } } },
    ];
    expect(remoteEntryUrls(manifests)).toEqual([
      { name: 'homeMfe', url: 'http://localhost:3050/remoteEntry.js' },
      { name: 'nested', url: 'http://localhost:3060/static/remoteEntry.js' },
    ]);
  });
});

describe('findNpxInstallNotice', () => {
  it('catches the interactive prompt and the non-interactive warning', () => {
    expect(findNpxInstallNotice('build ok\nNeed to install the following packages:\nconcurrently@10.0.5')).toBe('Need to install the following packages:');
    expect(findNpxInstallNotice('npm warn exec The following package was not found and will be installed: concurrently@10.0.5')).toContain('concurrently@10.0.5');
    expect(findNpxInstallNotice('VITE ready in 500 ms')).toBeNull();
  });
});

describe('the site install provides every tool the shell reaches through npx', () => {
  const site = JSON.parse(readFileSync(path.join(repoRoot, 'site', 'package.json'), 'utf8'));
  const declared = { ...site.dependencies, ...site.devDependencies };
  const scripts = Object.values(site.scripts).join('\n');
  const devAll = readFileSync(path.join(repoRoot, 'site', 'scripts', 'dev-all.ts'), 'utf8');
  const used = new Set([...scripts.matchAll(/\bnpx\s+([a-z@][\w@/.-]*)/g)].map((match) => match[1]));
  // dev-all.ts passes concurrently to npx as an argument list: spawn('npx', ['concurrently', ...]).
  if (/spawn\('npx'/.test(devAll) && /\['concurrently'/.test(devAll)) used.add('concurrently');

  it('finds the tools of the dev path among them', () => {
    expect(DEV_NPX_TOOLS.filter((tool) => !used.has(tool))).toEqual([]);
  });

  it('declares each of them in site/package.json, so npx never downloads one', () => {
    expect([...used].filter((tool) => !declared[tool])).toEqual([]);
  });
});
