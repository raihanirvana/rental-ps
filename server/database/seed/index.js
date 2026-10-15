import { randomUUID } from 'node:crypto';
import { insertBlock } from '../../repositories/block-repository.js';
import { insertBooking } from '../../repositories/booking-repository.js';
import { insertSettings } from '../../repositories/settings-repository.js';
import { insertUnit } from '../../repositories/unit-repository.js';
import {
  findWorkspace,
  insertWorkspace,
  markWorkspaceSeeded,
} from '../../repositories/workspace-repository.js';
import { withTransaction } from '../transaction.js';
import { wibDateKey } from '../../lib/wib-time.js';
import { buildSeedBlock, buildSeedBooking } from './build-records.js';
import { sampleSettings, sampleUnits } from './sample-catalog.js';
import { sampleBlocks, sampleBookings } from './sample-schedule.js';

function insertSampleUnits(database, workspaceId, nowIso) {
  const units = new Map();
  for (const sample of sampleUnits) {
    const unit = { ...sample, id: randomUUID(), workspaceId, isActive: 1, now: nowIso };
    insertUnit(database, unit);
    units.set(sample.seedKey, unit);
  }
  return units;
}

function insertSchedule(database, units, context) {
  for (const entry of sampleBookings) {
    insertBooking(database, buildSeedBooking({ ...context, entry, unit: units.get(entry.unit) }));
  }
  for (const entry of sampleBlocks) {
    insertBlock(database, buildSeedBlock({ ...context, entry, unit: units.get(entry.unit) }));
  }
}

// Mengisi workspace kosong. Dipanggil di dalam transaksi pemanggil.
export function seedWorkspace(database, workspaceId, now) {
  const nowIso = now.toISOString();
  insertSettings(database, { workspaceId, ...sampleSettings, updatedAt: nowIso });
  const units = insertSampleUnits(database, workspaceId, nowIso);
  insertSchedule(database, units, { workspaceId, now, today: wibDateKey(now) });
  markWorkspaceSeeded(database, workspaceId, nowIso);
  return {
    units: sampleUnits.length,
    bookings: sampleBookings.length,
    blocks: sampleBlocks.length,
  };
}

// Membuat workspace beserta data contoh di dalam transaksi pemanggil.
// Workspace yang sudah di-seed tidak digandakan.
export function insertSeededWorkspace(database, { workspaceId, now, expiresAt }) {
  const createdAt = now.toISOString();
  insertWorkspace(database, { id: workspaceId, createdAt, expiresAt: expiresAt.toISOString() });
  if (findWorkspace(database, workspaceId).seeded_at) {
    return { seeded: false };
  }
  return { seeded: true, ...seedWorkspace(database, workspaceId, now) };
}

// Versi berdiri sendiri: satu transaksi, gagal di tengah berarti tidak ada data separuh jadi.
export function createSeededWorkspace(database, options) {
  return withTransaction(database, () => insertSeededWorkspace(database, options));
}
