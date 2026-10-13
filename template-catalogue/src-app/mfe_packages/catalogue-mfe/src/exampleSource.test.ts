import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MfeHandlerMF } from '@gears-frontx/mfes';
import { describe, expect, it } from 'vitest';
import { exampleSourceModule } from '../exampleSourcePlugin';
import { decodeExampleSource } from './exampleSource';

const buttonSource = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'examples/button.tsx'), 'utf8');

/** The default export of a generated module, the way the bundle evaluates it. */
function exportedString(moduleCode: string): string {
  const literal = /^export default (".*");$/.exec(moduleCode)?.[1];
  if (literal === undefined) throw new Error(`not a string module: ${moduleCode.slice(0, 80)}`);
  const value: unknown = JSON.parse(literal);
  if (typeof value !== 'string') throw new Error('the default export is not a string');
  return value;
}

/*
 * The MFE loader's own chunk scanners, called on the module text the way the loader calls them on every chunk it links. They are private, so they are reached by name; if a loader upgrade renames them, these tests fail loudly rather than pass on nothing.
 */
const loader = new MfeHandlerMF('gts.test.example_source.v1');
const relativeImportsOf = (chunk: string): string[] => loader['parseStaticImportFilenames'](chunk, 'assets/button-source.js');
const withBareSpecifiersRewritten = (chunk: string): string => loader['rewriteBareSpecifiers'](chunk, new Map([['react', 'blob:react']]));

describe('example source transport', () => {
  it('ships the text in a form the MFE loader does not mistake for imports, and reads it back unchanged', () => {
    const chunk = exampleSourceModule(buttonSource);
    expect(relativeImportsOf(chunk)).toEqual([]);
    expect(withBareSpecifiersRewritten(chunk)).toBe(chunk);
    expect(decodeExampleSource(exportedString(chunk))).toBe(buttonSource);
  });

  it('keeps text outside ASCII intact', () => {
    const text = "const label = 'Searching… 検索 ok';\n";
    expect(decodeExampleSource(exportedString(exampleSourceModule(text)))).toBe(text);
  });

  it('is needed: the same text as a plain string literal is read as an import of a chunk that does not exist', () => {
    const rawChunk = `export default ${JSON.stringify(buttonSource)};`;
    expect(relativeImportsOf(rawChunk)).toEqual(['shared']);
  });
});
