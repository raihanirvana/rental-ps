// Filter agenda di URL (bahasa Indonesia) ↔ parameter API.
export const statusFilters = [
  { value: '', label: 'Semua status' },
  { value: 'confirmed', label: 'Terkonfirmasi' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

export function readAgendaQuery(searchParams) {
  const status = searchParams.get('status') ?? '';
  return {
    date: searchParams.get('tanggal') || null,
    unitId: searchParams.get('unit') || null,
    status: statusFilters.some((item) => item.value === status) ? status || null : null,
  };
}

export function agendaHref({ date, unitId, status }) {
  const query = new URLSearchParams();
  if (date) {
    query.set('tanggal', date);
  }
  if (unitId) {
    query.set('unit', unitId);
  }
  if (status) {
    query.set('status', status);
  }
  return query.size > 0 ? `/pemilik?${query}` : '/pemilik';
}

export function shiftDate(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// Status agenda selalu tertulis. "Menunggu selesai" = confirmed yang waktunya sudah lewat.
export const agendaStateLabels = {
  upcoming: 'Reservasi',
  ongoing: 'Sedang main',
  ended: 'Menunggu selesai',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  blocked: 'Diblokir',
};

export function formatMinutes(minutes) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} jam ${rest} menit` : `${hours} jam`;
}
