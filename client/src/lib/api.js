import { isCurrentSessionRevision, sessionRevision } from './session-revision.js';

// Klien API satu origin. Cookie sesi HttpOnly dikirim browser; JavaScript tidak pernah
// membaca/menyimpan token, dan tidak memakai localStorage untuk sesi atau booking.
export class ApiError extends Error {
  constructor({ status, code, message, fields, requestId }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
    this.requestId = requestId;
  }
}

const unauthorizedListeners = new Set();

// Dipanggil pada setiap 401 agar UI langsung mengosongkan sesi yang tidak berlaku.
export function onUnauthorized(listener) {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

function networkError() {
  return new ApiError({
    status: 0,
    code: 'NETWORK_ERROR',
    message: 'Server belum bisa dihubungi. Periksa koneksi, lalu coba lagi.',
  });
}

function invalidResponse() {
  return new ApiError({
    status: 0,
    code: 'INVALID_RESPONSE',
    message: 'Respons server belum bisa dibaca. Coba lagi.',
  });
}

async function parseJsonResponse(response) {
  try {
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError' || response.ok) {
      throw error.name === 'AbortError' ? error : invalidResponse();
    }
    return null;
  }
}

async function readPayload(response) {
  if (response.status === 204) {
    return null;
  }
  const type = response.headers.get('content-type') ?? '';
  const payload = type.includes('application/json') ? await parseJsonResponse(response) : null;
  if (response.ok && (!payload || typeof payload !== 'object' || Array.isArray(payload))) {
    throw invalidResponse();
  }
  return payload;
}

function toApiError(response, payload) {
  const error = payload?.error ?? {};
  return new ApiError({
    status: response.status,
    code: typeof error.code === 'string' ? error.code : 'SERVER_ERROR',
    message:
      typeof error.message === 'string'
        ? error.message
        : 'Server sedang bermasalah. Coba lagi sebentar.',
    fields: error.fields,
    requestId: error.requestId,
  });
}

async function sendRequest(path, { method = 'GET', body, signal }) {
  try {
    return await fetch(`/api${path}`, {
      method,
      signal,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    throw error.name === 'AbortError' ? error : networkError();
  }
}

export async function apiRequest(path, options = {}) {
  const revision = sessionRevision();
  const response = await sendRequest(path, options);
  const payload = await readPayload(response);
  if (response.ok) {
    return payload;
  }
  const error = toApiError(response, payload);
  if (
    response.status === 401 &&
    options.notifyUnauthorized !== false &&
    isCurrentSessionRevision(revision)
  ) {
    unauthorizedListeners.forEach((listener) => listener(error));
  }
  throw error;
}
