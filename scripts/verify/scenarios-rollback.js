import { withDatabase } from './fixtures.js';
import { bookingBody, codeOf, visitor } from './demo.js';

const tables = [
  'sessions',
  'units',
  'bookings',
  'unit_blocks',
  'business_settings',
  'booking_requests',
];

function snapshot(databasePath, workspaceId) {
  return withDatabase(databasePath, (db) =>
    JSON.stringify([
      db.prepare('SELECT * FROM workspaces WHERE id = ?').get(workspaceId),
      ...tables.map((table) =>
        db.prepare(`SELECT * FROM ${table} WHERE workspace_id = ? ORDER BY rowid`).all(workspaceId),
      ),
    ]),
  );
}

async function failedReset(databasePath, client) {
  withDatabase(databasePath, (db) =>
    db.exec(`CREATE TRIGGER verify_seed_failure
    BEFORE INSERT ON units WHEN NEW.name = 'PS5 A'
    BEGIN SELECT RAISE(ABORT, 'PRIVATE-VERIFY seed failure'); END`),
  );
  try {
    return await client.post('/api/demo/reset', { confirm: true });
  } finally {
    withDatabase(databasePath, (db) => db.exec('DROP TRIGGER verify_seed_failure'));
  }
}

export async function runRollbackScenario(report, base, databasePath) {
  const demo = await visitor(base, 'owner');
  const unitId = demo.units.get('PS5 A');
  await demo.client.patch('/api/settings', { businessName: 'Uji Verifikasi rollback' });
  await demo.client.post('/api/bookings', bookingBody(unitId, demo.day(1), '19:00', 60));
  const workspace = withDatabase(
    databasePath,
    (db) => db.prepare('SELECT workspace_id FROM units WHERE id = ?').get(unitId).workspace_id,
  );
  const before = snapshot(databasePath, workspace);
  const response = await failedReset(databasePath, demo.client);
  report.check(
    'Seed reset gagal di tengah transaksi: snapshot pulih seluruhnya',
    response.status === 500 && snapshot(databasePath, workspace) === before,
  );
  report.check(
    'Error internal tidak memantulkan pesan database/input privat',
    codeOf(response) === 'INTERNAL_ERROR' &&
      Boolean(response.json?.error?.requestId) &&
      !response.text.includes('PRIVATE-VERIFY'),
  );
}
