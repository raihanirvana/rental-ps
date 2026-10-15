import { roleHome, roleNames } from '../../lib/routes.js';
import { Brand } from '../Brand.jsx';
import { Link } from '../Link.jsx';

function OwnerAction({ session, demo }) {
  if (session) {
    return (
      <Link className="button button--quiet" to={roleHome[session.role]}>
        Lanjutkan sebagai {roleNames[session.role]}
      </Link>
    );
  }
  const busy = demo.pendingRole === 'owner';
  return (
    <button
      type="button"
      className="button button--quiet"
      onClick={() => demo.start('owner', roleHome.owner)}
      disabled={demo.pendingRole !== null}
    >
      {busy ? 'Menyiapkan…' : 'Coba sebagai pemilik'}
    </button>
  );
}

export function LandingHeader({ session, demo }) {
  return (
    <header className="site-header">
      <Brand />
      <nav className="header-nav" aria-label="Navigasi utama">
        <a className="desktop-link" href="#unit">
          Unit &amp; tarif
        </a>
        <a className="desktop-link" href="#cara-booking">
          Cara booking
        </a>
        <OwnerAction session={session} demo={demo} />
      </nav>
    </header>
  );
}
