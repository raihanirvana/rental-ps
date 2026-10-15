// Satu key per isi booking. Retry dengan isi sama memakai key yang sama sehingga server
// mengembalikan booking yang sama; isi berubah (unit/jam/durasi/nama/HP) membuat key baru.
function newKey() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  const bytes = window.crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function bookingFingerprint(payload) {
  const { unitId, date, startTime, durationMinutes, customerName, phone, quoteId } = payload;
  const fields = [unitId, date, startTime, durationMinutes, customerName, phone ?? null];
  return JSON.stringify(quoteId === undefined ? fields : [...fields, quoteId]);
}

export function keyFor(previous, payload) {
  const fingerprint = bookingFingerprint(payload);
  if (previous && previous.fingerprint === fingerprint) {
    return previous;
  }
  return { fingerprint, key: newKey() };
}
