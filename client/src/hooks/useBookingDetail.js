import { useCallback } from 'react';
import { getBooking } from '../lib/my-bookings-api.js';
import { useRefreshableResource } from './useRefreshableResource.js';

// Detail selalu dari API (snapshot server), bukan dari katalog atau daftar sebelumnya.
export function useBookingDetail(id) {
  const request = useCallback((signal) => getBooking(id, signal), [id]);
  const resource = useRefreshableResource(id, request);
  const replace = (booking) => resource.update((data) => ({ ...data, booking }));
  return { ...resource, replace };
}
