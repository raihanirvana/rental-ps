import { DatabaseSync } from 'node:sqlite';

// Fixture langsung di database sementara untuk keadaan yang tidak bisa dibuat lewat API
// (booking sedang berlangsung, workspace kedaluwarsa). Foreign key selalu aktif.
export function withDatabase(databasePath, work) {
  const database = new DatabaseSync(databasePath);
  database.exec('PRAGMA busy_timeout = 8000; PRAGMA foreign_keys = ON;');
  try {
    return work(database);
  } finally {
    database.close();
  }
}

export function shiftDate(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function wibIso(dateKey, time) {
  return new Date(`${dateKey}T${time}:00.000+07:00`).toISOString();
}

const ongoingSql = `
  INSERT INTO bookings (id, workspace_id, unit_id, reference, source, created_by_role,
    starts_at, ends_at, duration_minutes, unit_name, unit_kind, hourly_rate, total_price,
    customer_name, status, created_at, updated_at)
  SELECT $id, workspace_id, id, $reference, 'visitor', 'customer', $startsAt, $endsAt, 60,
    name, kind, hourly_rate, hourly_rate, 'Uji Berlangsung', 'confirmed', $now, $now
  FROM units WHERE id = $unitId`;

// Confirmed yang sudah mulai/berakhir kemarin; aturan larangan batal diuji pada jam apa pun.
// PS4 A kemarin kosong dalam seed; fixture tidak melewati batas jam buka pada uji malam hari.
export function insertStartedBooking(databasePath, unitId) {
  const today = new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
  const start = new Date(wibIso(shiftDate(today, -1), '10:00'));
  const params = {
    id: `verify-ongoing-${Date.now()}`,
    reference: 'SP-VERIFY',
    startsAt: start.toISOString(),
    endsAt: new Date(start.getTime() + 3600000).toISOString(),
    now: new Date().toISOString(),
    unitId,
  };
  withDatabase(databasePath, (database) => database.prepare(ongoingSql).run(params));
  return params.id;
}
