import { BookingListBody } from '../components/my-bookings/BookingListBody.jsx';
import { BookingTabs } from '../components/my-bookings/BookingTabs.jsx';
import { useMyBookings } from '../hooks/useMyBookings.js';
import { readListQuery } from '../lib/my-bookings-view.js';

// Tab dan halaman disimpan di URL sehingga refresh/tab baru menampilkan daftar yang sama.
export function MyBookingsPage({ searchParams }) {
  const { tab, page } = readListQuery(searchParams);
  const list = useMyBookings(tab, page);
  return (
    <>
      <div className="page-intro">
        <h1>Booking saya.</h1>
        <p>
          Booking yang dibuat di ruang demo ini. Data contoh pemilik tidak ditampilkan di sini.
          Pembayaran tetap di tempat.
        </p>
      </div>
      <BookingTabs current={tab} />
      <section
        className="booking-list-section"
        aria-label={`Booking ${tab.label.toLowerCase()}`}
        aria-busy={list.status === 'loading'}
      >
        <BookingListBody list={list} tab={tab} />
      </section>
    </>
  );
}
