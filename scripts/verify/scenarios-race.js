import { createClient } from './http.js';
import { bookingBody, visitor } from './demo.js';
import { shiftDate, wibIso, withDatabase } from './fixtures.js';
import { section } from './report.js';

// Klien kedua memakai cookie yang sama tetapi menembak proses server lain (file SQLite sama).
function twin(demo, otherBase) {
  const client = createClient(otherBase);
  for (const [name, value] of demo.client.jar) {
    client.jar.set(name, value);
  }
  return client;
}

async function bookingRaces(report, demo, other) {
  const unit = demo.units.get('PS5 B');
  const outcomes = [];
  for (let round = 0; round < 6; round += 1) {
    const date = demo.day(7);
    const time = `${10 + round}:00`;
    const [a, b] = await Promise.all([
      demo.client.post('/api/bookings', bookingBody(unit, date, time, 60)),
      other.post('/api/bookings', bookingBody(unit, date, time, 60)),
    ]);
    outcomes.push([a.status, b.status].sort().join('+'));
  }
  report.check(
    'Booking vs booking antarproses (6 ronde)',
    outcomes.every((item) => item === '201+409'),
    outcomes.join(' '),
  );
}

async function blockRaces(report, demo, other) {
  const unit = demo.units.get('PS4 A');
  const outcomes = [];
  for (let round = 0; round < 6; round += 1) {
    const time = `${10 + round}:00`;
    const block = { unitId: unit, date: demo.day(8), startTime: time, endTime: `${10 + round}:30` };
    const [a, b] = await Promise.all([
      demo.client.post('/api/bookings', bookingBody(unit, demo.day(8), time, 60)),
      other.post('/api/owner/blocks', block),
    ]);
    outcomes.push(`${a.status}/${b.status}`);
  }
  const ok = outcomes.every((item) => ['201/409', '409/201'].includes(item));
  report.check('Booking vs blok antarproses (6 ronde)', ok, outcomes.join(' '));
}

const endedSql = `
  INSERT INTO bookings (id, workspace_id, unit_id, reference, source, created_by_role,
    starts_at, ends_at, duration_minutes, unit_name, unit_kind, hourly_rate, total_price,
    customer_name, status, created_at, updated_at)
  SELECT $id, workspace_id, id, $reference, 'visitor', 'customer', $startsAt, $endsAt, 60,
    name, kind, hourly_rate, hourly_rate, 'Uji Berakhir', 'confirmed', $now, $now
  FROM units WHERE id = $unitId`;

// Fixture: booking confirmed kemarin yang sudah berakhir (bisa ditandai selesai/dibatalkan).
function insertEnded(databasePath, unitId, dateKey, hour) {
  const params = {
    id: `verify-ended-${hour}-${Date.now()}`,
    reference: `SP-END${hour}`,
    startsAt: wibIso(dateKey, `${hour}:00`),
    endsAt: wibIso(dateKey, `${hour + 1}:00`),
    now: new Date().toISOString(),
    unitId,
  };
  withDatabase(databasePath, (db) => db.prepare(endedSql).run(params));
  return params.id;
}

async function statusRaces(report, demo, other, databasePath) {
  const yesterday = shiftDate(demo.today, -1);
  const outcomes = [];
  for (let round = 0; round < 6; round += 1) {
    const id = insertEnded(databasePath, demo.units.get('PS5 B'), yesterday, 10 + round);
    const complete = () =>
      demo.client.patch(`/api/owner/bookings/${id}/status`, { status: 'completed' });
    const cancel = () => other.post(`/api/bookings/${id}/cancel`, {});
    const [a, b] = await Promise.all(round % 2 ? [complete(), cancel()] : [cancel(), complete()]);
    outcomes.push([a.status, b.status].sort().join('+'));
  }
  report.check(
    'Cancel vs complete antarproses (6 ronde): satu transisi sah',
    outcomes.every((item) => item === '200+409'),
    outcomes.join(' '),
  );
}

export async function runRaceScenarios(report, baseA, baseB, databasePath) {
  section('Race antar dua proses server (SQLite sama)');
  const demo = await visitor(baseA, 'owner');
  const other = twin(demo, baseB);
  await bookingRaces(report, demo, other);
  await blockRaces(report, demo, other);
  await statusRaces(report, demo, other, databasePath);
  const integrity = withDatabase(databasePath, (db) => [
    db.prepare('PRAGMA integrity_check').get().integrity_check,
    db.prepare('PRAGMA foreign_key_check').all().length,
  ]);
  report.check(
    'Integritas database setelah race',
    integrity[0] === 'ok' && integrity[1] === 0,
    integrity.join(', '),
  );
}
