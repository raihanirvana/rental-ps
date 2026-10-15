const insertBlockSql = `
  INSERT INTO unit_blocks (id, workspace_id, unit_id, source, starts_at, ends_at, note,
    created_at, updated_at)
  VALUES ($id, $workspaceId, $unitId, $source, $startsAt, $endsAt, $note, $now, $now)`;

export function insertBlock(database, block) {
  database.prepare(insertBlockSql).run(block);
}
