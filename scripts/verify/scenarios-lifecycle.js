import { bookingBody, codeOf, slotReason } from './demo.js';
import { insertStartedBooking, withDatabase } from './fixtures.js';
import { section } from './report.js';

// Lead time bergantung jam uji: pakai slot grid berikutnya bila < 15 menit, atau slot yang
// sudah lewat hari ini. Di luar itu dicatat sebagai tidak bisa diuji pada jam ini.
function leadTimeCandidate(now = new Date()) {
  const wib = new Date(now.getTime() + 7 * 3600000);
  const minutes = wib.getUTCHours() * 60 + wib.getUTCMinutes();
  const next = Math.ceil(minutes / 30) * 30;
  const past = Math.floor(minutes / 30) * 30 - 30;
  const pick = next - minutes < 15 && next >= 600 && next <= 1320 ? next : past;
  const label = (value) =>
    `${String(Math.floor(value / 60)).padStart(2, '0')}:${value % 60 ? '30' : '00'}`;
  return pick >= 600 && pick <= 1320 ? label(pick) : null;
}

async function leadTime(report, demo) {
  const time = leadTimeCandidate();
  if (!time) {
    report.note(
      'Lead time 15 menit',
      'jam uji di luar jam buka; dicek lewat dokumentasi RPS-004/005',
    );
    return;
  }
  const unit = demo.units.get('PS4 B');
  const response = await demo.client.post('/api/bookings', bookingBody(unit, demo.today, time, 60));
  const reason = await slotReason(demo.client, unit, demo.today, time);
  report.check(
    `Hari ini ${time} (lewat/<15 menit) ditolak`,
    response.status === 400 && reason !== 'available',
    `${codeOf(response)}, slot ${reason}`,
  );
}

async function blockedSlot(report, owner, unit, D4) {
  const block = { unitId: unit, date: D4, startTime: '12:00', endTime: '14:00' };
  const blocked = await owner.client.post('/api/owner/blocks', block);
  const direct = await owner.client.post('/api/bookings', bookingBody(unit, D4, '13:00', 60));
  const reason = await slotReason(owner.client, unit, D4, '13:00');
  const ok = blocked.status === 201 && direct.status === 409 && reason === 'blocked';
  report.check(
    'Slot diblokir tidak tersedia, POST langsung ditolak',
    ok,
    `${reason}, ${codeOf(direct)}`,
  );
}

async function blocks(report, demo, owner) {
  const unit = owner.units.get('PS4 A');
  const D4 = owner.day(4);
  await owner.client.post('/api/bookings', bookingBody(unit, D4, '18:00', 120));
  await blockedSlot(report, owner, unit, D4);
  const block = { unitId: unit, date: D4, startTime: '19:00', endTime: '20:00' };
  const onBooking = await owner.client.post('/api/owner/blocks', block);
  report.check(
    'Blok menabrak booking aktif → 409, booking tetap',
    onBooking.status === 409,
    codeOf(onBooking),
  );
}

async function cancellations(report, demo, databasePath) {
  const unit = demo.units.get('PS5 B');
  const created = await demo.client.post(
    '/api/bookings',
    bookingBody(unit, demo.day(5), '15:00', 60),
  );
  const cancel = await demo.client.post(`/api/bookings/${created.json.booking.id}/cancel`, {});
  const reason = await slotReason(demo.client, unit, demo.day(5), '15:00');
  report.check(
    'Customer batal sebelum mulai → cancelled, slot bebas',
    cancel.json?.booking?.status === 'cancelled' && reason === 'available',
    reason,
  );
  await startedCancellation(report, demo, databasePath);
}

async function startedCancellation(report, demo, databasePath) {
  const bookingId = insertStartedBooking(databasePath, demo.units.get('PS4 A'));
  const response = await demo.client.post(`/api/bookings/${bookingId}/cancel`, {});
  const status = withDatabase(
    databasePath,
    (db) => db.prepare('SELECT status FROM bookings WHERE id = ?').get(bookingId).status,
  );
  report.check(
    'Customer batal setelah mulai ditolak, status tetap',
    response.status === 409 && status === 'confirmed',
    `${codeOf(response)}, ${status}`,
  );
}

async function snapshotAndDeactivate(report, owner, booking) {
  const unit = owner.units.get('PS5 A');
  await owner.client.patch(`/api/owner/units/${unit}`, { name: 'PS5 Pro A', hourlyRate: 40000 });
  const detail = await owner.client.get(`/api/bookings/${booking.id}`);
  const snapshot = detail.json?.booking;
  report.check(
    'Unit/tarif berubah, detail lama tetap snapshot',
    snapshot?.unitName === 'PS5 A' &&
      snapshot.hourlyRate === 25000 &&
      snapshot.totalPrice === 50000,
    `${snapshot?.unitName} Rp${snapshot?.hourlyRate}`,
  );
  const deactivate = await owner.client.patch(`/api/owner/units/${unit}`, { isActive: false });
  report.check(
    'Nonaktif unit dengan booking mendatang → 409, tetap aktif',
    deactivate.status === 409,
    codeOf(deactivate),
  );
}

export async function runLifecycleScenarios(report, base, databasePath, booking, demo) {
  section('PRD §13 — lead time, blok, batal, snapshot, nonaktif');
  await leadTime(report, demo);
  const owner = { ...demo };
  await owner.client.post('/api/demo/sessions', { role: 'owner' });
  await blocks(report, demo, owner);
  await owner.client.post('/api/demo/sessions', { role: 'customer' });
  await cancellations(report, demo, databasePath);
  await owner.client.post('/api/demo/sessions', { role: 'owner' });
  await snapshotAndDeactivate(report, owner, booking);
}
