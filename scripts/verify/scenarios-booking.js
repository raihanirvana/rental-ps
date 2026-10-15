import { bookingBody, codeOf, slotReason, visitor } from './demo.js';
import { section } from './report.js';

async function firstBooking(report, demo) {
  const D1 = demo.day(1);
  const body = bookingBody(demo.units.get('PS5 A'), D1, '19:00', 120);
  const first = await demo.client.post('/api/bookings', body);
  const booking = first.json?.booking;
  const ok =
    first.status === 201 &&
    booking.totalPrice === 50000 &&
    booking.endTime === '21:00' &&
    /^SP-/.test(booking.reference);
  const detail = `${first.status} Rp${booking?.totalPrice} selesai ${booking?.endTime}`;
  report.check('PS5 A D+1 19.00 120 menit', ok, `${detail} ${booking?.reference}`);
  return booking;
}

async function conflicts(report, demo) {
  const { client, units } = demo;
  const D1 = demo.day(1);
  const post = (unit, time, minutes) =>
    client.post('/api/bookings', bookingBody(units.get(unit), D1, time, minutes));
  const overlap = await post('PS5 A', '20:30', 60);
  report.check('20.30–21.30 di atas 19.00–21.00 ditolak', overlap.status === 409, codeOf(overlap));
  const adjacent = await post('PS5 A', '21:00', 60);
  report.check('21.00–22.00 bersebelahan diterima', adjacent.status === 201, `${adjacent.status}`);
  const other = await post('PS5 B', '19:00', 120);
  report.check(
    'PS5 B 19.00–21.00 (unit berbeda) diterima',
    other.status === 201,
    `${other.status}`,
  );
}

async function priceAndConflicts(report, demo) {
  const booking = await firstBooking(report, demo);
  await conflicts(report, demo);
  return booking;
}

async function concurrentPair(report, demo) {
  const { client, units } = demo;
  const D2 = demo.day(2);
  const [a, b] = await Promise.all([
    client.post('/api/bookings', bookingBody(units.get('PS4 A'), D2, '12:00', 120)),
    client.post('/api/bookings', bookingBody(units.get('PS4 A'), D2, '13:00', 60)),
  ]);
  const statuses = [a.status, b.status].sort().join('+');
  report.check(
    'Dua request berbeda bersamaan pada interval bertabrakan',
    statuses === '201+409',
    statuses,
  );
}

async function invalidSchedules(report, demo) {
  const { client, units } = demo;
  const cases = [
    ['22.30 selama 60 menit', bookingBody(units.get('PS5 B'), demo.day(1), '22:30', 60), 400],
    ['Tanggal kemarin', bookingBody(units.get('PS5 B'), demo.day(-1), '12:00', 60), 400],
    ['Tanggal D+15', bookingBody(units.get('PS5 B'), demo.day(15), '12:00', 60), 400],
    ['Tanggal 31 Februari', bookingBody(units.get('PS5 B'), '2027-02-31', '12:00', 60), 400],
    ['Jam 19.15 di luar grid', bookingBody(units.get('PS5 B'), demo.day(1), '19:15', 60), 400],
  ];
  for (const [name, body, expected] of cases) {
    const response = await client.post('/api/bookings', body);
    report.check(
      `${name} ditolak`,
      response.status === expected,
      `${response.status} ${codeOf(response)}`,
    );
  }
  report.check(
    '22.30 tidak ditawarkan di availability',
    (await slotReason(client, units.get('PS5 B'), demo.day(1), '22:30')) === 'not-offered',
  );
}

async function forgedFields(report, demo) {
  const { client, units } = demo;
  for (const field of [
    { totalPrice: 1 },
    { hourlyRate: 1000 },
    { status: 'completed' },
    { workspaceId: 'x' },
    { role: 'owner' },
  ]) {
    const response = await client.post(
      '/api/bookings',
      bookingBody(units.get('PS4 B'), demo.day(3), '10:00', 60, field),
    );
    report.check(
      `Field palsu ${Object.keys(field)[0]} ditolak`,
      response.status === 400 && response.json.error.fields?.[Object.keys(field)[0]],
      codeOf(response),
    );
  }
}

async function idempotency(report, demo) {
  const { client, units } = demo;
  const body = bookingBody(units.get('PS4 B'), demo.day(3), '14:00', 60);
  const first = await client.post('/api/bookings', body);
  const retry = await client.post('/api/bookings', body);
  report.check(
    'Retry key + payload sama → booking yang sama',
    first.status === 201 && retry.status === 200 && retry.json.booking.id === first.json.booking.id,
    `${first.status}/${retry.status}`,
  );
  const changed = await client.post('/api/bookings', { ...body, startTime: '16:00' });
  report.check('Key sama, jam berbeda → 409', changed.status === 409, codeOf(changed));
}

export async function runBookingScenarios(report, base) {
  section('PRD §13 — booking, konflik, validasi, idempotensi');
  const demo = await visitor(base, 'customer');
  const booking = await priceAndConflicts(report, demo);
  await concurrentPair(report, demo);
  await invalidSchedules(report, demo);
  await forgedFields(report, demo);
  await idempotency(report, demo);
  return { demo, booking };
}
