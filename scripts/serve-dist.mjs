#!/usr/bin/env node
// `npm start`: serves the production build, site/dist, over plain HTTP on PORT (8080 by default) and HOST (0.0.0.0 by default), the way the image's Caddy serves it (deploy/site/Caddyfile): the same security headers, cache policy and content types, a folder address served without a redirect, br or gzip for text, GET and HEAD only, errors as plain text that is never cached. For a Node host that runs the built site; the container image stays the main deploy path. Node's standard library only, so it runs after `npm ci --omit=dev` too.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
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
 * br when the client takes it, otherwise gzip when it takes that, otherwise none.
 * @param {string | undefined} header - the request's Accept-Encoding
 * @returns {'br' | 'gzip' | null}
 */
// @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-compress
function chooseEncoding(header) {
  const accepted = new Set();
  for (const part of (header ?? '').split(',')) {
    const [name, ...params] = part.trim().toLowerCase().split(';');
    const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
    if (name && (q === undefined || Number(q.slice(2)) > 0)) accepted.add(name);
  }
  if (accepted.has('br')) return 'br';
  if (accepted.has('gzip') || accepted.has('*')) return 'gzip';
  return null;
}
// @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-compress

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
 * The file to send for a resolved path: the file itself, or a folder's `index.html` with no redirect to the slashed address (Caddy's `disable_canonical_uris`: the redirect would be written from the root and leave a sub-path mount).
 * @param {string} named
 * @returns {{ file: string, stats: fs.Stats } | null}
 */
// @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-folder-index
function locate(named) {
  try {
    let file = named;
    let stats = fs.statSync(file);
    if (stats.isDirectory()) {
      file = path.join(named, 'index.html');
      stats = fs.statSync(file);
    }
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
  return http.createServer((req, res) => {
    // @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-if-method
    if (req.method !== 'GET' && req.method !== 'HEAD') return sendError(res, 405);
    // @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-if-method
    // @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-resolve-path
    const pathname = (req.url ?? '/').split('?')[0];
    const named = resolveFile(base, pathname);
    // @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-resolve-path
    // @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-folder-index
    const found = named === null ? null : locate(named);
    if (found === null) return sendError(res, 404);
    const { file, stats } = found;
    // @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-folder-index

    // @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-headers
    const type = TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
    const etag = `"${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}"`;
    /** @type {http.OutgoingHttpHeaders} */
    const headers = {
      ...SECURITY_HEADERS,
      'Content-Type': type,
      'Cache-Control': HASHED.test(pathname) ? 'public, max-age=31536000, immutable' : 'no-cache',
      ETag: etag,
      'Last-Modified': stats.mtime.toUTCString(),
    };
    // @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-headers
    // @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-if-unchanged
    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304, headers);
      return res.end();
    }
    // @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-if-unchanged

    // @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-compress
    const compressible = COMPRESSIBLE.test(type) && stats.size >= MIN_COMPRESS_BYTES;
    const encoding = compressible ? chooseEncoding(req.headers['accept-encoding']) : null;
    if (compressible) headers.Vary = 'Accept-Encoding';
    if (encoding) headers['Content-Encoding'] = encoding;
    else headers['Content-Length'] = stats.size;
    res.writeHead(200, headers);
    if (req.method === 'HEAD') return res.end();

    const source = fs.createReadStream(file);
    const body =
      encoding === 'br'
        ? source.pipe(zlib.createBrotliCompress({ params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } }))
        : encoding === 'gzip'
          ? source.pipe(zlib.createGzip())
          : source;
    source.on('error', () => res.destroy());
    body.pipe(res);
    // @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-compress
  });
}

// @cpt-flow:cpt-site-flow-production-build-layout-serve-dist:p2
if (isEntryPoint(import.meta.url)) {
  // @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-if-no-build
  const missing = missingBuild(DIST);
  if (missing) {
    console.error(missing);
    process.exit(1);
  }
  // @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-if-no-build
  // @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-listen
  const port = Number(process.env.PORT || 8080);
  const host = process.env.HOST || '0.0.0.0';
  createServer(DIST).listen(port, host, () => {
    console.log(`serve-dist: site/dist at http://${host}:${port}/`);
  });
  // @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-listen
}
