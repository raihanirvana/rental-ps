import { randomBytes, randomUUID } from 'node:crypto';
import { insertSeededWorkspace } from '../database/seed/index.js';
import { withTransaction } from '../database/transaction.js';
import { HttpError } from '../lib/http-error.js';
import { insertSession, revokeSession } from '../repositories/session-repository.js';
import {
  countActiveWorkspaces,
  deleteExpiredWorkspaces,
  deleteWorkspace,
} from '../repositories/workspace-repository.js';
import {
  demoRoles,
  findSessionByToken,
  hashToken,
  resolveSessionById,
} from './session-resolver.js';

const minuteInMs = 60 * 1000;

// Dalam transaksi login (BEGIN IMMEDIATE): kapasitas diperiksa atomik setelah membersihkan
// workspace kedaluwarsa. Ganti peran tidak melewati jalur ini sehingga tetap bisa saat penuh.
function assertCapacity(database, nowIso, maxWorkspaces) {
  if (countActiveWorkspaces(database, nowIso) >= maxWorkspaces) {
    const error = new HttpError(503, 'DEMO_CAPACITY', 'Ruang demo sedang penuh. Coba lagi nanti.');
    error.retryAfter = 600;
    throw error;
  }
}

function openWorkspace(database, now, ttlMinutes, maxWorkspaces) {
  deleteExpiredWorkspaces(database, now.toISOString());
  assertCapacity(database, now.toISOString(), maxWorkspaces);
  const workspaceId = randomUUID();
  const expiresAt = new Date(now.getTime() + ttlMinutes * minuteInMs);
  insertSeededWorkspace(database, { workspaceId, now, expiresAt });
  return { id: workspaceId, createdAt: now.toISOString(), expiresAt: expiresAt.toISOString() };
}

// Ganti peran: sesi diperiksa ulang setelah kunci tulis, lalu token lama dicabut.
// Workspace dan masa berlakunya tetap; ganti peran tidak memperpanjang umur demo.
function switchWorkspace(database, currentAuth, now) {
  const current = resolveSessionById(database, currentAuth.sessionId, now).auth;
  const revoked = current && revokeSession(database, current.sessionId, now.toISOString());
  if (!revoked) {
    throw new HttpError(409, 'SESSION_CHANGED', 'Sesi baru saja berubah. Muat ulang halaman.');
  }
  return {
    id: current.workspaceId,
    createdAt: current.workspaceCreatedAt,
    expiresAt: current.workspaceExpiresAt,
    dataVersion: current.dataVersion,
  };
}

function issueSession(database, workspace, role, nowIso) {
  const token = randomBytes(32).toString('base64url');
  const session = {
    id: randomUUID(),
    workspaceId: workspace.id,
    tokenHash: hashToken(token),
    role,
    createdAt: nowIso,
    expiresAt: workspace.expiresAt,
  };
  insertSession(database, session);
  return { token, session };
}

function toAuth(session, workspace) {
  return {
    sessionId: session.id,
    workspaceId: workspace.id,
    role: session.role,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    workspaceCreatedAt: workspace.createdAt,
    workspaceExpiresAt: workspace.expiresAt,
    dataVersion: workspace.dataVersion ?? 1,
  };
}

// Token yang sudah dicabut berarti peran baru saja diganti (mis. request paralel).
// Jangan membuat workspace baru diam-diam; cookie terbaru sudah dipegang browser.
function assertNotRevoked(sessionProblem) {
  if (sessionProblem === 'revoked') {
    throw new HttpError(409, 'SESSION_CHANGED', 'Sesi baru saja berubah. Muat ulang halaman.');
  }
}

// Login baru: workspace, seed dan sesi dalam satu transaksi BEGIN IMMEDIATE.
export function startDemoSession(database, options) {
  const { role, currentAuth, sessionProblem, ttlMinutes, maxWorkspaces } = options;
  assertNotRevoked(sessionProblem);
  return withTransaction(database, () => {
    const now = new Date();
    const workspace = currentAuth
      ? switchWorkspace(database, currentAuth, now)
      : openWorkspace(database, now, ttlMinutes, maxWorkspaces);
    const { token, session } = issueSession(database, workspace, role, now.toISOString());
    return { token, auth: toAuth(session, workspace), workspaceCreated: !currentAuth };
  });
}

// Logout menghapus workspace milik token yang masih aktif (diperiksa setelah kunci tulis).
// false: token dicabut, sehingga caller tidak boleh menghapus cookie sesi baru.
// Token yang sudah dicabut tidak bisa menghapus workspace yang kini dipakai token baru.
export function endDemoSession(database, token) {
  return withTransaction(database, () => {
    const row = findSessionByToken(database, token);
    if (row?.revoked_at) {
      return false;
    }
    if (row) {
      deleteWorkspace(database, row.workspace_id);
    }
    return true;
  });
}

export function describeSession(auth) {
  return {
    role: auth.role,
    roleLabel: demoRoles[auth.role],
    startedAt: auth.createdAt,
    expiresAt: auth.expiresAt,
    workspace: {
      createdAt: auth.workspaceCreatedAt,
      expiresAt: auth.workspaceExpiresAt,
      dataVersion: auth.dataVersion,
    },
  };
}
