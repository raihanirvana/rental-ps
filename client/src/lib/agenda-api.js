import { apiRequest } from './api.js';

export function getAgenda({ date, unitId, status }, signal) {
  const query = new URLSearchParams();
  if (date) {
    query.set('date', date);
  }
  if (unitId) {
    query.set('unitId', unitId);
  }
  if (status) {
    query.set('status', status);
  }
  const suffix = query.size > 0 ? `?${query}` : '';
  return apiRequest(`/owner/agenda${suffix}`, { signal });
}

export function completeBooking(id) {
  return apiRequest(`/owner/bookings/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: { status: 'completed' },
  });
}
