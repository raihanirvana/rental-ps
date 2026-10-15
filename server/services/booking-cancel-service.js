import { HttpError } from '../lib/http-error.js';
import { cancelBookingRow, findBooking } from '../repositories/booking-repository.js';
import { bookingRoles, findVisibleBooking } from './booking-access.js';
import { canCancel, toBookingDetail } from './booking-view.js';
import { withWorkspaceAccess } from './workspace-access.js';

function cancelRejection(row, role) {
  if (row.status === 'completed') {
    return ['BOOKING_COMPLETED', 'Booking sudah selesai dan tidak bisa dibatalkan.'];
  }
  if (role === 'customer') {
    return ['BOOKING_STARTED', 'Booking yang sudah dimulai tidak bisa dibatalkan pelanggan.'];
  }
  return ['INVALID_STATUS', 'Status booking tidak bisa diubah.'];
}

// Pembatalan ulang dengan alasan sama mengembalikan keadaan yang sama tanpa efek baru.
function repeatCancel(row, reason) {
  if ((row.cancel_reason ?? null) !== reason) {
    const message = 'Booking sudah dibatalkan dengan alasan berbeda.';
    throw new HttpError(409, 'ALREADY_CANCELLED', message);
  }
  return false;
}

function applyCancel(database, auth, row, reason, now) {
  if (row.status === 'cancelled') {
    return repeatCancel(row, reason);
  }
  if (!canCancel(row, auth.role, now)) {
    const [code, message] = cancelRejection(row, auth.role);
    throw new HttpError(409, code, message);
  }
  const change = { workspaceId: auth.workspaceId, bookingId: row.id, role: auth.role, reason };
  return cancelBookingRow(database, { ...change, now: now.toISOString() });
}

// Aturan status dicek ulang di dalam transaksi tulis setelah sesi diperiksa ulang.
export function cancelBooking(database, auth, bookingId, { reason }) {
  return withWorkspaceAccess(database, auth, bookingRoles, (current) => {
    const now = new Date();
    const row = findVisibleBooking(database, current, bookingId);
    const changed = applyCancel(database, current, row, reason, now);
    const updated = findBooking(database, current.workspaceId, bookingId);
    return { booking: toBookingDetail(updated, current.role, now), changed };
  });
}
