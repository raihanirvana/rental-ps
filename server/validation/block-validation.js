import { HttpError } from '../lib/http-error.js';
import { isValidDateKey } from '../lib/wib-time.js';
import { isPlainObject } from './common.js';
import { invalidInput, unknownFieldErrors } from './booking-validation.js';

const blockKeys = ['unitId', 'date', 'startTime', 'endTime', 'note'];
const idPattern = /^[A-Za-z0-9-]{8,64}$/;
// Grid 30 menit; akhir boleh tepat 23:00.
const gridTime = /^([01]\d|2[0-3]):(00|30)$/;
const controlPattern = /\p{Cc}/u;

export function parseBlockId(value) {
  if (!idPattern.test(value)) {
    throw new HttpError(404, 'BLOCK_NOT_FOUND', 'Blok tidak ditemukan.');
  }
  return value;
}

function shapeErrors(body) {
  const fields = unknownFieldErrors(body, blockKeys);
  if (typeof body.unitId !== 'string' || !idPattern.test(body.unitId)) {
    fields.unitId = 'Pilih unit yang valid.';
  }
  if (!isValidDateKey(body.date)) {
    fields.date = 'Gunakan tanggal YYYY-MM-DD yang valid.';
  }
  if (typeof body.startTime !== 'string' || !gridTime.test(body.startTime)) {
    fields.startTime = 'Jam mulai kelipatan 30 menit (HH:00/HH:30).';
  }
  if (
    typeof body.endTime !== 'string' ||
    !(gridTime.test(body.endTime) || body.endTime === '23:00')
  ) {
    fields.endTime = 'Jam selesai kelipatan 30 menit (HH:00/HH:30).';
  }
  return fields;
}

function noteError(note) {
  if (note === undefined || note === null) {
    return null;
  }
  const valid = typeof note === 'string' && !controlPattern.test(note) && note.trim().length <= 120;
  return valid ? null : 'Catatan maksimal 120 karakter tanpa karakter kontrol.';
}

export function parseCreateBlock(body) {
  if (!isPlainObject(body)) {
    throw invalidInput('Kirim data blok dalam JSON.');
  }
  const fields = shapeErrors(body);
  const note = noteError(body.note);
  if (note) {
    fields.note = note;
  }
  if (Object.keys(fields).length > 0) {
    throw invalidInput('Periksa kembali data blok.', fields);
  }
  const { unitId, date, startTime, endTime } = body;
  return { unitId, date, startTime, endTime, note: (body.note ?? '').trim() };
}
