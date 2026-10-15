import { HttpError } from '../lib/http-error.js';
import { isPlainObject } from './common.js';
import { invalidInput, unknownFieldErrors } from './booking-validation.js';

const unitKeys = ['name', 'kind', 'hourlyRate', 'isActive'];
const idPattern = /^[A-Za-z0-9-]{8,64}$/;
const controlPattern = /\p{Cc}/u;

export function parseUnitId(value) {
  if (!idPattern.test(value)) {
    throw new HttpError(404, 'UNIT_NOT_FOUND', 'Unit tidak ditemukan.');
  }
  return value;
}

// Karakter kontrol diperiksa pada nilai mentah sebelum trim.
const validators = {
  name: (value) =>
    typeof value === 'string' &&
    !controlPattern.test(value) &&
    value.trim().length >= 2 &&
    value.trim().length <= 40
      ? null
      : 'Nama unit 2–40 karakter tanpa karakter kontrol.',
  kind: (value) => (value === 'PS4' || value === 'PS5' ? null : 'Jenis harus PS4 atau PS5.'),
  hourlyRate: (value) =>
    Number.isInteger(value) && value >= 1000 && value <= 1000000
      ? null
      : 'Tarif harus bilangan bulat Rp1.000–Rp1.000.000.',
  isActive: (value) => (typeof value === 'boolean' ? null : 'Status aktif harus true/false.'),
};

function collectErrors(body, required) {
  const fields = unknownFieldErrors(body, unitKeys);
  for (const key of unitKeys) {
    const missing = body[key] === undefined;
    const error = missing
      ? required.includes(key)
        ? 'Wajib diisi.'
        : null
      : validators[key](body[key]);
    if (error) {
      fields[key] = error;
    }
  }
  return fields;
}

function normalize(body) {
  const unit = {};
  for (const key of unitKeys) {
    if (body[key] !== undefined) {
      unit[key] = key === 'name' ? body.name.trim() : body[key];
    }
  }
  return unit;
}

function parseUnitBody(body, required) {
  if (!isPlainObject(body)) {
    throw invalidInput('Kirim data unit dalam JSON.');
  }
  const fields = collectErrors(body, required);
  if (Object.keys(fields).length > 0) {
    throw invalidInput('Periksa kembali data unit.', fields);
  }
  return normalize(body);
}

export function parseCreateUnit(body) {
  return { isActive: true, ...parseUnitBody(body, ['name', 'kind', 'hourlyRate']) };
}

export function parseUpdateUnit(body) {
  const unit = parseUnitBody(body, []);
  if (Object.keys(unit).length === 0) {
    throw invalidInput('Kirim minimal satu perubahan unit.');
  }
  return unit;
}
