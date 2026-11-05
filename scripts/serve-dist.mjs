#!/usr/bin/env node
// `npm start`: serves the production build, site/dist, over plain HTTP on PORT (8080 by default) and HOST (0.0.0.0 by default), the way the image's Caddy serves it (deploy/site/Caddyfile): the same security headers, cache policy and content types, a folder address served without a redirect, br or gzip for text, GET and HEAD only, errors as plain text that is never cached. For a Node host that runs the built site; the container image stays the main deploy path. Node's standard library only, so it runs after `npm ci --omit=dev` too.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { pipeline } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import zlib from 'node:zlib';
import { isEntryPoint } from './entry-point.mjs';

/** The production build, resolved from this file so the working directory does not matter. */
export const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'site', 'dist');

// The values of deploy/site/Caddyfile, which explains them; change both together.
// @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-headers
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Content-Security-Policy': "base-uri 'self'; object-src 'none'; frame-ancestors 'self'",
};
const HASHED = /^\/(?:mfe\/[^/]+\/)?assets\//;

/** Content types of the files a build writes; anything else is served as bytes. */
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.map': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.md': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm',
};
const COMPRESSIBLE = /^(?:text\/|application\/(?:json|manifest\+json|xml)|image\/svg\+xml)/;
// Caddy's encode skips bodies this small: the encoding would cost more than it saves.
const MIN_COMPRESS_BYTES = 512;
// @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-headers

const brotliCompress = promisify(zlib.brotliCompress);
const gzip = promisify(zlib.gzip);
// Quality 5 of 11 keeps the first request for a file quick; the result is kept, so later ones cost nothing.
const BROTLI_OPTIONS = { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } };

/**
 * The missing-build message, or null when `root` holds a build.
 * @param {string} root
 * @returns {string | null}
 */
// @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-if-no-build
export function missingBuild(root) {
  if (fs.existsSync(path.join(root, 'index.html'))) return null;
  return `serve-dist: ${path.join(root, 'index.html')} is missing; run npm run build first`;
}
// @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-if-no-build

/**
 * The file a request path names under `root`, or null: the path is decoded and normalized, and a path that does not decode, carries a NUL byte or leaves `root` names nothing.
 * @param {string} root - an absolute path
 * @param {string} pathname - the request path without its query string
 * @returns {string | null}
 */
// @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-resolve-path
export function resolveFile(root, pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes('\0')) return null;
  const file = path.resolve(root, `.${path.posix.normalize(`/${decoded}`)}`);
  if (file !== root && !file.startsWith(root + path.sep)) return null;
  return file;
}
// @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-resolve-path

/**
 * br when the client takes it, otherwise gzip when it takes that, otherwise none. A coding the header names takes its own weight; one it does not name takes the weight of `*`, if any; a weight of 0 refuses.
 * @param {string | undefined} header - the request's Accept-Encoding
 * @returns {'br' | 'gzip' | null}
 */
// @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-compress
export function chooseEncoding(header) {
  /** @type {Map<string, number>} */
  const weights = new Map();
  for (const part of (header ?? '').split(',')) {
    const [name, ...params] = part.split(';').map((p) => p.trim().toLowerCase());
    const q = params.find((p) => p.startsWith('q='));
    if (name) weights.set(name, q === undefined ? 1 : Number(q.slice(2)));
  }
  const takes = (/** @type {string} */ name) => (weights.get(name) ?? weights.get('*') ?? 0) > 0;
  if (takes('br')) return 'br';
  if (takes('gzip')) return 'gzip';
  return null;
}
// @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-compress

/**
 * Whether an If-None-Match value names `etag`: `*`, or a comma-separated list of tags compared weakly (RFC 9110 section 13.1.2), so `W/"x"` matches `"x"`.
 * @param {string | undefined} header - the request's If-None-Match
 * @param {string} etag - the tag of the representation this request would get, its content coding included
 * @returns {boolean}
 */
// @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-if-unchanged
export function matchesEtag(header, etag) {
  const opaque = (/** @type {string} */ tag) => tag.trim().replace(/^W\//, '');
  return (header ?? '').split(',').some((tag) => tag.trim() === '*' || opaque(tag) === opaque(etag));
}
// @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-if-unchanged

/**
 * The port a PORT value names, or null when it is not an integer from 0 to 65535.
 * @param {string | undefined} value - PORT; unset or empty means 8080
 * @returns {number | null}
 */
// @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-listen
export function parsePort(value) {
  if (value === undefined || value === '') return 8080;
  const port = /^\d+$/.test(value) ? Number(value) : NaN;
  return port <= 65535 ? port : null;
}
// @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-listen

/**
 * @param {http.ServerResponse} res
 * @param {number} status
 */
function sendError(res, status) {
  // @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-error
  const body = `${status} ${http.STATUS_CODES[status]}`;
  res.writeHead(status, {
    ...SECURITY_HEADERS,
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    // A missing file must not be cached, least of all under assets/ while a deploy is rolling out.
    'Cache-Control': 'no-store',
    ...(status === 405 ? { Allow: 'GET, HEAD' } : {}),
  });
  res.end(body);
  // @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-error
}

/**
 * The file to send for a resolved path: the file itself, or a folder's `index.html` with no redirect to the slashed address (Caddy's `disable_canonical_uris`: the redirect would be written from the root and leave a sub-path mount). A file whose real path, symlinks followed, lies outside the build names nothing.
 * @param {string} named
 * @param {string} realBase - the build folder's real path
 * @returns {{ file: string, stats: fs.Stats } | null}
 */
// @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-folder-index
function locate(named, realBase) {
  try {
    let file = named;
    let stats = fs.statSync(file);
    if (stats.isDirectory()) {
      file = path.join(named, 'index.html');
      stats = fs.statSync(file);
    }
    const real = fs.realpathSync(file);
    if (real !== realBase && !real.startsWith(realBase + path.sep)) return null;
    return stats.isFile() ? { file, stats } : null;
  } catch {
    // Missing, or a folder without an index: both are a 404.
    return null;
  }
}
// @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-folder-index

// @cpt-dod:cpt-site-dod-production-build-layout-serve-dist:p2
/**
 * The server over a build folder; `listen` is the caller's.
 * @param {string} [root] - the build folder, `site/dist` by default
 * @returns {http.Server}
 */
export function createServer(root = DIST) {
  const base = path.resolve(root);
  const realBase = fs.realpathSync(base);
  // @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-compress
  // Compressed bodies, one per file and coding, each with the tag of the file it was made from: a build is compressed once, not on every request. A changed file gets a new tag and replaces its entry, so the cache stays within the size of the build.
  /** @type {Map<string, { etag: string, body: Promise<Buffer> }>} */
  const compressed = new Map();
  /**
   * @param {string} file
   * @param {string} etag - the encoded representation's tag
   * @param {'br' | 'gzip'} encoding
   * @returns {Promise<Buffer>}
   */
  const compress = (file, etag, encoding) => {
    const key = `${encoding}:${file}`;
    const cached = compressed.get(key);
    if (cached?.etag === etag) return cached.body;
    const body = fs.promises
      .readFile(file)
      .then((source) => (encoding === 'br' ? brotliCompress(source, BROTLI_OPTIONS) : gzip(source)));
    // A failed read is not kept, so the next request tries again.
    body.catch(() => {
      if (compressed.get(key)?.body === body) compressed.delete(key);
    });
    compressed.set(key, { etag, body });
    return body;
  };
  // @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-compress
  return http.createServer((req, res) => {
    // @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-if-method
    if (req.method !== 'GET' && req.method !== 'HEAD') return sendError(res, 405);
    // @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-if-method
    // @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-resolve-path
    const pathname = (req.url ?? '/').split('?')[0];
    const named = resolveFile(base, pathname);
    // @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-resolve-path
    // @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-folder-index
    const found = named === null ? null : locate(named, realBase);
    if (found === null) return sendError(res, 404);
    const { file, stats } = found;
    // @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-folder-index

    // @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-headers
    const type = TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
    // The policy follows the file served, not the raw path: `/assets/..%2Fmf-manifest.json` names a root file.
    const served = `/${path.relative(base, file).split(path.sep).join('/')}`;
    const compressible = COMPRESSIBLE.test(type) && stats.size >= MIN_COMPRESS_BYTES;
    const encoding = compressible ? chooseEncoding(req.headers['accept-encoding']) : null;
    // A strong tag names one representation, so each content coding gets its own (RFC 9110 section 8.8.3).
    const tag = `${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}`;
    const etag = encoding ? `"${tag}-${encoding}"` : `"${tag}"`;
    /** @type {http.OutgoingHttpHeaders} */
    const headers = {
      ...SECURITY_HEADERS,
      'Content-Type': type,
      'Cache-Control': HASHED.test(served) ? 'public, max-age=31536000, immutable' : 'no-cache',
      ETag: etag,
      'Last-Modified': stats.mtime.toUTCString(),
    };
    // A 304 carries the Vary its 200 would, so a cache keys both the same way.
    if (compressible) headers.Vary = 'Accept-Encoding';
    // @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-headers
    // @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-if-unchanged
    if (matchesEtag(req.headers['if-none-match'], etag)) {
      res.writeHead(304, headers);
      return res.end();
    }
    // @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-if-unchanged

    // @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-compress
    if (encoding) {
      compress(file, etag, encoding).then(
        (body) => {
          headers['Content-Encoding'] = encoding;
          headers['Content-Length'] = body.length;
          res.writeHead(200, headers);
          res.end(req.method === 'HEAD' ? undefined : body);
        },
        () => sendError(res, 500),
      );
      return;
    }
    headers['Content-Length'] = stats.size;
    res.writeHead(200, headers);
    if (req.method === 'HEAD' || stats.size === 0) return res.end();
    // Exactly the bytes stat counted, so the body keeps to its Content-Length if the file grows meanwhile; pipeline destroys both streams on an error or on a client that leaves mid-body, so no file stays open.
    pipeline(fs.createReadStream(file, { start: 0, end: stats.size - 1 }), res, () => {});
    // @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-compress
  });
}

// @cpt-flow:cpt-site-flow-production-build-layout-serve-dist:p2
function main() {
  // @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-if-no-build
  const missing = missingBuild(DIST);
  if (missing) {
    console.error(missing);
    process.exitCode = 1;
    return;
  }
  // @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-if-no-build
  // @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-listen
  const port = parsePort(process.env.PORT);
  if (port === null) {
    console.error(`serve-dist: PORT must be an integer from 0 to 65535, got "${process.env.PORT}"`);
    process.exitCode = 1;
    return;
  }
  const host = process.env.HOST || '0.0.0.0';
  const server = createServer(DIST);
  // A failed listen leaves nothing open, so the process ends on its own.
  server.on('error', (error) => {
    console.error(`serve-dist: cannot listen on ${host}:${port}: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(port, host, () => {
    // The bound port, which PORT=0 leaves to the system.
    const bound = /** @type {import('node:net').AddressInfo} */ (server.address()).port;
    console.log(`serve-dist: site/dist at http://${host}:${bound}/`);
  });
  // @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-listen
}

if (isEntryPoint(import.meta.url)) main();
