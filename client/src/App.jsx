import { AppShell } from './components/AppShell.jsx';
import { useRouteFocus } from './hooks/useRouteFocus.js';
import { useSession } from './hooks/useSession.js';
import { useLocation } from './lib/router.js';
import { matchRoute } from './lib/routes.js';
import { SignInRequired, WrongRoleScreen } from './pages/AccessPages.jsx';
import { BookingPage } from './pages/BookingPage.jsx';
import { DestinationPage } from './pages/DestinationPage.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { LoadingScreen, NotFoundPage, SessionErrorScreen } from './pages/StatusPages.jsx';
import { SessionProvider } from './session/SessionProvider.jsx';

const pages = { booking: BookingPage };

// Halaman di-mount ulang per ruang demo + peran, sehingga respons dari sesi sebelumnya
// (mis. booking yang selesai setelah logout/ganti peran) tidak pernah ditampilkan.
function RoutePage({ route, location, session }) {
  const Page = pages[route.page] ?? DestinationPage;
  const key = `${session.workspace.createdAt}:${session.startedAt}:${route.page}`;
  return <Page key={key} page={route.page} searchParams={location.searchParams} />;
}

// Pemeriksaan peran di UI hanya untuk navigasi; server tetap menolak request yang tidak sah.
function locationHref({ pathname, searchParams }) {
  return searchParams.size > 0 ? `${pathname}?${searchParams}` : pathname;
}

function ProtectedRoute({ route, location }) {
  const { status, session, error, notice, reload } = useSession();
  const href = locationHref(location);
  if (status === 'loading') {
    return <LoadingScreen />;
  }
  if (status === 'error') {
    return <SessionErrorScreen error={error} onRetry={reload} />;
  }
  if (!session) {
    return <SignInRequired route={route} href={href} expired={notice?.kind === 'expired'} />;
  }
  if (session.role !== route.role) {
    return <WrongRoleScreen route={route} href={href} session={session} />;
  }
  return (
    <AppShell currentPath={route.path}>
      <RoutePage route={route} location={location} session={session} />
    </AppShell>
  );
}

function Routes() {
  const location = useLocation();
  const route = matchRoute(location.pathname);
  useRouteFocus(route.title, location.pathname);
  if (route.page === 'landing') {
    return <LandingPage />;
  }
  if (route.page === 'not-found') {
    return <NotFoundPage />;
  }
  return <ProtectedRoute route={route} location={location} />;
}

export default function App() {
  return (
    <SessionProvider>
      <a className="skip-link" href="#main">
        Lewati ke konten
      </a>
      <Routes />
    </SessionProvider>
  );
}
