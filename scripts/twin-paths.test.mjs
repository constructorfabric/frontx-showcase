// The plain-text twins are written by template-site-meta's generator and linked by template-site's screens, each with its own copy of the path rule, because neither template may reference the other. This holds the two copies to one answer over the composed site; a disagreement would 404 every plain-text link while each template's own checks stay green.
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'site');
// Imported at run time from the composed copies, which resolve their dependencies from the site's install.
const load = (file) => import(pathToFileURL(path.join(site, file)).href);

describe('twin paths', () => {
  it('agree between the generator and the screens that link them, for the root, a nested route, a single segment and an agent task', async () => {
    const generator = await load('src-app/verify_packages/site-meta/src/twins.ts');
    const screens = await load('src-app/mfe_packages/shared/site/content/twins.ts');
    for (const route of ['/', '/a/b', '/template-shell']) expect(generator.twinPath('docs', route)).toBe(screens.twinPath('docs', route));
    expect(generator.twinPath('docs', '/')).toBe('/docs/index.md');
    for (const route of ['/', '/first-change']) expect(generator.taskTwinPath('docs', route, 'agent-task')).toBe(screens.taskTwinPath('docs', route, 'agent-task'));
  });
});
