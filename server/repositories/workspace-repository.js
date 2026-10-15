const insertWorkspaceSql = `
  INSERT INTO workspaces (id, created_at, expires_at)
  VALUES ($id, $createdAt, $expiresAt)
  ON CONFLICT (id) DO NOTHING`;

export function insertWorkspace(database, workspace) {
  database.prepare(insertWorkspaceSql).run(workspace);
}

export function findWorkspace(database, workspaceId) {
  return database
    .prepare(
      'SELECT id, data_version, created_at, expires_at, seeded_at FROM workspaces WHERE id = ?',
    )
    .get(workspaceId);
}

export function markWorkspaceSeeded(database, workspaceId, seededAt) {
  database.prepare('UPDATE workspaces SET seeded_at = ? WHERE id = ?').run(seededAt, workspaceId);
}

// Sesi, pengaturan, unit, booking, request dan blok ikut terhapus lewat ON DELETE CASCADE.
export function deleteWorkspace(database, workspaceId) {
  return database.prepare('DELETE FROM workspaces WHERE id = ?').run(workspaceId).changes;
}

export function deleteExpiredWorkspaces(database, nowIso) {
  return database.prepare('DELETE FROM workspaces WHERE expires_at <= ?').run(nowIso).changes;
}
