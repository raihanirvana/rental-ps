import { apiRequest } from './api.js';

export function listMyBookings({ view, limit, offset }, signal) {
  const query = new URLSearchParams({ view, limit: String(limit), offset: String(offset) });
  return apiRequest(`/bookings/mine?${query}`, { signal });
}

export function getBooking(id, signal) {
  return apiRequest(`/bookings/${encodeURIComponent(id)}`, { signal });
}

// Body selalu JSON; alasan kosong dikirim sebagai objek tanpa field.
export function cancelBooking(id, reason) {
  const body = reason ? { reason } : {};
  return apiRequest(`/bookings/${encodeURIComponent(id)}/cancel`, { method: 'POST', body });
}
