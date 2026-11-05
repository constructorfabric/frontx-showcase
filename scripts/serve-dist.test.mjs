import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import http from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createServer, missingBuild } from './serve-dist.mjs';

let root;
let dist;
let server;
let port;

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
  // The build sits one level down, so `/../package.json` would reach a real file if traversal worked.
  root = mkdtempSync(path.join(tmpdir(), 'serve-dist-'));
  writeFileSync(path.join(root, 'package.json'), '{"secret":true}');
  dist = path.join(root, 'dist');
  write('index.html', '<!doctype html><title>home</title>');
  write('assets/index-abc123.js', SCRIPT);
  write('mfe/site-docs-mfe/assets/lifecycle-def456.js', SCRIPT);
  write('mfe/site-docs-mfe/remoteEntry.js', SCRIPT);
  write('docs/index.html', '<!doctype html><title>docs</title>');
  write('docs/get-started.md', '# Get started\n');
  write('site.webmanifest', '{"name":"FrontX"}');
  write('blob.unknownext', 'bytes');
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
  });

  it('answers 304 when the validator matches', async () => {
    const first = await request('/');
    const again = await request('/', { headers: { 'if-none-match': first.headers.etag } });
    expect(again.status).toBe(304);
    expect(again.body.length).toBe(0);
  });

  it('answers 404 as uncached plain text to a missing file and to every path that leaves the build', async () => {
    for (const address of ['/missing.js', '/../package.json', '/%2e%2e/package.json', '/docs/%2e%2e/%2e%2e/package.json', '/%00', '/%E0%A4%A']) {
      const res = await request(address);
      expect(res.status, address).toBe(404);
      expect(res.headers['cache-control']).toBe('no-store');
      expect(res.headers['content-type']).toBe('text/plain; charset=utf-8');
      expect(res.body.toString()).toBe('404 Not Found');
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
