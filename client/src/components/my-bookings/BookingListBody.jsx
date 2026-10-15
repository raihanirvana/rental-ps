import { listHref } from '../../lib/my-bookings-view.js';
import { Link } from '../Link.jsx';
import { ErrorNotice } from '../Notice.jsx';
import { BookingListItem } from './BookingListItem.jsx';
import { Pagination } from './Pagination.jsx';

function EmptyList({ tab, total }) {
  if (total > 0) {
    return (
      <p className="list-state">
        Halaman ini kosong.{' '}
        <Link className="text-link" to={listHref(tab)}>
          Kembali ke halaman 1
        </Link>
      </p>
    );
  }
  return (
    <div className="list-state">
      <p>{tab.empty}</p>
      <Link className="button" to="/booking">
        Buat booking
      </Link>
    </div>
  );
}

export function BookingListBody({ list, tab }) {
  if (list.status === 'error') {
    const error = { message: `Daftar booking belum bisa dimuat. ${list.error.message}` };
    return <ErrorNotice error={error} onRetry={list.retry} />;
  }
  if (list.status !== 'ready') {
    return <p className="list-state">Memuat booking…</p>;
  }
  if (list.data.items.length === 0) {
    return <EmptyList tab={tab} total={list.data.total} />;
  }
  return (
    <>
      <p className="list-count">{`${list.data.total} booking`}</p>
      <ul className="booking-list">
        {list.data.items.map((booking) => (
          <BookingListItem key={booking.id} booking={booking} />
        ))}
      </ul>
      <Pagination tab={tab} data={list.data} />
    </>
  );
}
