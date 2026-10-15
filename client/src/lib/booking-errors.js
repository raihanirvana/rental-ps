// Error yang berarti jadwal/unit harus dipilih ulang: form data diri tetap dipertahankan.
export const scheduleErrorCodes = new Set([
  'SLOT_UNAVAILABLE',
  'QUOTE_CHANGED',
  'START_TOO_SOON',
  'OUTSIDE_OPERATING_HOURS',
  'DATE_OUT_OF_RANGE',
  'UNIT_INACTIVE',
  'UNIT_NOT_FOUND',
]);

const contactFields = ['customerName', 'phone'];

export function contactFieldErrors(error) {
  const fields = error?.fields ?? {};
  return Object.fromEntries(
    contactFields.filter((name) => fields[name]).map((name) => [name, fields[name]]),
  );
}

export const timeoutError = {
  code: 'TIMEOUT',
  message:
    'Server belum menjawab. Kirim lagi bila perlu; booking dengan data yang sama ' +
    'tidak akan tercatat dua kali.',
};
