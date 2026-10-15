import { apiRequest } from './api.js';

export function getSettings(signal) {
  return apiRequest('/settings', { signal });
}

export function updateSettings(payload) {
  return apiRequest('/settings', { method: 'PATCH', body: payload });
}

// Konfirmasi eksplisit diwajibkan server; UI mengirimnya hanya setelah dialog disetujui.
export function resetDemo() {
  return apiRequest('/demo/reset', {
    method: 'POST',
    body: { confirm: true },
    observeDataVersion: false,
  });
}
