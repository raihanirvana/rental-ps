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

// Urutan mengikuti foreign key: key idempotensi → booking/blok → unit → pengaturan.
// Sesi dan baris workspace (masa berlaku) tidak disentuh.
const clearStatements = [
  'DELETE FROM booking_requests WHERE workspace_id = ?',
  'DELETE FROM bookings WHERE workspace_id = ?',
  'DELETE FROM unit_blocks WHERE workspace_id = ?',
  'DELETE FROM units WHERE workspace_id = ?',
  'DELETE FROM business_settings WHERE workspace_id = ?',
];

export function clearWorkspaceData(database, workspaceId) {
  for (const sql of clearStatements) {
    database.prepare(sql).run(workspaceId);
  }
}

export function bumpDataVersion(database, workspaceId) {
  database
    .prepare('UPDATE workspaces SET data_version = data_version + 1, seeded_at = NULL WHERE id = ?')
    .run(workspaceId);
  return findWorkspace(database, workspaceId).data_version;
}

// Kapasitas dihitung dari database (bukan memori proses) agar konsisten antarproses.
export function countActiveWorkspaces(database, nowIso) {
  return database.prepare('SELECT count(*) AS n FROM workspaces WHERE expires_at > ?').get(nowIso)
    .n;
}
