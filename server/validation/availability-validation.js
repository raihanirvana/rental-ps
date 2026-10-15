import { HttpError } from '../lib/http-error.js';
import { scheduleRules } from '../lib/schedule-rules.js';
import { isValidDateKey } from '../lib/wib-time.js';

const allowedKeys = new Set(['unitId', 'date', 'durationMinutes']);
const unitIdPattern = /^[A-Za-z0-9-]{8,64}$/;
const durationValues = new Set(scheduleRules.durationsMinutes.map(String));

function invalid(fields) {
  return new HttpError(400, 'VALIDATION_ERROR', 'Parameter ketersediaan tidak valid.', fields);
}

// Nilai query harus satu string; parameter ganda (?date=a&date=b) dianggap ambigu.
function collectFieldErrors(query) {
  const fields = Object.create(null);
  for (const key of Object.keys(query)) {
    if (!allowedKeys.has(key)) {
      fields[key] = 'Parameter tidak dikenal.';
    }
  }
  if (typeof query.unitId !== 'string' || !unitIdPattern.test(query.unitId)) {
    fields.unitId = 'ID unit tidak valid.';
  }
  if (!isValidDateKey(query.date)) {
    fields.date = 'Gunakan tanggal YYYY-MM-DD yang valid.';
  }
  if (typeof query.durationMinutes !== 'string' || !durationValues.has(query.durationMinutes)) {
    fields.durationMinutes = 'Durasi harus 60, 120 atau 180 menit.';
  }
  return fields;
}

export function parseAvailabilityQuery(query) {
  const fields = collectFieldErrors(query);
  if (Object.keys(fields).length > 0) {
    throw invalid(fields);
  }
  return {
    unitId: query.unitId,
    date: query.date,
    durationMinutes: Number(query.durationMinutes),
  };
}
