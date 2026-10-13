import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NOT_FOUND_ROUTE, runnerArgs, verifyUiRoutes } from './verify-ui.mjs';

describe('verifyUiRoutes', () => {
  let root;
  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), 'verify-ui-'));
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  const write = (relativePath, text) => {
    mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
    writeFileSync(path.join(root, relativePath), text);
  };

  it('takes every page of the built manifest, then every block showcase route, then the not-found route', () => {
    write('site/dist/seo-manifest.json', JSON.stringify({ pages: { a: { address: '/?screen=home' }, b: { address: '/?screen=blocks' } } }));
    const blocks = 'template-site-blocks/src-app/verify_packages/site-blocks/src/blocks';
    write(`${blocks}/PathCards/PathCards.showcase.tsx`, '');
    write(`${blocks}/Hero/Hero.showcase.tsx`, '');
    write(`${blocks}/Hero/Hero.tsx`, '');
    write(`${blocks}/NoFixture/NoFixture.tsx`, '');
    expect(verifyUiRoutes(root)).toEqual(['/?screen=home', '/?screen=blocks', '/?screen=blocks;route=hero', '/?screen=blocks;route=path-cards', NOT_FOUND_ROUTE]);
  });

  it('fails with a hint when the site has not been built', () => {
    expect(() => verifyUiRoutes(root)).toThrow(/npm run build/);
  });
});

describe('runnerArgs', () => {
  it('runs the gate: dev server with the cold-start wait dev:smoke allows, both widths, light, the root baseline, new findings fail; later flags override', () => {
    const args = runnerArgs({ root: '/r', routes: ['/?screen=home', '/?screen=docs'], extra: ['--themes', 'light,dark'] });
    expect(args).toEqual([
      '--url', 'http://localhost:5173/',
      '--start-server', 'npm run dev:all',
      '--server-cwd', path.join('/r', 'site'),
      '--server-timeout-ms', '900000',
      '--routes', '/?screen=home,/?screen=docs',
      '--widths', '1440,390',
      '--themes', 'light',
      '--out', path.join('/r', 'design-verify-report'),
      '--baseline', path.join('/r', 'scripts', 'design-verify-baseline.json'),
      '--fail-on-findings',
      '--themes', 'light,dark',
    ]);
  });

  it('leaves the baseline out for the run the baseline is built from', () => {
    const args = runnerArgs({ root: '/r', routes: ['/'], extra: [], baseline: false });
    expect(args).not.toContain('--baseline');
    expect(args).not.toContain('--fail-on-findings');
  });
});
