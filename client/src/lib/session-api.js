import { apiRequest } from './api.js';

export function getSession(signal) {
  return apiRequest('/session', { signal, notifyUnauthorized: false });
}

// Tanpa sesi aktif membuat ruang demo baru; dengan sesi aktif mengganti peran di
// workspace yang sama. Body hanya berisi peran; workspace ditentukan server.
export function startDemoSession(role) {
  return apiRequest('/demo/sessions', { method: 'POST', body: { role } });
}

export function endDemoSession() {
  return apiRequest('/session', { method: 'DELETE' });
}

export function getCatalog(signal) {
  return apiRequest('/catalog', { signal });
}
