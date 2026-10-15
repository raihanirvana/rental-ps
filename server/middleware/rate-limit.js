import { HttpError } from '../lib/http-error.js';

const maxTrackedIps = 10000;

function prune(hits, now) {
  for (const [key, entry] of hits) {
    if (entry.resetAt <= now) {
      hits.delete(key);
    }
  }
}

// Fixed window per IP di memori proses. Penyimpanan dibatasi; bila penuh dan tidak ada
// entri kedaluwarsa, IP baru langsung dibatasi (bukan menggusur hitungan IP lain).
function entryFor(hits, key, now, windowMs) {
  const entry = hits.get(key);
  if (entry && entry.resetAt > now) {
    return entry;
  }
  if (!entry && hits.size >= maxTrackedIps) {
    prune(hits, now);
    if (hits.size >= maxTrackedIps) {
      return null;
    }
  }
  const fresh = { count: 0, resetAt: now + windowMs };
  hits.set(key, fresh);
  return fresh;
}

export function createRateLimiter({ windowMs, max, message }) {
  const hits = new Map();
  return (request, response, next) => {
    const now = Date.now();
    const entry = entryFor(hits, request.ip ?? 'tanpa-ip', now, windowMs);
    if (entry) {
      entry.count += 1;
    }
    if (!entry || entry.count > max) {
      const seconds = entry ? Math.ceil((entry.resetAt - now) / 1000) : Math.ceil(windowMs / 1000);
      response.set('Retry-After', String(seconds));
      next(new HttpError(429, 'RATE_LIMITED', message));
      return;
    }
    next();
  };
}
