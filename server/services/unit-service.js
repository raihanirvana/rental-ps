import { randomUUID } from 'node:crypto';
import { HttpError } from '../lib/http-error.js';
import {
  countPendingBookings,
  countUnits,
  findUnit,
  findUnitByName,
  insertUnit,
  listUnits,
  updateUnitRow,
} from '../repositories/unit-repository.js';
import { toUnitView } from './catalog-service.js';
import { withWorkspaceAccess, withWorkspaceReadAccess } from './workspace-access.js';

const ownerOnly = ['owner'];
const maxUnits = 20;

function toOwnerUnit(database, workspaceId, row, now) {
  const pendingBookings = countPendingBookings(database, { workspaceId, unitId: row.id, now });
  return { ...toUnitView(row), pendingBookings };
}

export function listOwnerUnits(database, auth) {
  const now = new Date().toISOString();
  const read = (current) => ({
    units: listUnits(database, current.workspaceId).map((row) =>
      toOwnerUnit(database, current.workspaceId, row, now),
    ),
    maxUnits,
  });
  return withWorkspaceReadAccess(database, auth, read, ownerOnly);
}

function assertNameFree(database, workspaceId, name, unitId = null) {
  const existing = name ? findUnitByName(database, workspaceId, name) : null;
  if (existing && existing.id !== unitId) {
    throw new HttpError(409, 'UNIT_NAME_TAKEN', 'Nama unit sudah dipakai di ruang demo ini.', {
      name: 'Gunakan nama lain.',
    });
  }
}

// Batas unit dan nama unik diperiksa setelah kunci tulis, dalam transaksi yang sama.
export function createUnit(database, auth, input) {
  return withWorkspaceAccess(database, auth, ownerOnly, (current) => {
    if (countUnits(database, current.workspaceId) >= maxUnits) {
      throw new HttpError(409, 'UNIT_LIMIT_REACHED', `Maksimal ${maxUnits} unit per ruang demo.`);
    }
    assertNameFree(database, current.workspaceId, input.name);
    const now = new Date().toISOString();
    const id = randomUUID();
    const row = { ...input, id, workspaceId: current.workspaceId, seedKey: null, now };
    insertUnit(database, { ...row, isActive: input.isActive ? 1 : 0 });
    const unit = findUnit(database, current.workspaceId, id);
    return { unit: toOwnerUnit(database, current.workspaceId, unit, now) };
  });
}

// Nonaktif ditolak bila masih ada booking non-cancelled yang belum berakhir.
function assertCanDeactivate(database, workspaceId, unit, now) {
  const pending = countPendingBookings(database, { workspaceId, unitId: unit.id, now });
  if (pending > 0) {
    const message =
      `${unit.name} masih punya ${pending} booking yang belum berakhir. ` +
      'Batalkan atau tunggu selesai sebelum menonaktifkan.';
    throw new HttpError(409, 'UNIT_HAS_BOOKINGS', message);
  }
}

function mergeUnit(row, patch) {
  return {
    name: patch.name ?? row.name,
    kind: patch.kind ?? row.kind,
    hourlyRate: patch.hourlyRate ?? row.hourly_rate,
    isActive: patch.isActive === undefined ? row.is_active : Number(patch.isActive),
  };
}

// Snapshot booking lama tidak disentuh: hanya baris units yang berubah.
export function updateUnit(database, auth, unitId, patch) {
  return withWorkspaceAccess(database, auth, ownerOnly, (current) => {
    const row = findUnit(database, current.workspaceId, unitId);
    if (!row) {
      throw new HttpError(404, 'UNIT_NOT_FOUND', 'Unit tidak ditemukan.');
    }
    const now = new Date().toISOString();
    assertNameFree(database, current.workspaceId, patch.name, unitId);
    if (patch.isActive === false && row.is_active === 1) {
      assertCanDeactivate(database, current.workspaceId, row, now);
    }
    const next = { ...mergeUnit(row, patch), id: unitId, workspaceId: current.workspaceId, now };
    updateUnitRow(database, next);
    const unit = findUnit(database, current.workspaceId, unitId);
    return { unit: toOwnerUnit(database, current.workspaceId, unit, now) };
  });
}
