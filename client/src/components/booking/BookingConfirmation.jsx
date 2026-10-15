import { useEffect, useRef } from 'react';
import { formatDateKey, formatDuration, formatTimeRange } from '../../lib/booking-format.js';
import { formatRupiah } from '../../lib/format.js';
import { Link } from '../Link.jsx';

function ConfirmationDetails({ booking }) {
  return (
    <dl className="detail-list detail-list--wide">
      <dt>Nomor reservasi</dt>
      <dd className="reference">{booking.reference}</dd>
      <dt>Pemesan</dt>
      <dd>{booking.customerName}</dd>
      <dt>Unit</dt>
      <dd>{`${booking.unitName} (${booking.unitKind})`}</dd>
      <dt>Tanggal</dt>
      <dd>{formatDateKey(booking.date)}</dd>
      <dt>Jam</dt>
      <dd>{formatTimeRange(booking.startTime, booking.endTime)}</dd>
      <dt>Durasi</dt>
      <dd>{formatDuration(booking.durationMinutes)}</dd>
      <dt>Nilai reservasi</dt>
      <dd className="price">{formatRupiah(booking.totalPrice)}</dd>
      <dt>Pembayaran</dt>
      <dd>Bayar di tempat</dd>
    </dl>
  );
}

function ConfirmationNotes({ result, quoteTotal }) {
  const changed = quoteTotal !== null && quoteTotal !== result.booking.totalPrice;
  return (
    <>
      {result.replayed ? (
        <p>Permintaan yang sama sudah tercatat sebelumnya; ini booking yang sama.</p>
      ) : null}
      {result.booking.status === 'cancelled' ? <p>Booking ini sudah dibatalkan.</p> : null}
      {changed ? <p>Tarif berubah sejak jadwal dimuat. Nilai di atas mengikuti server.</p> : null}
    </>
  );
}

// Hasil akhir dari respons server (snapshot), bukan dari pilihan di browser.
export function BookingConfirmation({ result, quoteTotal, onNewBooking }) {
  const headingRef = useRef(null);
  useEffect(() => headingRef.current?.focus(), []);
  return (
    <section className="confirmation" aria-labelledby="confirmation-title">
      <span className="pill pill--green">Booking tercatat</span>
      <h2 id="confirmation-title" ref={headingRef} tabIndex={-1}>
        Jadwal main tercatat.
      </h2>
      <p>Tunjukkan nomor reservasi saat datang. Pembayaran dilakukan di tempat.</p>
      <ConfirmationDetails booking={result.booking} />
      <ConfirmationNotes result={result} quoteTotal={quoteTotal} />
      <div className="confirmation-actions">
        <Link className="button" to="/booking-saya">
          Lihat booking saya
        </Link>
        <button type="button" className="button button--white" onClick={onNewBooking}>
          Buat booking lain
        </button>
      </div>
    </section>
  );
}
