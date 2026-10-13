/**
 * The source text of an example file, from the base64 string the `?example-source` import gives (see `exampleSourcePlugin.ts` for why the text travels encoded).
 * @param base64 - the module's default export
 */
// @cpt-algo:cpt-template-catalogue-algo-catalogue-screen-example-source:p1
export function decodeExampleSource(base64: string): string {
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-example-source:p1:inst-decode-source
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
  // @cpt-end:cpt-template-catalogue-algo-catalogue-screen-example-source:p1:inst-decode-source
}
