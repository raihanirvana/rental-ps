import { useCallback } from 'react';
import { getAgenda } from '../lib/agenda-api.js';
import { useRefreshableResource } from './useRefreshableResource.js';

function withBooking(data, booking, status) {
  if (!data) {
    return data;
  }
  return {
    ...data,
    bookings: data.bookings
      .map((item) => (item.id === booking.id ? booking : item))
      .filter((item) => !status || item.status === status),
  };
}

// Agenda per filter. Respons filter lama diabaikan (key). `refresh` memuat ulang di latar
// setelah mutasi tanpa mengosongkan tampilan; `replaceBooking` memperbarui satu baris dulu.
export function useAgenda({ date, unitId, status }) {
  const key = `${date}|${unitId}|${status}`;
  const request = useCallback(
    (signal) => getAgenda({ date, unitId, status }, signal),
    [date, unitId, status],
  );
  const resource = useRefreshableResource(key, request);
  const replaceBooking = (booking) => resource.update((data) => withBooking(data, booking, status));
  return { ...resource, replaceBooking };
}
