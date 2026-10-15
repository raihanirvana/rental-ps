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
  if (error.code === 'ERR_SQLITE_ERROR' && [5, 6].includes(error.errcode & 255)) {
    return databaseBusy;
  }
  return bodyErrors[error.type] ?? internalError;
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
