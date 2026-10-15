import { listHref } from '../../lib/my-bookings-view.js';
import { Link } from '../Link.jsx';

function PageLink({ tab, page, show, children }) {
  if (!show) {
    return <span />;
  }
  return (
    <Link className="button button--white button--small" to={listHref(tab, page)}>
      {children}
    </Link>
  );
}

// Label halaman berasal dari data yang sudah dimuat (offset/limit/total server).
export function Pagination({ tab, data }) {
  const page = Math.floor(data.offset / data.limit) + 1;
  const pages = Math.max(1, Math.ceil(data.total / data.limit));
  if (pages <= 1) {
    return null;
  }
  return (
    <nav className="pagination" aria-label="Halaman booking">
      <PageLink tab={tab} page={page - 1} show={page > 1}>
        Sebelumnya
      </PageLink>
      <span aria-current="page">{`Halaman ${page} dari ${pages}`}</span>
      <PageLink tab={tab} page={page + 1} show={page < pages}>
        Berikutnya
      </PageLink>
    </nav>
  );
}
