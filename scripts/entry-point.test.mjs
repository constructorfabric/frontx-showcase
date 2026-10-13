import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { isEntryPoint } from './entry-point.mjs';

let root;

beforeEach(() => {
  root = fs.realpathSync(fs.mkdtempSync(path.join(tmpdir(), 'entry-point-')));
  fs.mkdirSync(path.join(root, 'real', 'scripts'), { recursive: true });
  fs.writeFileSync(path.join(root, 'real', 'scripts', 'guard.mjs'), '');
  fs.writeFileSync(path.join(root, 'real', 'scripts', 'other.mjs'), '');
  fs.symlinkSync(path.join(root, 'real'), path.join(root, 'linked'));
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe('isEntryPoint', () => {
  const moduleUrl = () => pathToFileURL(path.join(root, 'real', 'scripts', 'guard.mjs')).href;

  it('holds for the started script by its real path, a relative path or a path through a symlink', () => {
    expect(isEntryPoint(moduleUrl(), path.join(root, 'real', 'scripts', 'guard.mjs'))).toBe(true);
    expect(isEntryPoint(moduleUrl(), path.relative(process.cwd(), path.join(root, 'real', 'scripts', 'guard.mjs')))).toBe(true);
    expect(isEntryPoint(moduleUrl(), path.join(root, 'linked', 'scripts', 'guard.mjs'))).toBe(true);
  });

  it('does not hold for another script, or without a started script', () => {
    expect(isEntryPoint(moduleUrl(), path.join(root, 'linked', 'scripts', 'other.mjs'))).toBe(false);
    expect(isEntryPoint(moduleUrl(), undefined)).toBe(false);
    expect(isEntryPoint(moduleUrl(), '')).toBe(false);
  });
});
