import { HttpError } from '../lib/http-error.js';
import { findBooking } from '../repositories/booking-repository.js';

export const bookingRoles = ['customer', 'owner'];

export function bookingNotFound() {
  return new HttpError(404, 'BOOKING_NOT_FOUND', 'Booking tidak ditemukan.');
}

// Customer hanya melihat booking asal pengunjung workspace sendiri; seed dan ID workspace
// lain 404. Owner melihat seluruh booking workspace sendiri, termasuk seed.
export function findVisibleBooking(database, auth, bookingId) {
  const row = findBooking(database, auth.workspaceId, bookingId);
  if (!row || (auth.role === 'customer' && row.source !== 'visitor')) {
    throw bookingNotFound();
  }
  return row;
}
