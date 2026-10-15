import { withTransaction } from '../database/transaction.js';
import { deleteExpiredWorkspaces } from '../repositories/workspace-repository.js';

// Hanya workspace dengan expires_at <= sekarang; workspace aktif tidak tersentuh.
export function cleanupExpiredWorkspaces(database, now = new Date()) {
  return withTransaction(database, () => deleteExpiredWorkspaces(database, now.toISOString()));
}

function runCleanup(database) {
  try {
    const removed = cleanupExpiredWorkspaces(database);
    if (removed > 0) {
      console.log(`Cleanup: ${removed} workspace kedaluwarsa dihapus.`);
    }
  } catch (error) {
    console.error(`Cleanup workspace gagal: ${error.message}`);
  }
}

export function scheduleWorkspaceCleanup(database, intervalMs) {
  runCleanup(database);
  const timer = setInterval(() => runCleanup(database), intervalMs);
  timer.unref();
  return timer;
}
