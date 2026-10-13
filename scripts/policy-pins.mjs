#!/usr/bin/env node
// Pin policy of architecture/DESIGN.md section 4.2.2: every MFE package and every tooling package of every template pins the FrontX ecosystem at the registry versions the site's application depends on (site/package.json), the shell's workspace packages at the versions of the applied shell, a `@gears-frontx/*` package one of this repository's templates delivers under `src-app/verify_packages/` at that package's own version, and the shared toolchain at the shell's own versions, exactly. Every other dependency of a template package is pinned exactly at the version site/package-lock.json resolves for that package's composed copy, its own nested copy first, so a template installs what the site tested. A pin that differs from a shell workspace version or a template package's version makes npm fetch a second copy from the registry (two React contexts, or a release instead of the template's source), and an ecosystem package the site does not depend on would install a version nothing else checks.
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { findTemplateDirs } from './template-discovery.mjs';
import { isEntryPoint } from './entry-point.mjs';

/** Third-party packages every MFE package shares with the shell, pinned at the shell's own versions. */
export const SHELL_SHARED = ['react', 'react-dom', 'vite', 'vitest', 'typescript', '@module-federation/vite', '@vitejs/plugin-react', '@tanstack/react-query'];

/** Packages the kit depends on and an MFE package may pin, at the kit's own version (the shell keeps its own copy at another version). */
export const KIT_OWN = ['lucide-react'];

const ECOSYSTEM_SCOPE = '@gears-frontx/';

/** An exact registry version: the ecosystem set is a list of releases, so a range or a `file:` spec in site/package.json is refused rather than read as a pin. */
const EXACT_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/**
 * The expected pin of every package the policy governs, with where the value comes from, and the errors of the sources themselves.
 * @param {string} root - repository root
 * @returns {{ pins: Map<string, { version: string, source: string }>, errors: string[] }}
 */
// @cpt-algo:cpt-site-algo-repository-policies-expected-pins:p3
export function expectedPins(root) {
  /** @type {Map<string, { version: string, source: string }>} */
  const pins = new Map();
  /** @type {string[]} */
  const errors = [];
  const shell = readJson(path.join(root, 'site', 'package.json'));
  // @cpt-begin:cpt-site-algo-repository-policies-expected-pins:p3:inst-read-workspaces
  const workspaces = path.join(root, 'site', 'packages');
  /** @type {Map<string, { version: string, source: string }>} */
  const workspacePins = new Map();
  for (const dir of fs.readdirSync(workspaces).sort()) {
    const file = path.join(workspaces, dir, 'package.json');
    if (!fs.existsSync(file)) continue;
    const pkg = readJson(file);
    workspacePins.set(pkg.name, { version: pkg.version, source: `site/packages/${dir}/package.json` });
  }
  // @cpt-end:cpt-site-algo-repository-policies-expected-pins:p3:inst-read-workspaces
  // @cpt-begin:cpt-site-algo-repository-policies-expected-pins:p3:inst-read-template-packages
  /** @type {Map<string, { version: string, source: string }>} */
  const templatePins = new Map();
  for (const file of templatePackageFiles(root, [VERIFY_PACKAGES])) {
    const pkg = readJson(file);
    if (typeof pkg.name !== 'string' || !pkg.name.startsWith(ECOSYSTEM_SCOPE)) continue;
    templatePins.set(pkg.name, { version: pkg.version, source: path.relative(root, file).split(path.sep).join('/') });
  }
  // @cpt-end:cpt-site-algo-repository-policies-expected-pins:p3:inst-read-template-packages
  // The ecosystem set: the site application's direct `@gears-frontx/*` dependencies that are neither the shell itself, one of its workspaces nor a package a template here delivers.
  // @cpt-begin:cpt-site-algo-repository-policies-expected-pins:p3:inst-ecosystem-set
  for (const [name, spec] of Object.entries(shell.dependencies ?? {})) {
    if (!name.startsWith(ECOSYSTEM_SCOPE) || name === shell.name || workspacePins.has(name)) continue;
    const delivered = templatePins.get(name);
    if (delivered) {
      if (spec !== delivered.version) errors.push(`site/package.json: dependencies.${name} is "${spec}"; the pin is "${delivered.version}" (${delivered.source})`);
      continue;
    }
    if (typeof spec === 'string' && EXACT_VERSION.test(spec)) pins.set(name, { version: spec, source: 'site/package.json' });
    else errors.push(`site/package.json: dependencies.${name} is "${spec}"; the ecosystem is pinned to an exact registry version`);
  }
  // @cpt-end:cpt-site-algo-repository-policies-expected-pins:p3:inst-ecosystem-set
  // @cpt-begin:cpt-site-algo-repository-policies-expected-pins:p3:inst-shell-pins
  pins.set(shell.name, { version: shell.version, source: 'site/package.json' });
  for (const [name, pin] of workspacePins) pins.set(name, pin);
  // @cpt-end:cpt-site-algo-repository-policies-expected-pins:p3:inst-shell-pins
  // A template package under the shell's name or a workspace's would shadow that package in the site's install, so it is refused rather than pinned. The site application's own dependency on a delivered package is held to the template's version above.
  // @cpt-begin:cpt-site-algo-repository-policies-expected-pins:p3:inst-template-pins
  for (const [name, pin] of templatePins) {
    if (name === shell.name || workspacePins.has(name)) errors.push(`${pin.source}: ${name} is a package of the shell; a template package takes a name of its own`);
    else pins.set(name, pin);
  }
  // @cpt-end:cpt-site-algo-repository-policies-expected-pins:p3:inst-template-pins
  // @cpt-begin:cpt-site-algo-repository-policies-expected-pins:p3:inst-toolchain-pins
  const shellDeps = { ...shell.dependencies, ...shell.devDependencies };
  for (const name of SHELL_SHARED) {
    if (shellDeps[name]) pins.set(name, { version: shellDeps[name], source: 'site/package.json' });
  }
  // @cpt-end:cpt-site-algo-repository-policies-expected-pins:p3:inst-toolchain-pins
  // @cpt-begin:cpt-site-algo-repository-policies-expected-pins:p3:inst-kit-own-pins
  const kit = pins.get('@gears-frontx/ui-kit');
  if (kit) {
    // The kit's own dependencies as the site's lock file records them for the installed kit, so the policy needs no install.
    const lockFile = path.join(root, 'site', 'package-lock.json');
    const locked = fs.existsSync(lockFile) ? readJson(lockFile).packages?.['node_modules/@gears-frontx/ui-kit'] : undefined;
    if (!locked || locked.version !== kit.version) errors.push(`site/package-lock.json: does not resolve @gears-frontx/ui-kit to ${kit.version}; run npm install --prefix site`);
    const kitDeps = locked?.dependencies ?? {};
    for (const name of KIT_OWN) {
      if (kitDeps[name]) pins.set(name, { version: kitDeps[name], source: `@gears-frontx/ui-kit@${kit.version} dependencies` });
    }
  }
  // @cpt-end:cpt-site-algo-repository-policies-expected-pins:p3:inst-kit-own-pins
  // @cpt-begin:cpt-site-algo-repository-policies-expected-pins:p3:inst-return-pins
  return { pins, errors };
  // @cpt-end:cpt-site-algo-repository-policies-expected-pins:p3:inst-return-pins
}

/**
 * The version site/package-lock.json resolves for a dependency of the package composed at `lockPath` under `site/`: the package's own nested copy, else the root copy.
 * @param {Record<string, { version?: string }>} lock - the lock file's `packages`
 * @param {string} lockPath - the composed package's path relative to `site/`, posix separators
 * @param {string} name
 */
// @cpt-algo:cpt-site-algo-repository-policies-check-package:p3
function lockedVersion(lock, lockPath, name) {
  // @cpt-begin:cpt-site-algo-repository-policies-check-package:p3:inst-if-other-dependency
  return lock[`${lockPath}/node_modules/${name}`]?.version ?? lock[`node_modules/${name}`]?.version;
  // @cpt-end:cpt-site-algo-repository-policies-check-package:p3:inst-if-other-dependency
}

/**
 * Pin violations of one package.json.
 * @param {{ name?: string, dependencies?: Record<string, string>, devDependencies?: Record<string, string> }} pkg
 * @param {Map<string, { version: string, source: string }>} pins
 * @param {string} where - the file, for messages
 * @param {{ lock: Record<string, { version?: string }>, lockPath: string }} [site] - the site lock file's `packages` and the package's composed path; without it the dependencies outside the pin set are not checked
 */
// @cpt-dod:cpt-site-dod-repository-policies-exact-pins:p3
export function checkPackagePins(pkg, pins, where, site) {
  const errors = [];
  // @cpt-begin:cpt-site-algo-repository-policies-check-package:p3:inst-for-each-dependency
  for (const field of ['dependencies', 'devDependencies']) {
    for (const [name, spec] of Object.entries(pkg[field] ?? {})) {
      // @cpt-begin:cpt-site-algo-repository-policies-check-package:p3:inst-if-governed-differs
      const pin = pins.get(name);
      if (pin && spec !== pin.version) errors.push(`${where}: ${field}.${name} is "${spec}"; the pin is "${pin.version}" (${pin.source})`);
      // @cpt-end:cpt-site-algo-repository-policies-check-package:p3:inst-if-governed-differs
      // @cpt-begin:cpt-site-algo-repository-policies-check-package:p3:inst-if-ungoverned-ecosystem
      if (!pin && name.startsWith(ECOSYSTEM_SCOPE)) errors.push(`${where}: ${field}.${name} is not an ecosystem package the site depends on, a shell workspace or a package a template of this repository delivers`);
      // @cpt-end:cpt-site-algo-repository-policies-check-package:p3:inst-if-ungoverned-ecosystem
      // @cpt-begin:cpt-site-algo-repository-policies-check-package:p3:inst-if-other-dependency
      if (!pin && !name.startsWith(ECOSYSTEM_SCOPE) && site) {
        const version = lockedVersion(site.lock, site.lockPath, name);
        if (!version) errors.push(`${where}: ${field}.${name} is not resolved by site/package-lock.json; run npm install --prefix site`);
        else if (spec !== version) errors.push(`${where}: ${field}.${name} is "${spec}"; the pin is "${version}" (site/package-lock.json)`);
      }
      // @cpt-end:cpt-site-algo-repository-policies-check-package:p3:inst-if-other-dependency
    }
  }
  // @cpt-end:cpt-site-algo-repository-policies-check-package:p3:inst-for-each-dependency
  // @cpt-begin:cpt-site-algo-repository-policies-check-package:p3:inst-return-violations
  return errors;
  // @cpt-end:cpt-site-algo-repository-policies-check-package:p3:inst-return-violations
}

/** The shell's workspace root for the packages a template delivers that are not screens. */
const VERIFY_PACKAGES = path.join('src-app', 'verify_packages');

/** The template folders that hold packages: screen MFE packages, and the non-screen packages (tooling, brand, components) a template delivers into the shell's `src-app/verify_packages/`. */
const PACKAGE_ROOTS = [path.join('src-app', 'mfe_packages'), VERIFY_PACKAGES];

/**
 * Every package.json of every template's screen and non-screen packages, as absolute paths.
 * @param {string} root
 * @param {string[]} [packageRoots] - the template folders to list, both by default
 */
// @cpt-algo:cpt-site-algo-repository-policies-check-templates:p3
export function templatePackageFiles(root, packageRoots = PACKAGE_ROOTS) {
  // @cpt-begin:cpt-site-algo-repository-policies-check-templates:p3:inst-list-packages
  return findTemplateDirs(root).flatMap((templateDir) =>
    packageRoots.flatMap((packageRoot) => {
      const packages = path.join(templateDir, packageRoot);
      if (!fs.existsSync(packages)) return [];
      return fs
        .readdirSync(packages)
        .filter((name) => name !== 'shared' && !name.startsWith('.'))
        .map((name) => path.join(packages, name, 'package.json'))
        .filter((file) => fs.existsSync(file))
        .sort();
    }),
  );
  // @cpt-end:cpt-site-algo-repository-policies-check-templates:p3:inst-list-packages
}

/**
 * @param {string} root
 * @returns {{ errors: string[], checked: number }}
 */
export function runPolicyPins(root) {
  // @cpt-begin:cpt-site-algo-repository-policies-check-templates:p3:inst-derive-pins
  const { pins, errors: sourceErrors } = expectedPins(root);
  // @cpt-end:cpt-site-algo-repository-policies-check-templates:p3:inst-derive-pins
  // @cpt-begin:cpt-site-algo-repository-policies-check-templates:p3:inst-list-packages
  const files = templatePackageFiles(root);
  // @cpt-end:cpt-site-algo-repository-policies-check-templates:p3:inst-list-packages
  // @cpt-begin:cpt-site-algo-repository-policies-check-templates:p3:inst-read-lock
  const lockFile = path.join(root, 'site', 'package-lock.json');
  const lock = fs.existsSync(lockFile) ? (readJson(lockFile).packages ?? {}) : {};
  // @cpt-end:cpt-site-algo-repository-policies-check-templates:p3:inst-read-lock
  // @cpt-begin:cpt-site-algo-repository-policies-check-templates:p3:inst-check-each
  const errors = [
    ...sourceErrors,
    ...files.flatMap((file) => {
      const where = path.relative(root, file);
      // <template>/src-app/<mfe_packages|verify_packages>/<package>/package.json is composed to site/src-app/<...>/<package>.
      const lockPath = where.split(path.sep).slice(1, -1).join('/');
      return checkPackagePins(readJson(file), pins, where, { lock, lockPath });
    }),
  ];
  // @cpt-end:cpt-site-algo-repository-policies-check-templates:p3:inst-check-each
  // @cpt-begin:cpt-site-algo-repository-policies-check-templates:p3:inst-return-pin-result
  return { errors, checked: files.length };
  // @cpt-end:cpt-site-algo-repository-policies-check-templates:p3:inst-return-pin-result
}

// @cpt-flow:cpt-site-flow-repository-policies-run-policy:p3
if (isEntryPoint(import.meta.url)) {
  // @cpt-begin:cpt-site-flow-repository-policies-run-policy:p3:inst-run-policy
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const { errors, checked } = runPolicyPins(root);
  // @cpt-end:cpt-site-flow-repository-policies-run-policy:p3:inst-run-policy
  // @cpt-begin:cpt-site-flow-repository-policies-run-policy:p3:inst-if-findings
  if (errors.length > 0) {
    for (const error of errors) console.error(`policy:pins: ${error}`);
    process.exit(1);
  }
  // @cpt-end:cpt-site-flow-repository-policies-run-policy:p3:inst-if-findings
  // @cpt-begin:cpt-site-flow-repository-policies-run-policy:p3:inst-report-checked
  console.log(`policy:pins: ${checked} packages pin the ecosystem, the shell workspaces, the template packages, the shared toolchain and every other dependency exactly`);
  // @cpt-end:cpt-site-flow-repository-policies-run-policy:p3:inst-report-checked
}
