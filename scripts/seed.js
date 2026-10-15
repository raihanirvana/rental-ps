import { config } from '../server/config.js';
import { openDatabase } from '../server/database/connection.js';
import { migrateDatabase } from '../server/database/migrate.js';
import { createSeededWorkspace } from '../server/database/seed/index.js';

// Workspace contoh untuk pengembangan lokal. Ruang demo pengunjung dibuat per sesi (RPS-003).
const workspaceId = 'contoh-lokal';
const lifetimeMs = 365 * 24 * 60 * 60 * 1000;

const database = openDatabase(config.databasePath);
try {
  migrateDatabase(database);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + lifetimeMs);
  const result = createSeededWorkspace(database, { workspaceId, now, expiresAt });
  const summary = `${result.units} unit, ${result.bookings} booking, ${result.blocks} blok`;
  console.log(
    result.seeded
      ? `Seed workspace ${workspaceId}: ${summary}.`
      : `Workspace ${workspaceId} sudah berisi data contoh; seed dilewati.`,
  );
} catch (error) {
  console.error(`Seed gagal: ${error.message}`);
  process.exitCode = 1;
} finally {
  database.close();
}
