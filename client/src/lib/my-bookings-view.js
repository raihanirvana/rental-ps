// Tab di URL memakai bahasa Indonesia; API memakai nama view server.
export const bookingTabs = [
  {
    param: 'mendatang',
    view: 'upcoming',
    label: 'Mendatang',
    empty: 'Belum ada booking mendatang.',
  },
  {
    param: 'riwayat',
    view: 'finished',
    label: 'Riwayat',
    empty: 'Belum ada booking yang sudah lewat.',
  },
  {
    param: 'dibatalkan',
    view: 'cancelled',
    label: 'Dibatalkan',
    empty: 'Belum ada booking yang dibatalkan.',
  },
];

export const pageSize = 10;

function readPage(value) {
  const page = /^\d{1,4}$/.test(value ?? '') ? Number(value) : 1;
  return page >= 1 ? page : 1;
}

export function readListQuery(searchParams) {
  const tab =
    bookingTabs.find((item) => item.param === searchParams.get('tampil')) ?? bookingTabs[0];
  return { tab, page: readPage(searchParams.get('halaman')) };
}

export function listHref(tab, page = 1) {
  const query = new URLSearchParams({ tampil: tab.param });
  if (page > 1) {
    query.set('halaman', String(page));
  }
  return `/booking-saya?${query}`;
}

// Status tampilan dari server (timeState), selalu berupa teks, bukan warna saja.
export const timeStateLabels = {
  upcoming: 'Mendatang',
  ongoing: 'Sedang main',
  ended: 'Sudah berakhir',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};
