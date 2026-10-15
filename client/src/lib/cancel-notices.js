import { formatTimeRange } from './booking-format.js';

export function cancelledNotice({ booking, changed }) {
  if (!changed) {
    return { tone: 'info', message: 'Booking ini sudah dibatalkan sebelumnya.' };
  }
  const slot = `${formatTimeRange(booking.startTime, booking.endTime)} di ${booking.unitName}`;
  return {
    tone: 'success',
    message: `Booking dibatalkan. Jam ${slot} tersedia lagi untuk dipesan.`,
  };
}

// Penolakan server (mis. sudah dimulai) ditampilkan apa adanya; detail dimuat ulang.
export function rejectedNotice(error) {
  return { tone: 'error', message: error.message };
}
