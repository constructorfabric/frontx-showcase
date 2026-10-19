import { createHmac } from 'node:crypto';
import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { clientIp, DEPLOY_WORKFLOW, DEPLOY_WORKFLOW_PATH, isFromGitHub, parseHookRanges, shouldDeploy, verifySignature } from './verify.mjs';

const SECRET = 'a'.repeat(64);
const sign = (body, secret = SECRET) => `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;

describe('verifySignature', () => {
  const body = Buffer.from('{"action":"completed"}');

  it('accepts the signature of the same body under the same secret', () => {
    expect(verifySignature(SECRET, body, sign(body))).toBe(true);
  });

  it('refuses a changed body, another secret, a bare digest and a truncated signature', () => {
    expect(verifySignature(SECRET, Buffer.from('{"action":"requested"}'), sign(body))).toBe(false);
    expect(verifySignature(SECRET, body, sign(body, 'b'.repeat(64)))).toBe(false);
    expect(verifySignature(SECRET, body, sign(body).slice('sha256='.length))).toBe(false);
    expect(verifySignature(SECRET, body, sign(body).slice(0, 20))).toBe(false);
  });

  it('refuses a missing, empty or non-string header without throwing', () => {
    expect(verifySignature(SECRET, body, undefined)).toBe(false);
    expect(verifySignature(SECRET, body, '')).toBe(false);
    expect(verifySignature(SECRET, body, [sign(body)])).toBe(false);
  });
});

describe('parseHookRanges and isFromGitHub', () => {
  it('allows addresses inside the published IPv4 and IPv6 ranges and refuses the rest', () => {
    const ranges = parseHookRanges(['192.30.252.0/22', '2a0a:a440::/29']);
    expect(isFromGitHub(ranges, '192.30.252.1')).toBe(true);
    expect(isFromGitHub(ranges, '2a0a:a440::1')).toBe(true);
    expect(isFromGitHub(ranges, '203.0.113.9')).toBe(false);
    expect(isFromGitHub(ranges, 'not-an-address')).toBe(false);
  });

  it('skips malformed entries, an empty prefix and out-of-range prefixes, and keeps the usable ones', () => {
    const ranges = parseHookRanges(['not-a-cidr', '192.30.252.0/nonsense', '10.0.0.0/', '10.0.0.0/33', '10.0.0.0/-1', '::/129', 42, '192.30.252.0/22']);
    expect(isFromGitHub(ranges, '192.30.252.1')).toBe(true);
    expect(isFromGitHub(ranges, '203.0.113.9')).toBe(false);
    expect(isFromGitHub(ranges, '10.0.0.1')).toBe(false);
  });

  it('reads an unusable list as unknown, which allows', () => {
    for (const hooks of [[], undefined, '192.30.252.0/22', ['not-a-cidr', 42]]) {
      expect(parseHookRanges(hooks)).toBeNull();
    }
    expect(isFromGitHub(null, '203.0.113.9')).toBe(true);
  });
});

describe('clientIp', () => {
  it('reads the rightmost X-Forwarded-For entry, the one the edge proxy wrote', () => {
    expect(clientIp('192.30.252.1, 203.0.113.9', '172.18.0.5')).toBe('203.0.113.9');
  });

  it('falls back to the socket peer and unwraps an IPv4-mapped address', () => {
    expect(clientIp(undefined, '::ffff:192.30.252.1')).toBe('192.30.252.1');
    expect(clientIp('  ', '203.0.113.9')).toBe('203.0.113.9');
    expect(clientIp(undefined, undefined)).toBe('');
  });
});

describe('shouldDeploy', () => {
  const delivery = (run, action = 'completed') => ({
    action,
    workflow_run: { name: DEPLOY_WORKFLOW, path: DEPLOY_WORKFLOW_PATH, event: 'push', head_branch: 'v0.1.0', conclusion: 'success', ...run },
  });

  it('deploys a successful push run of the image workflow for a release tag', () => {
    expect(shouldDeploy(delivery({}))).toBe(true);
    expect(shouldDeploy(delivery({ head_branch: 'v12.0.3' }))).toBe(true);
  });

  it('ignores a push run on main, which publishes nothing', () => {
    expect(shouldDeploy(delivery({ head_branch: 'main' }))).toBe(false);
  });

  it('ignores a ref that is not a plain release version', () => {
    for (const ref of ['feat/x', 'v0.1', 'v0.1.0-rc.1', '0.1.0', 'v01.0.0', 'release/v0.1.0', 'v0.1.0\n']) {
      expect(shouldDeploy(delivery({ head_branch: ref }))).toBe(false);
    }
    expect(shouldDeploy(delivery({ head_branch: undefined }))).toBe(false);
  });

  it('ignores another stage, workflow, workflow file, event or conclusion', () => {
    expect(shouldDeploy(delivery({}, 'requested'))).toBe(false);
    expect(shouldDeploy(delivery({ name: 'Main CI' }))).toBe(false);
    expect(shouldDeploy(delivery({ path: '.github/workflows/other.yml' }))).toBe(false);
    expect(shouldDeploy(delivery({ event: 'pull_request' }))).toBe(false);
    expect(shouldDeploy(delivery({ conclusion: 'failure' }))).toBe(false);
  });

  it('matches the path and the name of the real image workflow file', () => {
    const workflow = fs.readFileSync(new URL(`../../${DEPLOY_WORKFLOW_PATH}`, import.meta.url), 'utf8');
    expect(workflow).toMatch(new RegExp(`^name: ${DEPLOY_WORKFLOW}$`, 'm'));
  });

  it('ignores a payload without a workflow run', () => {
    expect(shouldDeploy({ action: 'completed' })).toBe(false);
    expect(shouldDeploy(null)).toBe(false);
  });
});
