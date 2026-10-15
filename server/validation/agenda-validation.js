import { isValidDateKey } from '../lib/wib-time.js';
import { isPlainObject } from './common.js';
import { invalidInput, unknownFieldErrors } from './booking-validation.js';

const unitIdPattern = /^[A-Za-z0-9-]{8,64}$/;
export const agendaStatuses = ['confirmed', 'completed', 'cancelled'];

function single(value) {
  return typeof value === 'string' ? value : undefined;
}

// Semua parameter opsional; tanpa parameter tanggal berarti hari ini WIB menurut server.
// Peran/workspace di query tidak dikenal dan ditolak, bukan dipercaya.
export function parseAgendaQuery(query) {
  const fields = unknownFieldErrors(query, ['date', 'unitId', 'status']);
  const [date, unitId, status] = [single(query.date), single(query.unitId), single(query.status)];
  if (query.date !== undefined && !isValidDateKey(date)) {
    fields.date = 'Gunakan tanggal YYYY-MM-DD yang valid.';
  }
  if (query.unitId !== undefined && !unitIdPattern.test(unitId ?? '')) {
    fields.unitId = 'ID unit tidak valid.';
  }
  if (query.status !== undefined && !agendaStatuses.includes(status)) {
    fields.status = 'Status harus confirmed, completed atau cancelled.';
  }
  if (Object.keys(fields).length > 0) {
    throw invalidInput('Filter agenda tidak valid.', fields);
  }
  return { date: date ?? null, unitId: unitId ?? null, status: status ?? null };
}

// PATCH status pemilik hanya untuk menandai selesai; pembatalan memakai endpoint cancel.
export function parseStatusBody(body) {
  if (!isPlainObject(body)) {
    throw invalidInput('Kirim status dalam JSON.');
  }
  const fields = unknownFieldErrors(body, ['status']);
  if (body.status !== 'completed') {
    fields.status = 'Pemilik hanya dapat menetapkan status completed di sini.';
  }
  if (Object.keys(fields).length > 0) {
    throw invalidInput('Perubahan status tidak valid.', fields);
  }
  return { status: 'completed' };
}
