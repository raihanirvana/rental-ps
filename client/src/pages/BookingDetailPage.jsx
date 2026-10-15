import { useState } from 'react';
import { CancelBookingDialog } from '../components/my-bookings/CancelBookingDialog.jsx';
import { BookingDetailView } from '../components/my-bookings/BookingDetailView.jsx';
import { Link } from '../components/Link.jsx';
import { ErrorNotice, RefreshErrorNotice } from '../components/Notice.jsx';
import { useBookingDetail } from '../hooks/useBookingDetail.js';
import { useCancelBooking } from '../hooks/useCancelBooking.js';
import { cancelledNotice, rejectedNotice } from '../lib/cancel-notices.js';

// Seed, booking workspace lain dan ID asing → 404 dari server, dengan teks yang sama.
function DetailFallback({ detail }) {
  if (detail.status === 'error' && detail.error.status === 404) {
    return (
      <div className="status-screen">
        <h1>Booking tidak ditemukan.</h1>
        <p>Booking ini tidak ada di ruang demomu atau bukan booking yang kamu buat.</p>
        <div className="status-actions">
          <Link className="button" to="/booking-saya">
            Ke booking saya
          </Link>
        </div>
      </div>
    );
  }
  if (detail.status === 'error') {
    return <ErrorNotice error={detail.error} onRetry={detail.retry} />;
  }
  return <p aria-busy="true">Memuat detail booking…</p>;
}

function DetailWithCancel({ detail }) {
  const [notice, setNotice] = useState(null);
  const booking = detail.data.booking;
  const cancel = useCancelBooking(booking, {
    onCancelled: (result) => {
      detail.replace(result.booking);
      setNotice(cancelledNotice(result));
    },
    onRejected: (error) => {
      setNotice(rejectedNotice(error));
      detail.refresh();
    },
  });
  return (
    <>
      <BookingDetailView
        booking={booking}
        notice={notice}
        onDismissNotice={() => setNotice(null)}
        onCancel={cancel.open}
      />
      <CancelBookingDialog booking={booking} cancel={cancel} />
    </>
  );
}

export function BookingDetailPage({ params }) {
  const detail = useBookingDetail(params.id);
  return detail.status === 'ready' ? (
    <>
      <RefreshErrorNotice resource={detail} />
      <DetailWithCancel key={detail.data.booking.id} detail={detail} />
    </>
  ) : (
    <DetailFallback detail={detail} />
  );
}
