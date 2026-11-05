#!/usr/bin/env node
// `npm start`: serves the production build, site/dist, over plain HTTP on PORT (8080 by default) and SERVE_HOST (0.0.0.0 by default; not HOST, which shells set to the hostname), the way the image's Caddy serves it (deploy/site/Caddyfile): the same security headers, cache policy and content types, a folder address served without a redirect, GET and HEAD only, errors as plain text that is never cached. It sends every file as it is, uncompressed: a CDN or proxy in front compresses, as the image's Caddy does. For a Node host that runs the built site; the container image stays the main deploy path. Node's standard library only, so it runs after `npm ci --omit=dev` too.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { pipeline } from 'node:stream';
import { fileURLToPath } from 'node:url';
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
// Exported so the tests hold it to the Caddyfile's.
export const HASHED = /^\/(?:mfe\/[^/]+\/)?assets\//;

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
 * The file a request path names under `root`, or null: the path is decoded and its dot segments are resolved inside `root` (`/../x` is `/x`, as Caddy cleans it), so a path never leaves `root`; a path that does not decode or carries a NUL byte names nothing, and the containment check stays as a backstop.
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
 * Whether an If-None-Match value names `etag`: `*`, or a comma-separated list of tags compared weakly (RFC 9110 section 13.1.2), so `W/"x"` matches `"x"`.
 * @param {string | undefined} header - the request's If-None-Match
 * @param {string} etag - the file's tag
 * @returns {boolean}
 */
// @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-if-unchanged
export function matchesEtag(header, etag) {
  const opaque = (/** @type {string} */ tag) => tag.trim().replace(/^W\//, '');
  return (header ?? '').split(',').some((tag) => tag.trim() === '*' || opaque(tag) === opaque(etag));
}

/**
 * Whether a request's validators find the file unchanged: If-None-Match decides when present, otherwise If-Modified-Since, compared in whole seconds as HTTP dates carry them (RFC 9110 section 13.2.2); a date that does not parse is ignored.
 * @param {http.IncomingHttpHeaders} headers - the request's headers
 * @param {string} etag - the file's tag
 * @param {number} mtimeMs - the file's modification time
 * @returns {boolean}
 */
export function notModified(headers, etag, mtimeMs) {
  if (headers['if-none-match'] !== undefined) return matchesEtag(headers['if-none-match'], etag);
  const since = Date.parse(headers['if-modified-since'] ?? '');
  return !Number.isNaN(since) && Math.floor(mtimeMs / 1000) <= Math.floor(since / 1000);
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
 * The file to send for a resolved path: the file itself, or a folder's `index.html` with no redirect to the slashed address (Caddy's `disable_canonical_uris`: the redirect would be written from the root and leave a sub-path mount). A path that names nothing, anything but a regular file (a FIFO would block the open), or a file whose real path, symlinks followed, lies outside the build, names nothing.
 * @param {string} named
 * @param {string} realBase - the build folder's real path
 * @returns {Promise<{ file: string, real: string } | null>} `file` as named, for its type and cache policy; `real`, the checked path, to open
 */
// @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-folder-index
async function locate(named, realBase) {
  try {
    const file = (await fs.promises.stat(named)).isDirectory() ? path.join(named, 'index.html') : named;
    const real = await fs.promises.realpath(file);
    if (real !== realBase && !real.startsWith(realBase + path.sep)) return null;
    return (await fs.promises.stat(real)).isFile() ? { file, real } : null;
  } catch {
    // Missing, or a folder without an index: both are a 404.
    return null;
  }
}
// @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-folder-index

/**
 * Logs a failure on the server's side, which the client sees only as a 500 or a cut body.
 * @param {string} what - what failed
 * @param {string} file
 * @param {unknown} error
 */
function logFailure(what, file, error) {
  // @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-error
  console.error(`serve-dist: cannot ${what} ${file}: ${error instanceof Error ? error.message : String(error)}`);
  // @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-error
}

// @cpt-dod:cpt-site-dod-production-build-layout-serve-dist:p2
/**
 * The server over a build folder; `listen` is the caller's.
 * @param {string} [root] - the build folder, `site/dist` by default
 * @returns {http.Server}
 */
export function createServer(root = DIST) {
  const base = path.resolve(root);
  const realBase = fs.realpathSync(base);

  /**
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   */
  const respond = async (req, res) => {
    // @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-if-method
    if (req.method !== 'GET' && req.method !== 'HEAD') return sendError(res, 405);
    // @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-if-method
    // @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-resolve-path
    const pathname = (req.url ?? '/').split('?')[0];
    const named = resolveFile(base, pathname);
    // @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-resolve-path
    // @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-folder-index
    const found = named === null ? null : await locate(named, realBase);
    if (found === null) return sendError(res, 404);
    const { file, real } = found;
    // The checked real path is opened, not the name, and with O_NOFOLLOW where the system has it, so a leaf swapped for a link meanwhile fails to open instead of leading out; a parent folder swapped meanwhile is still followed, which takes write access to the build. O_NONBLOCK keeps a FIFO put there meanwhile from blocking the open. Everything after reads this handle: a file that cannot be opened is a 500.
    let handle;
    try {
      handle = await fs.promises.open(
        real,
        fs.constants.O_RDONLY | (fs.constants.O_NONBLOCK ?? 0) | (fs.constants.O_NOFOLLOW ?? 0),
      );
    } catch (error) {
      logFailure('open', file, error);
      return sendError(res, 500);
    }
    // @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-folder-index
    let streaming = false;
    try {
      // @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-folder-index
      const stats = await handle.stat();
      if (!stats.isFile()) return sendError(res, 404);
      // @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-folder-index

      // @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-headers
      const type = TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
      // The policy follows the file served, not the raw path: `/assets/..%2Fmf-manifest.json` names a root file.
      const served = `/${path.relative(base, file).split(path.sep).join('/')}`;
      const etag = `"${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}"`;
      /** @type {http.OutgoingHttpHeaders} */
      const headers = {
        ...SECURITY_HEADERS,
        'Content-Type': type,
        'Cache-Control': HASHED.test(served) ? 'public, max-age=31536000, immutable' : 'no-cache',
        ETag: etag,
        'Last-Modified': stats.mtime.toUTCString(),
      };
      // @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-headers
      // @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-if-unchanged
      if (notModified(req.headers, etag, stats.mtimeMs)) {
        res.writeHead(304, headers);
        return res.end();
      }
      // @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-if-unchanged

      // @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-stream
      headers['Content-Length'] = stats.size;
      res.writeHead(200, headers);
      if (req.method === 'HEAD' || stats.size === 0) return res.end();
      // Exactly the bytes fstat counted, so the body keeps to its Content-Length if the file grows meanwhile; the stream owns the handle from here and closes it, and pipeline destroys both streams on an error or on a client that leaves mid-body, so no file stays open.
      streaming = true;
      pipeline(fs.createReadStream('', { fd: handle, start: 0, end: stats.size - 1 }), res, (error) => {
        // A client that left is not a failure of the server's.
        if (error && error.code !== 'ERR_STREAM_PREMATURE_CLOSE') logFailure('read', file, error);
      });
      // @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-stream
    } finally {
      if (!streaming) await handle.close().catch(() => {});
    }
  };

  return http.createServer((req, res) => {
    // @cpt-begin:cpt-site-flow-production-build-layout-serve-dist:p2:inst-error
    respond(req, res).catch((error) => {
      logFailure('serve', req.url ?? '/', error);
      if (!res.headersSent) sendError(res, 500);
      else res.destroy();
    });
    // @cpt-end:cpt-site-flow-production-build-layout-serve-dist:p2:inst-error
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
  const host = process.env.SERVE_HOST || '0.0.0.0';
  const server = createServer(DIST);
  // Longer than a platform load balancer's idle timeout, so it never reuses an upstream socket Node has just closed.
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;
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
