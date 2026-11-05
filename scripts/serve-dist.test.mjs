import { execFileSync } from 'node:child_process';
import fs, { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import http from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createServer, HASHED, matchesEtag, missingBuild, parsePort } from './serve-dist.mjs';

let root;
let dist;
let server;
let port;
let symlinked = false;

const SCRIPT = `export const text = ${JSON.stringify('x'.repeat(2048))};\n`;

function write(file, content) {
  mkdirSync(path.dirname(path.join(dist, file)), { recursive: true });
  writeFileSync(path.join(dist, file), content);
}

const CADDYFILE = new URL('../deploy/site/Caddyfile', import.meta.url);

/** The Caddyfile with LF line ends, whatever the checkout wrote. */
const readCaddyfile = () => fs.readFileSync(CADDYFILE, 'utf8').replace(/\r\n/g, '\n');

/** The headers of the Caddyfile's `header { ... }` block, comments skipped and quotes removed; indented with tabs or spaces. */
function caddySecurityHeaders() {
  const block = readCaddyfile().match(/^[ \t]+header \{\n([\s\S]*?)\n[ \t]+\}$/m)?.[1] ?? '';
  return Object.fromEntries(
    block
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const [, name, quoted, bare] = /** @type {RegExpMatchArray} */ (line.match(/^(\S+)[ \t]+(?:"(.*)"|(\S+))$/));
        return [name, quoted ?? bare];
      }),
  );
}

/** A raw request: the path goes out as written, so `..` reaches the server instead of being resolved by the client. */
function request(pathname, { method = 'GET', headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, path: pathname, method, headers }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
    });
    req.on('error', reject);
    req.end();
  });
}

beforeAll(async () => {
  // The build sits one level down: the `package.json` outside it holds the secret that must never be served; the one inside is what a clamped dot-segment path reaches.
  root = mkdtempSync(path.join(tmpdir(), 'serve-dist-'));
  writeFileSync(path.join(root, 'package.json'), '{"secret":true}');
  dist = path.join(root, 'dist');
  write('package.json', '{"inside":true}');
  write('index.html', '<!doctype html><title>home</title>');
  write('assets/index-abc123.js', SCRIPT);
  write('mfe/site-docs-mfe/assets/lifecycle-def456.js', SCRIPT);
  write('mfe/site-docs-mfe/remoteEntry.js', SCRIPT);
  write('docs/index.html', '<!doctype html><title>docs</title>');
  write('docs/get-started.md', '# Get started\n');
  write('site.webmanifest', '{"name":"FrontX"}');
  write('blob.unknownext', 'bytes');
  write('empty.txt', '');
  // A file outside the build that a link inside it points at.
  writeFileSync(path.join(root, 'outside.js'), SCRIPT);
  try {
    fs.symlinkSync(path.join(root, 'outside.js'), path.join(dist, 'outside.js'));
    symlinked = true;
  } catch (error) {
    // Windows without the privilege to create links.
    if (process.platform !== 'win32') throw error;
  }
  // 16 MB: more than the send and receive buffers of a loopback socket hold together, so the body is still being read when the client leaves.
  write('assets/large-0a1b2c.js', Buffer.alloc(16 * 1024 * 1024, 'x'));
  write('assets/locked-0f0f0f.js', SCRIPT);
  server = createServer(dist);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  port = /** @type {import('node:net').AddressInfo} */ (server.address()).port;
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  rmSync(root, { recursive: true, force: true });
});

describe('serve-dist', () => {
  it('serves the document at / and ignores the query string', async () => {
    for (const address of ['/', '/?screen=docs', '/index.html?screen=docs;route=get-started']) {
      const res = await request(address);
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('text/html; charset=utf-8');
      expect(res.body.toString()).toContain('<title>home</title>');
    }
  });

  it("serves a folder's index without a trailing slash and without a redirect", async () => {
    for (const address of ['/docs', '/docs/']) {
      const res = await request(address);
      expect(res.status).toBe(200);
      expect(res.body.toString()).toContain('<title>docs</title>');
    }
  });

  it('caches hashed assets as immutable and revalidates every other file', async () => {
    const immutable = 'public, max-age=31536000, immutable';
    expect((await request('/assets/index-abc123.js')).headers['cache-control']).toBe(immutable);
    expect((await request('/mfe/site-docs-mfe/assets/lifecycle-def456.js')).headers['cache-control']).toBe(immutable);
    expect((await request('/mfe/site-docs-mfe/remoteEntry.js')).headers['cache-control']).toBe('no-cache');
    expect((await request('/')).headers['cache-control']).toBe('no-cache');
    expect((await request('/site.webmanifest')).headers['cache-control']).toBe('no-cache');
  });

  it('serves the twins as plain text, the web manifest with its type and an unknown file as bytes', async () => {
    expect((await request('/docs/get-started.md')).headers['content-type']).toBe('text/plain; charset=utf-8');
    expect((await request('/site.webmanifest')).headers['content-type']).toBe('application/manifest+json');
    expect((await request('/assets/index-abc123.js')).headers['content-type']).toBe('text/javascript; charset=utf-8');
    expect((await request('/blob.unknownext')).headers['content-type']).toBe('application/octet-stream');
  });

  it("sends the image's security headers, on errors too", async () => {
    const security = caddySecurityHeaders();
    expect(Object.keys(security)).toHaveLength(5);
    for (const address of ['/', '/missing.js']) {
      const { headers } = await request(address);
      for (const [name, value] of Object.entries(security)) expect(headers[name.toLowerCase()], `${address} ${name}`).toBe(value);
    }
  });

  it('answers 404 to a folder without an index.html', async () => {
    write('bare/note.txt', 'x');
    for (const address of ['/bare', '/bare/']) expect((await request(address)).status, address).toBe(404);
  });

  it("keeps the image's hashed-asset pattern", () => {
    const caddyfile = readCaddyfile();
    const hashed = caddyfile.match(/^\s*@hashed path_regexp (\S+)$/m)?.[1];
    expect(hashed).toBeDefined();
    expect(caddyfile).toContain(`@named not path_regexp ${hashed}\n`);
    expect(HASHED.source.replaceAll('\\/', '/')).toBe(hashed);
  });

  it('answers 404 to a named pipe and never opens it', async (context) => {
    const fifo = path.join(dist, 'pipe.txt');
    try {
      execFileSync('mkfifo', [fifo]);
    } catch {
      // Windows, or a system without mkfifo.
      return context.skip();
    }
    try {
      // Opening the pipe would block until a writer comes, and the request would time out.
      const res = await request('/pipe.txt');
      expect(res.status).toBe(404);
    } finally {
      rmSync(fifo);
    }
  });

  it('sends an empty file with a zero length', async () => {
    const res = await request('/empty.txt');
    expect(res.status).toBe(200);
    expect(res.headers['content-length']).toBe('0');
    expect(res.body.length).toBe(0);
  });

  it('answers 404 to a link that leads out of the build', async (context) => {
    // Only on Windows can the link be missing; beforeAll fails anywhere else.
    if (!symlinked) return context.skip();
    const res = await request('/outside.js');
    expect(res.status).toBe(404);
    expect(res.headers['cache-control']).toBe('no-store');
  });

  it('sends a file as it is, whatever Accept-Encoding asks, with one tag per file', async () => {
    const plain = await request('/assets/index-abc123.js');
    const asked = await request('/assets/index-abc123.js', { headers: { 'accept-encoding': 'br, gzip' } });
    for (const res of [plain, asked]) {
      expect(res.headers['content-encoding']).toBeUndefined();
      expect(res.headers.vary).toBeUndefined();
      expect(res.headers['content-length']).toBe(String(SCRIPT.length));
      expect(res.body.toString()).toBe(SCRIPT);
    }
    expect(asked.headers.etag).toBe(plain.headers.etag);
  });

  it('answers 304 when the validator matches', async () => {
    const first = await request('/');
    const again = await request('/', { headers: { 'if-none-match': first.headers.etag } });
    expect(again.status).toBe(304);
    expect(again.body.length).toBe(0);
    expect(again.headers.etag).toBe(first.headers.etag);
  });

  it('answers 304 to If-Modified-Since at or after the file time, in whole seconds, unless If-None-Match is sent', async () => {
    const { headers } = await request('/docs/get-started.md');
    const modified = Date.parse(String(headers['last-modified']));
    const at = (/** @type {number} */ time, /** @type {Record<string, string>} */ more = {}) =>
      request('/docs/get-started.md', { headers: { 'if-modified-since': new Date(time).toUTCString(), ...more } });

    expect((await at(modified)).status).toBe(304);
    expect((await at(modified + 60_000)).status).toBe(304);
    expect((await at(modified - 1000)).status).toBe(200);
    // If-None-Match decides when present, even when the date alone would match.
    expect((await at(modified, { 'if-none-match': '"other"' })).status).toBe(200);
    expect((await request('/docs/get-started.md', { headers: { 'if-modified-since': 'not a date' } })).status).toBe(200);
  });

  it('answers 500 to a file it cannot open and logs the path and the reason', async (context) => {
    // Permissions do not bind root, and Windows has no mode bits to clear.
    if (process.platform === 'win32' || process.getuid?.() === 0) return context.skip();
    const file = path.join(dist, 'assets/locked-0f0f0f.js');
    fs.chmodSync(file, 0o000);
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const res = await request('/assets/locked-0f0f0f.js');
      expect(res.status).toBe(500);
      expect(res.headers['cache-control']).toBe('no-store');
      expect(res.body.toString()).toBe('500 Internal Server Error');
      expect(logged).toHaveBeenCalledTimes(1);
      expect(logged.mock.calls[0][0]).toContain(file);
      expect(logged.mock.calls[0][0]).toContain('EACCES');
    } finally {
      logged.mockRestore();
      fs.chmodSync(file, 0o644);
    }
  });

  it('matches If-None-Match as a list, weakly and as *', () => {
    expect(matchesEtag('"a-1"', '"a-1"')).toBe(true);
    expect(matchesEtag('"b-2", "a-1"', '"a-1"')).toBe(true);
    expect(matchesEtag('W/"a-1"', '"a-1"')).toBe(true);
    expect(matchesEtag('*', '"a-1"')).toBe(true);
    expect(matchesEtag('"b-2"', '"a-1"')).toBe(false);
    expect(matchesEtag('"a-1-x"', '"a-1"')).toBe(false);
    expect(matchesEtag(undefined, '"a-1"')).toBe(false);
    expect(matchesEtag('', '"a-1"')).toBe(false);
  });

  it('decides the cache policy from the file served, not the raw path', async () => {
    const immutable = 'public, max-age=31536000, immutable';
    // Looks hashed, names a root file.
    const escaped = await request('/assets/..%2Fsite.webmanifest');
    expect(escaped.status).toBe(200);
    expect(escaped.headers['cache-control']).toBe('no-cache');
    // Looks unhashed, names a hashed asset.
    for (const address of ['/docs/../assets/index-abc123.js', '/%61ssets/index-abc123.js']) {
      const res = await request(address);
      expect(res.status, address).toBe(200);
      expect(res.headers['cache-control'], address).toBe(immutable);
    }
  });

  it('closes the file when a client leaves mid-body, logs nothing for it and keeps answering', async () => {
    const opened = vi.spyOn(fs, 'createReadStream');
    const logged = vi.spyOn(console, 'error');
    try {
      await new Promise((resolve) => {
        const req = http.request({ host: '127.0.0.1', port, path: '/assets/large-0a1b2c.js' }, (res) => {
          res.once('data', () => {
            req.destroy();
            resolve(undefined);
          });
        });
        req.on('error', () => {});
        req.on('close', () => resolve(undefined));
        req.end();
      });
      const stream = opened.mock.results[0]?.value;
      await vi.waitFor(() => expect(stream?.destroyed).toBe(true));
      // Cut short, not read to the end: the 16 MB body was still going out when the client left.
      expect(stream.bytesRead).toBeLessThan(fs.statSync(path.join(dist, 'assets/large-0a1b2c.js')).size);
      expect((await request('/')).status).toBe(200);
      expect(logged).not.toHaveBeenCalled();
    } finally {
      opened.mockRestore();
      logged.mockRestore();
    }
  });

  it('reads PORT as an integer from 0 to 65535, 8080 when unset', () => {
    expect(parsePort(undefined)).toBe(8080);
    expect(parsePort('')).toBe(8080);
    expect(parsePort('0')).toBe(0);
    expect(parsePort('3000')).toBe(3000);
    expect(parsePort('65535')).toBe(65535);
    for (const value of ['65536', '-1', '80.5', 'abc', ' 80', '0x50']) expect(parsePort(value), value).toBeNull();
  });

  it('answers 404 as uncached plain text to a missing file and to a path that does not decode', async () => {
    for (const address of ['/missing.js', '/%00', '/%E0%A4%A']) {
      const res = await request(address);
      expect(res.status, address).toBe(404);
      expect(res.headers['cache-control']).toBe('no-store');
      expect(res.headers['content-type']).toBe('text/plain; charset=utf-8');
      expect(res.body.toString()).toBe('404 Not Found');
    }
  });

  it('clamps dot segments at the build root, so nothing outside the build is ever served', async () => {
    for (const address of ['/../package.json', '/%2e%2e/package.json', '/docs/%2e%2e/%2e%2e/package.json']) {
      const res = await request(address);
      expect(res.status, address).toBe(200);
      expect(res.body.toString(), address).toBe('{"inside":true}');
    }
  });

  it('sends no body to HEAD and refuses other methods', async () => {
    const head = await request('/', { method: 'HEAD' });
    expect(head.status).toBe(200);
    expect(head.body.length).toBe(0);

    const post = await request('/', { method: 'POST' });
    expect(post.status).toBe(405);
    expect(post.headers.allow).toBe('GET, HEAD');
    expect(post.body.toString()).toBe('405 Method Not Allowed');
  });

  it('refuses to start without a build, naming the command that makes one', () => {
    expect(missingBuild(dist)).toBeNull();
    expect(missingBuild(root)).toContain('run npm run build first');
  });
});
