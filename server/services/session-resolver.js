import { createHash } from 'node:crypto';
import { findSessionById, findSessionByTokenHash } from '../repositories/session-repository.js';

export const demoRoles = { customer: 'Pelanggan', owner: 'Pemilik' };

// Token mentah hanya ada di cookie; database menyimpan SHA-256-nya.
export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function toAuth(row) {
  return {
    sessionId: row.id,
    workspaceId: row.workspace_id,
    role: row.role,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    workspaceCreatedAt: row.workspace_created_at,
    workspaceExpiresAt: row.workspace_expires_at,
    dataVersion: row.data_version,
  };
}

// Hasil { auth } untuk sesi aktif, atau { problem: 'invalid' | 'revoked' | 'expired' }.
// 'revoked': token lama setelah ganti peran, workspace-nya masih dipakai token baru.
function resolveRow(row, now) {
  if (!row) {
    return { problem: 'invalid' };
  }
  const nowIso = now.toISOString();
  if (row.expires_at <= nowIso || row.workspace_expires_at <= nowIso) {
    return { problem: 'expired' };
  }
  if (row.revoked_at) {
    return { problem: 'revoked' };
  }
  return { auth: toAuth(row) };
}

export function resolveSessionByToken(database, token, now) {
  return resolveRow(findSessionByToken(database, token), now);
}

export function resolveSessionById(database, sessionId, now) {
  return resolveRow(findSessionById(database, sessionId), now);
}

// Sertakan revoked agar logout dari request lama tidak menghapus cookie sesi baru.
export function findSessionByToken(database, token) {
  return token ? findSessionByTokenHash(database, hashToken(token)) : undefined;
}
