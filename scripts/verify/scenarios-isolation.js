import { bookingBody, codeOf, slotReason, visitor } from './demo.js';
import { withDatabase } from './fixtures.js';
import { section } from './report.js';

async function twoVisitors(report, base, first) {
  const second = await visitor(base, 'customer');
  const D1 = second.day(1);
  const reason = await slotReason(second.client, second.units.get('PS5 A'), D1, '19:00', 120);
  report.check(
    'Pengunjung kedua: slot 19.00 PS5 A tetap kosong di workspace-nya',
    reason === 'available',
    reason,
  );
  const mine = await second.client.get('/api/bookings/mine');
  report.check(
    'Pengunjung kedua tidak melihat booking pengunjung pertama',
    mine.json.total === 0,
    `total ${mine.json.total}`,
  );
  const foreign = await second.client.get(`/api/bookings/${first.booking.id}`);
  report.check('Detail booking workspace lain → 404', foreign.status === 404, codeOf(foreign));
  return second;
}

async function resetIsolation(report, owner, second) {
  const before = (await second.client.get('/api/bookings/mine')).json.total;
  const units = (await second.client.get('/api/catalog')).json.units.length;
  await owner.client.post('/api/demo/sessions', { role: 'owner' });
  const reset = await owner.client.post('/api/demo/reset', { confirm: true });
  const after = (await second.client.get('/api/bookings/mine')).json.total;
  const unitsAfter = (await second.client.get('/api/catalog')).json.units.length;
  report.check(
    'Reset pengunjung pertama tidak mengubah pengunjung kedua',
    reset.status === 200 && before === after && units === unitsAfter,
    `v${reset.json?.dataVersion}`,
  );
}

async function resetVersusBooking(report, owner) {
  const catalog = (await owner.client.get('/api/catalog')).json;
  const unit = catalog.units.find((item) => item.name === 'PS4 B').id;
  const [booking, reset] = await Promise.all([
    owner.client.post('/api/bookings', bookingBody(unit, owner.day(6), '11:00', 60)),
    owner.client.post('/api/demo/reset', { confirm: true }),
  ]);
  const mine = (await owner.client.get('/api/bookings/mine')).json.total;
  const consistent =
    reset.status === 200 && (booking.status === 404 || (booking.status === 201 && mine === 0));
  report.check(
    'Reset bersamaan booking → data konsisten',
    consistent,
    `booking ${codeOf(booking)}, reset ${reset.status}, booking pengunjung sesudah ${mine}`,
  );
}

const findWorkspaceSql = 'SELECT workspace_id AS id FROM units WHERE id = ?';
const expireWorkspaceSql = `UPDATE workspaces
  SET created_at = ?, expires_at = ?
  WHERE id = ?`;
const expireSessionsSql = `UPDATE sessions
  SET created_at = ?, expires_at = ?
  WHERE workspace_id = ?`;

// Fixture: memajukan masa berlaku workspace pengunjung ke masa lalu (tanpa mengubah jam mesin).
function expireWorkspace(databasePath, unitId, startedAt) {
  const expired = new Date(Date.parse(startedAt) - 60000).toISOString();
  const created = new Date(Date.parse(expired) - 3600000).toISOString();
  withDatabase(databasePath, (db) => {
    const workspace = db.prepare(findWorkspaceSql).get(unitId);
    db.prepare(expireWorkspaceSql).run(created, expired, workspace.id);
    db.prepare(expireSessionsSql).run(created, expired, workspace.id);
  });
}

async function expiry(report, demo, databasePath) {
  const session = (await demo.client.get('/api/session')).json.session;
  expireWorkspace(databasePath, demo.units.get('PS5 A'), session.startedAt);
  const expired = await demo.client.get('/api/session');
  const personal = await demo.client.get('/api/bookings/mine');
  const ok =
    expired.status === 401 && codeOf(expired) === 'SESSION_EXPIRED' && personal.status === 401;
  report.check(
    'Sesi habis → 401 SESSION_EXPIRED, tanpa data',
    ok,
    `${codeOf(expired)}/${personal.status}`,
  );
}

export async function runIsolationScenarios(report, base, databasePath, first) {
  section('PRD §13 — dua pengunjung, reset, expiry');
  const second = await twoVisitors(report, base, first);
  await resetIsolation(report, first.demo, second);
  await resetVersusBooking(report, first.demo);
  await expiry(report, second, databasePath);
}
