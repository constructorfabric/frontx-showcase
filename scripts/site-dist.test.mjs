import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AGGREGATE_FILE, layoutDist, MFE_DIR, remotePublicPath } from './site-dist.mjs';

let site;

function write(file, content) {
  mkdirSync(path.dirname(path.join(site, file)), { recursive: true });
  writeFileSync(path.join(site, file), typeof content === 'string' ? content : JSON.stringify(content));
}

function readAggregate() {
  return JSON.parse(readFileSync(path.join(site, 'dist', AGGREGATE_FILE), 'utf8'));
}

/** A built remote: its enriched manifest names it by id, and its dist carries what the build writes. */
function builtRemote(name, id) {
  const dist = `src-app/mfe_packages/${name}/dist`;
  write(`src-app/mfe_packages/${name}/mfe.json`, {});
  write(`${dist}/mfe-manifest.json`, { manifest: { id, remoteEntry: 'http://localhost:3050/remoteEntry.js' } });
  write(`${dist}/mf-manifest.json`, { id });
  write(`${dist}/remoteEntry.js`, 'export {};');
  write(`${dist}/assets/lifecycle-abc.js`, 'export default {};');
  write(`${dist}/assets/lifecycle-abc.css`, '.a{}');
  write(`${dist}/shared/react.js`, 'export {};');
  write(`${dist}/index.html`, '<!doctype html>');
  write(`${dist}/mf-stats.json`, '{}');
  write(`${dist}/@mf-types.zip`, 'zip');
  write(`${dist}/@mf-types/lifecycle.d.ts`, 'export {};');
}

/** One aggregate config as generate-mfe-manifests.ts writes it: the manifest, inlined again into each entry. */
function config(id, publicPath) {
  const manifest = { id, metaData: { publicPath, remoteEntry: { name: 'remoteEntry.js', path: '', type: 'module' } }, shared: [] };
  return { manifest, entries: [{ id: `${id}.entry`, manifest: structuredClone(manifest) }], extensions: [] };
}

beforeEach(() => {
  site = mkdtempSync(path.join(tmpdir(), 'site-dist-'));
  builtRemote('home-mfe', 'manifest.home');
  builtRemote('docs-mfe', 'manifest.docs');
  builtRemote('example-mfe', 'manifest.example');
  write('src-app/mfe_packages/shared/site/index.ts', 'export {};');
  write('dist/index.html', '<!doctype html>');
  write(`dist/${AGGREGATE_FILE}`, [config('manifest.home', 'http://localhost:3050/'), config('manifest.docs', 'http://localhost:3051/')]);
});

afterEach(() => rmSync(site, { recursive: true, force: true }));

describe('remotePublicPath', () => {
  it('is the remote folder relative to the aggregate, with a trailing slash', () => {
    expect(remotePublicPath('home-mfe')).toBe(`${MFE_DIR}/home-mfe/`);
    expect(remotePublicPath('home-mfe')).not.toMatch(/^\/|^[a-z]+:/);
  });
});

describe('layoutDist', () => {
  it('copies every aggregated remote into dist/mfe/<package>/ without the build leftovers the host never reads', () => {
    layoutDist(site);
    const remote = path.join(site, 'dist', MFE_DIR, 'home-mfe');
    for (const file of ['remoteEntry.js', 'mf-manifest.json', 'assets/lifecycle-abc.js', 'assets/lifecycle-abc.css', 'shared/react.js']) {
      expect(existsSync(path.join(remote, file)), file).toBe(true);
    }
    for (const file of ['index.html', 'mf-stats.json', '@mf-types.zip', '@mf-types', 'mfe-manifest.json']) {
      expect(existsSync(path.join(remote, file)), file).toBe(false);
    }
    expect(existsSync(path.join(site, 'dist', MFE_DIR, 'docs-mfe', 'remoteEntry.js'))).toBe(true);
  });

  it('leaves out a built package the aggregate does not carry', () => {
    layoutDist(site);
    expect(existsSync(path.join(site, 'dist', MFE_DIR, 'example-mfe'))).toBe(false);
  });

  it('rewrites every publicPath, on the manifest and on each entry, to the remote folder relative to the aggregate', () => {
    layoutDist(site);
    const [home, docs] = readAggregate();
    expect(home.manifest.metaData.publicPath).toBe('mfe/home-mfe/');
    expect(home.entries[0].manifest.metaData.publicPath).toBe('mfe/home-mfe/');
    expect(docs.manifest.metaData.publicPath).toBe('mfe/docs-mfe/');
    expect(JSON.stringify(readAggregate())).not.toContain('localhost');
  });

  it('replaces a previous layout instead of merging into it', () => {
    write(`dist/${MFE_DIR}/home-mfe/assets/stale-old.js`, 'old');
    write(`dist/${MFE_DIR}/gone-mfe/remoteEntry.js`, 'old');
    layoutDist(site);
    expect(existsSync(path.join(site, 'dist', MFE_DIR, 'home-mfe', 'assets', 'stale-old.js'))).toBe(false);
    expect(existsSync(path.join(site, 'dist', MFE_DIR, 'gone-mfe'))).toBe(false);
  });

  it('refuses an aggregate config whose manifest no built package carries', () => {
    write(`dist/${AGGREGATE_FILE}`, [config('manifest.unknown', 'http://localhost:3099/')]);
    expect(() => layoutDist(site)).toThrow(/manifest\.unknown/);
  });

  it('refuses a dist without the aggregate, since the host build copies it from public/', () => {
    rmSync(path.join(site, 'dist', AGGREGATE_FILE));
    expect(() => layoutDist(site)).toThrow(new RegExp(AGGREGATE_FILE));
  });
});
