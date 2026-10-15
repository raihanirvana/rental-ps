const insertBlockSql = `
  INSERT INTO unit_blocks (id, workspace_id, unit_id, source, starts_at, ends_at, note,
    created_at, updated_at)
  VALUES ($id, $workspaceId, $unitId, $source, $startsAt, $endsAt, $note, $now, $now)`;

export function insertBlock(database, block) {
  database.prepare(insertBlockSql).run(block);
}

const blockIntervalsSql = `
  SELECT starts_at, ends_at FROM unit_blocks
  WHERE workspace_id = ? AND unit_id = ? AND starts_at < ? AND ends_at > ?
  ORDER BY starts_at`;

export function listBlockIntervals(database, { workspaceId, unitId, from, to }) {
  return database.prepare(blockIntervalsSql).all(workspaceId, unitId, to, from);
}
