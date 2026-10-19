// The deploy webhook: GitHub posts a signed workflow_run delivery to /deploy-hook when the image workflow finishes, and a successful push run for a release tag vX.Y.Z pulls the published image and restarts the site service through the host's Docker. The request checks are in handler.mjs and verify.mjs.
import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { createHandler } from './handler.mjs';
import { createSerialRunner } from './serialize.mjs';
import { parseHookRanges } from './verify.mjs';

const SECRET = process.env.DEPLOY_WEBHOOK_SECRET ?? '';
if (!SECRET) throw new Error('DEPLOY_WEBHOOK_SECRET is not set');

const SERVICE = 'site';
// The compose plugin runs as its own binary, not through `docker compose`: a timeout then kills the process doing the work, not a front end that would leave it running.
const COMPOSE_BIN = '/usr/libexec/docker/cli-plugins/docker-compose';
const COMPOSE = ['-f', '/deploy/docker-compose.yml', '--project-directory', '/deploy'];
/** The label of the site image (Dockerfile); only replaced site images are pruned, never another project's. */
const SITE_IMAGE_LABEL = 'org.opencontainers.image.title=frontx-site';
const RANGES_REFRESH_MS = 60 * 60 * 1000;
/** While the ranges are unknown (a failed first fetch), the refresh is retried every minute. */
const RANGES_RETRY_MS = 60 * 1000;
/** The first refresh is awaited before listening, so a stalled api.github.com must not keep the webhook from starting. */
const META_TIMEOUT_MS = 10 * 1000;
// Each step is bounded and killed hard at its bound: a hung `docker` call would otherwise hold the deploy lock forever. The output buffer is generous, so verbose output never kills a pull midway.
/** @type {import('node:child_process').ExecFileOptions} */
const PULL = { timeout: 10 * 60 * 1000, killSignal: 'SIGKILL', maxBuffer: 16 * 1024 * 1024 };
/** @type {import('node:child_process').ExecFileOptions} */
const UP = { timeout: 5 * 60 * 1000, killSignal: 'SIGKILL', maxBuffer: 16 * 1024 * 1024 };
/** @type {import('node:child_process').ExecFileOptions} */
const PRUNE = { timeout: 2 * 60 * 1000, killSignal: 'SIGKILL', maxBuffer: 16 * 1024 * 1024 };

/** null until the first successful refresh and kept as is when a refresh fails. */
let hookRanges = null;
let refreshedAt = 0;

async function refreshHookRanges() {
  try {
    const response = await fetch('https://api.github.com/meta', {
      headers: { 'user-agent': 'frontx-site-deploy-webhook' },
      signal: AbortSignal.timeout(META_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`api.github.com/meta responded ${response.status}`);
    const meta = /** @type {{ hooks?: unknown }} */ (await response.json());
    const parsed = parseHookRanges(meta.hooks);
    if (!parsed) throw new Error('api.github.com/meta returned no usable hook ranges');
    hookRanges = parsed;
    refreshedAt = Date.now();
  } catch (error) {
    console.error('could not refresh the GitHub hook ranges:', error instanceof Error ? error.message : error);
  }
}

/** A timed-out call reports an empty stderr. */
function reason(error, stderr) {
  return String(stderr ?? '').trim() || error.message;
}

/** Pull, restart, then prune the replaced site image; a failed pull keeps the running image. The lock is released after the prune, so a prune never races the next pull. */
function runDeploy(done) {
  execFile(COMPOSE_BIN, [...COMPOSE, 'pull', '--quiet', SERVICE], PULL, (pullError, _stdout, pullStderr) => {
    if (pullError) {
      console.error('pull failed:', reason(pullError, pullStderr));
      return done();
    }
    execFile(COMPOSE_BIN, [...COMPOSE, 'up', '-d', SERVICE], UP, (upError, upStdout, upStderr) => {
      if (upError) {
        console.error('up failed:', reason(upError, upStderr));
        return done();
      }
      console.log('deployed:', String(upStdout).trim());
      execFile('docker', ['image', 'prune', '-f', '--filter', `label=${SITE_IMAGE_LABEL}`], PRUNE, (pruneError, _pruneStdout, pruneStderr) => {
        if (pruneError) console.error('prune failed:', reason(pruneError, pruneStderr));
        done();
      });
    });
  });
}

const redeploy = createSerialRunner(runDeploy, () => console.log('a deploy is running; one follow-up run is queued'));
const handle = createHandler({ secret: SECRET, getRanges: () => hookRanges, redeploy });

// A delivery is small and quick; slow or numerous connections are cut, checked every 5 seconds, so no caller can hold the process's memory while the ranges are unknown.
const server = createServer({ requestTimeout: 15 * 1000, headersTimeout: 10 * 1000, connectionsCheckingInterval: 5 * 1000 }, (req, res) => {
  handle(req, res).catch((error) => {
    console.error('request failed:', error);
    if (!res.headersSent) res.writeHead(500).end('internal error');
  });
});

server.maxConnections = 32;

await refreshHookRanges();
setInterval(() => {
  if (hookRanges === null || Date.now() - refreshedAt >= RANGES_REFRESH_MS) void refreshHookRanges();
}, RANGES_RETRY_MS).unref();
server.listen(9000, () => console.log('deploy webhook listening on :9000'));
