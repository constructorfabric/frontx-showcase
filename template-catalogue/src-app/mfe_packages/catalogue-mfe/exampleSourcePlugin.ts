/// <reference types="node" />
import fs from 'node:fs';
import type { Plugin } from 'vite';

/** The import query that turns an example file into its source text, read by `decodeExampleSource`. */
export const EXAMPLE_SOURCE_QUERY = 'example-source';

/**
 * The module an example's source becomes: its text as one base64 string.
 *
 * Vite's `?raw` would ship the text as a string literal, and the MFE loader reads every chunk's text with regular expressions before it runs it: an `import ... from '../shared'` inside that string is taken for a real import, the loader fetches a chunk that does not exist, and the source never arrives. Bare specifiers such as `'react'` inside the string would be rewritten to blob URLs too. Base64 has no quotes, so no minifier can turn it back into text the loader would match.
 * @param text - the example file's source text
 */
export function exampleSourceModule(text: string): string {
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-example-source:p1:inst-serve-base64
  return `export default ${JSON.stringify(Buffer.from(text, 'utf8').toString('base64'))};`;
  // @cpt-end:cpt-template-catalogue-algo-catalogue-screen-example-source:p1:inst-serve-base64
}

/** Serves `<file>?example-source` imports as {@link exampleSourceModule}, in the build and in the tests alike. */
// @cpt-algo:cpt-template-catalogue-algo-catalogue-screen-example-source:p1
export function exampleSource(): Plugin {
  return {
    name: 'catalogue:example-source',
    enforce: 'pre',
    load(id) {
      // @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-example-source:p1:inst-match-source-query
      const [file, query] = id.split('?');
      if (!file || query === undefined || !new URLSearchParams(query).has(EXAMPLE_SOURCE_QUERY)) return null;
      // @cpt-end:cpt-template-catalogue-algo-catalogue-screen-example-source:p1:inst-match-source-query
      // @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-example-source:p1:inst-serve-base64
      this.addWatchFile(file);
      return exampleSourceModule(fs.readFileSync(file, 'utf8'));
      // @cpt-end:cpt-template-catalogue-algo-catalogue-screen-example-source:p1:inst-serve-base64
    },
  };
}
