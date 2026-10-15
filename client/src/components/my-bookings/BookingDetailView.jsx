import { Link } from '../Link.jsx';
import { Notice } from '../Notice.jsx';
import { BookingDetailFacts, CancellationFacts } from './BookingDetailFacts.jsx';
import { StatusBadge } from './StatusBadge.jsx';

function CancelAction({ booking, onCancel }) {
  if (booking.canCancel) {
    return (
      <button type="button" className="button button--white" onClick={onCancel}>
        Batalkan booking
      </button>
    );
  }
  if (booking.status === 'confirmed') {
    return (
      <p className="detail-note">Booking yang sudah dimulai tidak bisa dibatalkan pelanggan.</p>
    );
  }
  return null;
}

function DetailHeader({ booking }) {
  return (
    <div className="page-intro detail-intro">
      <Link className="text-link back-link" to="/booking-saya">
        ← Booking saya
      </Link>
      <h1>{booking.reference}</h1>
      <StatusBadge timeState={booking.timeState} />
    </div>
  );
}

export function BookingDetailView({ booking, notice, onDismissNotice, onCancel }) {
  return (
    <>
      <DetailHeader booking={booking} />
      {notice ? (
        <Notice tone={notice.tone} onDismiss={onDismissNotice}>
          {notice.message}
        </Notice>
      ) : null}
      <section className="panel detail-panel" aria-labelledby="detail-title">
        <h2 id="detail-title">Detail reservasi</h2>
        <BookingDetailFacts booking={booking} />
        <CancellationFacts booking={booking} />
        <p className="detail-note">
          Pembayaran dilakukan di tempat. Aplikasi tidak mencatat pembayaran.
        </p>
        <CancelAction booking={booking} onCancel={onCancel} />
      </section>
    </>
  );
}
