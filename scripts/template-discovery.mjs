// How a repository script finds this repository's templates: a directory is a template if and only if it carries `frontx-template.json` (manifest presence, never a `template-*` name guess). Every script that walks templates (validate-templates, site-assemble, the policies) discovers them through this one function, so they cannot disagree about what a template is.
import fs from 'node:fs';
import path from 'node:path';

// The CLI's manifest filename, kept as a local literal so a script runs right after `npm ci`; validate-templates passes the value the installed CLI exports.
export const MANIFEST_FILENAME = 'frontx-template.json';

// @cpt-algo:cpt-site-algo-template-composition-discover:p1
// @cpt-dod:cpt-site-dod-template-composition-shared-modules:p1
/**
 * Every top-level directory of rootDir that carries the manifest, as absolute paths, sorted. `node_modules` is the one exclusion.
 * @param {string} rootDir
 * @param {string} [manifestFilename]
 * @returns {string[]}
 */
export function findTemplateDirs(rootDir, manifestFilename = MANIFEST_FILENAME) {
  // @cpt-begin:cpt-site-algo-template-composition-discover:p1:inst-find
  return fs
    .readdirSync(rootDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== 'node_modules')
    .map((entry) => path.join(rootDir, entry.name))
    .filter((dir) => fs.existsSync(path.join(dir, manifestFilename)))
    // @cpt-end:cpt-site-algo-template-composition-discover:p1:inst-find
    // @cpt-begin:cpt-site-algo-template-composition-discover:p1:inst-return-dirs
    .sort();
    // @cpt-end:cpt-site-algo-template-composition-discover:p1:inst-return-dirs
}

/**
 * The parsed manifest of a template directory.
 * @param {string} templateDir
 * @param {string} [manifestFilename]
 */
export function readTemplateManifest(templateDir, manifestFilename = MANIFEST_FILENAME) {
  // @cpt-begin:cpt-site-algo-template-composition-discover:p1:inst-read-manifest
  return JSON.parse(fs.readFileSync(path.join(templateDir, manifestFilename), 'utf8'));
  // @cpt-end:cpt-site-algo-template-composition-discover:p1:inst-read-manifest
}
