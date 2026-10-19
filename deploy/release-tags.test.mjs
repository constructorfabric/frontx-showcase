// The tag gate and the image tags of deploy/release-tags.sh, run against a scratch repository whose origin/main and tags are laid out per case.
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const SCRIPT = fileURLToPath(new URL('./release-tags.sh', import.meta.url));
/** @type {string[]} */
const dirs = [];

/**
 * A repository with one commit per tag on main, each tagged, and origin/main at the last one; `off` tags go on a commit outside main.
 * @param {{ main?: string[], off?: string[] }} layout
 */
function repo({ main = [], off = [] }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'release-tags-'));
  dirs.push(dir);
  const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim();
  git('init', '-q', '-b', 'main');
  git('config', 'user.email', 'test@example.invalid');
  git('config', 'user.name', 'test');
  // The developer's global signing or hooks must not reach the scratch commits and tags.
  git('config', 'commit.gpgsign', 'false');
  git('config', 'tag.gpgSign', 'false');
  git('config', 'core.hooksPath', '/dev/null');
  git('commit', '-q', '--allow-empty', '-m', 'root');
  for (const tag of main) {
    git('commit', '-q', '--allow-empty', '-m', tag);
    git('tag', tag);
  }
  git('update-ref', 'refs/remotes/origin/main', 'main');
  for (const tag of off) {
    git('switch', '-q', '-c', `side-${tag}`, 'main');
    git('commit', '-q', '--allow-empty', '-m', tag);
    git('tag', tag);
    git('switch', '-q', 'main');
  }
  return { dir, sha: (tag) => git('rev-parse', `${tag}^{commit}`), run: (tag, sha) => spawnSync(SCRIPT, [tag, sha], { cwd: dir, encoding: 'utf8' }) };
}

/**
 * The image tags the script prints for a tag, with the sha shown as `sha`.
 * @param {ReturnType<typeof repo>} r
 * @param {string} tag
 */
function imageTags(r, tag) {
  const sha = r.sha(tag);
  const out = r.run(tag, sha);
  expect(out.status, out.stderr).toBe(0);
  return out.stdout.trim().split('\n').map((t) => (t === sha ? 'sha' : t));
}

afterEach(() => {
  for (const dir of dirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

describe('release-tags.sh', () => {
  it('gives the first release its version, sha, line and latest', () => {
    expect(imageTags(repo({ main: ['v0.1.0'] }), 'v0.1.0')).toEqual(['0.1.0', 'sha', '0.1', 'latest']);
  });

  it('keeps latest and the line on the highest release when an older one is published', () => {
    const r = repo({ main: ['v0.1.0', 'v0.1.1', 'v0.2.0'] });
    expect(imageTags(r, 'v0.1.0')).toEqual(['0.1.0', 'sha']);
    expect(imageTags(r, 'v0.1.1')).toEqual(['0.1.1', 'sha', '0.1']);
    expect(imageTags(r, 'v0.2.0')).toEqual(['0.2.0', 'sha', '0.2', 'latest']);
  });

  it('orders versions numerically and keeps a line apart from a longer one', () => {
    const r = repo({ main: ['v1.2.0', 'v0.9.0', 'v0.10.0', 'v11.2.0'] });
    expect(imageTags(r, 'v1.2.0')).toEqual(['1.2.0', 'sha', '1.2']);
    expect(imageTags(r, 'v0.10.0')).toEqual(['0.10.0', 'sha', '0.10']);
    expect(imageTags(r, 'v11.2.0')).toEqual(['11.2.0', 'sha', '11.2', 'latest']);
  });

  it('ignores a release tag outside main when choosing latest', () => {
    expect(imageTags(repo({ main: ['v0.1.0'], off: ['v9.0.0'] }), 'v0.1.0')).toEqual(['0.1.0', 'sha', '0.1', 'latest']);
  });

  it('fails on a tag outside main', () => {
    const r = repo({ main: ['v0.1.0'], off: ['v0.2.0'] });
    const out = r.run('v0.2.0', r.sha('v0.2.0'));
    expect(out.status).toBe(1);
    expect(out.stderr).toMatch(/not on main/);
  });

  it('fails apart from "not on main" when git cannot check the commit', () => {
    const r = repo({ main: ['v0.1.0'] });
    execFileSync('git', ['update-ref', '-d', 'refs/remotes/origin/main'], { cwd: r.dir });
    const out = r.run('v0.1.0', r.sha('v0.1.0'));
    expect(out.status).toBe(1);
    expect(out.stderr).toMatch(/git exit/);
    expect(out.stderr).not.toMatch(/not on main/);
  });

  it('fails when the tag is missing or points at another commit, lightweight or annotated', () => {
    const r = repo({ main: ['v0.1.0', 'v0.2.0'] });
    execFileSync('git', ['tag', '-a', '-m', 'v0.3.0', 'v0.3.0', 'v0.1.0'], { cwd: r.dir });
    expect(imageTags(r, 'v0.3.0')).toEqual(['0.3.0', 'sha', '0.3', 'latest']);
    for (const tag of ['v0.1.0', 'v0.3.0']) {
      const out = r.run(tag, r.sha('v0.2.0'));
      expect(out.status, tag).toBe(1);
      expect(out.stderr).toMatch(/points at .*, not at /);
    }
    const missing = r.run('v0.4.0', r.sha('v0.2.0'));
    expect(missing.status).toBe(1);
    expect(missing.stderr).toMatch(/not a tag in this clone/);
  });

  it('fails on a shallow clone, which cannot tell a commit off main from missing history', () => {
    const r = repo({ main: ['v0.1.0', 'v0.2.0'] });
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'release-tags-shallow-'));
    dirs.push(dir);
    execFileSync('git', ['clone', '-q', '--depth', '1', '--no-single-branch', `file://${r.dir}`, dir]);
    const out = spawnSync(SCRIPT, ['v0.2.0', r.sha('v0.2.0')], { cwd: dir, encoding: 'utf8' });
    expect(out.status).toBe(1);
    expect(out.stderr).toMatch(/shallow/);
  });

  it('fails on a tag that is not a plain release version', () => {
    const r = repo({ main: ['v0.1.0'] });
    for (const tag of ['v0.1', 'v0.1.0-rc.1', '0.1.0', 'v01.0.0', 'v0.1.0\nv9.0.0']) {
      const out = r.run(tag, r.sha('v0.1.0'));
      expect(out.status, tag).toBe(1);
      expect(out.stderr).toMatch(/not a release version/);
    }
  });
});
