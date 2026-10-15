import { agendaStateLabels } from '../../lib/agenda-view.js';
import { formatTimeRange } from '../../lib/booking-format.js';
import { BookingDetailFacts, CancellationFacts } from '../my-bookings/BookingDetailFacts.jsx';

export function BookingDetailBody({ booking }) {
  return (
    <>
      <p>
        <span className="pill pill--neutral">
          {booking.isSample ? 'Data contoh' : 'Booking pengunjung'}
        </span>{' '}
        <span className={`status-badge status-badge--${booking.timeState}`}>
          {agendaStateLabels[booking.timeState]}
        </span>
      </p>
      <BookingDetailFacts booking={booking} />
      <CancellationFacts booking={booking} />
    </>
  );
}

export function BlockDetailBody({ block, unitName }) {
  return (
    <>
      <p>
        <span className="status-badge status-badge--blocked">Diblokir</span>
      </p>
      <dl className="detail-list detail-list--wide">
        <dt>Unit</dt>
        <dd>{unitName}</dd>
        <dt>Jam</dt>
        <dd>{formatTimeRange(block.startTime, block.endTime)}</dd>
        <dt>Catatan</dt>
        <dd>{block.note || 'Tanpa catatan'}</dd>
      </dl>
      <p>Blok dibuat dan dihapus di halaman Unit &amp; jadwal.</p>
    </>
  );
}
