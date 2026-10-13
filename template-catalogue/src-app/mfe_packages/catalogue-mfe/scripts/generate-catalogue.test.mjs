import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  ADAPTATIONS_DIR,
  CACHE_DIR,
  LOCK_FILE,
  applyContentRules,
  applyPatch,
  checkCatalogue,
  createPatch,
  generateCatalogue,
  generateFiles,
  isIncluded,
  parseArgs,
  recordAdaptations,
  sha256,
} from './generate-catalogue.mjs';

const VENDOR = '\x46igma';
const DASH = '\u2014';

const temporaryDirs = [];
afterEach(() => {
  for (const dir of temporaryDirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

/** @param {string} root @param {Record<string, string>} files */
function writeTree(root, files) {
  for (const [file, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), text);
  }
}

const DEMO = {
  'examples/button.tsx': `export default function ButtonExample() {\n  // a note ${DASH} with a long dash\n  return <a href="#">Link</a>;\n}\n`,
  'examples/card.tsx': 'export default function CardExample() {\n  return null;\n}\n',
  'pages/token-utils.ts': 'export const read = () => document.documentElement;\n',
  'shared.tsx': 'export function Section() {\n  return null;\n}\n',
  'main.tsx': 'not taken by the catalogue\n',
};
const BUTTON_ADAPTATION = `Adaptation of examples/button.tsx\nKind: mechanical\nReason: the link stays on the page\n--- a/examples/button.tsx\n+++ b/examples/button.tsx\n@@ -1,3 +1,3 @@\n export default function ButtonExample() {\n   // a note - with a long dash\n-  return <a href="#">Link</a>;\n+  return <a href="#button-link">Link</a>;\n }\n`;

/**
 * A catalogue package and a kit checkout side by side: the package generated from the checkout's demo with one adaptation.
 * @param {{ pin?: string, kitVersion?: string }} options
 */
async function fixture({ pin = '0.4.0', kitVersion = '0.4.0' } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'catalogue-generator-'));
  temporaryDirs.push(root);
  const packageDir = path.join(root, 'catalogue-mfe');
  const sourceDir = path.join(root, 'kit', 'demo');
  writeTree(path.join(root, 'kit'), { 'package.json': JSON.stringify({ version: kitVersion }) });
  writeTree(sourceDir, DEMO);
  writeTree(packageDir, {
    'package.json': JSON.stringify({ dependencies: { '@gears-frontx/ui-kit': pin } }),
    [LOCK_FILE]: JSON.stringify({ kit: { name: '@gears-frontx/ui-kit', version: '0.3.0' }, source: { repository: 'owner/repo', ref: 'old', path: 'packages/ui-kit/demo' }, include: ['examples/*.tsx', 'pages/*.ts', 'pages/*.tsx', 'shared.tsx'], files: {} }),
    [`${ADAPTATIONS_DIR}/examples/button.tsx.patch`]: BUTTON_ADAPTATION,
    'src/catalog.ts': 'export {};\n',
  });
  await generateCatalogue({ packageDir, sourceDir, ref: 'release' });
  return { root, packageDir, sourceDir };
}

describe('content rules', () => {
  it('replaces long dashes, the vendor name and internal mail domains', () => {
    const text = [
      `a ${DASH} b \u2013 c`,
      ` * Ordered to match the ${VENDOR} foundations mockup's "Semantic colors" board`,
      ` * theme.css actually defines. The ${VENDOR}\n * foundations mockup's "Typography" board`,
      `// the gap against ${VENDOR}'s 4-specimen board`,
      "{ email: 'aisha@constructor\x2edev' }",
    ].join('\n');
    expect(applyContentRules(text)).toBe(
      [
        'a - b - c',
        ` * Ordered to match the design source's foundations "Semantic colors" board`,
        ` * theme.css actually defines. The design\n * source's foundations "Typography" board`,
        "// the gap against the design source's 4-specimen board",
        "{ email: 'aisha@example.com' }",
      ].join('\n'),
    );
  });

  it('refuses generated text where refused content survives', () => {
    const sources = new Map([['examples/x.tsx', `// made in ${VENDOR}\n`]]);
    expect(() => generateFiles(sources, new Map())).toThrow(/vendor name survives/);
  });
});

describe('adaptations', () => {
  const oldText = 'one\ntwo\nthree\nfour\nfive\nsix\nseven\neight\nnine\nten\n';
  const newText = 'one\ntwo\n3\nfour\nfive\nsix\nseven\neight\nnine\nten\neleven\n';

  it('round-trips a recorded diff', () => {
    const patch = createPatch(oldText, newText, 'x.ts');
    expect(applyPatch(oldText, patch, 'x')).toBe(newText);
    expect(createPatch(oldText, oldText, 'x.ts')).toBeUndefined();
  });

  it('applies where the source moved, and only there', () => {
    const patch = createPatch(oldText, newText, 'x.ts');
    expect(applyPatch(`zero\n${oldText}`, patch, 'x')).toBe(`zero\n${newText}`);
  });

  it('fails instead of guessing when the source under a hunk changed', () => {
    const patch = createPatch(oldText, newText, 'x.ts');
    expect(() => applyPatch(oldText.replace('two', 'TWO'), patch, 'x')).toThrow(/no longer matches the source/);
  });

  it('refuses an adaptation without its kind and reason', () => {
    const sources = new Map([['a.ts', 'a\n']]);
    const patch = `Kind: TODO mechanical or substantive\nReason: TODO\n${createPatch('a\n', 'b\n', 'a.ts')}`;
    expect(() => generateFiles(sources, new Map([['a.ts', patch]]))).toThrow(/Kind must be one of/);
    const noReason = `Kind: mechanical\nReason: TODO why\n${createPatch('a\n', 'b\n', 'a.ts')}`;
    expect(() => generateFiles(sources, new Map([['a.ts', noReason]]))).toThrow(/Reason/);
  });

  it('refuses an adaptation of a file the demo does not have', () => {
    expect(() => generateFiles(new Map(), new Map([['gone.tsx', BUTTON_ADAPTATION]]))).toThrow(/does not have/);
  });
});

describe('generation and --check', () => {
  it('generates the included demo files through the rules and adaptations, and records the release', async () => {
    const { packageDir, sourceDir } = await fixture();
    expect(fs.readFileSync(path.join(packageDir, 'src/examples/button.tsx'), 'utf8')).toContain('// a note - with a long dash\n  return <a href="#button-link">');
    expect(fs.existsSync(path.join(packageDir, 'src/main.tsx'))).toBe(false);
    const lock = JSON.parse(fs.readFileSync(path.join(packageDir, LOCK_FILE), 'utf8'));
    expect(lock.kit.version).toBe('0.4.0');
    expect(lock.source.ref).toBe('release');
    expect(Object.keys(lock.files)).toEqual(['examples/button.tsx', 'examples/card.tsx', 'pages/token-utils.ts', 'shared.tsx']);
    expect(lock.files['shared.tsx']).toBe(sha256(DEMO['shared.tsx']));
    expect(await checkCatalogue({ packageDir, sourceDir })).toEqual([]);
  });

  it('is deterministic: generating again changes nothing', async () => {
    const { packageDir, sourceDir } = await fixture();
    const before = fs.readFileSync(path.join(packageDir, 'src/examples/button.tsx'), 'utf8');
    await generateCatalogue({ packageDir, sourceDir });
    expect(fs.readFileSync(path.join(packageDir, 'src/examples/button.tsx'), 'utf8')).toBe(before);
  });

  it('fails on a hand edit of a generated file', async () => {
    const { packageDir, sourceDir } = await fixture();
    fs.appendFileSync(path.join(packageDir, 'src/examples/card.tsx'), '// edited\n');
    expect(await checkCatalogue({ packageDir, sourceDir })).toEqual(['src/examples/card.tsx: differs from what the generator produces']);
  });

  it('fails on a file in a generated folder that the generator does not produce, and on a missing one', async () => {
    const { packageDir, sourceDir } = await fixture();
    fs.writeFileSync(path.join(packageDir, 'src/examples/extra.tsx'), 'export {};\n');
    fs.rmSync(path.join(packageDir, 'src/shared.tsx'));
    expect(await checkCatalogue({ packageDir, sourceDir })).toEqual(['src/examples/extra.tsx: not produced by the generator', 'src/shared.tsx: missing']);
  });

  it('fails when the pinned kit version changes', async () => {
    const { packageDir, sourceDir } = await fixture();
    fs.writeFileSync(path.join(packageDir, 'package.json'), JSON.stringify({ dependencies: { '@gears-frontx/ui-kit': '0.5.0' } }));
    const problems = await checkCatalogue({ packageDir, sourceDir });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/pins @gears-frontx\/ui-kit 0\.5\.0, the catalogue was generated from 0\.4\.0/);
    await expect(generateCatalogue({ packageDir, sourceDir })).rejects.toThrow(/run with --ref/);
  });

  it('fails when the demo source differs from the locked hashes', async () => {
    const { packageDir, sourceDir } = await fixture();
    fs.appendFileSync(path.join(sourceDir, 'shared.tsx'), '// upstream moved\n');
    expect(await checkCatalogue({ packageDir, sourceDir })).toEqual([`kit demo shared.tsx: its content does not match the hash in ${LOCK_FILE}`]);
  });

  it('refuses a commit that declares another kit version than the pin', async () => {
    const { packageDir, sourceDir } = await fixture();
    fs.writeFileSync(path.join(sourceDir, '..', 'package.json'), JSON.stringify({ version: '0.4.1' }));
    await expect(generateCatalogue({ packageDir, sourceDir, ref: 'newer' })).rejects.toThrow(/declares @gears-frontx\/ui-kit 0\.4\.1, package.json pins 0\.4\.0/);
  });

  it('records a deliberate edit as an adaptation that generation reproduces once its header is filled in', async () => {
    const { packageDir, sourceDir } = await fixture();
    const card = path.join(packageDir, 'src/examples/card.tsx');
    fs.writeFileSync(card, fs.readFileSync(card, 'utf8').replace('return null', 'return <p>card</p>'));
    expect(await recordAdaptations({ packageDir, sourceDir, files: ['examples/card.tsx'] })).toEqual([`wrote ${ADAPTATIONS_DIR}/examples/card.tsx.patch`]);
    expect(await checkCatalogue({ packageDir, sourceDir })).toEqual(['adaptation examples/card.tsx.patch: Kind must be one of mechanical, substantive']);
    const patchPath = path.join(packageDir, ADAPTATIONS_DIR, 'examples/card.tsx.patch');
    fs.writeFileSync(patchPath, fs.readFileSync(patchPath, 'utf8').replace(/Kind: .*/, 'Kind: substantive').replace(/Reason: .*/, 'Reason: the card shows text'));
    expect(await checkCatalogue({ packageDir, sourceDir })).toEqual([]);
  });

  it('drops an adaptation the file no longer needs', async () => {
    const { packageDir, sourceDir } = await fixture();
    fs.writeFileSync(path.join(packageDir, 'src/examples/button.tsx'), applyContentRules(DEMO['examples/button.tsx']));
    expect(await recordAdaptations({ packageDir, sourceDir, files: ['examples/button.tsx'] })).toEqual([`removed ${ADAPTATIONS_DIR}/examples/button.tsx.patch`]);
  });
});

describe('the network and the cache', () => {
  /**
   * A fetch that serves the demo checkout by its raw.githubusercontent.com address, or the given answer for every address.
   * @param {string} sourceDir
   * @param {{ body?: string }} options
   */
  function fakeFetch(sourceDir, { body } = {}) {
    const calls = [];
    const fetchImpl = async (url) => {
      calls.push(String(url));
      const file = String(url).split('/packages/ui-kit/demo/')[1] ?? '';
      return new Response(body ?? fs.readFileSync(path.join(sourceDir, file), 'utf8'), { status: 200 });
    };
    return { fetchImpl, calls };
  }

  /** @param {string} packageDir */
  function cachedFiles(packageDir) {
    const dir = path.join(packageDir, CACHE_DIR);
    return fs.existsSync(dir) ? fs.readdirSync(dir, { recursive: true }).filter((entry) => fs.statSync(path.join(dir, entry)).isFile()).sort() : [];
  }

  it('does not cache an answer whose content does not match the lock, names its address, and succeeds once the network answers right', async () => {
    const { packageDir, sourceDir } = await fixture();
    const portal = fakeFetch(sourceDir, { body: '<html>portal</html>\n' });
    await expect(checkCatalogue({ packageDir, fetchImpl: portal.fetchImpl })).rejects.toThrow(/raw\.githubusercontent\.com\/owner\/repo\/release\/packages\/ui-kit\/demo\/examples\/button\.tsx.*does not match the hash/);
    expect(cachedFiles(packageDir)).toEqual([]);
    const good = fakeFetch(sourceDir);
    expect(await checkCatalogue({ packageDir, fetchImpl: good.fetchImpl })).toEqual([]);
    expect(cachedFiles(packageDir)).toEqual(['release/examples/button.tsx', 'release/examples/card.tsx', 'release/pages/token-utils.ts', 'release/shared.tsx']);
    const again = fakeFetch(sourceDir);
    expect(await checkCatalogue({ packageDir, fetchImpl: again.fetchImpl })).toEqual([]);
    expect(again.calls).toEqual([]);
  });

  it('fetches a cache entry that does not match the lock again and replaces it', async () => {
    const { packageDir, sourceDir } = await fixture();
    await checkCatalogue({ packageDir, fetchImpl: fakeFetch(sourceDir).fetchImpl });
    const entry = path.join(packageDir, CACHE_DIR, 'release', 'shared.tsx');
    fs.writeFileSync(entry, 'export function Sect');
    const refetch = fakeFetch(sourceDir);
    expect(await checkCatalogue({ packageDir, fetchImpl: refetch.fetchImpl })).toEqual([]);
    expect(refetch.calls).toEqual(['https://raw.githubusercontent.com/owner/repo/release/packages/ui-kit/demo/shared.tsx']);
    expect(fs.readFileSync(entry, 'utf8')).toBe(DEMO['shared.tsx']);
  });

  it('names the address and the local alternative when the network fails', async () => {
    const { packageDir } = await fixture();
    const offline = async () => {
      throw new TypeError('fetch failed');
    };
    await expect(checkCatalogue({ packageDir, fetchImpl: offline })).rejects.toThrow(/GET https:\/\/raw\.githubusercontent\.com\/owner\/repo\/release\/.*fetch failed.*--source/);
    expect(cachedFiles(packageDir)).toEqual([]);
  });
});

describe('moving to a new kit version', () => {
  /** The demo at a newer commit of the same kit version, where the line the button adaptation changes moved on upstream. */
  function moveUpstream(sourceDir) {
    const file = path.join(sourceDir, 'examples/button.tsx');
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('return <a href="#">Link</a>;', 'return <a href="#" title="Link">Link</a>;'));
  }

  it('moves the lock and writes every file when an adaptation no longer applies, leaving that file as the new source and its adaptation in place', async () => {
    const { packageDir, sourceDir } = await fixture();
    moveUpstream(sourceDir);
    const result = await generateCatalogue({ packageDir, sourceDir, ref: 'next' });
    expect(result.unported).toEqual([expect.stringMatching(/^adaptation examples\/button\.tsx\.patch: hunk 1 .*no longer matches/)]);
    const lock = JSON.parse(fs.readFileSync(path.join(packageDir, LOCK_FILE), 'utf8'));
    expect(lock.source.ref).toBe('next');
    expect(fs.readFileSync(path.join(packageDir, 'src/examples/button.tsx'), 'utf8')).toBe(applyContentRules(fs.readFileSync(path.join(sourceDir, 'examples/button.tsx'), 'utf8')));
    expect(fs.readFileSync(path.join(packageDir, ADAPTATIONS_DIR, 'examples/button.tsx.patch'), 'utf8')).toBe(BUTTON_ADAPTATION);
    expect(await checkCatalogue({ packageDir, sourceDir })).toEqual([expect.stringMatching(/button\.tsx\.patch: hunk 1 .*no longer matches/)]);
  });

  it('records the ported edit against the new commit, keeping the adaptation header, after which the check passes', async () => {
    const { packageDir, sourceDir } = await fixture();
    moveUpstream(sourceDir);
    await generateCatalogue({ packageDir, sourceDir, ref: 'next' });
    const button = path.join(packageDir, 'src/examples/button.tsx');
    fs.writeFileSync(button, fs.readFileSync(button, 'utf8').replace('href="#"', 'href="#button-link"'));
    expect(await recordAdaptations({ packageDir, sourceDir, files: ['examples/button.tsx'], ref: 'next' })).toEqual([`wrote ${ADAPTATIONS_DIR}/examples/button.tsx.patch`]);
    const patch = fs.readFileSync(path.join(packageDir, ADAPTATIONS_DIR, 'examples/button.tsx.patch'), 'utf8');
    expect(patch).toMatch(/^Adaptation of examples\/button\.tsx\nKind: mechanical\nReason: the link stays on the page\n--- /);
    expect(await checkCatalogue({ packageDir, sourceDir })).toEqual([]);
    await generateCatalogue({ packageDir, sourceDir });
    expect(fs.readFileSync(button, 'utf8')).toContain('<a href="#button-link" title="Link">');
  });

  it('refuses --record with a --ref the lock does not name yet, instead of recording against the old commit', async () => {
    const { packageDir, sourceDir } = await fixture();
    moveUpstream(sourceDir);
    await expect(recordAdaptations({ packageDir, sourceDir, files: ['examples/button.tsx'], ref: 'next' })).rejects.toThrow(/the lock names release.*--ref next.*first/);
    expect(fs.readFileSync(path.join(packageDir, ADAPTATIONS_DIR, 'examples/button.tsx.patch'), 'utf8')).toBe(BUTTON_ADAPTATION);
  });
});

describe('arguments and selection', () => {
  it('reads the command line', () => {
    expect(parseArgs(['--check'])).toMatchObject({ check: true });
    expect(parseArgs(['--ref', 'abc'])).toMatchObject({ ref: 'abc' });
    expect(parseArgs(['--record', 'src/examples/a.tsx', 'shared.tsx'])).toMatchObject({ record: ['examples/a.tsx', 'shared.tsx'] });
    expect(parseArgs(['--ref', 'abc', '--record', 'src/examples/a.tsx'])).toMatchObject({ ref: 'abc', record: ['examples/a.tsx'] });
    expect(() => parseArgs(['--nope'])).toThrow(/unknown argument/);
  });

  it('takes only the included demo files', () => {
    const include = ['examples/*.tsx', 'pages/*.ts', 'shared.tsx'];
    expect(isIncluded('examples/button.tsx', include)).toBe(true);
    expect(isIncluded('examples/nested/button.tsx', include)).toBe(false);
    expect(isIncluded('pages/token-utils.ts', include)).toBe(true);
    expect(isIncluded('main.tsx', include)).toBe(false);
  });
});
