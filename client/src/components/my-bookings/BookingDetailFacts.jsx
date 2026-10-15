import { formatDateKey, formatDuration, formatTimeRange } from '../../lib/booking-format.js';
import { formatRupiah, formatWibDateTime } from '../../lib/format.js';
import { roleNames } from '../../lib/routes.js';

// Unit, tarif dan nilai adalah snapshot saat booking dibuat; tidak mengikuti katalog terbaru.
export function BookingDetailFacts({ booking }) {
  return (
    <dl className="detail-list detail-list--wide">
      <dt>Unit</dt>
      <dd>{`${booking.unitName} (${booking.unitKind})`}</dd>
      <dt>Tanggal</dt>
      <dd>{formatDateKey(booking.date)}</dd>
      <dt>Jam</dt>
      <dd>{formatTimeRange(booking.startTime, booking.endTime)}</dd>
      <dt>Durasi</dt>
      <dd>{formatDuration(booking.durationMinutes)}</dd>
      <dt>Tarif saat booking</dt>
      <dd>{`${formatRupiah(booking.hourlyRate)} / jam`}</dd>
      <dt>Nilai reservasi</dt>
      <dd className="price">{formatRupiah(booking.totalPrice)}</dd>
      <dt>Pemesan</dt>
      <dd>{booking.customerName}</dd>
      <dt>Nomor HP</dt>
      <dd>{booking.phone ?? 'Tidak diisi'}</dd>
      <dt>Dibuat</dt>
      <dd>{formatWibDateTime(booking.createdAt)}</dd>
    </dl>
  );
}

export function CancellationFacts({ booking }) {
  if (booking.status !== 'cancelled') {
    return null;
  }
  return (
    <dl className="detail-list detail-list--wide cancellation-facts">
      <dt>Dibatalkan</dt>
      <dd>{formatWibDateTime(booking.cancelledAt)}</dd>
      <dt>Oleh</dt>
      <dd>{roleNames[booking.cancelledBy] ?? booking.cancelledBy}</dd>
      <dt>Alasan</dt>
      <dd>{booking.cancelReason ?? 'Tanpa alasan'}</dd>
    </dl>
  );
}
