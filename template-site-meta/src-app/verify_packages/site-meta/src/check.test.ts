// @vitest-environment node
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { check, checkConfig, checkRoutingVersion, checkRules, generate, linkedIcons } from './generate.ts';
import { checkRasters } from './rasters.ts';
import { SITE_ASSETS } from './outputs.ts';
import { buildPageMap, readScreenExtensions, sitePaths, type ScreenExtension } from './site.ts';
import { CONFIG, EXTENSIONS, ORIGIN } from './test-support/fixtures.ts';
import { makeProject, SCREEN_DOMAIN, SHELL_INDEX, temporaryDir, write } from './test-support/project.ts';

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

/** A tool directory with its own copy of the routing package, as npm installs it when the project's copy is another version. */
function toolWithRouting(version: string): string {
  const dir = temporaryDir('site-meta-tool-', roots);
  write(path.join(dir, 'node_modules', '@gears-frontx', 'routing', 'package.json'), { name: '@gears-frontx/routing', version });
  return dir;
}

describe('sitePaths', () => {
  it('reads the project from its own folder and the config from the project, unless the config is another file', () => {
    expect(sitePaths('/work/site')).toEqual({
      project: '/work/site',
      config: '/work/site/site.config.json',
      packages: '/work/site/src-app/mfe_packages',
      screenDomain: '/work/site/packages/framework/src/plugins/microfrontends/gts/frontx.screensets/instances/domains/screen.v1.json',
      dist: '/work/site/dist',
    });
    expect(sitePaths('/work/site', '/work/site.config.json').config).toBe('/work/site.config.json');
  });
});

describe('readScreenExtensions', () => {
  it('reads screen extensions with the shell scanner rules: no shared, no dot-directories, no templateExample, no other domain', () => {
    const screens = readScreenExtensions(makeProject(roots).packages, SCREEN_DOMAIN);
    expect(screens.map((screen) => [screen.packageName, screen.route])).toEqual([
      ['demo-mfe', '/demo'],
      ['home-mfe', '/home'],
    ]);
  });
});

describe('checkRoutingVersion', () => {
  it('holds when the tool bundles the project copy, when both copies are one version, or when the project has no install yet', () => {
    const tool = temporaryDir('site-meta-tool-', roots);
    expect(checkRoutingVersion(makeProject(roots, { projectRouting: '0.3.1' }), tool)).toEqual([]);
    expect(checkRoutingVersion(makeProject(roots, { projectRouting: '0.3.0' }), toolWithRouting('0.3.0'))).toEqual([]);
    expect(checkRoutingVersion(makeProject(roots), toolWithRouting('0.3.0'))).toEqual([]);
  });

  it('fails when the tool resolves its own copy of another routing version than the project runs', () => {
    expect(checkRoutingVersion(makeProject(roots, { projectRouting: '0.3.1' }), toolWithRouting('0.3.0'))).toEqual([
      'head-sync bundles @gears-frontx/routing 0.3.0, the site runs 0.3.1; the navigation history singleton would not be shared',
    ]);
  });
});

describe('the duplicate canonical rule', () => {
  it('refuses two route keys that name one address', () => {
    const [catalogue, home] = EXTENSIONS as [ScreenExtension, ScreenExtension];
    const twins: ScreenExtension = {
      ...catalogue,
      seo: {
        ...catalogue.seo,
        routes: {
          '/week': { title: 'Week', description: 'Week: a description long enough to hold the fifty character minimum.' },
          '//week': { title: 'Week again', description: 'Week again: a description long enough to hold the fifty character minimum.' },
        },
      },
    };
    const extensions = [twins, home];
    expect(checkRules(extensions, buildPageMap(CONFIG, ORIGIN, 'screen', extensions))).toContain(`2 pages share the canonical URL "${ORIGIN}/?screen=catalogue;route=week"`);
  });
});

describe('check', () => {
  it('reports the rules alone when site/dist has no generated outputs', async () => {
    expect(await check({ paths: makeProject(roots) })).toEqual({ errors: [], compared: false });
  });

  it('holds right after generation, and names every output that drifts from the sources', async () => {
    const paths = makeProject(roots);
    await generate({ paths }, { SITE_ORIGIN: ORIGIN });
    expect(await check({ paths })).toEqual({ errors: [], compared: true });

    fs.appendFileSync(path.join(paths.dist, 'robots.txt'), '# edited by hand\n');
    expect((await check({ paths })).errors).toEqual(['dist/robots.txt differs from what the sources generate; run npm run seo:generate']);

    await generate({ paths }, { SITE_ORIGIN: ORIGIN });
    const manifest = path.join(paths.packages, 'demo-mfe', 'mfe.json');
    fs.writeFileSync(manifest, fs.readFileSync(manifest, 'utf8').replace('"Week"', '"Week view"'));
    const { errors } = await check({ paths });
    expect(errors).toEqual(
      expect.arrayContaining([
        'dist/index.html differs from what the sources generate; run npm run seo:generate',
        'dist/seo-manifest.json differs from what the sources generate; run npm run seo:generate',
        'dist/llms.txt differs from what the sources generate; run npm run seo:generate',
      ]),
    );
    expect(errors.some((error) => error.includes('sitemap.xml'))).toBe(false);
  });

  it('writes a plain-text twin per outline page from its strings and data, lists it in llms.txt and holds it to its sources', async () => {
    const paths = makeProject(roots);
    await generate({ paths }, { SITE_ORIGIN: ORIGIN });
    const week = fs.readFileSync(path.join(paths.dist, 'demo', 'week.md'), 'utf8');
    expect(week).toContain('# Week');
    expect(week).toContain('## 1. Run it');
    expect(week).toContain('npm run dev -- --port 5173');
    expect(week).toContain('Expected result: It runs on 5173.');
    expect(fs.readFileSync(path.join(paths.dist, 'demo', 'index.md'), 'utf8')).toContain(`- [Week](${ORIGIN}/?screen=demo;route=week)`);
    expect(fs.readFileSync(path.join(paths.dist, 'llms.txt'), 'utf8')).toContain(`(${ORIGIN}/demo/week.md)`);

    const strings = path.join(paths.packages, 'demo-mfe', 'src', 'screens', 'demo', 'i18n', 'en.json');
    fs.writeFileSync(strings, fs.readFileSync(strings, 'utf8').replace('Run it', 'Start it'));
    expect((await check({ paths })).errors).toEqual(['dist/demo/week.md differs from what the sources generate; run npm run seo:generate']);
  });

  it('refuses to generate when the build lacks an icon the head links', async () => {
    const paths = makeProject(roots);
    fs.rmSync(path.join(paths.dist, SITE_ASSETS.appleTouchIcon));
    await expect(generate({ paths }, { SITE_ORIGIN: ORIGIN })).rejects.toThrow(/apple-touch-icon\.png does not exist/);
  });

  it('refuses to generate when the built page links an icon the build lacks, the main favicon among them', async () => {
    const paths = makeProject(roots);
    write(path.join(paths.dist, 'index.html'), SHELL_INDEX.replace('<title>', '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />\n    <title>'));
    await expect(generate({ paths }, { SITE_ORIGIN: ORIGIN })).rejects.toThrow(/dist\/favicon\.svg does not exist/);
    write(path.join(paths.dist, 'favicon.svg'), '<svg/>');
    await expect(generate({ paths }, { SITE_ORIGIN: ORIGIN })).resolves.toBeDefined();
  });

  it('fails the check when a share image is configured without its alternative text', async () => {
    const paths = makeProject(roots);
    write(paths.config, { ...CONFIG, ogImage: '/og-image.png' });
    expect((await check({ paths })).errors).toEqual(['site.config.json: ogImage is set without ogImageAlt; the share image needs its alternative text']);
  });
}, 30000);

describe('checkConfig', () => {
  it('requires ogImageAlt with ogImage, and nothing without a share image', () => {
    expect(checkConfig({ ...CONFIG })).toEqual([]);
    expect(checkConfig({ ...CONFIG, ogImage: '/og.png', ogImageAlt: 'FrontX' })).toEqual([]);
    expect(checkConfig({ ...CONFIG, ogImage: '/og.png', ogImageAlt: '  ' })).toHaveLength(1);
  });
});

describe('linkedIcons', () => {
  it('reads every site-relative icon link of a page, and no other link', () => {
    const html = '<link rel="icon" href="/favicon.svg"><link rel="apple-touch-icon" href="/a.png"><link rel="stylesheet" href="/s.css"><link rel="icon" href="https://cdn.example/x.png"><link rel="icon" href="//cdn.example/y.png"><link rel="shortcut icon" href="/f.ico">';
    expect(linkedIcons(html)).toEqual(['favicon.svg', 'a.png', 'f.ico']);
  });

  it('reads an icon linked relative to the document, as a build with a relative base writes it', () => {
    expect(linkedIcons('<link rel="icon" href="./brand/favicon.svg"><link rel="icon" href="brand/favicon.ico">')).toEqual(['brand/favicon.svg', 'brand/favicon.ico']);
  });
});

describe('checkRasters', () => {
  const sha = (text: string) => createHash('sha256').update(text).digest('hex');

  /** A record kept outside the project, its paths relative to its own folder, as this repository keeps the share image's source next to the site. */
  function rasterRecord(): string {
    const root = temporaryDir('site-meta-rasters-', roots);
    write(path.join(root, 'art', 'icon.svg'), '<svg>icon</svg>');
    write(path.join(root, 'site', 'public', 'icon.png'), 'PNG-1');
    write(path.join(root, 'site', 'public', 'favicon.svg'), '<svg>icon</svg>');
    const record = path.join(root, 'art', 'rasters.json');
    write(record, {
      rasters: [{ file: '../site/public/icon.png', size: '32x32', source: 'icon.svg', sourceSha256: sha('<svg>icon</svg>'), sha256: sha('PNG-1') }],
      copies: [{ file: '../site/public/favicon.svg', source: 'icon.svg' }],
    });
    return record;
  }

  it('checks nothing without a record', () => {
    expect(checkRasters(undefined)).toEqual([]);
  });

  it('holds while every PNG is recorded against its source and every copy equals its source, both read relative to the record', () => {
    expect(checkRasters(rasterRecord())).toEqual([]);
  });

  it('names a source edited without drawing its PNG again, and the copy that went stale with it', () => {
    const record = rasterRecord();
    write(path.join(path.dirname(record), 'icon.svg'), '<svg>new icon</svg>');
    expect(checkRasters(record)).toEqual([
      `icon.svg changed since ../site/public/icon.png was drawn from it; render ../site/public/icon.png again at 32x32 and record both hashes in ${record}`,
      '../site/public/favicon.svg differs from its source icon.svg; copy it again',
    ]);
  });

  it('names a PNG replaced without being recorded, and a recorded file that is missing', () => {
    const record = rasterRecord();
    write(path.join(path.dirname(record), '..', 'site', 'public', 'icon.png'), 'PNG-2');
    expect(checkRasters(record)).toEqual([`../site/public/icon.png is not the PNG ${record} records; if it was rendered again from icon.svg, record its hash`]);
    fs.rmSync(path.join(path.dirname(record), '..', 'site', 'public', 'favicon.svg'));
    expect(checkRasters(record)).toContain(`../site/public/favicon.svg does not exist (${record})`);
  });
});
