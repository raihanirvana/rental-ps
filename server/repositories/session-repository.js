const selectSession = `
  SELECT session.id, session.workspace_id, session.role, session.created_at,
    session.expires_at, session.revoked_at, workspace.created_at AS workspace_created_at,
    workspace.expires_at AS workspace_expires_at, workspace.data_version
  FROM sessions AS session
  JOIN workspaces AS workspace ON workspace.id = session.workspace_id`;

const insertSessionSql = `
  INSERT INTO sessions (id, workspace_id, token_hash, role, created_at, expires_at)
  VALUES ($id, $workspaceId, $tokenHash, $role, $createdAt, $expiresAt)`;

export function findSessionByTokenHash(database, tokenHash) {
  return database.prepare(`${selectSession} WHERE session.token_hash = ?`).get(tokenHash);
}

export function findSessionById(database, sessionId) {
  return database.prepare(`${selectSession} WHERE session.id = ?`).get(sessionId);
}

export function insertSession(database, session) {
  database.prepare(insertSessionSql).run(session);
}

// true hanya jika sesi masih aktif saat dicabut (belum dicabut request lain).
export function revokeSession(database, sessionId, nowIso) {
  const result = database
    .prepare('UPDATE sessions SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL')
    .run(nowIso, sessionId);
  return result.changes === 1;
}
