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
