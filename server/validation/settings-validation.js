import { isPlainObject } from './common.js';
import { invalidInput, unknownFieldErrors } from './booking-validation.js';

// Hanya identitas usaha contoh. Jam buka, horizon dan durasi tetap mengikuti PRD.
const limits = {
  businessName: { min: 2, max: 60, label: 'Nama usaha 2–60 karakter.' },
  address: { min: 2, max: 150, label: 'Alamat 2–150 karakter.' },
  contactNote: { min: 0, max: 200, label: 'Teks kontak maksimal 200 karakter.' },
};
const controlPattern = /\p{Cc}/u;

function fieldError(key, value) {
  const { min, max, label } = limits[key];
  if (typeof value !== 'string' || controlPattern.test(value)) {
    return `${label} Tanpa karakter kontrol.`;
  }
  const length = value.trim().length;
  return length < min || length > max ? label : null;
}

export function parseSettingsPatch(body) {
  if (!isPlainObject(body)) {
    throw invalidInput('Kirim pengaturan dalam JSON.');
  }
  const fields = unknownFieldErrors(body, Object.keys(limits));
  const patch = {};
  for (const key of Object.keys(limits)) {
    if (body[key] === undefined) {
      continue;
    }
    const error = fieldError(key, body[key]);
    if (error) {
      fields[key] = error;
    } else {
      patch[key] = body[key].trim();
    }
  }
  if (Object.keys(fields).length > 0 || Object.keys(patch).length === 0) {
    throw invalidInput('Periksa kembali pengaturan usaha.', fields);
  }
  return patch;
}

// Reset menghapus data ruang demo, jadi body wajib berisi konfirmasi eksplisit.
export function parseResetBody(body) {
  const fields = isPlainObject(body) ? unknownFieldErrors(body, ['confirm']) : {};
  if (!isPlainObject(body) || body.confirm !== true || Object.keys(fields).length > 0) {
    throw invalidInput('Kirim { "confirm": true } untuk mereset data demo.', fields);
  }
  return { confirm: true };
}
