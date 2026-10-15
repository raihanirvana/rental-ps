import { withTransaction } from '../database/transaction.js';
import { HttpError } from '../lib/http-error.js';
import { resolveSessionById } from './session-resolver.js';

function currentAuth(database, auth, roles) {
  const current = resolveSessionById(database, auth.sessionId, new Date());
  if (!current.auth || current.auth.workspaceId !== auth.workspaceId) {
    const code = current.problem === 'expired' ? 'SESSION_EXPIRED' : 'UNAUTHENTICATED';
    throw new HttpError(401, code, 'Sesi berubah atau berakhir. Masuk demo lagi.');
  }
  if (!roles.includes(current.auth.role)) {
    throw new HttpError(403, 'FORBIDDEN', 'Peran ini tidak memiliki akses ke perubahan tersebut.');
  }
  return current.auth;
}

// Untuk setiap mutasi: kunci tulis diambil dulu (BEGIN IMMEDIATE), lalu sesi diperiksa ulang
// sebelum data diubah. `work` menerima auth terkini (workspaceId, role) dari tabel sessions.
export function withWorkspaceAccess(database, auth, roles, work) {
  return withTransaction(database, () => work(currentAuth(database, auth, roles)));
}
