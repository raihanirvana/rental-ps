import { HttpError } from '../lib/http-error.js';
import { completeBookingRow } from '../repositories/agenda-repository.js';
import { findBooking } from '../repositories/booking-repository.js';
import { bookingNotFound } from './booking-access.js';
import { toAgendaBooking } from './agenda-view.js';
import { withWorkspaceAccess } from './workspace-access.js';

const statusErrors = {
  cancelled: [409, 'INVALID_STATUS', 'Booking yang dibatalkan tidak bisa ditandai selesai.'],
  notEnded: [
    409,
    'BOOKING_NOT_ENDED',
    'Booking baru bisa ditandai selesai setelah waktunya berakhir.',
  ],
};

function assertCompletable(row, now) {
  const problem =
    row.status === 'cancelled' ? 'cancelled' : row.ends_at > now.toISOString() ? 'notEnded' : null;
  if (problem) {
    const [status, code, message] = statusErrors[problem];
    throw new HttpError(status, code, message);
  }
}

// Diperiksa ulang setelah kunci tulis: completed hanya dari confirmed yang sudah berakhir.
// Completed yang diulang mengembalikan keadaan yang sama tanpa efek baru.
export function completeBooking(database, auth, bookingId) {
  return withWorkspaceAccess(database, auth, ['owner'], (current) => {
    const now = new Date();
    const row = findBooking(database, current.workspaceId, bookingId);
    if (!row) {
      throw bookingNotFound();
    }
    let changed = false;
    if (row.status !== 'completed') {
      assertCompletable(row, now);
      const change = { workspaceId: current.workspaceId, bookingId, now: now.toISOString() };
      changed = completeBookingRow(database, change);
    }
    const updated = findBooking(database, current.workspaceId, bookingId);
    return { booking: toAgendaBooking(updated, now), changed };
  });
}
