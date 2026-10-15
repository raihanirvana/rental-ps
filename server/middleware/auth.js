import { HttpError } from '../lib/http-error.js';
import { clearSessionCookie, readSessionToken } from '../lib/session-cookie.js';
import { demoRoles, resolveSessionByToken } from '../services/session-resolver.js';

const sessionProblems = {
  missing: { code: 'UNAUTHENTICATED', message: 'Masuk demo terlebih dahulu.' },
  invalid: { code: 'UNAUTHENTICATED', message: 'Sesi tidak dikenali. Masuk demo lagi.' },
  revoked: { code: 'UNAUTHENTICATED', message: 'Sesi sudah diganti. Muat ulang halaman.' },
  expired: { code: 'SESSION_EXPIRED', message: 'Sesi demo berakhir. Masuk demo lagi.' },
};

// Mengisi request.auth dari cookie. Workspace dan peran hanya berasal dari tabel sessions,
// tidak pernah dari body, query atau header lain.
export function loadSession(database) {
  return (request, _response, next) => {
    const token = readSessionToken(request);
    request.sessionToken = token ?? null;
    request.auth = null;
    request.authProblem = 'missing';
    if (token !== undefined) {
      const result = resolveSessionByToken(database, token, new Date());
      request.auth = result.auth ?? null;
      request.authProblem = result.problem ?? null;
    }
    next();
  };
}

// Token revoked dapat berasal dari request lama sebelum rotasi; jangan hapus cookie baru.
// Cookie invalid/expired tetap dibersihkan, sedangkan revoked hanya mendapat 401.
export function requireSession(request, response, next) {
  if (request.auth) {
    next();
    return;
  }
  if (!['missing', 'revoked'].includes(request.authProblem)) {
    clearSessionCookie(request, response);
  }
  const { code, message } = sessionProblems[request.authProblem];
  next(new HttpError(401, code, message));
}

export function requireRole(...roles) {
  return (request, response, next) => {
    if (!request.auth) {
      requireSession(request, response, next);
      return;
    }
    if (roles.includes(request.auth.role)) {
      next();
      return;
    }
    const label = demoRoles[request.auth.role];
    next(new HttpError(403, 'FORBIDDEN', `${label} tidak memiliki akses ke fitur ini.`));
  };
}
