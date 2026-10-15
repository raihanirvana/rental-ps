import { randomInt } from 'node:crypto';

// Tanpa 0/O/1/I agar nomor mudah dibacakan di kasir.
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// Nomor booking pendek, unik per workspace melalui constraint database.
export function createBookingReference() {
  let code = '';
  for (let index = 0; index < 6; index += 1) {
    code += alphabet[randomInt(alphabet.length)];
  }
  return `SP-${code}`;
}
