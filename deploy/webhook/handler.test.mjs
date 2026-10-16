import { createHmac } from 'node:crypto';
import { createServer, request } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHandler, HOOK_PATH, MAX_BODY_BYTES } from './handler.mjs';
import { DEPLOY_BRANCH, DEPLOY_WORKFLOW, DEPLOY_WORKFLOW_PATH, parseHookRanges } from './verify.mjs';

const SECRET = 's'.repeat(64);
const sign = (body, secret = SECRET) => `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
const deployable = JSON.stringify({
  action: 'completed',
  workflow_run: { id: 1, head_sha: 'abc', name: DEPLOY_WORKFLOW, path: DEPLOY_WORKFLOW_PATH, event: 'push', head_branch: DEPLOY_BRANCH, conclusion: 'success' },
});
const quiet = { log: () => {}, warn: () => {} };

let server;

/**
 * Starts the handler on a loopback port and returns its base address and the redeploy spy.
 * @param {import('node:net').BlockList | null} [ranges]
 */
async function start(ranges = null) {
  const redeploy = vi.fn();
  const handle = createHandler({ secret: SECRET, getRanges: () => ranges, redeploy, log: quiet });
  server = createServer((req, res) => void handle(req, res));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = /** @type {import('node:net').AddressInfo} */ (server.address());
  return { base: `http://127.0.0.1:${port}`, redeploy };
}

/**
 * Sends headers and, unless `chunk` is null, one body chunk, and resolves with the status as soon as the server answers, whether or not the body was read; the request is never ended.
 * @param {string} base
 * @param {Record<string, string | number>} headers
 * @param {string | null} chunk
 */
function sendPartial(base, headers, chunk) {
  return new Promise((resolve, reject) => {
    const req = request(`${base}${HOOK_PATH}`, { method: 'POST', headers }, (res) => {
      resolve(res.statusCode);
      res.resume();
      req.destroy();
    });
    req.on('error', reject);
    if (chunk === null) req.flushHeaders();
    else req.write(chunk);
  });
}

function post(base, body, headers = {}) {
  return fetch(`${base}${HOOK_PATH}`, { method: 'POST', body, headers: { 'content-type': 'application/json', ...headers } });
}

afterEach(async () => {
  await new Promise((resolve) => server.close(resolve));
});

describe('createHandler', () => {
  it('deploys a signed, deployable workflow_run delivery and answers 202', async () => {
    const { base, redeploy } = await start();
    const res = await post(base, deployable, { 'x-github-event': 'workflow_run', 'x-hub-signature-256': sign(deployable) });
    expect(res.status).toBe(202);
    expect(redeploy).toHaveBeenCalledTimes(1);
  });

  it('refuses an unsigned or wrongly signed delivery without deploying', async () => {
    const { base, redeploy } = await start();
    expect((await post(base, deployable, { 'x-github-event': 'workflow_run' })).status).toBe(401);
    expect((await post(base, deployable, { 'x-github-event': 'workflow_run', 'x-hub-signature-256': sign(deployable, 'other') })).status).toBe(401);
    expect(redeploy).not.toHaveBeenCalled();
  });

  it('refuses a caller outside the hook ranges, even with a valid signature', async () => {
    const { base, redeploy } = await start(parseHookRanges(['192.30.252.0/22']));
    const res = await post(base, deployable, { 'x-github-event': 'workflow_run', 'x-hub-signature-256': sign(deployable) });
    expect(res.status).toBe(403);
    expect(redeploy).not.toHaveBeenCalled();
  });

  it('reads the caller from the rightmost X-Forwarded-For entry, the one the edge wrote', async () => {
    const { base, redeploy } = await start(parseHookRanges(['192.30.252.0/22']));
    const signed = { 'x-github-event': 'workflow_run', 'x-hub-signature-256': sign(deployable) };
    expect((await post(base, deployable, { ...signed, 'x-forwarded-for': '203.0.113.9, 192.30.252.1' })).status).toBe(202);
    expect((await post(base, deployable, { ...signed, 'x-forwarded-for': '192.30.252.1, 203.0.113.9' })).status).toBe(403);
    expect(redeploy).toHaveBeenCalledTimes(1);
  });

  it('checks the address before the size, so an outside caller never gets a body read', async () => {
    const { base } = await start(parseHookRanges(['192.30.252.0/22']));
    expect(await sendPartial(base, { 'content-length': MAX_BODY_BYTES + 1 }, null)).toBe(403);
  });

  it('refuses a declared body over the limit with 413 before reading it', async () => {
    const { base, redeploy } = await start();
    expect(await sendPartial(base, { 'content-length': MAX_BODY_BYTES + 1 }, null)).toBe(413);
    expect(redeploy).not.toHaveBeenCalled();
  });

  it('refuses a streamed body once it passes the limit with 413', async () => {
    const { base, redeploy } = await start();
    expect(await sendPartial(base, { 'transfer-encoding': 'chunked' }, 'x'.repeat(MAX_BODY_BYTES + 1))).toBe(413);
    expect(redeploy).not.toHaveBeenCalled();
  });

  it('answers a signed ping and ignores other events and non-deploying runs', async () => {
    const { base, redeploy } = await start();
    expect((await post(base, '{}', { 'x-github-event': 'ping' })).status).toBe(401);
    expect((await post(base, '{}', { 'x-github-event': 'push' })).status).toBe(401);
    expect((await post(base, '{}', { 'x-github-event': 'ping', 'x-hub-signature-256': sign('{}') })).status).toBe(200);
    expect((await post(base, '{}', { 'x-github-event': 'push', 'x-hub-signature-256': sign('{}') })).status).toBe(204);
    const pullRequestRun = deployable.replace('"event":"push"', '"event":"pull_request"');
    expect((await post(base, pullRequestRun, { 'x-github-event': 'workflow_run', 'x-hub-signature-256': sign(pullRequestRun) })).status).toBe(204);
    expect((await post(base, 'not json', { 'x-github-event': 'workflow_run', 'x-hub-signature-256': sign('not json') })).status).toBe(400);
    expect(redeploy).not.toHaveBeenCalled();
  });

  it('answers 404 to any other method or path', async () => {
    const { base } = await start();
    expect((await fetch(`${base}${HOOK_PATH}`)).status).toBe(404);
    expect((await fetch(`${base}/other`, { method: 'POST', body: '{}' })).status).toBe(404);
  });
});
