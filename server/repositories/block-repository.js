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

const blockColumns = `
  block.id, block.unit_id, block.source, block.starts_at, block.ends_at, block.note,
  unit.name AS unit_name`;

export function findBlock(database, workspaceId, blockId) {
  return database
    .prepare(
      `SELECT ${blockColumns} FROM unit_blocks AS block
       JOIN units AS unit ON unit.id = block.unit_id
       WHERE block.workspace_id = ? AND block.id = ?`,
    )
    .get(workspaceId, blockId);
}

// Blok yang belum berakhir, untuk halaman Unit & jadwal.
export function listUpcomingBlocks(database, workspaceId, nowIso) {
  return database
    .prepare(
      `SELECT ${blockColumns} FROM unit_blocks AS block
       JOIN units AS unit ON unit.id = block.unit_id
       WHERE block.workspace_id = ? AND block.ends_at > ?
       ORDER BY block.starts_at, unit.name`,
    )
    .all(workspaceId, nowIso);
}

export function deleteBlockRow(database, workspaceId, blockId) {
  return database
    .prepare('DELETE FROM unit_blocks WHERE workspace_id = ? AND id = ?')
    .run(workspaceId, blockId).changes;
}
