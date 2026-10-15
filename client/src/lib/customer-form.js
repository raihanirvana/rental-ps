const controlPattern = /\p{Cc}/u;
const phonePattern = /^\+?\d{8,15}$/;

export function normalizePhone(value) {
  return value.replace(/[\s-]/g, '');
}

// Aturan sama dengan server; server tetap memvalidasi ulang.
export function validateCustomer({ customerName, phone }) {
  const errors = {};
  const name = customerName.trim();
  if (name.length < 2 || name.length > 60) {
    errors.customerName = 'Isi nama pemesan, minimal 2 karakter.';
  }
  if (controlPattern.test(customerName)) {
    errors.customerName = 'Nama tidak boleh berisi karakter kontrol.';
  }
  const normalized = normalizePhone(phone);
  if (controlPattern.test(phone) || (normalized && !phonePattern.test(normalized))) {
    errors.phone = 'Gunakan 8–15 digit, boleh diawali +, atau kosongkan.';
  }
  return errors;
}

export function customerPayload({ customerName, phone }) {
  const normalized = normalizePhone(phone);
  return { customerName: customerName.trim(), ...(normalized ? { phone: normalized } : {}) };
}
