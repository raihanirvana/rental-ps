const insertUnitSql = `
  INSERT INTO units (id, workspace_id, seed_key, name, kind, hourly_rate, is_active,
    created_at, updated_at)
  VALUES ($id, $workspaceId, $seedKey, $name, $kind, $hourlyRate, $isActive, $now, $now)`;

export function insertUnit(database, unit) {
  database.prepare(insertUnitSql).run(unit);
}
