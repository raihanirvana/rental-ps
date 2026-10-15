import { formatClock } from './format.js';

const longDateFormat = new Intl.DateTimeFormat('id-ID', {
  timeZone: 'Asia/Jakarta',
  weekday: 'long',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

// Tanggal YYYY-MM-DD (WIB dari server) → "Jumat, 16 Okt 2026".
export function formatDateKey(dateKey) {
  return longDateFormat.format(new Date(`${dateKey}T12:00:00+07:00`));
}

export function formatDuration(minutes) {
  return `${minutes / 60} jam`;
}

export function formatTimeRange(startTime, endTime) {
  return `${formatClock(startTime)}–${formatClock(endTime)} WIB`;
}

// Alasan slot tidak tersedia ditulis sebagai teks, bukan hanya warna.
export const slotReasonLabels = {
  booked: 'Terisi',
  blocked: 'Diblokir',
  past: 'Lewat',
  lead_time: 'Terlalu dekat',
  unit_inactive: 'Nonaktif',
};
