import { scheduleRules } from '../lib/schedule-rules.js';
import { findSettingsRow, updateSettingsRow } from '../repositories/settings-repository.js';
import { withWorkspaceAccess, withWorkspaceReadAccess } from './workspace-access.js';

function toSettingsView(row, dataVersion) {
  return {
    settings: {
      businessName: row.business_name,
      address: row.address,
      contactNote: row.contact_note,
      updatedAt: row.updated_at,
    },
    rules: scheduleRules,
    dataVersion,
  };
}

// Dibaca semua peran di workspace sendiri; jam buka/horizon/durasi tetap (tidak bisa diubah).
export function getSettings(database, auth) {
  return withWorkspaceReadAccess(database, auth, (current) =>
    toSettingsView(findSettingsRow(database, current.workspaceId), current.dataVersion),
  );
}

export function updateSettings(database, auth, patch) {
  return withWorkspaceAccess(database, auth, ['owner'], (current) => {
    const row = findSettingsRow(database, current.workspaceId);
    const next = {
      businessName: patch.businessName ?? row.business_name,
      address: patch.address ?? row.address,
      contactNote: patch.contactNote ?? row.contact_note,
      updatedAt: new Date().toISOString(),
      workspaceId: current.workspaceId,
    };
    updateSettingsRow(database, next);
    return toSettingsView(findSettingsRow(database, current.workspaceId), current.dataVersion);
  });
}
