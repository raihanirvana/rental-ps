// Peta halaman. `role` hanya untuk navigasi/UX; server tetap memeriksa hak akses
// setiap request (requireRole) sehingga request langsung tanpa peran sesuai ditolak.
export const routes = [
  { path: '/', page: 'landing', title: 'Rental PS di tempat', public: true },
  { path: '/booking', page: 'booking', title: 'Booking', role: 'customer' },
  { path: '/booking-saya', page: 'my-bookings', title: 'Booking saya', role: 'customer' },
  { path: '/pemilik', page: 'agenda', title: 'Agenda', role: 'owner' },
  { path: '/pemilik/unit', page: 'units', title: 'Unit & jadwal', role: 'owner' },
  { path: '/pemilik/pengaturan', page: 'settings', title: 'Pengaturan', role: 'owner' },
];

const notFound = { path: null, page: 'not-found', title: 'Halaman tidak ditemukan', public: true };

export const roleHome = { customer: '/booking', owner: '/pemilik' };

export const roleNames = { customer: 'pelanggan', owner: 'pemilik' };

export function matchRoute(pathname) {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return routes.find((route) => route.path === normalized) ?? notFound;
}

export function navigationFor(role) {
  return routes.filter((route) => route.role === role);
}
