const insertSettingsSql = `
  INSERT INTO business_settings (workspace_id, business_name, address, contact_note, updated_at)
  VALUES ($workspaceId, $businessName, $address, $contactNote, $updatedAt)`;

export function insertSettings(database, settings) {
  database.prepare(insertSettingsSql).run(settings);
}

export function findSettings(database, workspaceId) {
  return database
    .prepare(
      `SELECT business_name, address, contact_note FROM business_settings
       WHERE workspace_id = ?`,
    )
    .get(workspaceId);
}
