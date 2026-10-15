import { apiRequest } from './api.js';

export function getAvailability({ unitId, date, durationMinutes }, signal) {
  const query = new URLSearchParams({ unitId, date, durationMinutes: String(durationMinutes) });
  return apiRequest(`/availability?${query}`, { signal });
}

// Harga, total, status dan workspace tidak pernah dikirim; server yang menentukan.
export function createBooking(payload, signal) {
  return apiRequest('/bookings', { method: 'POST', body: payload, signal });
}
