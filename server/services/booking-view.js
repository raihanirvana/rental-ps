import { wibDateKey, wibTimeLabel } from '../lib/wib-time.js';

// Status tampilan dihitung dari waktu server: booking confirmed bisa sedang berlangsung
// atau sudah berakhir tetapi belum ditandai selesai oleh pemilik.
function timeState(row, now) {
  if (row.status !== 'confirmed') {
    return row.status;
  }
  const nowIso = now.toISOString();
  if (row.ends_at <= nowIso) {
    return 'ended';
  }
  return row.starts_at <= nowIso ? 'ongoing' : 'upcoming';
}

// Pelanggan hanya membatalkan confirmed sebelum mulai. Pemilik boleh membatalkan confirmed,
// termasuk yang sedang berlangsung (PRD §8). Cancelled/completed bersifat terminal.
export function canCancel(row, role, now) {
  const state = timeState(row, now);
  return state === 'upcoming' || (role === 'owner' && row.status === 'confirmed');
}

export function toBookingSummary(row, role, now) {
  const startsAt = new Date(row.starts_at);
  const endsAt = new Date(row.ends_at);
  return {
    id: row.id,
    reference: row.reference,
    unitName: row.unit_name,
    unitKind: row.unit_kind,
    date: wibDateKey(startsAt),
    startTime: wibTimeLabel(startsAt),
    endTime: wibTimeLabel(endsAt),
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    durationMinutes: row.duration_minutes,
    totalPrice: row.total_price,
    status: row.status,
    timeState: timeState(row, now),
    canCancel: canCancel(row, role, now),
  };
}

// Nilai reservasi adalah snapshot saat booking dibuat; pembayaran di tempat, tidak dicatat.
export function toBookingDetail(row, role, now) {
  return {
    ...toBookingSummary(row, role, now),
    unitId: row.unit_id,
    hourlyRate: row.hourly_rate,
    customerName: row.customer_name,
    phone: row.phone,
    source: row.source,
    createdByRole: row.created_by_role,
    createdAt: row.created_at,
    cancelledAt: row.cancelled_at,
    cancelledBy: row.cancelled_by,
    cancelReason: row.cancel_reason,
    completedAt: row.completed_at,
    payment: 'pay_at_venue',
  };
}
