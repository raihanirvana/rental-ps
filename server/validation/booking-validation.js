import { HttpError } from '../lib/http-error.js';
import { scheduleRules } from '../lib/schedule-rules.js';
import { isValidDateKey } from '../lib/wib-time.js';
import { isPlainObject } from './common.js';

const bookingKeys = [
  'unitId',
  'date',
  'startTime',
  'durationMinutes',
  'customerName',
  'phone',
  'idempotencyKey',
];
const unitIdPattern = /^[A-Za-z0-9-]{8,64}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const keyPattern = /^[A-Za-z0-9_-]{8,100}$/;
const phonePattern = /^\+?\d{8,15}$/;
// Karakter kontrol tidak boleh masuk nama/alasan yang nanti ditampilkan.
const controlPattern = /\p{Cc}/u;

export function invalidInput(message, fields) {
  return new HttpError(400, 'VALIDATION_ERROR', message, fields);
}

export function unknownFieldErrors(body, allowed) {
  const fields = Object.create(null);
  for (const key of Object.keys(body)) {
    if (!allowed.includes(key)) {
      fields[key] = 'Field tidak dikenal atau ditentukan server.';
    }
  }
  return fields;
}

function validateName(value) {
  if (typeof value !== 'string') {
    return 'Nama wajib diisi.';
  }
  const name = value.trim();
  if (name.length < 2 || name.length > 60) {
    return 'Nama 2–60 karakter.';
  }
  return controlPattern.test(value) ? 'Nama berisi karakter yang tidak diizinkan.' : null;
}

// Spasi dan tanda hubung dibuang; sisanya harus 8–15 digit dengan awalan + opsional.
export function normalizePhone(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  return typeof value === 'string' ? value.replace(/[\s-]/g, '') : undefined;
}

function validatePhone(value) {
  if (typeof value === 'string' && controlPattern.test(value)) {
    return 'Nomor HP tidak boleh berisi karakter kontrol.';
  }
  const phone = normalizePhone(value);
  if (phone === null) {
    return null;
  }
  return phone && phonePattern.test(phone) ? null : 'Nomor HP 8–15 digit, boleh diawali +.';
}

function scheduleFieldErrors(body) {
  const fields = {};
  if (typeof body.unitId !== 'string' || !unitIdPattern.test(body.unitId)) {
    fields.unitId = 'Pilih unit yang valid.';
  }
  if (!isValidDateKey(body.date)) {
    fields.date = 'Gunakan tanggal YYYY-MM-DD yang valid.';
  }
  if (typeof body.startTime !== 'string' || !timePattern.test(body.startTime)) {
    fields.startTime = 'Gunakan jam HH:mm.';
  }
  if (!scheduleRules.durationsMinutes.includes(body.durationMinutes)) {
    fields.durationMinutes = 'Durasi harus 60, 120 atau 180 menit.';
  }
  return fields;
}

function contactFieldErrors(body) {
  const fields = {};
  const nameError = validateName(body.customerName);
  const phoneError = validatePhone(body.phone);
  if (nameError) {
    fields.customerName = nameError;
  }
  if (phoneError) {
    fields.phone = phoneError;
  }
  if (typeof body.idempotencyKey !== 'string' || !keyPattern.test(body.idempotencyKey)) {
    fields.idempotencyKey = 'Kunci permintaan tidak valid. Muat ulang halaman.';
  }
  return fields;
}

// Harga, total, status, workspace dan peran tidak pernah diterima dari client.
export function parseCreateBooking(body) {
  if (!isPlainObject(body)) {
    throw invalidInput('Kirim data booking dalam JSON.');
  }
  const fields = {
    ...unknownFieldErrors(body, bookingKeys),
    ...scheduleFieldErrors(body),
    ...contactFieldErrors(body),
  };
  if (Object.keys(fields).length > 0) {
    throw invalidInput('Periksa kembali data booking.', fields);
  }
  return {
    unitId: body.unitId,
    date: body.date,
    startTime: body.startTime,
    durationMinutes: body.durationMinutes,
    customerName: body.customerName.trim(),
    phone: normalizePhone(body.phone),
    idempotencyKey: body.idempotencyKey,
  };
}
