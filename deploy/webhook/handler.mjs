// The request half of the deploy webhook: the order of the checks on a delivery, with no process state, so the tests drive it over a real HTTP server. Nothing is read past the address check and nothing is acted on before the signature holds. server.mjs supplies the hook ranges and the deploy.
import { clientIp, isFromGitHub, shouldDeploy, verifySignature } from './verify.mjs';

export const HOOK_PATH = '/deploy-hook';
/** A workflow_run delivery is a few kilobytes; a larger body is refused. */
export const MAX_BODY_BYTES = 1024 * 1024;

/**
 * @param {import('node:http').IncomingMessage} req
 * @param {number} limit
 * @returns {Promise<Buffer | null>} null when the body passes the limit
 */
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        // Stop buffering but keep the socket, so the 413 reaches the client.
        req.removeAllListeners('data');
        req.resume();
        resolve(null);
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/**
 * @param {{ secret: string, getRanges: () => import('node:net').BlockList | null, redeploy: () => void, log?: Pick<Console, 'log' | 'warn'> }} options
 * @returns {(req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse) => Promise<void>}
 */
export function createHandler({ secret, getRanges, redeploy, log = console }) {
  return async function handle(req, res) {
    // Every answer given before the body is read closes the connection, so an unread body is not drained.
    if (req.method !== 'POST' || req.url !== HOOK_PATH) {
      res.writeHead(404, { connection: 'close' }).end();
      return;
    }
    const ip = clientIp(req.headers['x-forwarded-for'], req.socket.remoteAddress);
    if (!isFromGitHub(getRanges(), ip)) {
      log.warn(`rejected ${ip}: outside the GitHub hook ranges`);
      res.writeHead(403, { connection: 'close' }).end('forbidden');
      return;
    }
    if (Number(req.headers['content-length'] ?? 0) > MAX_BODY_BYTES) {
      res.writeHead(413, { connection: 'close' }).end('payload too large');
      return;
    }
    const raw = await readBody(req, MAX_BODY_BYTES);
    if (raw === null) {
      res.writeHead(413, { connection: 'close' }).end('payload too large');
      return;
    }
    if (!verifySignature(secret, raw, req.headers['x-hub-signature-256'])) {
      log.warn(`rejected ${ip}: bad or missing X-Hub-Signature-256`);
      res.writeHead(401).end('unauthorized');
      return;
    }
    const event = req.headers['x-github-event'];
    // GitHub sends ping when the webhook is registered: a 200 proves the address, the secret and TLS.
    if (event === 'ping') {
      res.writeHead(200).end('pong');
      return;
    }
    if (event !== 'workflow_run') {
      res.writeHead(204).end();
      return;
    }
    let payload;
    try {
      payload = JSON.parse(raw.toString('utf8'));
    } catch {
      res.writeHead(400).end('invalid json');
      return;
    }
    if (!shouldDeploy(payload)) {
      // A completed run that does not deploy is logged, so a gate that stops matching real deliveries shows in the log.
      const run = payload?.workflow_run;
      if (payload?.action === 'completed') log.log(`ignored run ${run?.id}: ${run?.name} (${run?.path}) ${run?.event} on ${run?.head_branch}, ${run?.conclusion}`);
      res.writeHead(204).end();
      return;
    }
    // GitHub times a delivery out after 10 seconds; a pull takes longer, so the answer comes first.
    res.writeHead(202).end('deploying');
    log.log(`pulling latest after ${payload.workflow_run.head_branch} at ${payload.workflow_run.head_sha} (run ${payload.workflow_run.id})`);
    redeploy();
  };
}
