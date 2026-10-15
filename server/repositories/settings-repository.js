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

const updateSettingsSql = `
  UPDATE business_settings
  SET business_name = $businessName, address = $address, contact_note = $contactNote,
    updated_at = $updatedAt
  WHERE workspace_id = $workspaceId`;

export function updateSettingsRow(database, settings) {
  database.prepare(updateSettingsSql).run(settings);
}

export function findSettingsRow(database, workspaceId) {
  return database
    .prepare(
      `SELECT business_name, address, contact_note, updated_at FROM business_settings
       WHERE workspace_id = ?`,
    )
    .get(workspaceId);
}
