import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MANIFEST_FILENAME, findTemplateDirs, readTemplateManifest } from './template-discovery.mjs';

let root;

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), 'template-discovery-'));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

function makeDir(name, withManifest) {
  mkdirSync(path.join(root, name), { recursive: true });
  if (withManifest) writeFileSync(path.join(root, name, MANIFEST_FILENAME), JSON.stringify({ name: `@x/${name}` }));
}

describe('findTemplateDirs', () => {
  it('finds directories by manifest presence, sorted, whatever their name', () => {
    makeDir('template-b', true);
    makeDir('a-template', true);
    makeDir('template-no-manifest', false);
    makeDir('site', false);
    expect(findTemplateDirs(root)).toEqual([path.join(root, 'a-template'), path.join(root, 'template-b')]);
  });

  it('ignores node_modules and plain files', () => {
    makeDir('node_modules', true);
    writeFileSync(path.join(root, MANIFEST_FILENAME), '{}');
    expect(findTemplateDirs(root)).toEqual([]);
  });

  it('accepts another manifest filename', () => {
    mkdirSync(path.join(root, 'x'));
    writeFileSync(path.join(root, 'x', 'other.json'), '{}');
    expect(findTemplateDirs(root, 'other.json')).toEqual([path.join(root, 'x')]);
  });
});

describe('readTemplateManifest', () => {
  it('parses the manifest', () => {
    makeDir('template-a', true);
    expect(readTemplateManifest(path.join(root, 'template-a'))).toEqual({ name: '@x/template-a' });
  });
});
