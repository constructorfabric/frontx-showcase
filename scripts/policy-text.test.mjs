import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { checkText, inDashScope, inScope, runPolicyText } from './policy-text.mjs';

const EM = '\u2014';
const EN = '\u2013';

describe('checkText', () => {
  it('refuses both long dashes, naming file and line', () => {
    expect(checkText('a.md', `one\ntwo ${EM} three\nfour ${EN} five`)).toEqual([
      'a.md:2: an em dash (U+2014); use "-"',
      'a.md:3: an en dash (U+2013); use "-"',
    ]);
  });

  it('refuses the design-tool vendor name, internal company domains, the company-specific name and the former product name in any case', () => {
    expect(checkText('a.ts', '// exported from Figma')).toEqual(['a.ts:1: a vendor name; describe the design source neutrally']);
    expect(checkText('a.ts', 'const FIGMA_URL = 1;')).toHaveLength(1);
    expect(checkText('a.md', 'mail me at someone@constructor.tech')).toEqual(['a.md:1: an internal company domain (constructor.tech)']);
    expect(checkText('a.ts', "const email = 'aisha@constructor.dev';")).toEqual(['a.ts:1: an internal company domain (constructor.dev)']);
    expect(checkText('a.md', 'the ACV workspace')).toEqual(['a.md:1: a company-specific name (acv)']);
    expect(checkText('a.json', '"title": "Gears FrontX"')).toEqual(['a.json:1: a former product name; the product is FrontX']);
  });

  it('accepts the company homepage written exactly as https://constructor.tech/, and refuses a mail address, a subdomain or another address on that domain', () => {
    expect(checkText('a.json', '{ "href": { "url": "https://constructor.tech/" } }')).toEqual([]);
    expect(checkText('a.md', 'See https://constructor.tech/ for the company.')).toEqual([]);
    expect(checkText('a.md', 'the homepage `https://constructor.tech/` is public')).toEqual([]);
    expect(checkText('a.md', 'write to team@constructor.tech')).toEqual(['a.md:1: an internal company domain (constructor.tech)']);
    expect(checkText('a.md', 'https://wiki.constructor.tech/')).toEqual(['a.md:1: an internal company domain (constructor.tech)']);
    expect(checkText('a.md', 'https://constructor.tech/careers')).toEqual(['a.md:1: an internal company domain (constructor.tech)']);
    expect(checkText('a.md', 'http://constructor.tech/')).toEqual(['a.md:1: an internal company domain (constructor.tech)']);
  });

  it('accepts the Constructor Fabric brand: the company and product names, the brand domain and the GitHub organization', () => {
    expect(checkText('a.html', '<title>FrontX · Constructor Fabric</title>')).toEqual([]);
    expect(checkText('a.md', 'Built by Constructor; see frontx.constructor.rocks')).toEqual([]);
    expect(checkText('a.md', 'made by ConstructorFabric, validated with Constructor Studio')).toEqual([]);
    expect(checkText('a.md', 'https://github.com/constructorfabric/gears-frontx and github:constructorfabric/gears-frontx-templates')).toEqual([]);
  });

  it('accepts ordinary text and the short hyphen', () => {
    expect(checkText('a.ts', 'class A { constructor() {} } // a - b')).toEqual([]);
    expect(checkText('a.ts', "import { x } from '@gears-frontx/react'; // gears-frontx repository")).toEqual([]);
  });

  it('skips the integrity and resolved lines of a lockfile, and nothing else there', () => {
    const lock = ['{', '  "integrity": "sha512-xfigmax==",', '  "resolved": "https://registry.npmjs.org/acv/-/acv-1.0.0.tgz",', '  "description": "figma"', '}'].join('\n');
    expect(checkText('site/package-lock.json', lock)).toEqual(['site/package-lock.json:4: a vendor name; describe the design source neutrally']);
  });
});

describe('inScope', () => {
  it('scans repository files, and of site/ only the project-owned ones', () => {
    expect(inScope('README.md')).toBe(true);
    expect(inScope('template-site/src-app/mfe_packages/site-home-mfe/src/lifecycle.tsx')).toBe(true);
    expect(inScope('site/package.json')).toBe(true);
    expect(inScope('site/.npmrc')).toBe(true);
    // A shell file the site changed is site-owned; one it left as the shell ships it is not.
    expect(inScope('site/src-app/app/main.tsx')).toBe(true);
    expect(inScope('site/src-app/app/layout/navigation.ts')).toBe(true);
    expect(inScope('site/src-app/app/api/index.ts')).toBe(false);
    expect(inScope('site/.frontx/provenance.json')).toBe(false);
  });

  it('leaves out .cf-studio/, installs, build output and the policy files', () => {
    expect(inScope('.cf-studio/config/core.toml')).toBe(false);
    expect(inScope('tools/site-meta/node_modules/x/index.js')).toBe(false);
    expect(inScope('template-site/src-app/mfe_packages/site-home-mfe/dist/index.js')).toBe(false);
    expect(inScope('scripts/policy-text.mjs')).toBe(false);
    expect(inScope('scripts/policy-text.test.mjs')).toBe(false);
  });
});

describe('inDashScope', () => {
  it('holds the long-dash rules in every file but installs and build output', () => {
    expect(inDashScope('README.md')).toBe(true);
    expect(inDashScope('.cf-studio/config/core.toml')).toBe(true);
    expect(inDashScope('scripts/policy-text.mjs')).toBe(true);
    expect(inDashScope('site/src-app/app/api/index.ts')).toBe(true);
    expect(inDashScope('site/.frontx/ai/@gears-frontx/template-design-guardrails/skills/verify-interface/SKILL.md')).toBe(true);
    expect(inDashScope('tools/site-meta/node_modules/x/index.js')).toBe(false);
    expect(inDashScope('template-site/src-app/mfe_packages/site-home-mfe/dist/index.js')).toBe(false);
  });
});

describe('runPolicyText', () => {
  let root;

  /** @param {string} rel @param {string | Buffer} content */
  const write = (rel, content) => {
    mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    writeFileSync(path.join(root, rel), content);
  };

  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), 'policy-text-'));
    execFileSync('git', ['init', '-q'], { cwd: root });
    write('.gitignore', 'ignored/\n');
  });

  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it('reports findings in tracked and new files, skipping git-ignored and binary files', () => {
    write('docs/a.md', `fine\nnot ${EM} fine\n`);
    write('ignored/b.md', `ignored ${EM}\n`);
    write('image.bin', Buffer.from([0, 1, 2, ...Buffer.from(EM)]));
    const { errors, checked } = runPolicyText(root);
    expect(errors).toEqual(['docs/a.md:2: an em dash (U+2014); use "-"']);
    expect(checked).toBe(2);
  });

  it('refuses a long dash in a Studio file and in an applied file the site left as it ships, where the other rules do not look', () => {
    write('.cf-studio/c.md', `studio-owned ${EM}\nexported from Figma\n`);
    write('site/src-app/app/d.ts', `// applied by the shell ${EN}\n// the ACV workspace\n`);
    const { errors } = runPolicyText(root);
    expect(errors).toEqual(['.cf-studio/c.md:1: an em dash (U+2014); use "-"', 'site/src-app/app/d.ts:1: an en dash (U+2013); use "-"']);
  });
});
