import { createHmac, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';

const host = process.env.WEBHOOK_HOST || '127.0.0.1';
const port = Number(process.env.WEBHOOK_PORT || 9010);
const path = process.env.WEBHOOK_PATH || '/_deploy/github';
const branch = process.env.DEPLOY_BRANCH || 'main';
const secret = process.env.WEBHOOK_SECRET;
const deployScript = process.env.DEPLOY_SCRIPT || '/opt/shinbun-news/deploy.sh';
const maxBodyBytes = Number(process.env.WEBHOOK_MAX_BODY_BYTES || 1_048_576);

if (!secret || secret.length < 32) {
  throw new Error('WEBHOOK_SECRET must contain at least 32 characters');
}

let deploying = false;
let pending = false;
const deliveries = new Set();

function log(message, details = {}) {
  process.stdout.write(`${JSON.stringify({ time: new Date().toISOString(), message, ...details })}\n`);
}

function validSignature(body, provided) {
  if (!provided?.startsWith('sha256=')) return false;
  const expected = `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  return expectedBuffer.length === providedBuffer.length && timingSafeEqual(expectedBuffer, providedBuffer);
}

function executeDeploy(delivery) {
  return new Promise((resolve) => {
    const child = spawn(deployScript, [], {
      env: process.env,
      stdio: 'inherit'
    });

    child.once('error', (error) => {
      log('deploy process failed to start', { delivery, error: error.message });
      resolve(false);
    });

    child.once('exit', (code, signal) => {
      const success = code === 0;
      log('deploy process finished', { delivery, success, code, signal });
      resolve(success);
    });
  });
}

async function queueDeploy(delivery) {
  if (deploying) {
    pending = true;
    log('deploy already running; queued one follow-up build', { delivery });
    return;
  }

  deploying = true;
  let currentDelivery = delivery;

  do {
    pending = false;
    log('starting deploy', { delivery: currentDelivery, branch });
    await executeDeploy(currentDelivery);
    currentDelivery = 'coalesced-push';
  } while (pending);

  deploying = false;
}

function send(response, status, body) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff'
  });
  response.end(JSON.stringify(body));
}

const server = createServer((request, response) => {
  if (request.method === 'GET' && request.url === '/healthz') {
    send(response, 200, { ok: true, deploying, pending });
    return;
  }

  if (request.method !== 'POST' || request.url !== path) {
    send(response, 404, { error: 'not_found' });
    return;
  }

  const chunks = [];
  let size = 0;

  request.on('data', (chunk) => {
    size += chunk.length;
    if (size > maxBodyBytes) {
      send(response, 413, { error: 'payload_too_large' });
      request.destroy();
      return;
    }
    chunks.push(chunk);
  });

  request.on('end', () => {
    if (size > maxBodyBytes || response.writableEnded) return;

    const body = Buffer.concat(chunks);
    const signature = request.headers['x-hub-signature-256'];
    const event = request.headers['x-github-event'];
    const delivery = request.headers['x-github-delivery'] || 'unknown';

    if (!validSignature(body, signature)) {
      log('rejected webhook with invalid signature', { delivery });
      send(response, 401, { error: 'invalid_signature' });
      return;
    }

    if (event === 'ping') {
      send(response, 200, { ok: true, event: 'ping' });
      return;
    }

    if (event !== 'push') {
      send(response, 202, { ok: true, ignored: `event:${event}` });
      return;
    }

    let payload;
    try {
      payload = JSON.parse(body.toString('utf8'));
    } catch {
      send(response, 400, { error: 'invalid_json' });
      return;
    }

    if (payload.ref !== `refs/heads/${branch}`) {
      send(response, 202, { ok: true, ignored: `ref:${payload.ref}` });
      return;
    }

    if (deliveries.has(delivery)) {
      send(response, 202, { ok: true, duplicate: true });
      return;
    }

    deliveries.add(delivery);
    if (deliveries.size > 500) deliveries.delete(deliveries.values().next().value);

    void queueDeploy(delivery);
    send(response, 202, { ok: true, queued: true });
  });
});

server.requestTimeout = 10_000;
server.headersTimeout = 12_000;
server.listen(port, host, () => {
  log('webhook server listening', { host, port, path, branch });
});

function shutdown(signal) {
  log('shutting down webhook server', { signal });
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
