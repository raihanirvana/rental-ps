const controlPattern = /\p{Cc}/u;

export const emptyUnitForm = { name: '', kind: 'PS4', hourlyRate: '' };

export function unitToForm(unit) {
  return { name: unit.name, kind: unit.kind, hourlyRate: String(unit.hourlyRate) };
}

// Aturan sama dengan server; isian mentah dipertahankan saat tidak valid.
export function validateUnitForm({ name, kind, hourlyRate }) {
  const errors = {};
  const trimmed = name.trim();
  if (controlPattern.test(name) || trimmed.length < 2 || trimmed.length > 40) {
    errors.name = 'Nama unit 2–40 karakter.';
  }
  if (kind !== 'PS4' && kind !== 'PS5') {
    errors.kind = 'Pilih PS4 atau PS5.';
  }
  const rate = /^\d{1,7}$/.test(hourlyRate.trim()) ? Number(hourlyRate.trim()) : NaN;
  if (!(rate >= 1000 && rate <= 1000000)) {
    errors.hourlyRate = 'Tarif bilangan bulat Rp1.000–Rp1.000.000, tanpa titik/koma.';
  }
  return errors;
}

export function unitPayload({ name, kind, hourlyRate }) {
  return { name: name.trim(), kind, hourlyRate: Number(hourlyRate.trim()) };
}
