import { withWorkspaceReadAccess } from './workspace-access.js';
import { listVisitorBookings } from '../repositories/booking-repository.js';
import { findVisibleBooking } from './booking-access.js';
import { toBookingDetail, toBookingSummary } from './booking-view.js';

function mineResponse(result, auth, query, now) {
  return {
    view: query.view,
    items: result.rows.map((row) => toBookingSummary(row, auth.role, now)),
    total: result.total,
    limit: query.limit,
    offset: query.offset,
    serverTime: now.toISOString(),
  };
}

// Sesi dan daftar dibaca dalam snapshot yang sama agar logout/rotasi tidak menyela.
export function listMyBookings(database, auth, query) {
  return withWorkspaceReadAccess(database, auth, (current) => {
    const now = new Date();
    const params = { workspaceId: current.workspaceId, now: now.toISOString(), ...query };
    return mineResponse(listVisitorBookings(database, params), current, query, now);
  });
}

export function getBookingDetail(database, auth, bookingId) {
  return withWorkspaceReadAccess(database, auth, (current) => {
    const now = new Date();
    const row = findVisibleBooking(database, current, bookingId);
    return { booking: toBookingDetail(row, current.role, now), serverTime: now.toISOString() };
  });
}
