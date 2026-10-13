/**
 * A suffix for an id the client makes up itself, unique within the package.
 *
 * `crypto.randomUUID` exists only in secure contexts, so a screen served over
 * plain http from a LAN address has none; there a counter in this module plus
 * the call time stands in, which is all a client-made id needs.
 */

let fallbackCount = 0;

// @cpt-dod:cpt-template-inbox-dod-screen-frame-shared-components:p2
export const uniqueSuffix = (): string => {
  const random = globalThis.crypto?.randomUUID;
  if (typeof random === 'function') return random.call(globalThis.crypto);
  fallbackCount += 1;
  return `${Date.now().toString(36)}-${fallbackCount.toString(36)}`;
};
