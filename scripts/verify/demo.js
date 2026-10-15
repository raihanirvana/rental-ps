import { createClient } from './http.js';
import { shiftDate } from './fixtures.js';

let keyCounter = 0;

export function nextKey(prefix = 'verify') {
  keyCounter += 1;
  return `${prefix}-${Date.now()}-${keyCounter}`;
}

// Pengunjung baru (cookie jar sendiri) yang masuk demo dengan peran tertentu.
export async function visitor(base, role) {
  const client = createClient(base);
  const response = await client.post('/api/demo/sessions', { role });
  if (response.status !== 201) {
    throw new Error(`Login demo gagal: ${response.status} ${response.text}`);
  }
  const catalog = (await client.get('/api/catalog')).json;
  const units = new Map(catalog.units.map((unit) => [unit.name, unit.id]));
  return {
    client,
    catalog,
    units,
    today: catalog.serverDate,
    day: (n) => shiftDate(catalog.serverDate, n),
  };
}

export function bookingBody(unitId, date, startTime, durationMinutes, extra = {}) {
  return {
    unitId,
    date,
    startTime,
    durationMinutes,
    customerName: 'Uji Verifikasi',
    idempotencyKey: nextKey(),
    ...extra,
  };
}

export async function slotReason(client, unitId, date, startTime, durationMinutes = 60) {
  const query = new URLSearchParams({ unitId, date, durationMinutes: String(durationMinutes) });
  const response = await client.get(`/api/availability?${query}`);
  const slot = response.json?.slots?.find((item) => item.startTime === startTime);
  return slot ? (slot.reason ?? 'available') : 'not-offered';
}

export function codeOf(response) {
  return response.json?.error?.code ?? String(response.status);
}
