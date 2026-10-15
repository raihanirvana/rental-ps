import { wibTimeLabel } from '../lib/wib-time.js';
import { toBookingDetail } from './booking-view.js';

// Booking agenda pemilik: detail lengkap + penanda data contoh + boleh ditandai selesai.
export function toAgendaBooking(row, now) {
  return {
    ...toBookingDetail(row, 'owner', now),
    isSample: row.source === 'seed',
    canComplete: row.status === 'confirmed' && row.ends_at <= now.toISOString(),
  };
}

export function toAgendaBlock(row) {
  const startsAt = new Date(row.starts_at);
  const endsAt = new Date(row.ends_at);
  return {
    id: row.id,
    unitId: row.unit_id,
    startTime: wibTimeLabel(startsAt),
    endTime: wibTimeLabel(endsAt),
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    note: row.note,
    isSample: row.source === 'seed',
  };
}

// Ringkasan dari booking yang tampil menurut filter; cancelled tidak pernah dihitung.
// Sedang main = confirmed dengan mulai <= waktu server < selesai. Nilai reservasi adalah
// jumlah snapshot total, bukan pendapatan diterima.
export function summarizeAgenda(bookings) {
  const counted = bookings.filter((booking) => booking.status !== 'cancelled');
  return {
    bookingCount: counted.length,
    ongoingCount: counted.filter((booking) => booking.timeState === 'ongoing').length,
    scheduledMinutes: counted.reduce((sum, booking) => sum + booking.durationMinutes, 0),
    reservationValue: counted.reduce((sum, booking) => sum + booking.totalPrice, 0),
  };
}
