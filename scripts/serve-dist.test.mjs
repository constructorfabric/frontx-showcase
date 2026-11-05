import { randomBytes } from 'node:crypto';
import fs, { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import http from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { chooseEncoding, createServer, matchesEtag, missingBuild, parsePort } from './serve-dist.mjs';

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
  write('assets/cached-123abc.js', SCRIPT);
  // A file outside the build that a link inside it points at.
  writeFileSync(path.join(root, 'outside.js'), SCRIPT);
  try {
    fs.symlinkSync(path.join(root, 'outside.js'), path.join(dist, 'outside.js'));
    symlinked = true;
  } catch (error) {
    // Windows without the privilege to create links.
    if (process.platform !== 'win32') throw error;
  }
  // Random text barely compresses, so neither body fits in the socket buffers before the client leaves.
  write('assets/large-0a1b2c.js', randomBytes(512 * 1024).toString('base64'));
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

  it("sends the image's security headers and no Server header, on errors too", async () => {
    for (const address of ['/', '/missing.js']) {
      const { headers } = await request(address);
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(headers['x-frame-options']).toBe('SAMEORIGIN');
      expect(headers['permissions-policy']).toBe('camera=(), microphone=(), geolocation=(), payment=(), usb=()');
      expect(headers['content-security-policy']).toBe("base-uri 'self'; object-src 'none'; frame-ancestors 'self'");
      expect(headers.server).toBeUndefined();
    }
  });

  it('compresses text with br or gzip as the client asks', async () => {
    const br = await request('/assets/index-abc123.js', { headers: { 'accept-encoding': 'gzip, br' } });
    expect(br.headers['content-encoding']).toBe('br');
    expect(br.headers.vary).toBe('Accept-Encoding');
    expect(zlib.brotliDecompressSync(br.body).toString()).toBe(SCRIPT);

    const gzip = await request('/assets/index-abc123.js', { headers: { 'accept-encoding': 'gzip, br;q=0' } });
    expect(gzip.headers['content-encoding']).toBe('gzip');
    expect(zlib.gunzipSync(gzip.body).toString()).toBe(SCRIPT);

    const plain = await request('/assets/index-abc123.js');
    expect(plain.headers['content-encoding']).toBeUndefined();
    expect(plain.body.toString()).toBe(SCRIPT);

    // One strong tag per content coding, each body with its own length.
    expect(br.headers.etag).toBe(plain.headers.etag.replace(/"$/, '-br"'));
    expect(gzip.headers.etag).toBe(plain.headers.etag.replace(/"$/, '-gzip"'));
    for (const res of [br, gzip, plain]) expect(Number(res.headers['content-length'])).toBe(res.body.length);
  });

  it('reads Accept-Encoding parameters with spaces around the semicolon', async () => {
    const res = await request('/assets/index-abc123.js', { headers: { 'accept-encoding': 'gzip;q=0.5, br ; q=0.8' } });
    expect(res.headers['content-encoding']).toBe('br');
  });

  it('chooses br, then gzip, from Accept-Encoding, honouring a refusal by q=0', () => {
    expect(chooseEncoding('gzip, br')).toBe('br');
    expect(chooseEncoding('gzip')).toBe('gzip');
    expect(chooseEncoding('*')).toBe('br');
    expect(chooseEncoding('gzip;q=0, *')).toBe('br');
    expect(chooseEncoding('br;q=0, *')).toBe('gzip');
    expect(chooseEncoding('br;q=0, gzip;q=0, *')).toBeNull();
    expect(chooseEncoding('br;q=0, gzip')).toBe('gzip');
    expect(chooseEncoding('*;q=0')).toBeNull();
    expect(chooseEncoding('br;q=0')).toBeNull();
    expect(chooseEncoding('identity')).toBeNull();
    expect(chooseEncoding(undefined)).toBeNull();
  });

  it('compresses a file once and sends the kept body until the file changes', async () => {
    const file = path.join(dist, 'assets/cached-123abc.js');
    const read = vi.spyOn(fs.promises, 'readFile');
    try {
      const headers = { 'accept-encoding': 'br' };
      const first = await request('/assets/cached-123abc.js', { headers });
      const second = await request('/assets/cached-123abc.js', { headers });
      expect(read).toHaveBeenCalledTimes(1);
      expect(second.body.equals(first.body)).toBe(true);

      // A changed file changes its tag, so the kept body is not sent for it.
      const changed = SCRIPT.replace('x', 'y');
      writeFileSync(file, changed);
      fs.utimesSync(file, new Date(), new Date(Date.now() + 5000));
      const third = await request('/assets/cached-123abc.js', { headers });
      expect(read).toHaveBeenCalledTimes(2);
      expect(third.headers.etag).not.toBe(first.headers.etag);
      expect(zlib.brotliDecompressSync(third.body).toString()).toBe(changed);
    } finally {
      read.mockRestore();
    }
  });

  it('matches If-None-Match against the tag of the coding this request gets', async () => {
    const gzipped = { 'accept-encoding': 'gzip' };
    const gzip = await request('/assets/index-abc123.js', { headers: gzipped });
    const plain = await request('/assets/index-abc123.js');

    expect((await request('/assets/index-abc123.js', { headers: { ...gzipped, 'if-none-match': gzip.headers.etag } })).status).toBe(304);
    expect((await request('/assets/index-abc123.js', { headers: { 'if-none-match': plain.headers.etag } })).status).toBe(304);
    // A tag of the other coding names a different representation.
    expect((await request('/assets/index-abc123.js', { headers: { 'if-none-match': gzip.headers.etag } })).status).toBe(200);
    expect((await request('/assets/index-abc123.js', { headers: { ...gzipped, 'if-none-match': plain.headers.etag } })).status).toBe(200);
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

  it('answers 304 when the validator matches, with the Vary the 200 carries', async () => {
    const first = await request('/');
    const again = await request('/', { headers: { 'if-none-match': first.headers.etag } });
    expect(again.status).toBe(304);
    expect(again.body.length).toBe(0);

    const script = await request('/assets/index-abc123.js');
    const unchanged = await request('/assets/index-abc123.js', { headers: { 'if-none-match': script.headers.etag } });
    expect(unchanged.status).toBe(304);
    expect(script.headers.vary).toBe('Accept-Encoding');
    expect(unchanged.headers.vary).toBe('Accept-Encoding');
    expect(first.headers.vary).toBeUndefined();
    expect(again.headers.vary).toBeUndefined();
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

  it('closes the file when a client leaves mid-body and keeps answering', async () => {
    const opened = vi.spyOn(fs, 'createReadStream');
    try {
      for (const headers of [{}, { 'accept-encoding': 'gzip' }]) {
        // A compressed body is sent from memory: no file is open while it goes out.
        const streamed = !headers['accept-encoding'];
        opened.mockClear();
        await new Promise((resolve) => {
          const req = http.request({ host: '127.0.0.1', port, path: '/assets/large-0a1b2c.js', headers }, (res) => {
            res.once('data', () => {
              req.destroy();
              resolve(undefined);
            });
          });
          req.on('error', () => {});
          req.on('close', () => resolve(undefined));
          req.end();
        });
        if (streamed) await vi.waitFor(() => expect(opened.mock.results[0]?.value.destroyed).toBe(true));
        else expect(opened).not.toHaveBeenCalled();
        expect((await request('/')).status).toBe(200);
      }
    } finally {
      opened.mockRestore();
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
      expect(res.body.toString(), address).not.toContain('secret');
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
