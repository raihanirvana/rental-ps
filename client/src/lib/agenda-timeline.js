// Timeline penuh jam buka 10.00–23.00 dalam kolom 30 menit (26 kolom).
export const timelineStartMinutes = 10 * 60;
export const timelineColumns = 26;

export const timelineHours = Array.from({ length: 13 }, (_, index) => `${10 + index}.00`);

function toMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function gridColumn(startTime, endTime) {
  const start = (toMinutes(startTime) - timelineStartMinutes) / 30 + 1;
  const span = (toMinutes(endTime) - toMinutes(startTime)) / 30;
  return `${start} / span ${span}`;
}

// Item agenda gabungan untuk tampilan: booking dan blok, diurutkan kronologis.
export function agendaItems(data) {
  const bookings = data.bookings.map((booking) => ({
    kind: 'booking',
    key: booking.id,
    ...booking,
  }));
  const blocks = data.blocks.map((block) => ({ kind: 'block', key: block.id, ...block }));
  return [...bookings, ...blocks].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
