#!/usr/bin/env node
// The data files the site's own screens render, generated from their sources so no copied text can drift (architecture/DESIGN.md section 4.13). Three outputs, all checked in: the templates screen's page outline (template-site/.../site-templates-mfe/src/content/outline.generated.json), built from every template's manifest and source at the version the site uses (the key files' content, bounded in size, included) plus the screen's hand-written guide, the docs screen's version data (template-site/.../site-docs-mfe/src/data/versions.generated.json: the CLI, the template source-specs and the toolchain) and the libs screen's data (template-site/.../site-libs-mfe/src/data/libraries.generated.json: the `@gears-frontx/*` packages the site's application depends on plus the variables its technical summaries read). The packages are read from site/package.json (exact versions), site/package-lock.json (the version and the registry address each one resolves to), the installed packages' own package.json (the description) and the npm registry (the commit each version was published from, its `gitHead`, which the published tarballs do not carry); the CLI from the root package.json and package-lock.json; the rest from site/.frontx/provenance.json, .nvmrc and the root packageManager pin. `--check` regenerates in memory and fails on any difference. The official templates are read from the FrontX CLI's inventory at the provenance source-spec; when the inventory lacks one, the CLI installs it (`frontx install <source-spec>`, which needs network access to the template host).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { findTemplateDirs, readTemplateManifest } from './template-discovery.mjs';
import { isEntryPoint } from './entry-point.mjs';

export const TEMPLATES_PACKAGE = 'template-site/src-app/mfe_packages/site-templates-mfe';
export const DOCS_PACKAGE = 'template-site/src-app/mfe_packages/site-docs-mfe';
export const LIBS_PACKAGE = 'template-site/src-app/mfe_packages/site-libs-mfe';
export const TEMPLATES_GUIDE = `${TEMPLATES_PACKAGE}/src/content/guide.json`;
export const TEMPLATES_OUTPUT = `${TEMPLATES_PACKAGE}/src/content/outline.generated.json`;
export const DOCS_OUTPUT = `${DOCS_PACKAGE}/src/data/versions.generated.json`;
export const LIBS_OUTPUT = `${LIBS_PACKAGE}/src/data/libraries.generated.json`;
export const TEMPLATES_STRINGS = 'src/screens/templates/i18n/en.json';

const INVENTORY_DIR = '.frontx-inventory';

/** The largest key file the page carries, and the most key-file content one page carries: the content is bundled with the templates screen, so a key file that outgrows these is replaced in the guide by a smaller one instead of silently inflating the bundle. */
export const MAX_KEY_FILE_BYTES = 40_000;
export const MAX_PAGE_CONTENT_BYTES = 120_000;

/**
 * @typedef {{ slug: string, dir: string, manifest: any, origin: 'official' | 'site', sourceSpec?: string, ref?: string }} SiteTemplate
 * @typedef {(name: string, version: string) => { gitHead?: string } | undefined} RegistryLookup
 */

/** The repository every `@gears-frontx/*` registry package is published from; the published manifests name none, so the source links are built on it. */
export const ECOSYSTEM_REPOSITORY = 'https://github.com/constructorfabric/gears-frontx';

/** Where the lock files must resolve an ecosystem package: the public registry the repository's `.npmrc` names. */
const REGISTRY_TARBALL = 'https://registry.npmjs.org/';

/** An exact version, as the ecosystem is pinned. */
const EXACT_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

// @cpt-algo:cpt-site-algo-site-data-registry-pin:p2
/**
 * The registry's record of `name@version`, or nothing when the registry does not hold it.
 * @type {RegistryLookup}
 */
export function npmRegistry(name, version) {
  // @cpt-begin:cpt-site-algo-site-data-registry-pin:p2:inst-registry-view
  try {
    const record = JSON.parse(execFileSync('npm', ['view', `${name}@${version}`, 'version', 'gitHead', '--json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
    return record?.version === version ? { gitHead: record.gitHead } : undefined;
  } catch {
    return undefined;
  }
  // @cpt-end:cpt-site-algo-site-data-registry-pin:p2:inst-registry-view
}

/**
 * The commit a registry package was published from: asked of the registry, because the tarball npm installs carries no `gitHead`.
 * @param {RegistryLookup} registry
 * @param {string} name
 * @param {string} version
 */
function publishedCommit(registry, name, version) {
  // @cpt-begin:cpt-site-algo-site-data-registry-pin:p2:inst-published-commit
  const record = registry(name, version);
  if (!record) throw new Error(`${name}@${version} is not on the npm registry`);
  if (typeof record.gitHead !== 'string' || !/^[0-9a-f]{40}$/.test(record.gitHead)) throw new Error(`${name}@${version} names no commit (gitHead) on the npm registry`);
  return record.gitHead;
  // @cpt-end:cpt-site-algo-site-data-registry-pin:p2:inst-published-commit
}

// @cpt-dod:cpt-site-dod-site-data-fails-on-inconsistency:p2
/**
 * A registry package pinned in a package.json and resolved by its lock file: the exact version, matched by the lock file's version and its registry address.
 * @param {{ pkg: any, lock: any, where: string, field: string, name: string }} input
 */
function lockedRegistryVersion({ pkg, lock, where, field, name }) {
  // @cpt-begin:cpt-site-algo-site-data-registry-pin:p2:inst-exact-pin
  const spec = pkg[field]?.[name];
  if (typeof spec !== 'string' || !EXACT_VERSION.test(spec)) throw new Error(`${where}/package.json: ${field}.${name} is ${JSON.stringify(spec)}; the ecosystem is pinned to an exact registry version`);
  // @cpt-end:cpt-site-algo-site-data-registry-pin:p2:inst-exact-pin
  // @cpt-begin:cpt-site-algo-site-data-registry-pin:p2:inst-lock-match
  const entry = lock.packages?.[`node_modules/${name}`];
  if (entry?.version !== spec) throw new Error(`${where}/package-lock.json resolves ${name} to ${entry?.version}, ${where}/package.json pins ${spec}`);
  if (typeof entry.resolved !== 'string' || !entry.resolved.startsWith(REGISTRY_TARBALL)) throw new Error(`${where}/package-lock.json resolves ${name} from ${entry.resolved}, not from ${REGISTRY_TARBALL}`);
  return spec;
  // @cpt-end:cpt-site-algo-site-data-registry-pin:p2:inst-lock-match
}

/** Long dashes are not allowed in repository files (CONTRIBUTING.md); a source text that carries one is written with a hyphen. */
export function plainDashes(text) {
  return text.replace(/\s*[\u2013\u2014]\s*/g, ' - ');
}

/**
 * A key file shows its source as the template ships it, long dashes included, while the repository keeps none: the generated JSON writes them as escapes, which parse back to the same text.
 * @param {unknown} value
 */
export function stringifyGenerated(value) {
  return `${JSON.stringify(value, null, 2).replace(/[\u2013\u2014]/g, (dash) => `\\u${dash.charCodeAt(0).toString(16).padStart(4, '0')}`)}\n`;
}

/** @param {string} file @returns {any} */
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

/** The last path segment of a provenance source-spec's subtree (`...//template-shell@sha` gives `template-shell`). */
export function parseSourceSpec(sourceSpec) {
  const match = /^github:([^/]+\/[^/@]+)\/\/([^@]+)@([0-9a-f]{7,40})$/.exec(sourceSpec);
  if (!match) throw new Error(`unsupported source-spec: ${sourceSpec}`);
  return { repository: match[1], subtree: match[2], ref: match[3] };
}

// @cpt-algo:cpt-site-algo-site-data-collect-templates:p2
/**
 * The directory of an official template in the CLI inventory, installed there first when absent or installed from another source-spec.
 * @param {string} root
 * @param {{ templateIdentity: string, sourceSpec: string }} record - a provenance record
 * @param {(root: string, sourceSpec: string) => void} [install]
 */
export function inventoryTemplateDir(root, record, install = installTemplate) {
  // @cpt-begin:cpt-site-algo-site-data-collect-templates:p2:inst-inventory-install
  const inventory = path.join(root, INVENTORY_DIR);
  const dir = path.join(inventory, ...record.templateIdentity.split('/'));
  const indexFile = path.join(inventory, 'index.json');
  const installed = fs.existsSync(indexFile) ? readJson(indexFile)[record.templateIdentity] : undefined;
  if (!installed || installed.source !== record.sourceSpec || !fs.existsSync(path.join(dir, 'frontx-template.json'))) install(root, record.sourceSpec);
  // @cpt-end:cpt-site-algo-site-data-collect-templates:p2:inst-inventory-install
  // @cpt-begin:cpt-site-algo-site-data-collect-templates:p2:inst-inventory-missing
  if (!fs.existsSync(path.join(dir, 'frontx-template.json'))) throw new Error(`${record.templateIdentity}: not in ${INVENTORY_DIR} after installing ${record.sourceSpec}`);
  return dir;
  // @cpt-end:cpt-site-algo-site-data-collect-templates:p2:inst-inventory-missing
}

/** @param {string} root @param {string} sourceSpec */
function installTemplate(root, sourceSpec) {
  const cli = path.join(root, 'node_modules', '.bin', 'frontx');
  execFileSync(cli, ['install', sourceSpec], { cwd: root, stdio: ['ignore', 'inherit', 'inherit'], env: { ...process.env, FRONTX_INVENTORY_ROOT: path.join(root, INVENTORY_DIR) } });
}

/** Lines of a text, as an editor counts them. @param {string} text */
function lineCount(text) {
  return text.length === 0 ? 0 : text.split('\n').length - (text.endsWith('\n') ? 1 : 0);
}

/**
 * Every template the screen presents: the official ones at their provenance source-spec, then this repository's.
 * @param {string} root
 * @param {(root: string, sourceSpec: string) => void} [install]
 * @returns {SiteTemplate[]}
 */
export function collectTemplates(root, install) {
  // @cpt-begin:cpt-site-algo-site-data-collect-templates:p2:inst-read-provenance
  const provenance = readJson(path.join(root, 'site', '.frontx', 'provenance.json'));
  // @cpt-end:cpt-site-algo-site-data-collect-templates:p2:inst-read-provenance
  /** @type {SiteTemplate[]} */
  // @cpt-begin:cpt-site-algo-site-data-collect-templates:p2:inst-official
  const official = provenance.map((/** @type {any} */ record) => {
    const { subtree, ref } = parseSourceSpec(record.sourceSpec);
    const dir = inventoryTemplateDir(root, record, install);
    // @cpt-end:cpt-site-algo-site-data-collect-templates:p2:inst-official
    // @cpt-begin:cpt-site-algo-site-data-collect-templates:p2:inst-check-version
    const manifest = readJson(path.join(dir, 'frontx-template.json'));
    if (manifest.name !== record.templateIdentity || manifest.version !== record.scaffoldedFromVersion) {
      throw new Error(`${record.templateIdentity}: the inventory holds ${manifest.name}@${manifest.version}, provenance records ${record.scaffoldedFromVersion}`);
    }
    return { slug: subtree.split('/').pop() ?? subtree, dir, manifest, origin: 'official', sourceSpec: record.sourceSpec, ref };
    // @cpt-end:cpt-site-algo-site-data-collect-templates:p2:inst-check-version
  });
  // @cpt-begin:cpt-site-algo-site-data-collect-templates:p2:inst-own
  /** @type {SiteTemplate[]} */
  const own = findTemplateDirs(root).map((dir) => ({ slug: path.basename(dir), dir, manifest: readTemplateManifest(dir), origin: 'site' }));
  // @cpt-end:cpt-site-algo-site-data-collect-templates:p2:inst-own
  // @cpt-begin:cpt-site-algo-site-data-collect-templates:p2:inst-return-templates
  return [...official, ...own];
  // @cpt-end:cpt-site-algo-site-data-collect-templates:p2:inst-return-templates
}

/** @param {string} key */
const text = (key) => `t:${key}`;
/** The screen domain every page of the site lives in. */
const SCREEN_DOMAIN = 'gts.frontx.mfes.ext.domain.v1~frontx.screensets.layout.screen.v1';

/**
 * @typedef {{ extension: string, show?: { type: string, property: string, values?: string[] } }} ScreenTarget
 */

// @cpt-algo:cpt-site-algo-site-data-screen-targets:p2
/**
 * Every screen of this repository's templates by its route token: its screen extension's id and, when its entry declares one, the action that shows one page of it, an action whose schema the package carries with a payload of exactly one required string property.
 * @param {string} root - the repository root
 * @returns {Map<string, ScreenTarget>}
 */
export function screenTargets(root) {
  /** @type {Map<string, ScreenTarget>} */
  const targets = new Map();
  for (const dir of findTemplateDirs(root)) {
    const packages = path.join(dir, 'src-app', 'mfe_packages');
    if (!fs.existsSync(packages)) continue;
    for (const name of fs.readdirSync(packages).sort()) {
      const file = path.join(packages, name, 'mfe.json');
      if (!fs.existsSync(file)) continue;
      const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
      // @cpt-begin:cpt-site-algo-site-data-screen-targets:p2:inst-each-screen
      for (const extension of manifest.extensions ?? []) {
        if (extension.domain !== SCREEN_DOMAIN || typeof extension.route !== 'string') continue;
        const entry = (manifest.entries ?? []).find((/** @type {{ id: string }} */ candidate) => candidate.id === extension.entry);
        const token = extension.route.slice(1);
        if (targets.has(token)) throw new Error(`${file}: the screen token "${token}" is declared by more than one screen extension of the site's templates`);
        // @cpt-end:cpt-site-algo-site-data-screen-targets:p2:inst-each-screen
        // @cpt-begin:cpt-site-algo-site-data-screen-targets:p2:inst-show-action
        const shows = (entry?.actions ?? [])
          .map((/** @type {string} */ type) => {
            const payload = (manifest.schemas ?? []).find((/** @type {{ $id: string }} */ schema) => schema.$id === `gts://${type}`)?.properties?.payload;
            const required = payload?.required ?? [];
            const property = payload?.properties?.[required[0]];
            return required.length === 1 && property?.type === 'string' ? { type, property: required[0], ...(Array.isArray(property.enum) ? { values: property.enum } : {}) } : undefined;
          })
          .filter(Boolean);
        if (shows.length > 1) throw new Error(`${file}: the entry of "${token}" declares more than one action that shows a page`);
        targets.set(token, { extension: extension.id, ...(shows.length === 1 ? { show: shows[0] } : {}) });
        // @cpt-end:cpt-site-algo-site-data-screen-targets:p2:inst-show-action
      }
    }
  }
  return targets;
}

/** The templates screen's route token: the screen whose outline this generator writes, linked inside itself by route. */
const TEMPLATES_SCREEN = 'templates';

/**
 * A link target of the templates outline: a page of the templates screen itself as a route inside it; another screen by its extension id, and a page of it by the action that shows it, named by the page's last path segment.
 * @param {Map<string, ScreenTarget>} targets
 * @param {ReadonlySet<string>} pages - the templates screen's own pages, the template slugs
 * @param {string} screen - the target screen's route token
 * @param {string} [route] - the page inside it
 */
function screenHref(targets, pages, screen, route) {
  // @cpt-begin:cpt-site-algo-site-data-screen-targets:p2:inst-own-screen
  if (screen === TEMPLATES_SCREEN) {
    if (route && !pages.has(route)) throw new Error(`guide.json links the templates page "${route}", which is not a template the site has`);
    return { route: `/${route ?? ''}` };
  }
  // @cpt-end:cpt-site-algo-site-data-screen-targets:p2:inst-own-screen
  // @cpt-begin:cpt-site-algo-site-data-screen-targets:p2:inst-other-screen
  const target = targets.get(screen);
  if (!target) throw new Error(`guide.json links the screen "${screen}", which no template of the site declares`);
  if (!route) return { extension: target.extension };
  if (!target.show) throw new Error(`guide.json links a page of "${screen}", whose entry declares no action that shows a page`);
  const value = route.split('/').pop() ?? '';
  if (target.show.values && !target.show.values.includes(value)) throw new Error(`guide.json links the page "${route}" of "${screen}", which its show action does not name`);
  return { extension: target.extension, action: { type: target.show.type, payload: { [target.show.property]: value } } };
  // @cpt-end:cpt-site-algo-site-data-screen-targets:p2:inst-other-screen
}

/** The GitHub address of a path of an official template at its pinned commit, or nothing for this repository's templates, which have no remote of their own. @param {SiteTemplate} template @param {'tree' | 'blob'} kind @param {string} [file] */
function sourceUrl(template, kind, file) {
  if (template.origin !== 'official' || !template.sourceSpec) return undefined;
  const { repository, subtree, ref } = parseSourceSpec(template.sourceSpec);
  return `https://github.com/${repository}/${kind}/${ref}/${subtree}${file ? `/${file}` : ''}`;
}

/** The license and notice of an official template's repository at the pinned commit, for the explorer's footer; this repository's templates have no remote to link. @param {SiteTemplate} template */
function repositoryFiles(template) {
  if (template.origin !== 'official' || !template.sourceSpec) return undefined;
  const { repository, ref } = parseSourceSpec(template.sourceSpec);
  return [
    { label: text('legal.license'), href: { url: `https://github.com/${repository}/blob/${ref}/LICENSE` } },
    { label: text('legal.notice'), href: { url: `https://github.com/${repository}/blob/${ref}/NOTICE` } },
  ];
}

/**
 * The key files of a template with their content, read from its source: a file over the size limit, or a page over the content limit, fails loudly.
 * @param {SiteTemplate} template
 * @param {string[]} keyFiles
 */
export function readKeyFiles(template, keyFiles) {
  // @cpt-begin:cpt-site-algo-site-data-templates-outline:p2:inst-key-files
  let total = 0;
  const files = keyFiles.map((file) => {
    const full = path.join(template.dir, file);
    if (!fs.existsSync(full)) throw new Error(`${template.slug}: key file ${file} does not exist in the template's source`);
    const content = fs.readFileSync(full, 'utf8');
    const bytes = Buffer.byteLength(content);
    if (bytes > MAX_KEY_FILE_BYTES) throw new Error(`${template.slug}: key file ${file} is ${bytes} bytes, over the ${MAX_KEY_FILE_BYTES} limit; name a smaller key file in guide.json`);
    total += bytes;
    const url = sourceUrl(template, 'blob', file);
    // Base64, because the MFE handler rewrites imports with regular expressions over a chunk's text, string literals included: source text that reads like an import (`from './x'`) inside a bundled data file is rewritten or rejected when the screen loads.
    return { path: file, text: text(`templates.${template.slug}.files.${file}`), lines: lineCount(content), contentBase64: Buffer.from(content).toString('base64'), ...(url ? { url } : {}) };
  });
  if (total > MAX_PAGE_CONTENT_BYTES) throw new Error(`${template.slug}: the key files carry ${total} bytes, over the ${MAX_PAGE_CONTENT_BYTES} limit; name fewer or smaller key files in guide.json`);
  return files;
  // @cpt-end:cpt-site-algo-site-data-templates-outline:p2:inst-key-files
}

// @cpt-algo:cpt-site-algo-site-data-templates-outline:p2
/**
 * The templates screen's outline: the index grouped as the guide says, and one page per template.
 * @param {ReturnType<typeof collectTemplates>} templates
 * @param {any} guide
 * @param {Map<string, ScreenTarget>} targets - the screens a page links, by route token (`screenTargets`)
 */
export function buildTemplatesOutline(templates, guide, targets) {
  // @cpt-begin:cpt-site-algo-site-data-templates-outline:p2:inst-guide-coverage
  const bySlug = new Map(templates.map((template) => [template.slug, template]));
  const slugs = new Set(bySlug.keys());
  /** @param {string} slug */
  const templateOf = (slug) => {
    const template = bySlug.get(slug);
    if (!template) throw new Error(`guide.json lists ${slug}, which is not a template the site has`);
    return template;
  };
  const listed = guide.groups.flatMap((/** @type {{ templates: string[] }} */ group) => group.templates);
  for (const slug of listed) templateOf(slug);
  for (const slug of bySlug.keys()) if (!listed.includes(slug)) throw new Error(`${slug} is a template the site has, and guide.json lists it in no group`);
  // @cpt-end:cpt-site-algo-site-data-templates-outline:p2:inst-guide-coverage

  // @cpt-begin:cpt-site-algo-site-data-templates-outline:p2:inst-index
  // The index features the groups the guide marks `featured`: the first as an illustrated pair under a labelled heading, the rest as row cards under it, then the band that leads to the quickstart. A group that is not featured has its pages, reachable by address and listed by the libs screen, and no place on the index.
  const featured = guide.groups.filter((/** @type {{ featured?: boolean }} */ group) => group.featured);
  // A card may name its template as an action (`indexName: true` in the guide), such as "Add Design Guardrails".
  const card = (/** @type {string} */ slug) => ({ title: text(guide.templates[slug]?.indexName ? `templates.${slug}.indexName` : `templates.${slug}.name`), text: text(`templates.${slug}.summary`), href: { route: `/${slug}` } });
  const index = {
    route: '/',
    title: text('index.title'),
    lead: text('index.lead'),
    entries: [
      ...featured.flatMap((/** @type {{ id: string, templates: string[] }} */ group, position) =>
        position === 0
          ? [{ type: 'section-heading', id: group.id, title: text(`groups.${group.id}.title`), label: text(`groups.${group.id}.label`) }, { type: 'template-pair', items: group.templates.map(card) }]
          : [{ type: 'template-row', items: group.templates.map(card) }]
      ),
      { type: 'cta-rule', title: text('cta.title'), text: text('cta.text'), action: { label: text('cta.action'), href: screenHref(targets, slugs, 'docs', 'get-started') } },
    ],
  };
  // @cpt-end:cpt-site-algo-site-data-templates-outline:p2:inst-index

  // @cpt-begin:cpt-site-algo-site-data-templates-outline:p2:inst-pages
  const pages = listed.map((/** @type {string} */ slug) => {
    const template = templateOf(slug);
    const entry = guide.templates[slug];
    if (!entry) throw new Error(`guide.json has no entry for ${slug}`);
    const { manifest } = template;
    const examples = entry.examples;
    /** @type {{ title: string, text: string, screens: { title: string, href: unknown }[], open: { label: string, href: unknown } } | undefined} */
    const example =
      examples.length > 0
        ? {
            title: text('sections.examples'),
            text: text(entry.exampleLead ? `templates.${slug}.exampleLead` : 'sections.examplesLead'),
            screens: examples.map((/** @type {{ screen: string, route?: string }} */ item) => ({ title: text(`screens.${item.screen}`), href: screenHref(targets, slugs, item.screen, item.route) })),
            open: { label: text('sections.examplesOpen'), href: screenHref(targets, slugs, examples[0].screen, examples[0].route) },
          }
        : undefined;
    const sourceTree = sourceUrl(template, 'tree');
    const manifestUrl = sourceUrl(template, 'blob', 'frontx-template.json');
    const ref = template.ref;
    const source = ref && sourceTree ? { label: text('source.label'), value: ref.slice(0, 8), href: { url: sourceTree } } : { label: text('source.label'), value: text('source.thisRepositoryShort') };
    const sourceDetail = template.origin === 'official' ? template.sourceSpec : text('source.thisRepository');
    const legal = repositoryFiles(template);
    const entries = [
      {
        type: 'facts',
        title: text('before.title'),
        items: [
          { label: text('before.kind'), value: text(`kinds.${entry.kind}`) },
          { label: text('before.requires'), value: text(`requires.${entry.requires}`) },
          { label: text('before.version'), value: manifest.version },
        ],
        actions: entry.next.map((/** @type {{ label: string, screen: string, route?: string }} */ next) => ({ label: text(next.label), href: screenHref(targets, slugs, next.screen, next.route) })),
      },
      {
        type: 'file-explorer',
        id: 'files',
        title: text('sections.files'),
        source,
        files: readKeyFiles(template, entry.keyFiles),
        scope: { text: text('explorer.scope'), ...(sourceTree ? { link: { label: text('explorer.repository'), href: { url: sourceTree } } } : {}) },
        note: text('explorer.unmodified'),
        ...(legal ? { legal } : {}),
        ...(example ? { example } : {}),
      },
      { type: 'checklist', items: Array.from({ length: entry.gives }, (_, item) => text(`templates.${slug}.gives.${item + 1}`)) },
      ...(manifestUrl && sourceTree ? [{ type: 'actions', items: [{ label: text('actions.manifest'), href: { url: manifestUrl }, primary: true }, { label: text('actions.source'), href: { url: sourceTree } }] }] : []),
      { type: 'details', summary: text('sections.source'), items: [sourceDetail, ...manifest.ownershipBoundaries.exclusiveSubtrees] },
    ];
    return {
      route: `/${slug}`,
      title: text(`templates.${slug}.name`),
      lead: text(`templates.${slug}.lead`),
      back: { label: text('back'), href: { route: '/' } },
      entries,
    };
  });
  // @cpt-end:cpt-site-algo-site-data-templates-outline:p2:inst-pages

  // @cpt-begin:cpt-site-algo-site-data-templates-outline:p2:inst-return-outline
  return { $comment: 'Generated by scripts/site-data.mjs from the templates manifests and src/content/guide.json; do not edit.', screen: 'templates', strings: TEMPLATES_STRINGS, pages: [index, ...pages] };
  // @cpt-end:cpt-site-algo-site-data-templates-outline:p2:inst-return-outline
}

/** A package description as the page shows it: long dashes written as hyphens, and the vendor-qualified product name written as the product's own. @param {string} description */
function cleanDescription(description) {
  return plainDashes(description).replace(/\bGears FrontX\b/g, 'FrontX');
}

/** The packages the site's application installs from `@gears-frontx/*`: the application's own MFE packages and the shell template itself are the application, not libraries. @param {string} name */
const isLibraryName = (name) => name.startsWith('@gears-frontx/') && !name.endsWith('-mfe') && name !== '@gears-frontx/frontx-template-shell';

// @cpt-algo:cpt-site-algo-site-data-libraries:p2
/**
 * The FrontX packages the site's application depends on (from the site's package.json and lock file, each one a registry package) and the shell template's own workspace packages: the list the libs screen shows.
 * @param {string} root
 * @param {RegistryLookup} [registry]
 */
export function collectLibraries(root, registry = npmRegistry) {
  // @cpt-begin:cpt-site-algo-site-data-libraries:p2:inst-libs-read
  const sitePackage = readJson(path.join(root, 'site', 'package.json'));
  const lock = readJson(path.join(root, 'site', 'package-lock.json'));
  // @cpt-end:cpt-site-algo-site-data-libraries:p2:inst-libs-read
  // @cpt-begin:cpt-site-algo-site-data-libraries:p2:inst-libs-packages
  /** @param {string} name */
  const installedMeta = (name) => {
    const file = path.join(root, 'site', 'node_modules', ...name.split('/'), 'package.json');
    if (!fs.existsSync(file)) throw new Error(`${name} is not installed; run npm ci and npm run setup first`);
    return readJson(file);
  };
  const libraries = Object.keys(sitePackage.dependencies ?? {})
    .filter(isLibraryName)
    .sort()
    .map((name) => {
      const version = lockedRegistryVersion({ pkg: sitePackage, lock, where: 'site', field: 'dependencies', name });
      const meta = installedMeta(name);
      if (meta.version !== version) throw new Error(`${name}: installed ${meta.version}, the lock file resolves ${version}`);
      const commit = publishedCommit(registry, name, version);
      return {
        package: name,
        version,
        description: cleanDescription(meta.description ?? ''),
        sourceUrl: `${ECOSYSTEM_REPOSITORY}/tree/${commit}`,
        sourceCommit: commit,
      };
    });
    // @cpt-end:cpt-site-algo-site-data-libraries:p2:inst-libs-packages
  // @cpt-begin:cpt-site-algo-site-data-libraries:p2:inst-libs-shell-packages
  // The shell template's workspace packages are installed with template-shell itself: they are not on the registry at these versions, so the page names them without an install command.
  const shellPackages = Object.entries(lock.packages ?? {})
    .flatMap(([key, entry]) => {
      const name = key.startsWith('node_modules/') ? key.slice('node_modules/'.length) : undefined;
      const resolved = /** @type {{ link?: boolean, resolved?: string }} */ (entry).resolved;
      return name && isLibraryName(name) && /** @type {{ link?: boolean }} */ (entry).link && resolved?.startsWith('packages/') ? [{ name, dir: resolved }] : [];
    })
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ name, dir }) => {
      const version = lock.packages?.[dir]?.version;
      const meta = readJson(path.join(root, 'site', dir, 'package.json'));
      if (typeof version !== 'string' || meta.version !== version) throw new Error(`${name}: site/package-lock.json resolves ${version}, ${dir}/package.json says ${meta.version}`);
      return { package: name, version, description: cleanDescription(meta.description ?? '') };
    });
  return { libraries, shellPackages };
  // @cpt-end:cpt-site-algo-site-data-libraries:p2:inst-libs-shell-packages
}

// @cpt-algo:cpt-site-algo-site-data-docs-versions:p2
/**
 * The docs screen's version data: the CLI, the official templates' source-specs and the toolchain the commands of its guides are written with.
 * @param {string} root
 * @param {RegistryLookup} [registry]
 */
export function buildDocsVersions(root, registry = npmRegistry) {
  // @cpt-begin:cpt-site-algo-site-data-docs-versions:p2:inst-docs-read
  const provenance = readJson(path.join(root, 'site', '.frontx', 'provenance.json'));
  const rootPackage = readJson(path.join(root, 'package.json'));
  // @cpt-end:cpt-site-algo-site-data-docs-versions:p2:inst-docs-read
  // @cpt-begin:cpt-site-algo-site-data-docs-versions:p2:inst-docs-records
  /** @param {string} identity */
  const recordOf = (identity) => {
    const record = provenance.find((/** @type {any} */ entry) => entry.templateIdentity === identity);
    if (!record) throw new Error(`site/.frontx/provenance.json has no record of ${identity}`);
    return record;
  };
  const shell = recordOf('@gears-frontx/frontx-template-shell');
  const mfe = recordOf('@gears-frontx/frontx-template-mfe');
  // @cpt-end:cpt-site-algo-site-data-docs-versions:p2:inst-docs-records
  // @cpt-begin:cpt-site-algo-site-data-docs-versions:p2:inst-docs-same-commit
  const { ref, repository } = parseSourceSpec(shell.sourceSpec);
  if (parseSourceSpec(mfe.sourceSpec).ref !== ref) throw new Error('template-shell and template-mfe are applied from different commits');
  // @cpt-end:cpt-site-algo-site-data-docs-versions:p2:inst-docs-same-commit
  // @cpt-begin:cpt-site-algo-site-data-docs-versions:p2:inst-docs-cli
  const cliPackage = '@gears-frontx/cli';
  const cliVersion = lockedRegistryVersion({ pkg: rootPackage, lock: readJson(path.join(root, 'package-lock.json')), where: '.', field: 'devDependencies', name: cliPackage });
  const cliCommit = publishedCommit(registry, cliPackage, cliVersion);
  // @cpt-end:cpt-site-algo-site-data-docs-versions:p2:inst-docs-cli
  // @cpt-begin:cpt-site-algo-site-data-docs-versions:p2:inst-docs-npm
  const npmPin = /^npm@(.+)$/.exec(rootPackage.packageManager ?? '')?.[1];
  if (!npmPin) throw new Error('package.json has no npm packageManager pin');
  // @cpt-end:cpt-site-algo-site-data-docs-versions:p2:inst-docs-npm
  // @cpt-begin:cpt-site-algo-site-data-docs-versions:p2:inst-docs-return
  return {
    $comment: 'Generated by scripts/site-data.mjs; do not edit.',
    vars: {
      nodeVersion: fs.readFileSync(path.join(root, '.nvmrc'), 'utf8').trim(),
      npmVersion: npmPin,
      cliPackage,
      cliVersion,
      templatesRepository: repository,
      templatesRef: ref,
      templatesRefShort: ref.slice(0, 7),
      shellIdentity: shell.templateIdentity,
      shellVersion: shell.scaffoldedFromVersion,
      shellSpec: shell.sourceSpec,
      mfeIdentity: mfe.templateIdentity,
      mfeVersion: mfe.scaffoldedFromVersion,
      mfeSpec: mfe.sourceSpec,
      // template-mfe's files at the applied commit, for the links of the first-change guide.
      mfeBlobUrl: `https://github.com/${repository}/blob/${ref}/${parseSourceSpec(mfe.sourceSpec).subtree}`,
      // The AI tooling kit's README at the commit the CLI was published from: the upstream documentation of the AI bundle.
      aiKitUrl: `${ECOSYSTEM_REPOSITORY}/blob/${cliCommit}/packages/cyber-pilot-kit-frontx/README.md`,
    },
  };
  // @cpt-end:cpt-site-algo-site-data-docs-versions:p2:inst-docs-return
}

/** The packages the libs screen's technical summaries are written from; each summary links its package's sources at the commit that version was published from. */
export const LIBS_SUMMARY_PACKAGES = ['@gears-frontx/routing', '@gears-frontx/routing-tanstack', '@gears-frontx/mfes'];

/** `@gears-frontx/routing-tanstack` gives `routingTanstackVersion` (or another suffix). @param {string} name @param {string} [suffix] */
const packageVariable = (name, suffix = 'Version') => `${name.replace(/^@gears-frontx\//, '').replace(/-([a-z0-9])/g, (_match, letter) => letter.toUpperCase())}${suffix}`;

/**
 * The libs screen's data: the package lists, and the variables the technical summaries read: every package's version, the address of each summarized package's sources at the commit its version was published from, and template-shell at the commit the site applies.
 * @param {string} root
 * @param {RegistryLookup} [registry]
 */
export function buildLibsData(root, registry = npmRegistry) {
  // @cpt-begin:cpt-site-algo-site-data-libraries:p2:inst-libs-collect
  const provenance = readJson(path.join(root, 'site', '.frontx', 'provenance.json'));
  const { libraries, shellPackages } = collectLibraries(root, registry);
  // @cpt-end:cpt-site-algo-site-data-libraries:p2:inst-libs-collect
  // @cpt-begin:cpt-site-algo-site-data-libraries:p2:inst-libs-sources
  /** @type {Record<string, string>} */
  const sources = {};
  for (const name of LIBS_SUMMARY_PACKAGES) {
    const library = libraries.find((entry) => entry.package === name);
    if (!library) throw new Error(`${name} is not a dependency of the site's application, and the libs summaries are written from it`);
    sources[packageVariable(name, 'BlobUrl')] = `${ECOSYSTEM_REPOSITORY}/blob/${library.sourceCommit}`;
    sources[packageVariable(name, 'CommitShort')] = library.sourceCommit.slice(0, 7);
  }
  // @cpt-end:cpt-site-algo-site-data-libraries:p2:inst-libs-sources
  // @cpt-begin:cpt-site-algo-site-data-libraries:p2:inst-libs-shell-source
  const shell = provenance.find((/** @type {any} */ entry) => entry.templateIdentity === '@gears-frontx/frontx-template-shell');
  if (!shell) throw new Error('site/.frontx/provenance.json has no record of @gears-frontx/frontx-template-shell');
  const { ref, repository, subtree } = parseSourceSpec(shell.sourceSpec);
  // @cpt-end:cpt-site-algo-site-data-libraries:p2:inst-libs-shell-source
  // @cpt-begin:cpt-site-algo-site-data-libraries:p2:inst-libs-return
  /** @type {Record<string, string>} */
  const versions = {};
  for (const entry of [...libraries, ...shellPackages]) versions[packageVariable(entry.package)] = entry.version;
  // The page texts read a variable per package by name, so the variables are a string map rather than a fixed shape.
  /** @type {Record<string, string>} */
  const vars = {
    ...versions,
    ...sources,
    shellSourceUrl: `https://github.com/${repository}/blob/${ref}/${subtree}`,
    shellRefShort: ref.slice(0, 7),
  };
  return {
    $comment: 'Generated by scripts/site-data.mjs; do not edit.',
    vars,
    libraries: libraries.map((library) => ({ ...library, sourceCommit: library.sourceCommit.slice(0, 7) })),
    shellPackages,
  };
  // @cpt-end:cpt-site-algo-site-data-libraries:p2:inst-libs-return
}

// @cpt-algo:cpt-site-algo-site-data-generate:p2
// @cpt-dod:cpt-site-dod-site-data-generated-from-sources:p2
/**
 * The outputs and their text, as written to disk.
 * @param {string} root
 * @param {(root: string, sourceSpec: string) => void} [install]
 * @param {RegistryLookup} [registry]
 */
export function generate(root, install, registry = npmRegistry) {
  // @cpt-begin:cpt-site-algo-site-data-generate:p2:inst-read-guide
  const guide = readJson(path.join(root, TEMPLATES_GUIDE));
  // @cpt-end:cpt-site-algo-site-data-generate:p2:inst-read-guide
  // @cpt-begin:cpt-site-algo-site-data-generate:p2:inst-build-outline
  const outline = buildTemplatesOutline(collectTemplates(root, install), guide, screenTargets(root));
  // @cpt-end:cpt-site-algo-site-data-generate:p2:inst-build-outline
  // @cpt-begin:cpt-site-algo-site-data-generate:p2:inst-serialise
  return [
    { file: TEMPLATES_OUTPUT, text: stringifyGenerated(outline) },
    { file: DOCS_OUTPUT, text: stringifyGenerated(buildDocsVersions(root, registry)) },
    { file: LIBS_OUTPUT, text: stringifyGenerated(buildLibsData(root, registry)) },
  ];
  // @cpt-end:cpt-site-algo-site-data-generate:p2:inst-serialise
}

// @cpt-flow:cpt-site-flow-site-data-generate:p2
/**
 * Writes the outputs, or with `check` compares them and returns the files that differ.
 * @param {string} root
 * @param {{ check?: boolean }} [options]
 * @param {(root: string, sourceSpec: string) => void} [install]
 * @param {RegistryLookup} [registry]
 * @returns {string[]}
 */
export function runSiteData(root, { check = false } = {}, install, registry) {
  /** @type {string[]} */
  const stale = [];
  // @cpt-begin:cpt-site-flow-site-data-generate:p2:inst-generate
  for (const { file, text: content } of generate(root, install, registry)) {
    const full = path.join(root, file);
    const current = fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : undefined;
    // @cpt-end:cpt-site-flow-site-data-generate:p2:inst-generate
    // @cpt-begin:cpt-site-flow-site-data-generate:p2:inst-unchanged
    if (current === content) continue;
    // @cpt-end:cpt-site-flow-site-data-generate:p2:inst-unchanged
    // @cpt-begin:cpt-site-flow-site-data-generate:p2:inst-write-or-record
    if (check) stale.push(file);
    else {
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, content);
    }
    // @cpt-end:cpt-site-flow-site-data-generate:p2:inst-write-or-record
  }
  // @cpt-begin:cpt-site-flow-site-data-generate:p2:inst-return-stale
  return stale;
  // @cpt-end:cpt-site-flow-site-data-generate:p2:inst-return-stale
}

if (isEntryPoint(import.meta.url)) {
  // @cpt-begin:cpt-site-flow-site-data-generate:p2:inst-run
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const check = process.argv.includes('--check');
  // @cpt-end:cpt-site-flow-site-data-generate:p2:inst-run
  try {
    const stale = runSiteData(root, { check });
    // @cpt-begin:cpt-site-flow-site-data-generate:p2:inst-report-stale
    for (const file of stale) console.error(`site:data: ${file} differs from what its sources generate; run npm run site:data`);
    if (stale.length > 0) process.exit(1);
    // @cpt-end:cpt-site-flow-site-data-generate:p2:inst-report-stale
    // @cpt-begin:cpt-site-flow-site-data-generate:p2:inst-report-ok
    console.log(check ? 'site:data: generated files match their sources' : 'site:data: generated files written');
    // @cpt-end:cpt-site-flow-site-data-generate:p2:inst-report-ok
  } catch (error) {
    // @cpt-begin:cpt-site-flow-site-data-generate:p2:inst-catch
    console.error(`site:data: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
    // @cpt-end:cpt-site-flow-site-data-generate:p2:inst-catch
  }
}
