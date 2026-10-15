import { seedWorkspace } from '../database/seed/index.js';
import { bumpDataVersion, clearWorkspaceData } from '../repositories/workspace-repository.js';
import { withWorkspaceAccess } from './workspace-access.js';

// Satu BEGIN IMMEDIATE: sesi owner diperiksa ulang setelah kunci (logout/expiry bersamaan →
// 401, workspace tidak dihidupkan lagi), data lama dihapus, versi naik, seed relatif hari ini.
// Kegagalan di langkah mana pun mengembalikan keadaan sebelum reset.
export function resetDemo(database, auth) {
  return withWorkspaceAccess(database, auth, ['owner'], (current) => {
    clearWorkspaceData(database, current.workspaceId);
    const dataVersion = bumpDataVersion(database, current.workspaceId);
    const seeded = seedWorkspace(database, current.workspaceId, new Date());
    return { dataVersion, seeded, expiresAt: current.workspaceExpiresAt };
  });
}
