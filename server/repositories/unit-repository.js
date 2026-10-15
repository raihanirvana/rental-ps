const insertUnitSql = `
  INSERT INTO units (id, workspace_id, seed_key, name, kind, hourly_rate, is_active,
    created_at, updated_at)
  VALUES ($id, $workspaceId, $seedKey, $name, $kind, $hourlyRate, $isActive, $now, $now)`;

export function insertUnit(database, unit) {
  database.prepare(insertUnitSql).run(unit);
}

const unitColumns = 'id, seed_key, name, kind, hourly_rate, is_active';

export function listUnits(database, workspaceId) {
  return database
    .prepare(`SELECT ${unitColumns} FROM units WHERE workspace_id = ? ORDER BY kind, name`)
    .all(workspaceId);
}

// Selalu dibatasi workspace; ID unit workspace lain tidak ditemukan.
export function findUnit(database, workspaceId, unitId) {
  return database
    .prepare(`SELECT ${unitColumns} FROM units WHERE workspace_id = ? AND id = ?`)
    .get(workspaceId, unitId);
}

export function countUnits(database, workspaceId) {
  return database.prepare('SELECT count(*) AS n FROM units WHERE workspace_id = ?').get(workspaceId)
    .n;
}

// Nama unik per workspace tanpa membedakan huruf besar/kecil (kolom COLLATE NOCASE).
export function findUnitByName(database, workspaceId, name) {
  return database
    .prepare('SELECT id FROM units WHERE workspace_id = ? AND name = ?')
    .get(workspaceId, name);
}

const updateUnitSql = `
  UPDATE units SET name = $name, kind = $kind, hourly_rate = $hourlyRate,
    is_active = $isActive, updated_at = $now
  WHERE workspace_id = $workspaceId AND id = $id`;

export function updateUnitRow(database, unit) {
  database.prepare(updateUnitSql).run(unit);
}

// Booking non-cancelled yang belum berakhir menahan unit tetap aktif.
export function countPendingBookings(database, { workspaceId, unitId, now }) {
  return database
    .prepare(
      `SELECT count(*) AS n FROM bookings WHERE workspace_id = ? AND unit_id = ?
       AND status <> 'cancelled' AND ends_at > ?`,
    )
    .get(workspaceId, unitId, now).n;
}
