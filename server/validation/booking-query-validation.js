import { HttpError } from '../lib/http-error.js';
import { isPlainObject } from './common.js';
import { invalidInput, unknownFieldErrors } from './booking-validation.js';

const bookingIdPattern = /^[A-Za-z0-9-]{8,64}$/;
const views = ['upcoming', 'finished', 'cancelled'];
const maxLimit = 50;
const controlPattern = /[\p{Cc}]/u;

// ID dengan format asing diperlakukan sama seperti booking yang tidak ada.
export function parseBookingId(value) {
  if (!bookingIdPattern.test(value)) {
    throw new HttpError(404, 'BOOKING_NOT_FOUND', 'Booking tidak ditemukan.');
  }
  return value;
}

function readInteger(value, fallback, min, max) {
  if (value === undefined) {
    return fallback;
  }
  const number = typeof value === 'string' && /^\d{1,6}$/.test(value) ? Number(value) : NaN;
  return number >= min && number <= max ? number : null;
}

export function parseMineQuery(query) {
  const fields = unknownFieldErrors(query, ['view', 'limit', 'offset']);
  const view = query.view ?? 'upcoming';
  const limit = readInteger(query.limit, 20, 1, maxLimit);
  const offset = readInteger(query.offset, 0, 0, 100000);
  if (!views.includes(view)) {
    fields.view = 'Pilih upcoming, finished atau cancelled.';
  }
  if (limit === null) {
    fields.limit = `Limit 1–${maxLimit}.`;
  }
  if (offset === null) {
    fields.offset = 'Offset harus bilangan bulat ≥ 0.';
  }
  if (Object.keys(fields).length > 0) {
    throw invalidInput('Parameter daftar booking tidak valid.', fields);
  }
  return { view, limit, offset };
}

// Body pembatalan opsional: hanya `reason` (≤200 karakter). Kosong dianggap tanpa alasan.
export function parseCancelBody(body) {
  const value = body ?? {};
  if (!isPlainObject(value)) {
    throw invalidInput('Kirim alasan pembatalan dalam JSON.');
  }
  const fields = unknownFieldErrors(value, ['reason']);
  const reason = typeof value.reason === 'string' ? value.reason.trim() : value.reason;
  const validType = reason === undefined || reason === null || typeof reason === 'string';
  const controls = typeof value.reason === 'string' && controlPattern.test(value.reason);
  if (!validType || controls || (reason && reason.length > 200)) {
    fields.reason = 'Alasan maksimal 200 karakter tanpa karakter kontrol.';
  }
  if (Object.keys(fields).length > 0) {
    throw invalidInput('Periksa kembali data pembatalan.', fields);
  }
  return { reason: reason ? reason : null };
}
