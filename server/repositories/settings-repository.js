const insertSettingsSql = `
  INSERT INTO business_settings (workspace_id, business_name, address, contact_note, updated_at)
  VALUES ($workspaceId, $businessName, $address, $contactNote, $updatedAt)`;

export function insertSettings(database, settings) {
  database.prepare(insertSettingsSql).run(settings);
}
