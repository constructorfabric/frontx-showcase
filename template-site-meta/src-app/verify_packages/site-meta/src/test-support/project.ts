/**
 * A FrontX project in a temporary directory, the way site-meta reads one: the site config, the shell's screen domain, composed packages, a built `dist/` and the routing versions.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { SITE_ASSETS } from '../outputs.ts';
import { sitePaths, type SitePaths } from '../site.ts';
import { CONFIG } from './fixtures.ts';

export const SCREEN_DOMAIN = 'gts.frontx.mfes.ext.domain.v1~frontx.screensets.layout.screen.v1';
const OTHER_DOMAIN = 'gts.frontx.mfes.ext.domain.v1~frontx.demo.widgets.v1';
export const SHELL_INDEX = '<!doctype html>\n<html lang="en">\n  <head>\n    <title>FrontX</title>\n  </head>\n  <body><div id="root"></div></body>\n</html>\n';

export function write(file: string, content: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, typeof content === 'string' ? content : `${JSON.stringify(content, null, 2)}\n`);
}

function screenExtension(token: string, order: number, extra: Record<string, unknown> = {}) {
  return {
    id: `ext.${token}`,
    domain: SCREEN_DOMAIN,
    route: `/${token}`,
    presentation: { label: token, order },
    seo: { title: `Title of ${token}`, description: `${token}: a description long enough to hold the fifty character minimum.` },
    ...extra,
  };
}

/** A temporary directory that `cleanup` removes. */
export function temporaryDir(prefix: string, cleanup: string[]): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  cleanup.push(dir);
  return dir;
}

/**
 * A project with two screens (one with an outline page per route), a widget extension of another domain and the packages the shell's scanners skip. The site config sits outside the project, as a repository that keeps it next to the project passes it with `--config`.
 * @param cleanup - collects the directory for removal
 * @param options.projectRouting - the routing version the project installs, when it has an install
 */
export function makeProject(cleanup: string[], options: { projectRouting?: string } = {}): SitePaths {
  const root = temporaryDir('site-meta-project-', cleanup);
  const paths = sitePaths(path.join(root, 'site'), path.join(root, 'site.config.json'));
  write(paths.config, { ...CONFIG });
  write(paths.screenDomain, { id: SCREEN_DOMAIN, route: 'screen' });
  write(path.join(paths.packages, 'home-mfe', 'mfe.json'), { extensions: [screenExtension('home', 10)] });
  write(path.join(paths.packages, 'demo-mfe', 'mfe.json'), {
    extensions: [
      screenExtension('demo', 20, { seo: { title: 'Demo', description: 'Demo: a description long enough to hold the fifty character minimum.', routes: { '/week': { title: 'Week', description: 'Week: a description long enough to hold the fifty character minimum.' } } } }),
      { id: 'ext.widget', domain: OTHER_DOMAIN, route: '/widget-alpha' },
    ],
  });
  write(path.join(paths.packages, 'shared', 'inbox', 'mfe.json'), { extensions: [screenExtension('shared-screen', 30)] });
  write(path.join(paths.packages, '.hidden-mfe', 'mfe.json'), { extensions: [screenExtension('hidden', 40)] });
  write(path.join(paths.packages, 'example-mfe', 'mfe.json'), { templateExample: true, extensions: [screenExtension('example', 50)] });
  fs.mkdirSync(path.join(paths.packages, 'no-manifest-mfe'), { recursive: true });
  if (options.projectRouting) write(path.join(paths.project, 'node_modules', '@gears-frontx', 'routing', 'package.json'), { name: '@gears-frontx/routing', version: options.projectRouting });
  write(path.join(paths.dist, 'index.html'), SHELL_INDEX);
  // The icons the head links; the shell's public folder puts them into dist/ in a real build.
  for (const asset of Object.values(SITE_ASSETS)) write(path.join(paths.dist, asset), 'png');
  // An outline page per route of the demo screen, the way template-site's docs screen declares its pages.
  write(path.join(paths.packages, 'demo-mfe', 'src', 'screens', 'demo', 'i18n', 'en.json'), { title: 'Demo pages', lead: 'What the demo shows.', step: 'Run it', expected: 'It runs on {port}.' });
  write(path.join(paths.packages, 'demo-mfe', 'src', 'data', 'versions.json'), { vars: { port: '5173' } });
  write(path.join(paths.packages, 'demo-mfe', 'src', 'content', 'outline.json'), {
    screen: 'demo',
    strings: 'src/screens/demo/i18n/en.json',
    data: 'src/data/versions.json',
    pages: [
      { route: '/', title: 't:title', lead: 't:lead', entries: [{ type: 'card-tiles', items: [{ title: 'Week', href: { route: '/week' } }] }] },
      { route: '/week', title: 'Week', lead: 'The week.', entries: [{ type: 'step', id: 'run', title: 't:step', code: { title: 'Run', lines: ['npm run dev -- --port {port}'] }, expected: 't:expected' }] },
    ],
  });
  return paths;
}
