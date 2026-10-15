import { config } from '../config.js';
import { HttpError } from '../lib/http-error.js';
import { normalizeOrigin } from '../lib/origin.js';

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);
const crossSiteFetch = new Set(['cross-site', 'same-site']);

// Origin aplikasi menurut Host asli (dev: Vite meneruskan Host) dan protokol yang
// dipercaya (HTTPS via proxy hanya bila TRUST_PROXY diset).
function ownOrigin(request) {
  return normalizeOrigin(`${request.protocol}://${request.get('host')}`);
}

function originAllowed(request, origin) {
  const normalized = normalizeOrigin(origin);
  if (normalized === null) {
    return false;
  }
  return normalized === ownOrigin(request) || config.allowedOrigins.includes(normalized);
}

// Lapis CSRF kedua (cookie sudah SameSite=Strict): mutasi dari browser wajib dari origin
// aplikasi. Klien tanpa Origin/Sec-Fetch-Site (curl) tidak membawa cookie korban.
// DELETE tanpa body tetap diperiksa.
export function requireSameOrigin(request, _response, next) {
  if (safeMethods.has(request.method)) {
    next();
    return;
  }
  const origin = request.get('origin');
  const fetchSite = request.get('sec-fetch-site');
  const rejected = origin ? !originAllowed(request, origin) : crossSiteFetch.has(fetchSite);
  if (rejected) {
    next(new HttpError(403, 'ORIGIN_REJECTED', 'Permintaan dari situs lain ditolak.'));
    return;
  }
  next();
}
