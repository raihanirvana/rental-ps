import { navigationFor } from '../lib/routes.js';
import { AccountActions } from './AccountActions.jsx';
import { Brand } from './Brand.jsx';
import { Link } from './Link.jsx';

function AppNav({ session, currentPath }) {
  return (
    <nav className="app-nav" aria-label={`Navigasi ${session.roleLabel.toLowerCase()}`}>
      {navigationFor(session.role).map((route) => (
        <Link
          key={route.path}
          to={route.path}
          aria-current={route.path === currentPath ? 'page' : undefined}
        >
          {route.title}
        </Link>
      ))}
    </nav>
  );
}

export function AppHeader({ session, currentPath }) {
  return (
    <header className="app-header">
      <div className="wrap site-header">
        <Brand />
        <AppNav session={session} currentPath={currentPath} />
        <AccountActions session={session} />
      </div>
    </header>
  );
}
