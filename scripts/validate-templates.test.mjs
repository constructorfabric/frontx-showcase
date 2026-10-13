import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { README_SECTIONS, checkGitignoreBundles, checkGitignoreVerifyPackages, checkTemplateShape, loadCliModule, readmeHeadings, runCli } from './validate-templates.mjs';

let root;

const README = `# template-demo\n\n${README_SECTIONS.map((s) => `## ${s}\n\ntext\n`).join('\n')}`;

/**
 * @param {string} name
 * @param {{ manifest?: Record<string, unknown>, readme?: string | null, extra?: string[] }} [options]
 */
function makeTemplate(name, { manifest = {}, readme = README, extra = [] } = {}) {
  const dir = path.join(root, `template-${name}`);
  const bundle = `.frontx/ai/@gears-frontx/frontx-template-${name}/`;
  mkdirSync(path.join(dir, bundle), { recursive: true });
  mkdirSync(path.join(dir, 'src-app/mfe_packages/demo-mfe'), { recursive: true });
  writeFileSync(path.join(dir, 'frontx-template.json'), JSON.stringify({
    schemaVersion: '1.0',
    name: `@gears-frontx/frontx-template-${name}`,
    version: '0.1.0-alpha.0',
    description: 'd',
    ownershipBoundaries: { exclusiveSubtrees: ['src-app/mfe_packages/demo-mfe/', bundle], sharedFiles: [] },
    ...manifest,
  }));
  if (readme !== null) writeFileSync(path.join(dir, 'README.md'), readme);
  for (const file of extra) {
    mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    writeFileSync(path.join(dir, file), '');
  }
  return dir;
}

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), 'validate-templates-'));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('checkTemplateShape', () => {
  it('accepts a template in the uniform shape', () => {
    expect(checkTemplateShape(makeTemplate('demo'))).toEqual([]);
  });

  it('requires the identity prefix', () => {
    const dir = makeTemplate('demo', { manifest: { name: '@gears-frontx/template-demo' } });
    expect(checkTemplateShape(dir).join('\n')).toMatch(/identity .* must be @gears-frontx\/frontx-template-demo/);
  });

  it('rejects sharedFiles, referencedTemplates and claims outside the allowed paths', () => {
    const bundle = '.frontx/ai/@gears-frontx/frontx-template-demo/';
    const dir = makeTemplate('demo', {
      manifest: {
        referencedTemplates: [],
        ownershipBoundaries: { exclusiveSubtrees: ['src-app/app/', bundle, 'src-app/mfe_packages/shared/other/'], sharedFiles: ['package.json'] },
      },
    });
    const errors = checkTemplateShape(dir).join('\n');
    expect(errors).toMatch(/referencedTemplates/);
    expect(errors).toMatch(/sharedFiles must be empty/);
    expect(errors).toMatch(/claims src-app\/app\//);
    expect(errors).toMatch(/shared folder is src-app\/mfe_packages\/shared\/demo\//);
  });

  it('requires the own AI bundle claim', () => {
    const dir = makeTemplate('demo', { manifest: { ownershipBoundaries: { exclusiveSubtrees: ['src-app/mfe_packages/demo-mfe/'], sharedFiles: [] } } });
    expect(checkTemplateShape(dir).join('\n')).toMatch(/must claim its own AI bundle/);
  });

  it('rejects a harness inside the template and files outside the shape', () => {
    const dir = makeTemplate('demo', { extra: ['package.json', 'src-app/vitest.mfe.base.ts', 'notes.txt'] });
    const errors = checkTemplateShape(dir).join('\n');
    expect(errors).toMatch(/package.json is not allowed/);
    expect(errors).toMatch(/vitest.mfe.base.ts is not allowed/);
    expect(errors).toMatch(/notes.txt is outside the template shape/);
  });

  it('ignores entries git never records, such as .DS_Store, editor swap files and installs', () => {
    const dir = makeTemplate('demo', { extra: ['.DS_Store', '.README.md.swp', 'node_modules/x/index.js', 'debug.log'] });
    expect(checkTemplateShape(dir)).toEqual([]);
  });

  it('allows a second path segment under src-app/mfe_packages/ only for the shared folder', () => {
    const bundle = '.frontx/ai/@gears-frontx/frontx-template-demo/';
    const nested = 'src-app/mfe_packages/demo-mfe/src/';
    const dir = makeTemplate('demo', { manifest: { ownershipBoundaries: { exclusiveSubtrees: ['src-app/mfe_packages/demo-mfe/', nested, 'src-app/mfe_packages/shared/', bundle], sharedFiles: [] } } });
    mkdirSync(path.join(dir, nested), { recursive: true });
    mkdirSync(path.join(dir, 'src-app/mfe_packages/shared'), { recursive: true });
    const errors = checkTemplateShape(dir);
    expect(errors).toContain(`claims ${nested}; only src-app/mfe_packages/<package>/, src-app/mfe_packages/shared/<name>/, src-app/verify_packages/<package>/ and ${bundle} are allowed`);
    expect(errors).toContain(`claims src-app/mfe_packages/shared/; only src-app/mfe_packages/<package>/, src-app/mfe_packages/shared/<name>/, src-app/verify_packages/<package>/ and ${bundle} are allowed`);
    const good = makeTemplate('good', { manifest: { ownershipBoundaries: { exclusiveSubtrees: ['src-app/mfe_packages/demo-mfe/', 'src-app/mfe_packages/shared/good/', '.frontx/ai/@gears-frontx/frontx-template-good/'], sharedFiles: [] } } });
    mkdirSync(path.join(good, 'src-app/mfe_packages/shared/good'), { recursive: true });
    expect(checkTemplateShape(good)).toEqual([]);
  });

  it('allows a tooling package under src-app/verify_packages/, one path segment deep', () => {
    const bundle = '.frontx/ai/@gears-frontx/frontx-template-tool/';
    const dir = makeTemplate('tool', { manifest: { ownershipBoundaries: { exclusiveSubtrees: ['src-app/verify_packages/tool-check/', bundle], sharedFiles: [] } } });
    mkdirSync(path.join(dir, 'src-app/verify_packages/tool-check/src'), { recursive: true });
    expect(checkTemplateShape(dir)).toEqual([]);
    const nested = makeTemplate('nested', { manifest: { ownershipBoundaries: { exclusiveSubtrees: ['src-app/verify_packages/tool-check/src/', '.frontx/ai/@gears-frontx/frontx-template-nested/'], sharedFiles: [] } } });
    mkdirSync(path.join(nested, 'src-app/verify_packages/tool-check/src'), { recursive: true });
    expect(checkTemplateShape(nested).join('\n')).toMatch(/claims src-app\/verify_packages\/tool-check\/src\/; only/);
  });

  it('accepts the brand, kit candidate and block templates: non-screen packages under src-app/verify_packages/, one beside a screen package', () => {
    const planned = {
      'site-brand': ['src-app/verify_packages/site-brand/'],
      'kit-candidates': ['src-app/verify_packages/kit-candidates/'],
      'site-blocks': ['src-app/verify_packages/site-blocks/', 'src-app/mfe_packages/site-blocks-mfe/'],
    };
    const dirs = Object.entries(planned).map(([name, packages]) => {
      const dir = makeTemplate(name, { manifest: { ownershipBoundaries: { exclusiveSubtrees: [...packages, `.frontx/ai/@gears-frontx/frontx-template-${name}/`], sharedFiles: [] } } });
      for (const subtree of packages) mkdirSync(path.join(dir, subtree, 'src'), { recursive: true });
      return dir;
    });
    for (const dir of dirs) expect(checkTemplateShape(dir)).toEqual([]);
    const gitignore = Object.entries(planned).flatMap(([name, packages]) => [`site/.frontx/ai/@gears-frontx/frontx-template-${name}/`, ...packages.filter((p) => p.startsWith('src-app/verify_packages/')).map((p) => `site/${p}`)]).join('\n');
    expect(checkGitignoreBundles(gitignore, dirs)).toEqual([]);
    expect(checkGitignoreVerifyPackages(gitignore, dirs)).toEqual([]);
  });

  it('requires the README sections in order', () => {
    const dir = makeTemplate('demo', { readme: '# t\n\n## Prerequisites\n\n## What it contributes\n' });
    const errors = checkTemplateShape(dir).join('\n');
    expect(errors).toMatch(/## Screens and routes/);
    expect(errors).toMatch(/## Prerequisites" \(or it is out of order\)/);
  });

  it('reports a missing README', () => {
    expect(checkTemplateShape(makeTemplate('demo', { readme: null }))).toContain('README.md is missing');
  });
});

describe('readmeHeadings', () => {
  it('lists level-2 headings only', () => {
    expect(readmeHeadings('# a\n## b\n### c\n## d')).toEqual(['b', 'd']);
  });
});

describe('checkGitignoreBundles', () => {
  it('passes when the listed bundles equal the templates', () => {
    expect(checkGitignoreBundles('node_modules/\nsite/.frontx/ai/@gears-frontx/frontx-template-demo/\n', ['/r/template-demo'])).toEqual([]);
  });

  it('reports missing and stale lines', () => {
    const errors = checkGitignoreBundles('site/.frontx/ai/@gears-frontx/frontx-template-gone/\n', ['/r/template-demo']);
    expect(errors.join('\n')).toMatch(/must list site\/\.frontx\/ai\/@gears-frontx\/frontx-template-demo\//);
    expect(errors.join('\n')).toMatch(/frontx-template-gone\/ but no such template exists/);
  });
});

describe('checkGitignoreVerifyPackages', () => {
  const withTool = () => {
    const dir = makeTemplate('tool', { manifest: { ownershipBoundaries: { exclusiveSubtrees: ['src-app/verify_packages/tool-check/', '.frontx/ai/@gears-frontx/frontx-template-tool/'], sharedFiles: [] } } });
    mkdirSync(path.join(dir, 'src-app/verify_packages/tool-check'), { recursive: true });
    return dir;
  };

  it('passes when every claimed tooling package is listed, as the site copy of a claimed package must stay out of git', () => {
    expect(checkGitignoreVerifyPackages('site/src-app/verify_packages/tool-check/\n', [withTool(), makeTemplate('demo')])).toEqual([]);
  });

  it('reports a claimed package the list lacks, and a listed package no template claims', () => {
    const errors = checkGitignoreVerifyPackages('site/src-app/verify_packages/gone/\n', [withTool()]).join('\n');
    expect(errors).toMatch(/must list site\/src-app\/verify_packages\/tool-check\//);
    expect(errors).toMatch(/lists site\/src-app\/verify_packages\/gone\/ but no template claims it/);
  });
});

describe('runCli', () => {
  const okCli = async () => ({
    ok: true,
    module: {
      MANIFEST_FILENAME: 'frontx-template.json',
      createFsReadFileFn: () => () => '',
      createFsListContentOwnedFilesFn: () => () => [],
      validateCommand: async () => ({ ok: true }),
    },
  });

  it('passes with zero templates and says so', async () => {
    /** @type {string[]} */
    const lines = [];
    expect(await runCli({ rootDir: root, loadCliModule: okCli, log: (l) => lines.push(l), logError: (l) => lines.push(l) })).toBe(0);
    expect(lines.at(-1)).toMatch(/OK: 0 templates/);
  });

  it('passes a valid template listed in .gitignore', async () => {
    makeTemplate('demo');
    writeFileSync(path.join(root, '.gitignore'), 'site/.frontx/ai/@gears-frontx/frontx-template-demo/\n');
    /** @type {string[]} */
    const lines = [];
    expect(await runCli({ rootDir: root, loadCliModule: okCli, log: (l) => lines.push(l), logError: (l) => lines.push(l) })).toBe(0);
    expect(lines).toContain('[validate-templates] PASS: template-demo');
    expect(lines.at(-1)).toMatch(/OK: 1 template$/);
  });

  it('fails when frontx validate fails or the shape is broken', async () => {
    makeTemplate('demo', { readme: '# none\n' });
    writeFileSync(path.join(root, '.gitignore'), 'site/.frontx/ai/@gears-frontx/frontx-template-demo/\n');
    const failingCli = async () => {
      const loaded = await okCli();
      loaded.module.validateCommand = async () => ({ ok: false, message: 'manifest broken' });
      return loaded;
    };
    /** @type {string[]} */
    const errors = [];
    expect(await runCli({ rootDir: root, loadCliModule: failingCli, log: () => {}, logError: (l) => errors.push(l) })).toBe(1);
    expect(errors.join('\n')).toMatch(/manifest broken/);
    expect(errors.join('\n')).toMatch(/README.md lacks/);
  });

  it('fails clearly when the CLI is not installed', async () => {
    /** @type {string[]} */
    const errors = [];
    expect(await runCli({ rootDir: root, loadCliModule: async () => ({ ok: false, message: 'not installed' }), logError: (l) => errors.push(l) })).toBe(1);
    expect(errors[0]).toMatch(/not installed/);
  });
});

describe('loadCliModule', () => {
  it('maps a missing module to a message', async () => {
    const error = Object.assign(new Error('x'), { code: 'ERR_MODULE_NOT_FOUND' });
    expect(await loadCliModule(async () => { throw error; })).toEqual({ ok: false, message: expect.stringMatching(/npm ci/) });
  });

  it('rethrows other errors', async () => {
    await expect(loadCliModule(async () => { throw new Error('boom'); })).rejects.toThrow('boom');
  });
});
