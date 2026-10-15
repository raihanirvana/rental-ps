// Peta halaman. `role` hanya untuk navigasi/UX; server tetap memeriksa hak akses
// setiap request (requireRole) sehingga request langsung tanpa peran sesuai ditolak.
// `nav: false` untuk halaman turunan; `navPath` menandai menu aktifnya.
export const routes = [
  { path: '/', page: 'landing', title: 'Rental PS di tempat', public: true },
  { path: '/booking', page: 'booking', title: 'Booking', role: 'customer' },
  { path: '/booking-saya', page: 'my-bookings', title: 'Booking saya', role: 'customer' },
  {
    path: '/booking-saya/:id',
    page: 'booking-detail',
    title: 'Detail booking',
    role: 'customer',
    nav: false,
    navPath: '/booking-saya',
  },
  { path: '/pemilik', page: 'agenda', title: 'Agenda', role: 'owner' },
  { path: '/pemilik/unit', page: 'units', title: 'Unit & jadwal', role: 'owner' },
  { path: '/pemilik/pengaturan', page: 'settings', title: 'Pengaturan', role: 'owner' },
];

const notFound = { path: null, page: 'not-found', title: 'Halaman tidak ditemukan', public: true };

export const roleHome = { customer: '/booking', owner: '/pemilik' };

export const roleNames = { customer: 'pelanggan', owner: 'pemilik' };

function decodeSegment(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
}

// Mencocokkan pola "/a/:id" segmen demi segmen; null bila tidak cocok.
function matchPattern(pattern, pathname) {
  const expected = pattern.split('/');
  const actual = pathname.split('/');
  if (expected.length !== actual.length) {
    return null;
  }
  const params = {};
  for (const [index, part] of expected.entries()) {
    if (!part.startsWith(':')) {
      if (part !== actual[index]) {
        return null;
      }
      continue;
    }
    const value = decodeSegment(actual[index]);
    if (!value) {
      return null;
    }
    params[part.slice(1)] = value;
  }
  return params;
}

export function matchRoute(pathname) {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  for (const route of routes) {
    const params = matchPattern(route.path, normalized);
    if (params) {
      return { ...route, params };
    }
  }
  return { ...notFound, params: {} };
}

export function navigationFor(role) {
  return routes.filter((route) => route.role === role && route.nav !== false);
}
