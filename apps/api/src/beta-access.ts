import { createHash } from 'node:crypto';
import type { RequestHandler } from 'express';

const minute = 60_000;
const maxRequests = 90;
const maxReadings = 6;
const maxConcurrentReadings = 2;

export function createBetaAccess(configured = ''): RequestHandler {
  const hashes = new Set(configured.split(',').map((entry) => entry.trim()).filter(Boolean));
  if ([...hashes].some((entry) => !/^[a-f0-9]{64}$/.test(entry))) {
    throw new Error('BETA_INVITE_HASHES must contain SHA-256 digests.');
  }

  const usage = new Map<string, { requests: number; readings: number }>();
  let windowEnd = 0;
  let activeReadings = 0;

  return (request, response, next) => {
    if (request.method === 'OPTIONS') return next();
    if (!hashes.size) {
      if (request.get('X-Cigana-Public') === '1') {
        response.status(503).json({ error: 'beta_not_configured' });
        return;
      }
      return next();
    }
    response.setHeader('Cache-Control', 'no-store');
    const invite = request.get('X-Beta-Invite') ?? '';
    const hash = /^[a-f0-9]{32}$/.test(invite) ? createHash('sha256').update(invite).digest('hex') : '';
    if (!hashes.has(hash)) {
      response.status(403).json({ error: 'beta_invite_required' });
      return;
    }

    if (request.method === 'GET' && request.path === '/beta/access') {
      response.status(204).end();
      return;
    }
    response.locals.betaInviteHash = hash;

    const now = Date.now();
    if (now >= windowEnd) {
      usage.clear();
      windowEnd = now + minute;
    }
    const entry = usage.get(hash) ?? { requests: 0, readings: 0 };
    const generatesReading = request.method === 'POST' && /^\/(chat\/?$|tarot\/interpret\/)/i.test(request.path);
    if (entry.requests >= maxRequests || (generatesReading &&
        (entry.readings >= maxReadings || activeReadings >= maxConcurrentReadings))) {
      response.setHeader('Retry-After', entry.requests >= maxRequests || entry.readings >= maxReadings
        ? Math.ceil((windowEnd - now) / 1000) : 5);
      response.status(429).json({ error: 'beta_rate_limited' });
      return;
    }
    entry.requests++;
    usage.set(hash, entry);
    if (generatesReading) {
      entry.readings++;
      activeReadings++;
      response.once('close', () => { activeReadings--; });
    }
    next();
  };
}
