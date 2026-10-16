import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildDocsVersions, buildLibsData, buildTemplatesOutline, DOCS_OUTPUT, inventoryTemplateDir, LIBS_OUTPUT, MAX_KEY_FILE_BYTES, parseSourceSpec, plainDashes, readKeyFiles, runSiteData, screenTargets, stringifyGenerated, TEMPLATES_GUIDE, TEMPLATES_OUTPUT } from './site-data.mjs';

const SHA = '3b6cddb2a700ae76bc5e1991204e127de566d597';
const SHELL_SPEC = `github:acme/templates//template-shell@${SHA}`;
const MFE_SPEC = `github:acme/templates//template-mfe@${SHA}`;
const EM = String.fromCharCode(0x2014);
const RELEASE = '00f71b2380ccbe7d12a68d0f021bb69112a25bda';
const PATCH = 'ec7cf9849ed767c5c32b00edb75901fd1950a378';
const REGISTRY = 'https://registry.npmjs.org';
const SCREEN_DOMAIN = 'gts.frontx.mfes.ext.domain.v1~frontx.screensets.layout.screen.v1';
const HOME = 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~acme.site.screens.home.v1';
const DOCS = 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~acme.site.screens.docs.v1';
const SHOW_GUIDE = 'gts.frontx.mfes.comm.action.v1~acme.site.nav.show_guide.v1~';

/** The registry's records: every version the fixtures pin, the runtime patch published from a later commit than the rest. */
let held;
const registry = (name, version) => held[`${name}@${version}`];
const tarball = (name, version) => `${REGISTRY}/${name}/-/${name.split('/')[1]}-${version}.tgz`;
/** A lock entry resolved from the registry. */
const locked = (name, version) => ({ version, resolved: tarball(name, version) });

let root;

function write(file, content) {
  mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  writeFileSync(path.join(root, file), typeof content === 'string' ? content : `${JSON.stringify(content, null, 2)}\n`);
}

const manifest = (name, version, description, subtrees = ['src/']) => ({ schemaVersion: '1.0', name, version, description, ownershipBoundaries: { exclusiveSubtrees: subtrees, sharedFiles: [] } });

/** A repository with two official templates in the inventory, one template of its own, a guide, registry packages and their installs. */
function makeRepo() {
  root = mkdtempSync(path.join(tmpdir(), 'site-data-'));
  write('site/.frontx/provenance.json', [
    { templateIdentity: '@gears-frontx/frontx-template-shell', scaffoldedFromVersion: '0.1.0-alpha.5', sourceSpec: SHELL_SPEC, occupiedOwnershipBoundary: '.' },
    { templateIdentity: '@gears-frontx/frontx-template-mfe', scaffoldedFromVersion: '0.1.0-alpha.2', sourceSpec: MFE_SPEC, occupiedOwnershipBoundary: '.' },
  ]);
  write('.frontx-inventory/index.json', { '@gears-frontx/frontx-template-shell': { source: SHELL_SPEC }, '@gears-frontx/frontx-template-mfe': { source: MFE_SPEC } });
  write('.frontx-inventory/@gears-frontx/frontx-template-shell/frontx-template.json', manifest('@gears-frontx/frontx-template-shell', '0.1.0-alpha.5', `The host ${EM} with a dash.`));
  write('.frontx-inventory/@gears-frontx/frontx-template-shell/src/main.tsx', 'one\ntwo\n');
  write('.frontx-inventory/@gears-frontx/frontx-template-mfe/frontx-template.json', manifest('@gears-frontx/frontx-template-mfe', '0.1.0-alpha.2', 'The workspace.'));
  write('.frontx-inventory/@gears-frontx/frontx-template-mfe/src/x.ts', 'x\n');
  write('template-site/frontx-template.json', manifest('@gears-frontx/frontx-template-site', '0.2.0-alpha.0', 'The sections.'));
  write('template-site/README.md', '# site\n');
  // The template's screens: home opens at its root only, docs declares the action that shows one guide.
  write('template-site/src-app/mfe_packages/site-home-mfe/mfe.json', { entries: [{ id: 'entry.home', actions: [] }], extensions: [{ id: HOME, domain: SCREEN_DOMAIN, entry: 'entry.home', route: '/home' }] });
  write('template-site/src-app/mfe_packages/site-docs-mfe/mfe.json', {
    schemas: [{ $id: `gts://${SHOW_GUIDE}`, properties: { payload: { properties: { guide: { type: 'string', enum: ['get-started'] } }, required: ['guide'] } } }],
    entries: [{ id: 'entry.docs', actions: [SHOW_GUIDE] }],
    extensions: [{ id: DOCS, domain: SCREEN_DOMAIN, entry: 'entry.docs', route: '/docs' }],
  });
  write(TEMPLATES_GUIDE, {
    groups: [{ id: 'start', featured: true, templates: ['template-shell'] }, { id: 'add', featured: true, templates: ['template-mfe'] }, { id: 'site', templates: ['template-site'] }],
    templates: {
      'template-shell': { kind: 'application', requires: 'new-project', gives: 2, keyFiles: ['src/main.tsx'], examples: [{ screen: 'home' }, { screen: 'docs', route: 'get-started' }], next: [{ screen: 'docs', route: 'get-started', label: 'next.getStarted' }] },
      'template-mfe': { kind: 'extension', requires: 'shell', gives: 1, keyFiles: ['src/x.ts'], examples: [], next: [], indexName: true },
      'template-site': { kind: 'screens', requires: 'shell-and-mfe', gives: 1, keyFiles: ['README.md'], examples: [], next: [] },
    },
  });
  held = {
    '@gears-frontx/cli@0.3.0': { gitHead: RELEASE },
    '@gears-frontx/ui-kit@0.4.0': { gitHead: RELEASE },
    '@gears-frontx/routing@0.3.0': { gitHead: RELEASE },
    '@gears-frontx/routing-tanstack@0.3.0': { gitHead: RELEASE },
    '@gears-frontx/mfes@0.3.1': { gitHead: PATCH },
  };
  const deps = { '@gears-frontx/ui-kit': '0.4.0', '@gears-frontx/mfes': '0.3.1', '@gears-frontx/routing': '0.3.0', '@gears-frontx/routing-tanstack': '0.3.0' };
  write('site/package.json', { name: 'shell', dependencies: { ...deps, '@gears-frontx/demo-mfe': '1.0.0', lodash: '1' } });
  write('site/package-lock.json', {
    packages: {
      ...Object.fromEntries(Object.entries(deps).map(([name, version]) => [`node_modules/${name}`, locked(name, version)])),
      'node_modules/@gears-frontx/demo-mfe': { link: true, resolved: 'src-app/mfe_packages/demo-mfe' },
      'node_modules/@gears-frontx/react': { link: true, resolved: 'packages/react' },
      'packages/react': { version: '0.2.0-alpha.10' },
    },
  });
  for (const [name, version] of Object.entries(deps)) write(`site/node_modules/${name}/package.json`, { name, version, description: `The ${name.split('/')[1]} package.` });
  write('site/packages/react/package.json', { name: '@gears-frontx/react', version: '0.2.0-alpha.10', description: `React bindings for ${'Gears'} FrontX.` });
  write('package.json', { name: 'repo', packageManager: 'npm@10.9.4', devDependencies: { '@gears-frontx/cli': '0.3.0' } });
  write('package-lock.json', { packages: { 'node_modules/@gears-frontx/cli': locked('@gears-frontx/cli', '0.3.0') } });
  write('.nvmrc', '25.1.0\n');
}

const noInstall = () => {
  throw new Error('no install expected');
};

beforeEach(makeRepo);
afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('plainDashes and parseSourceSpec', () => {
  it('writes a long dash of a source text as a hyphen and reads a source-spec', () => {
    expect(plainDashes(`a ${EM} b`)).toBe('a - b');
    expect(parseSourceSpec(SHELL_SPEC)).toEqual({ repository: 'acme/templates', subtree: 'template-shell', ref: SHA });
  });
});

describe('inventoryTemplateDir', () => {
  it('installs a template through the CLI when the inventory holds another source-spec', () => {
    const installed = [];
    write('.frontx-inventory/index.json', { '@gears-frontx/frontx-template-shell': { source: 'github:acme/templates//template-shell@0000000' } });
    inventoryTemplateDir(root, { templateIdentity: '@gears-frontx/frontx-template-shell', sourceSpec: SHELL_SPEC }, (_root, spec) => installed.push(spec));
    expect(installed).toEqual([SHELL_SPEC]);
  });
});

describe('the templates outline', () => {
  it('builds the index from the featured groups and a page per template from the manifests, the sources and the guide', () => {
    runSiteData(root, {}, noInstall, registry);
    const outline = JSON.parse(readFileSync(path.join(root, TEMPLATES_OUTPUT), 'utf8'));
    expect(outline.pages.map((page) => page.route)).toEqual(['/', '/template-shell', '/template-mfe', '/template-site']);
    // The first featured group is the labelled pair, the next one rows, then the closing rule; the site's own template has its page and no card.
    const index = outline.pages[0];
    expect(index.entries.map((entry) => entry.type)).toEqual(['section-heading', 'template-pair', 'template-row', 'cta-rule']);
    expect(index.entries[0].label).toBe('t:groups.start.label');
    expect(index.entries[2].items).toEqual([{ title: 't:templates.template-mfe.indexName', text: 't:templates.template-mfe.summary', href: { route: '/template-mfe' } }]);
    const shell = outline.pages[1];
    expect(shell.lead).toBe('t:templates.template-shell.lead');
    const explorer = shell.entries.find((entry) => entry.type === 'file-explorer');
    expect(explorer.files).toEqual([
      { path: 'src/main.tsx', text: 't:templates.template-shell.files.src/main.tsx', lines: 2, contentBase64: Buffer.from('one\ntwo\n').toString('base64'), url: `https://github.com/acme/templates/blob/${SHA}/template-shell/src/main.tsx` },
    ]);
    expect(explorer.source).toEqual({ label: 't:source.label', value: '3b6cddb2', href: { url: `https://github.com/acme/templates/tree/${SHA}/template-shell` } });
    expect(explorer.legal.map((entry) => entry.href.url)).toEqual([`https://github.com/acme/templates/blob/${SHA}/LICENSE`, `https://github.com/acme/templates/blob/${SHA}/NOTICE`]);
    expect(shell.entries.find((entry) => entry.type === 'actions').items[0]).toEqual({ label: 't:actions.manifest', href: { url: `https://github.com/acme/templates/blob/${SHA}/template-shell/frontx-template.json` }, primary: true });
    // Another screen is named by its extension id, and a page of it by the action its entry declares; the screen's routes appear nowhere.
    expect(explorer.example.screens.map((screen) => screen.href)).toEqual([{ extension: HOME }, { extension: DOCS, action: { type: SHOW_GUIDE, payload: { guide: 'get-started' } } }]);
    expect(explorer.example.open.href).toEqual({ extension: HOME });
    // A template of this repository has a source label but no address and no file links, and a template without a live screen has no example.
    const own = outline.pages[3].entries.find((entry) => entry.type === 'file-explorer');
    expect(own.source.value).toBe('t:source.thisRepositoryShort');
    expect(own.files[0].url).toBeUndefined();
    expect(own.example).toBeUndefined();
    expect(own.legal).toBeUndefined();
    expect(outline.pages[3].entries.some((entry) => entry.type === 'actions')).toBe(false);
    expect(shell.entries.find((entry) => entry.type === 'facts').items.map((item) => item.value)).toContain('0.1.0-alpha.5');
    expect(shell.entries.find((entry) => entry.type === 'details').items[0]).toBe(SHELL_SPEC);
  });

  it('refuses a guide that names a key file the template does not have, or leaves a template out', () => {
    const guide = JSON.parse(readFileSync(path.join(root, TEMPLATES_GUIDE), 'utf8'));
    /** @type {Parameters<typeof buildTemplatesOutline>[0]} */
    const templates = [{ slug: 'template-shell', dir: path.join(root, '.frontx-inventory/@gears-frontx/frontx-template-shell'), manifest: manifest('s', '1.0.0', 'd'), origin: 'official', sourceSpec: SHELL_SPEC }];
    const targets = screenTargets(root);
    expect(() => buildTemplatesOutline(templates, { ...guide, groups: [{ id: 'start', templates: ['template-shell'] }], templates: { 'template-shell': { ...guide.templates['template-shell'], keyFiles: ['nowhere.ts'] } } }, targets)).toThrow(/key file nowhere.ts does not exist/);
    expect(() => buildTemplatesOutline([...templates, { ...templates[0], slug: 'template-extra' }], { ...guide, groups: [{ id: 'start', templates: ['template-shell'] }] }, targets)).toThrow(/template-extra is a template the site has, and guide.json lists it in no group/);
  });

  it('refuses a guide link to a screen no template declares, to a page of a screen whose entry declares no action that shows one, to a page its show action does not name, or to a templates page that is not a template', () => {
    const guide = JSON.parse(readFileSync(path.join(root, TEMPLATES_GUIDE), 'utf8'));
    const templates = [{ slug: 'template-shell', dir: path.join(root, '.frontx-inventory/@gears-frontx/frontx-template-shell'), manifest: manifest('s', '1.0.0', 'd'), origin: /** @type {const} */ ('official'), sourceSpec: SHELL_SPEC }];
    const withExamples = (examples) => ({ ...guide, groups: [{ id: 'start', templates: ['template-shell'] }], templates: { 'template-shell': { ...guide.templates['template-shell'], examples } } });
    const targets = screenTargets(root);
    expect(() => buildTemplatesOutline(templates, withExamples([{ screen: 'nowhere' }]), targets)).toThrow(/links the screen "nowhere", which no template of the site declares/);
    expect(() => buildTemplatesOutline(templates, withExamples([{ screen: 'home', route: 'about' }]), targets)).toThrow(/links a page of "home", whose entry declares no action that shows a page/);
    expect(() => buildTemplatesOutline(templates, withExamples([{ screen: 'docs', route: 'get-startd' }]), targets)).toThrow(/links the page "get-startd" of "docs", which its show action does not name/);
    expect(() => buildTemplatesOutline(templates, withExamples([{ screen: 'templates', route: 'template-nowhere' }]), targets)).toThrow(/links the templates page "template-nowhere", which is not a template the site has/);
  });

  it('writes every link of the outline by extension id and show action, and a page of the templates screen as a route inside it', () => {
    const guide = JSON.parse(readFileSync(path.join(root, TEMPLATES_GUIDE), 'utf8'));
    const templates = [{ slug: 'template-shell', dir: path.join(root, '.frontx-inventory/@gears-frontx/frontx-template-shell'), manifest: manifest('s', '1.0.0', 'd'), origin: /** @type {const} */ ('official'), sourceSpec: SHELL_SPEC }];
    const shell = { ...guide.templates['template-shell'], examples: [{ screen: 'templates', route: 'template-shell' }], next: [{ screen: 'docs', route: 'get-started', label: 'next.getStarted' }] };
    const outline = buildTemplatesOutline(templates, { ...guide, groups: [{ id: 'start', featured: true, templates: ['template-shell'] }], templates: { 'template-shell': shell } }, screenTargets(root));
    const guideLink = { extension: DOCS, action: { type: SHOW_GUIDE, payload: { guide: 'get-started' } } };
    expect(outline.pages[0].entries.find((entry) => entry.type === 'cta-rule').action.href).toEqual(guideLink);
    const page = outline.pages[1];
    expect(page.entries.find((entry) => entry.type === 'facts').actions.map((action) => action.href)).toEqual([guideLink]);
    expect(page.entries.find((entry) => entry.type === 'file-explorer').example.screens.map((screen) => screen.href)).toEqual([{ route: '/template-shell' }]);
  });

  it('reads a screen without a show action, refuses a token two extensions declare and an entry with two show actions, and skips extensions off the screen domain', () => {
    write('template-site/src-app/mfe_packages/site-widget-mfe/mfe.json', { entries: [{ id: 'entry.widget', actions: [] }], extensions: [{ id: 'ext.widget', domain: 'gts.frontx.mfes.ext.domain.v1~acme.widgets.area.v1', entry: 'entry.widget', route: '/widget' }] });
    write('template-site/src-app/mfe_packages/site-wide-mfe/mfe.json', {
      schemas: [{ $id: 'gts://wide.show', properties: { payload: { properties: { a: { type: 'string' }, b: { type: 'string' } }, required: ['a', 'b'] } } }],
      entries: [{ id: 'entry.wide', actions: ['wide.show'] }],
      extensions: [{ id: 'ext.wide', domain: SCREEN_DOMAIN, entry: 'entry.wide', route: '/wide' }],
    });
    const targets = screenTargets(root);
    expect(targets.has('widget')).toBe(false);
    expect(targets.get('wide')).toEqual({ extension: 'ext.wide' });
    expect(targets.get('docs')).toEqual({ extension: DOCS, show: { type: SHOW_GUIDE, property: 'guide', values: ['get-started'] } });

    write('template-site/src-app/mfe_packages/site-twice-mfe/mfe.json', { entries: [{ id: 'entry.twice', actions: [] }], extensions: [{ id: 'ext.twice', domain: SCREEN_DOMAIN, entry: 'entry.twice', route: '/home' }] });
    expect(() => screenTargets(root)).toThrow(/the screen token "home" is declared by more than one screen extension/);
    rmSync(path.join(root, 'template-site/src-app/mfe_packages/site-twice-mfe'), { recursive: true, force: true });

    const twoShows = { $id: 'gts://docs.other', properties: { payload: { properties: { page: { type: 'string' } }, required: ['page'] } } };
    const docs = JSON.parse(readFileSync(path.join(root, 'template-site/src-app/mfe_packages/site-docs-mfe/mfe.json'), 'utf8'));
    write('template-site/src-app/mfe_packages/site-docs-mfe/mfe.json', { ...docs, schemas: [...docs.schemas, twoShows], entries: [{ id: 'entry.docs', actions: [SHOW_GUIDE, 'docs.other'] }] });
    expect(() => screenTargets(root)).toThrow(/the entry of "docs" declares more than one action that shows a page/);
  });
});

describe('the key files', () => {
  it('fails loudly on a key file over the size limit instead of bundling it', () => {
    write('.frontx-inventory/@gears-frontx/frontx-template-shell/src/big.ts', 'x'.repeat(MAX_KEY_FILE_BYTES + 1));
    const template = { slug: 'template-shell', dir: path.join(root, '.frontx-inventory/@gears-frontx/frontx-template-shell'), manifest: {}, origin: /** @type {const} */ ('official'), sourceSpec: SHELL_SPEC };
    expect(readKeyFiles(template, ['src/main.tsx'])).toHaveLength(1);
    expect(() => readKeyFiles(template, ['src/big.ts'])).toThrow(/over the 40000 limit/);
  });

  it('writes a long dash of a shown source as an escape that parses back to the same text', () => {
    const text = stringifyGenerated({ content: `a ${EM} b` });
    expect(text).not.toContain(EM);
    expect(JSON.parse(text).content).toBe(`a ${EM} b`);
  });
});

describe('the docs versions', () => {
  it('reads the toolchain, the CLI and the template source-specs, and links the AI kit at the commit the CLI was published from', () => {
    const versions = buildDocsVersions(root, registry);
    expect(versions.vars).toMatchObject({ nodeVersion: '25.1.0', npmVersion: '10.9.4', cliVersion: '0.3.0', shellSpec: SHELL_SPEC, templatesRefShort: '3b6cddb' });
    expect(versions.vars.aiKitUrl).toBe(`https://github.com/constructorfabric/gears-frontx/blob/${RELEASE}/packages/cyber-pilot-kit-frontx/README.md`);
    expect(Object.keys(versions).sort()).toEqual(['$comment', 'vars']);
  });

  it('refuses a CLI the root lock file does not resolve from the registry at its pin', () => {
    write('package-lock.json', { packages: { 'node_modules/@gears-frontx/cli': { version: '0.3.0', resolved: 'file:packs/cli-0.3.0.tgz' } } });
    expect(() => buildDocsVersions(root, registry)).toThrow(/resolves @gears-frontx\/cli from file:packs\/cli-0.3.0.tgz, not from https:\/\/registry.npmjs.org\//);
  });
});

describe('the libs data', () => {
  it('lists the FrontX packages the site depends on, not its own screens, each linked at the commit its version was published from', () => {
    expect(buildLibsData(root, registry).libraries).toEqual([
      { package: '@gears-frontx/mfes', version: '0.3.1', description: 'The mfes package.', sourceUrl: `https://github.com/constructorfabric/gears-frontx/tree/${PATCH}`, sourceCommit: 'ec7cf98' },
      { package: '@gears-frontx/routing', version: '0.3.0', description: 'The routing package.', sourceUrl: `https://github.com/constructorfabric/gears-frontx/tree/${RELEASE}`, sourceCommit: '00f71b2' },
      { package: '@gears-frontx/routing-tanstack', version: '0.3.0', description: 'The routing-tanstack package.', sourceUrl: `https://github.com/constructorfabric/gears-frontx/tree/${RELEASE}`, sourceCommit: '00f71b2' },
      { package: '@gears-frontx/ui-kit', version: '0.4.0', description: 'The ui-kit package.', sourceUrl: `https://github.com/constructorfabric/gears-frontx/tree/${RELEASE}`, sourceCommit: '00f71b2' },
    ]);
  });

  it('carries a version variable per package, the summarized packages\' sources at their own commits, and the shell template\'s workspace packages with the vendor name written as the product\'s', () => {
    const libs = buildLibsData(root, registry);
    expect(libs.shellPackages).toEqual([{ package: '@gears-frontx/react', version: '0.2.0-alpha.10', description: 'React bindings for FrontX.' }]);
    expect(libs.vars).toEqual({
      mfesVersion: '0.3.1',
      routingVersion: '0.3.0',
      routingTanstackVersion: '0.3.0',
      uiKitVersion: '0.4.0',
      reactVersion: '0.2.0-alpha.10',
      routingBlobUrl: `https://github.com/constructorfabric/gears-frontx/blob/${RELEASE}`,
      routingCommitShort: '00f71b2',
      routingTanstackBlobUrl: `https://github.com/constructorfabric/gears-frontx/blob/${RELEASE}`,
      routingTanstackCommitShort: '00f71b2',
      mfesBlobUrl: `https://github.com/constructorfabric/gears-frontx/blob/${PATCH}`,
      mfesCommitShort: 'ec7cf98',
      shellSourceUrl: `https://github.com/acme/templates/blob/${SHA}/template-shell`,
      shellRefShort: '3b6cddb',
    });
  });

  it('refuses a range or a file: spec, a lock entry that is not the pin or not from the registry, and an install that differs from the lock file', () => {
    const site = JSON.parse(readFileSync(path.join(root, 'site/package.json'), 'utf8'));
    const lock = JSON.parse(readFileSync(path.join(root, 'site/package-lock.json'), 'utf8'));
    write('site/package.json', { ...site, dependencies: { ...site.dependencies, '@gears-frontx/ui-kit': 'file:../packs/ui-kit.tgz' } });
    expect(() => buildLibsData(root, registry)).toThrow(/dependencies.@gears-frontx\/ui-kit is "file:..\/packs\/ui-kit.tgz"; the ecosystem is pinned to an exact registry version/);
    write('site/package.json', { ...site, dependencies: { ...site.dependencies, '@gears-frontx/ui-kit': '^0.4.0' } });
    expect(() => buildLibsData(root, registry)).toThrow(/is "\^0.4.0"; the ecosystem is pinned/);
    write('site/package.json', site);
    write('site/package-lock.json', { packages: { ...lock.packages, 'node_modules/@gears-frontx/ui-kit': locked('@gears-frontx/ui-kit', '0.4.0-alpha.6') } });
    expect(() => buildLibsData(root, registry)).toThrow(/resolves @gears-frontx\/ui-kit to 0.4.0-alpha.6, site\/package.json pins 0.4.0/);
    write('site/package-lock.json', { packages: { ...lock.packages, 'node_modules/@gears-frontx/ui-kit': { version: '0.4.0', resolved: 'file:../packs/ui-kit.tgz' } } });
    expect(() => buildLibsData(root, registry)).toThrow(/not from https:\/\/registry.npmjs.org\//);
    write('site/package-lock.json', lock);
    write('site/node_modules/@gears-frontx/ui-kit/package.json', { name: '@gears-frontx/ui-kit', version: '0.4.0-alpha.5' });
    expect(() => buildLibsData(root, registry)).toThrow(/installed 0.4.0-alpha.5, the lock file resolves 0.4.0/);
  });

  it('refuses a version the registry does not hold or that names no commit, and a summarized package the site does not depend on', () => {
    delete held['@gears-frontx/ui-kit@0.4.0'];
    expect(() => buildLibsData(root, registry)).toThrow('@gears-frontx/ui-kit@0.4.0 is not on the npm registry');
    held['@gears-frontx/ui-kit@0.4.0'] = {};
    expect(() => buildLibsData(root, registry)).toThrow('@gears-frontx/ui-kit@0.4.0 names no commit (gitHead) on the npm registry');
    held['@gears-frontx/ui-kit@0.4.0'] = { gitHead: RELEASE };
    const site = JSON.parse(readFileSync(path.join(root, 'site/package.json'), 'utf8'));
    const { '@gears-frontx/mfes': _mfes, ...rest } = site.dependencies;
    write('site/package.json', { ...site, dependencies: rest });
    expect(() => buildLibsData(root, registry)).toThrow(/@gears-frontx\/mfes is not a dependency of the site's application/);
  });
});

describe('runSiteData --check', () => {
  it('passes right after writing and names a generated file that no longer matches its sources', () => {
    runSiteData(root, {}, noInstall, registry);
    expect(runSiteData(root, { check: true }, noInstall, registry)).toEqual([]);
    write('.nvmrc', '24.14.0\n');
    expect(runSiteData(root, { check: true }, noInstall, registry)).toEqual([DOCS_OUTPUT]);
  });

  it('covers the libs data on its own: a change only the summarized packages reach makes the libs file stale and nothing else', () => {
    runSiteData(root, {}, noInstall, registry);
    held['@gears-frontx/mfes@0.3.1'] = { gitHead: 'fedcba9876543210fedcba9876543210fedcba98' };
    expect(runSiteData(root, { check: true }, noInstall, registry)).toEqual([LIBS_OUTPUT]);
  });
});
