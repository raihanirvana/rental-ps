import { HttpError } from '../lib/http-error.js';

const bodyErrors = {
  'entity.parse.failed': { status: 400, code: 'INVALID_JSON', message: 'Format JSON tidak valid.' },
  'entity.too.large': {
    status: 413,
    code: 'BODY_TOO_LARGE',
    message: 'Ukuran JSON maksimal 100 KB.',
  },
};

const databaseBusy = {
  status: 503,
  code: 'DATABASE_BUSY',
  message: 'Jadwal sedang diperbarui. Coba lagi sebentar.',
};

// Pesan RAISE dari trigger database (pengaman terakhir) dipetakan ke konflik yang jelas.
const triggerErrors = {
  SCHEDULE_CONFLICT: {
    status: 409,
    code: 'SLOT_UNAVAILABLE',
    message: 'Jadwal bentrok dengan booking atau blok lain.',
  },
  INVALID_STATUS_TRANSITION: {
    status: 409,
    code: 'INVALID_STATUS',
    message: 'Status booking tidak bisa diubah.',
  },
  UNIT_LIMIT_REACHED: {
    status: 409,
    code: 'UNIT_LIMIT_REACHED',
    message: 'Maksimal 20 unit per ruang demo.',
  },
  'units.workspace_id, units.name': {
    status: 409,
    code: 'UNIT_NAME_TAKEN',
    message: 'Nama unit sudah dipakai di ruang demo ini.',
  },
  BOOKING_IMMUTABLE: {
    status: 409,
    code: 'BOOKING_IMMUTABLE',
    message: 'Jadwal booking tidak bisa diubah. Batalkan lalu buat booking baru.',
  },
};

function describeDatabaseError(error) {
  if ([5, 6].includes(error.errcode & 255)) {
    return databaseBusy;
  }
  const key = Object.keys(triggerErrors).find((name) => error.message?.includes(name));
  return key ? triggerErrors[key] : null;
}

const internalError = {
  status: 500,
  code: 'INTERNAL_ERROR',
  message: 'Permintaan belum bisa diproses.',
};

// Path API yang tidak dikenal selalu JSON, tidak pernah jatuh ke HTML SPA.
export function apiNotFound(_request, _response, next) {
  next(new HttpError(404, 'NOT_FOUND', 'Endpoint API tidak ditemukan.'));
}

function describeError(error) {
  if (error instanceof HttpError) {
    const { status, code, message, fields } = error;
    return { status, code, message, fields };
  }
  const databaseError = error.code === 'ERR_SQLITE_ERROR' ? describeDatabaseError(error) : null;
  return databaseError ?? bodyErrors[error.type] ?? internalError;
}

export function errorHandler(error, request, response, _next) {
  const { status, code, message, fields } = describeError(error);
  if (status >= 500) {
    console.error(`[${request.requestId}] ${error.message}`);
  }
  if (code === 'DATABASE_BUSY') {
    response.set('Retry-After', '1');
  }
  response.status(status).json({
    error: { code, message, ...(fields ? { fields } : {}), requestId: request.requestId },
  });
}
