import { bookingTabs, listHref } from '../../lib/my-bookings-view.js';
import { Link } from '../Link.jsx';

export function BookingTabs({ current }) {
  return (
    <nav className="booking-tabs" aria-label="Kategori booking">
      {bookingTabs.map((tab) => (
        <Link
          key={tab.param}
          to={listHref(tab)}
          aria-current={tab.param === current.param ? 'page' : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
