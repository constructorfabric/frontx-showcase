// The pure half of the deploy webhook: the signature check, the source address check and the gate that decides whether a delivery deploys. No I/O, so the tests call it directly; server.mjs listens and runs Docker.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { BlockList, isIPv4, isIPv6 } from 'node:net';

/** The workflow whose successful run for a version tag publishes the image, by name and by file. */
export const DEPLOY_WORKFLOW = 'Docker image';
export const DEPLOY_WORKFLOW_PATH = '.github/workflows/docker.yml';
/** A release version tag, the only ref the workflow publishes from; a tag push run reports it as `head_branch`. */
export const RELEASE_TAG = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

/**
 * GitHub signs the raw request body with the webhook secret and sends `X-Hub-Signature-256: sha256=<hex>`. The digest is computed over the raw bytes, never over re-serialized JSON.
 * @param {string} secret
 * @param {Buffer} rawBody
 * @param {unknown} header
 * @returns {boolean}
 */
export function verifySignature(secret, rawBody, header) {
  if (typeof header !== 'string' || header === '') return false;
  const expected = Buffer.from(`sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`);
  const provided = Buffer.from(header);
  // timingSafeEqual throws on a length mismatch; the length of a sha256 digest is public anyway.
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}

/**
 * The `hooks` CIDR list of api.github.com/meta as a BlockList, or null when nothing usable is in it; null means the ranges are unknown and the address check allows (the signature stays the control that decides).
 * @param {unknown} hooks
 * @returns {BlockList | null}
 */
export function parseHookRanges(hooks) {
  if (!Array.isArray(hooks)) return null;
  const ranges = new BlockList();
  let added = 0;
  for (const entry of hooks) {
    if (typeof entry !== 'string') continue;
    const [address, prefix] = entry.split('/');
    if (!/^\d{1,3}$/.test(prefix ?? '')) continue;
    const bits = Number(prefix);
    /** @type {'ipv4' | 'ipv6'} */
    let family;
    if (isIPv4(address) && bits <= 32) family = 'ipv4';
    else if (isIPv6(address) && bits <= 128) family = 'ipv6';
    else continue;
    ranges.addSubnet(address, bits, family);
    added += 1;
  }
  return added > 0 ? ranges : null;
}

/** An IPv4 peer on a dual-stack socket reads `::ffff:1.2.3.4`, which ipv4 rules do not match. */
function normalizeIp(ip) {
  const mapped = ip.startsWith('::ffff:') ? ip.slice('::ffff:'.length) : '';
  return isIPv4(mapped) ? mapped : ip;
}

/**
 * The caller's address. The edge proxy (deploy/Caddyfile) overwrites X-Forwarded-For with the address it observed, so its rightmost entry is read; a client can prepend entries but cannot append after the proxy. Without the header, the socket peer.
 * @param {unknown} forwardedFor
 * @param {string | undefined} remoteAddress
 * @returns {string}
 */
export function clientIp(forwardedFor, remoteAddress) {
  if (typeof forwardedFor === 'string' && forwardedFor.trim() !== '') {
    const hops = forwardedFor.split(',');
    return normalizeIp(hops[hops.length - 1].trim());
  }
  return normalizeIp(remoteAddress ?? '');
}

/**
 * Whether an address is inside GitHub's published hook ranges; unknown ranges allow, since this check is defence in depth behind the signature.
 * @param {BlockList | null} ranges
 * @param {string} ip
 * @returns {boolean}
 */
export function isFromGitHub(ranges, ip) {
  if (ranges === null) return true;
  if (isIPv4(ip)) return ranges.check(ip, 'ipv4');
  if (isIPv6(ip)) return ranges.check(ip, 'ipv6');
  return false;
}

/**
 * A workflow_run delivery comes for every workflow, at every stage and for pull requests too; only a successful push run of the image workflow for a release tag `vX.Y.Z` deploys, since only such a run publishes. A push to main runs the workflow too and is ignored. The event check matters: a pull request from a fork whose branch is named like a tag reports that name as `head_branch`. The tag and `main` checks run in the workflow, not here. While the publish job is gated off, or when the tag is not the highest release, the run still succeeds, and the deploy then pulls the unchanged `latest` and changes nothing.
 * @param {any} payload - untrusted JSON of unverified shape; every access is optional-chained
 * @returns {boolean}
 */
export function shouldDeploy(payload) {
  const run = payload?.workflow_run;
  return (
    payload?.action === 'completed' &&
    run?.name === DEPLOY_WORKFLOW &&
    run?.path === DEPLOY_WORKFLOW_PATH &&
    run?.event === 'push' &&
    typeof run?.head_branch === 'string' &&
    RELEASE_TAG.test(run.head_branch) &&
    run?.conclusion === 'success'
  );
}
