export function isDateInRange(date, { from, to }) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= from && date <= to;
}

// Slot terpilih hanya sah bila berasal dari hasil availability yang sudah selesai dimuat
// untuk kombinasi unit/tanggal/durasi saat ini dan masih tersedia.
export function selectedSlot(availability, startTime) {
  if (availability.status !== 'ready' || !startTime) {
    return null;
  }
  const slot = availability.data.slots.find((item) => item.startTime === startTime);
  return slot?.available ? slot : null;
}
