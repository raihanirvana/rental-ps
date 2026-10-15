import { withReadTransaction, withTransaction } from '../database/transaction.js';
import { HttpError } from '../lib/http-error.js';
import { demoRoles, resolveSessionById } from './session-resolver.js';

function currentAuth(database, auth, roles) {
  const current = resolveSessionById(database, auth.sessionId, new Date());
  if (!current.auth || current.auth.workspaceId !== auth.workspaceId) {
    const code = current.problem === 'expired' ? 'SESSION_EXPIRED' : 'UNAUTHENTICATED';
    throw new HttpError(401, code, 'Sesi berubah atau berakhir. Masuk demo lagi.');
  }
  auth.dataVersion = current.auth.dataVersion;
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

// Ambil snapshot lebih dulu, lalu validasi sesi dan baca data dalam snapshot yang sama.
// Logout/rotasi dari proses lain tidak boleh menyebabkan pembacaan workspace tanpa sesi.
export function withWorkspaceReadAccess(database, auth, work, roles = Object.keys(demoRoles)) {
  return withReadTransaction(database, () => {
    const current = currentAuth(database, auth, roles);
    return work(current);
  });
}
