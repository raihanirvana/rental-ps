import { HttpError } from '../lib/http-error.js';

function hasBody(request) {
  return Boolean(request.get('transfer-encoding')) || Number(request.get('content-length')) > 0;
}

// Endpoint berbody hanya menerima application/json; form/text dari situs lain tidak diproses.
export function requireJsonBody(request, _response, next) {
  if (hasBody(request) && request.is('application/json') === false) {
    next(new HttpError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Kirim data dalam format JSON.'));
    return;
  }
  next();
}
