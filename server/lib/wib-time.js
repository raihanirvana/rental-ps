// Asia/Jakarta (WIB) tidak memakai daylight saving, sehingga offset selalu +07:00.
const wibDateFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const minuteInMs = 60 * 1000;

// Tanggal WIB (YYYY-MM-DD) untuk sebuah Date.
export function wibDateKey(date) {
  return wibDateFormat.format(date);
}

export function shiftDateKey(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// Tanggal YYYY-MM-DD dan jam HH:mm yang dimaknai sebagai WIB.
export function wibDateTime(dateKey, time) {
  return new Date(`${dateKey}T${time}:00.000+07:00`);
}

export function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * minuteInMs);
}
