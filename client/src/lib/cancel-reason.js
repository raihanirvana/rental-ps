const controlPattern = /\p{Cc}/u;

export const maxReasonLength = 200;

// Sama dengan aturan server: opsional, ≤200 karakter, tanpa karakter kontrol.
export function validateReason(value) {
  if (controlPattern.test(value)) {
    return 'Alasan tidak boleh berisi karakter kontrol.';
  }
  if (value.trim().length > maxReasonLength) {
    return `Alasan maksimal ${maxReasonLength} karakter.`;
  }
  return null;
}
