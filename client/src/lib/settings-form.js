const controlPattern = /\p{Cc}/u;

export const settingsLimits = {
  businessName: { min: 2, max: 60, message: 'Nama usaha 2–60 karakter.' },
  address: { min: 2, max: 150, message: 'Alamat 2–150 karakter.' },
  contactNote: { min: 0, max: 200, message: 'Teks kontak maksimal 200 karakter.' },
};

export function settingsToForm(settings) {
  const { businessName, address, contactNote } = settings;
  return { businessName, address, contactNote };
}

// Aturan sama dengan server; baris baru/karakter kontrol ditolak pada nilai mentah.
export function validateSettings(values) {
  const errors = {};
  for (const [name, { min, max, message }] of Object.entries(settingsLimits)) {
    const length = values[name].trim().length;
    if (controlPattern.test(values[name]) || length < min || length > max) {
      errors[name] = message;
    }
  }
  return errors;
}

export function settingsPayload(values) {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]));
}
