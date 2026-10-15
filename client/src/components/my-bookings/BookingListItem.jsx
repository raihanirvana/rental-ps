import { formatDateKey, formatDuration, formatTimeRange } from '../../lib/booking-format.js';
import { formatRupiah } from '../../lib/format.js';
import { Link } from '../Link.jsx';
import { StatusBadge } from './StatusBadge.jsx';

// Snapshot unit/harga saat booking dibuat, langsung dari respons server.
export function BookingListItem({ booking }) {
  const time = formatTimeRange(booking.startTime, booking.endTime);
  return (
    <li className="booking-item">
      <div className="booking-item-top">
        <strong className="booking-ref">{booking.reference}</strong>
        <StatusBadge timeState={booking.timeState} />
      </div>
      <dl className="booking-facts">
        <dt>Unit</dt>
        <dd>{`${booking.unitName} (${booking.unitKind})`}</dd>
        <dt>Jadwal</dt>
        <dd>{`${formatDateKey(booking.date)}, ${time}`}</dd>
        <dt>Durasi</dt>
        <dd>{formatDuration(booking.durationMinutes)}</dd>
        <dt>Nilai reservasi</dt>
        <dd className="price">{formatRupiah(booking.totalPrice)}</dd>
      </dl>
      <Link className="text-link booking-item-link" to={`/booking-saya/${booking.id}`}>
        Lihat detail<span className="visually-hidden"> booking {booking.reference}</span>
      </Link>
    </li>
  );
}
