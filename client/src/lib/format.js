const rupiahFormat = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

const wibDateTimeFormat = new Intl.DateTimeFormat('id-ID', {
  timeZone: 'Asia/Jakarta',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function formatRupiah(value) {
  return `Rp${rupiahFormat.format(value)}`;
}

// "10:00" dari server → "10.00" sesuai penulisan jam Indonesia.
export function formatClock(time) {
  return time.replace(':', '.');
}

// Waktu ISO dari server ditampilkan dalam WIB, tidak bergantung zona perangkat.
export function formatWibDateTime(iso) {
  return `${wibDateTimeFormat.format(new Date(iso))} WIB`;
}
