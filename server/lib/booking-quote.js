import { createHash } from 'node:crypto';

// Identitas quote untuk persetujuan harga; tarif tetap dibaca ulang dari database.
// Bukan token otorisasi. Workspace, snapshot unit dan durasi membatasi konteksnya.
export function bookingQuoteId(workspaceId, unit, durationMinutes) {
  const data = [workspaceId, unit.id, unit.name, unit.kind, unit.hourly_rate, durationMinutes];
  return createHash('sha256').update(JSON.stringify(data)).digest('hex');
}
