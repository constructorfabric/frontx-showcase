#!/usr/bin/env node
// Smoke test of `npm run dev`: starts it the way a developer does, waits until the host and every MFE remote answer, then stops everything it started. The shell's dev:all reaches its tools through `npx`; a tool missing from site/node_modules makes npx ask to download it (an interactive prompt the run then waits on, with nothing listening) or, without a terminal, fetch an unpinned copy. So the run first checks that each tool resolves from the site install, and fails on any npx install notice in the output.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { isEntryPoint } from './entry-point.mjs';

/** Tools template-shell's dev:all runs through npx (`scripts/dev-all.ts` and the scripts it calls); each must resolve from site/node_modules/.bin. */
export const DEV_NPX_TOOLS = ['concurrently', 'tsx'];

/** The host's dev server port (template-shell's Vite default). */
export const HOST_PORT = 5173;

/** Lines npm prints when npx is about to fetch a package that the site install does not provide. */
export const NPX_INSTALL_NOTICES = [/Need to install the following packages/, /npm warn exec The following package was not found and will be installed/i];

const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000;

/**
 * Tools of DEV_NPX_TOOLS that site/node_modules/.bin does not provide.
 * @param {string} root - repository root
 * @returns {string[]}
 */
// @cpt-algo:cpt-site-algo-dev-run-read-targets:p3
export function missingNpxTools(root) {
  // @cpt-begin:cpt-site-algo-dev-run-read-targets:p3:inst-missing-tools
  const bin = path.join(root, 'site', 'node_modules', '.bin');
  return DEV_NPX_TOOLS.filter((tool) => !fs.existsSync(path.join(bin, tool)));
  // @cpt-end:cpt-site-algo-dev-run-read-targets:p3:inst-missing-tools
}

/**
 * The MFE packages composed into the site and the port each one's mfe.json names.
 * @param {string} root - repository root
 * @returns {{ name: string, port: number }[]}
 */
export function composedPackages(root) {
  // @cpt-begin:cpt-site-algo-dev-run-read-targets:p3:inst-composed-packages
  const packages = path.join(root, 'site', 'src-app', 'mfe_packages');
  if (!fs.existsSync(packages)) return [];
  return fs
    .readdirSync(packages)
    .filter((name) => fs.existsSync(path.join(packages, name, 'mfe.json')))
    .sort()
    .map((name) => {
      const manifest = JSON.parse(fs.readFileSync(path.join(packages, name, 'mfe.json'), 'utf8')).manifest ?? {};
      return { name, port: Number(new URL(String(manifest.remoteEntry)).port) };
    });
  // @cpt-end:cpt-site-algo-dev-run-read-targets:p3:inst-composed-packages
}

/**
 * The remote entry URLs the host loads, read from the manifests it serves (`/generated-mfe-manifests.json`): each remote's `publicPath` plus its remote entry file.
 * @param {unknown} manifests - the parsed generated-mfe-manifests.json
 * @returns {{ name: string, url: string }[]}
 */
export function remoteEntryUrls(manifests) {
  // @cpt-begin:cpt-site-algo-dev-run-read-targets:p3:inst-remote-entries
  if (!Array.isArray(manifests)) return [];
  return manifests.map((item) => {
    const meta = item?.manifest?.metaData ?? {};
    const entry = meta.remoteEntry ?? {};
    const file = entry.path ? `${String(entry.path).replace(/\/+$/, '')}/${entry.name}` : String(entry.name);
    return { name: String(item?.manifest?.name ?? meta.name), url: new URL(file, String(meta.publicPath)).href };
  });
  // @cpt-end:cpt-site-algo-dev-run-read-targets:p3:inst-remote-entries
}

/**
 * The first npx install notice in a chunk of dev output, or null.
 * @param {string} text
 * @returns {string | null}
 */
export function findNpxInstallNotice(text) {
  // @cpt-begin:cpt-site-algo-dev-run-read-targets:p3:inst-find-notice
  for (const line of text.split(/\r?\n/)) {
    if (NPX_INSTALL_NOTICES.some((pattern) => pattern.test(line))) return line.trim();
  }
  return null;
  // @cpt-end:cpt-site-algo-dev-run-read-targets:p3:inst-find-notice
}

/**
 * Whether something already accepts connections on localhost at the port (IPv4 or IPv6).
 * @param {number} port
 * @returns {Promise<boolean>}
 */
export function portInUse(port) {
  // @cpt-begin:cpt-site-algo-dev-run-read-targets:p3:inst-port-in-use
  const probe = (host) =>
    new Promise((resolve) => {
      const socket = net.connect({ host, port });
      socket.once('connect', () => {
        socket.destroy();
        resolve(true);
      });
      socket.once('error', () => resolve(false));
    });
  return Promise.all([probe('127.0.0.1'), probe('::1')]).then((results) => results.some(Boolean));
  // @cpt-end:cpt-site-algo-dev-run-read-targets:p3:inst-port-in-use
}

/**
 * Whether the URL answers 200 with a body whose content type matches.
 * @param {string} url
 * @param {RegExp} contentType
 */
// @cpt-flow:cpt-site-flow-dev-run-smoke:p3
async function answers(url, contentType) {
  // @cpt-begin:cpt-site-flow-dev-run-smoke:p3:inst-check-targets
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    return response.ok && contentType.test(response.headers.get('content-type') ?? '');
  } catch {
    return false;
  }
  // @cpt-end:cpt-site-flow-dev-run-smoke:p3:inst-check-targets
}

/**
 * Stops the process group of the dev run and waits until it is gone.
 * @param {import('node:child_process').ChildProcess} child
 */
async function stopGroup(child) {
  // @cpt-begin:cpt-site-flow-dev-run-smoke:p3:inst-stop-run
  const pid = child.pid;
  if (pid === undefined) return;
  const signalGroup = (signal) => {
    try {
      process.kill(-pid, signal);
    } catch {
      // the group is already gone
    }
  };
  signalGroup('SIGTERM');
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try {
      process.kill(-pid, 0);
    } catch {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  signalGroup('SIGKILL');
  // @cpt-end:cpt-site-flow-dev-run-smoke:p3:inst-stop-run
}

/**
 * Runs `npm run dev` from the repository root and checks that the host and every remote answer.
 * @param {string} root - repository root
 * @param {{ timeoutMs?: number, log?: (line: string) => void }} [options]
 * @returns {Promise<{ errors: string[], seconds: number, checked: string[] }>}
 */
// @cpt-dod:cpt-site-dod-dev-run-smoke-check:p3
export async function runDevSmoke(root, { timeoutMs = DEFAULT_TIMEOUT_MS, log = console.log } = {}) {
  const started = Date.now();
  const seconds = () => Math.round((Date.now() - started) / 1000);
  // @cpt-begin:cpt-site-flow-dev-run-smoke:p3:inst-if-tool-missing
  const missing = missingNpxTools(root);
  if (missing.length > 0) {
    return {
      errors: missing.map((tool) => `${tool} is not installed in site/node_modules; the shell's dev:all runs it through npx, which would prompt to download it. Run \`npm run setup\`, and keep ${tool} in the devDependencies of site/package.json`),
      seconds: seconds(),
      checked: [],
    };
  }
  // @cpt-end:cpt-site-flow-dev-run-smoke:p3:inst-if-tool-missing
  // @cpt-begin:cpt-site-flow-dev-run-smoke:p3:inst-read-packages
  const packages = composedPackages(root);
  if (packages.length === 0) return { errors: ['site/src-app/mfe_packages/ holds no MFE package; run `npm run setup` first'], seconds: seconds(), checked: [] };
  // @cpt-end:cpt-site-flow-dev-run-smoke:p3:inst-read-packages
  // @cpt-begin:cpt-site-flow-dev-run-smoke:p3:inst-if-port-taken
  const busy = [];
  for (const port of [HOST_PORT, ...packages.map((pkg) => pkg.port)]) if (await portInUse(port)) busy.push(port);
  if (busy.length > 0) return { errors: [`port(s) ${busy.join(', ')} already in use; stop the running dev server first`], seconds: seconds(), checked: [] };
  // @cpt-end:cpt-site-flow-dev-run-smoke:p3:inst-if-port-taken

  // @cpt-begin:cpt-site-flow-dev-run-smoke:p3:inst-start-run
  const host = `http://localhost:${HOST_PORT}`;
  const pending = new Set([
    { label: `host ${host}/?screen=home`, url: `${host}/?screen=home`, type: /text\/html/ },
    { label: `host ${host}/generated-mfe-manifests.json`, url: `${host}/generated-mfe-manifests.json`, type: /json/, manifests: true },
  ]);
  const checked = [];

  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const child = spawn(npm, ['run', 'dev'], { cwd: root, detached: true, stdio: ['ignore', 'pipe', 'pipe'], env: process.env });
  const stopOnSignal = () => stopGroup(child).then(() => process.exit(130));
  process.once('SIGINT', stopOnSignal);
  process.once('SIGTERM', stopOnSignal);
  let output = '';
  let notice = null;
  let exited = null;
  const collect = (chunk) => {
    const text = chunk.toString();
    output = (output + text).slice(-20000);
    notice ??= findNpxInstallNotice(text);
  };
  child.stdout.on('data', collect);
  child.stderr.on('data', collect);
  child.on('exit', (code, signal) => {
    exited = signal ?? `exit code ${code}`;
  });
  // @cpt-end:cpt-site-flow-dev-run-smoke:p3:inst-start-run

  const errors = [];
  try {
    // @cpt-begin:cpt-site-flow-dev-run-smoke:p3:inst-poll
    while (pending.size > 0 && errors.length === 0) {
      // @cpt-begin:cpt-site-flow-dev-run-smoke:p3:inst-if-run-failed
      if (notice) {
        errors.push(`npx is fetching a package the site install does not provide: "${notice}"`);
        break;
      }
      if (exited) {
        errors.push(`npm run dev stopped (${exited}) before every server answered`);
        break;
      }
      if (Date.now() - started > timeoutMs) {
        errors.push(`timed out after ${seconds()}s; still not answering: ${[...pending].map((target) => target.label).join(', ')}`);
        break;
      }
      // @cpt-end:cpt-site-flow-dev-run-smoke:p3:inst-if-run-failed
      // @cpt-begin:cpt-site-flow-dev-run-smoke:p3:inst-check-targets
      for (const target of [...pending]) {
        if (!(await answers(target.url, target.type))) continue;
        pending.delete(target);
        checked.push(target.label);
        if (!target.manifests) continue;
        // The remotes are the ones the host loads, at the origins the served manifests name.
        const remotes = remoteEntryUrls(await (await fetch(target.url)).json());
        const servedPorts = remotes.map((remote) => Number(new URL(remote.url).port)).sort();
        const packagePorts = packages.map((pkg) => pkg.port).sort();
        if (servedPorts.join() !== packagePorts.join()) {
          errors.push(`the host serves remotes on ports ${servedPorts.join(', ')}, the composed packages declare ${packagePorts.join(', ')}`);
          break;
        }
        for (const remote of remotes) pending.add({ label: `${remote.name} ${remote.url}`, url: remote.url, type: /javascript/ });
      }
      // @cpt-end:cpt-site-flow-dev-run-smoke:p3:inst-check-targets
      if (pending.size > 0) await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    // @cpt-end:cpt-site-flow-dev-run-smoke:p3:inst-poll
  } finally {
    // @cpt-begin:cpt-site-flow-dev-run-smoke:p3:inst-stop-run
    process.off('SIGINT', stopOnSignal);
    process.off('SIGTERM', stopOnSignal);
    await stopGroup(child);
    // @cpt-end:cpt-site-flow-dev-run-smoke:p3:inst-stop-run
  }
  // @cpt-begin:cpt-site-flow-dev-run-smoke:p3:inst-return-result
  if (errors.length > 0) {
    log('dev:smoke: last output of npm run dev:');
    log(output.split(/\r?\n/).slice(-40).join('\n'));
  }
  return { errors, seconds: seconds(), checked };
  // @cpt-end:cpt-site-flow-dev-run-smoke:p3:inst-return-result
}

if (isEntryPoint(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const timeoutMs = Number(process.env.DEV_SMOKE_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;
  // @cpt-begin:cpt-site-flow-dev-run-smoke:p3:inst-report
  const { errors, seconds, checked } = await runDevSmoke(root, { timeoutMs });
  if (errors.length > 0) {
    for (const error of errors) console.error(`dev:smoke: ${error}`);
    process.exit(1);
  }
  console.log(`dev:smoke: npm run dev served the host and ${checked.length - 2} remote entries in ${seconds}s, then stopped`);
  // @cpt-end:cpt-site-flow-dev-run-smoke:p3:inst-report
}
