// Jadwal contoh relatif terhadap tanggal WIB (D) saat workspace dibuat.
// Semua dalam jam buka 10.00–23.00, kelipatan 30 menit, dan tidak saling bentrok.
// D+1 PS5 A/B 19.00–22.00 sengaja kosong untuk skenario uji PRD §13.
// `cancel` diisi untuk contoh cancelled; lainnya completed bila sudah berakhir.

export const sampleBookings = [
  { unit: 'ps5-a', day: -3, start: '20:00', minutes: 180, customer: 'Dimas (contoh)' },
  { unit: 'ps4-a', day: -2, start: '15:00', minutes: 120, customer: 'Sinta (contoh)' },
  { unit: 'ps5-b', day: -2, start: '13:00', minutes: 180, customer: 'Bima (contoh)' },
  { unit: 'ps5-a', day: -1, start: '19:00', minutes: 120, customer: 'Nadia (contoh)' },
  {
    unit: 'ps4-b',
    day: -1,
    start: '20:00',
    minutes: 60,
    customer: 'Laras (contoh)',
    cancel: { by: 'owner', reason: 'Contoh: unit dipakai acara offline.' },
  },
  { unit: 'ps5-b', day: 0, start: '10:00', minutes: 120, customer: 'Raka (contoh)' },
  { unit: 'ps4-a', day: 0, start: '14:00', minutes: 60, customer: 'Sinta (contoh)' },
  { unit: 'ps5-a', day: 0, start: '19:00', minutes: 120, customer: 'Dimas (contoh)' },
  { unit: 'ps4-a', day: 1, start: '16:00', minutes: 120, customer: 'Raka (contoh)' },
  { unit: 'ps4-b', day: 1, start: '19:00', minutes: 180, customer: 'Bima (contoh)' },
  { unit: 'ps5-a', day: 1, start: '13:00', minutes: 120, customer: 'Laras (contoh)' },
  { unit: 'ps5-b', day: 2, start: '18:00', minutes: 120, customer: 'Nadia (contoh)' },
  {
    unit: 'ps5-b',
    day: 3,
    start: '16:00',
    minutes: 120,
    customer: 'Raka (contoh)',
    cancel: { by: 'customer', reason: 'Contoh: jadwal berubah.' },
  },
  { unit: 'ps4-a', day: 4, start: '20:00', minutes: 120, customer: 'Bima (contoh)' },
];

export const sampleBlocks = [
  { unit: 'ps4-b', day: 0, start: '17:00', minutes: 120, note: 'Contoh: perawatan kontroler.' },
  { unit: 'ps4-b', day: 2, start: '10:00', minutes: 180, note: 'Contoh: pemakaian offline.' },
];
