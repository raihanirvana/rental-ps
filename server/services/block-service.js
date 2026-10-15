import { randomUUID } from 'node:crypto';
import { HttpError } from '../lib/http-error.js';
import { bookableDateRange, isBookableDate } from '../lib/schedule.js';
import { scheduleRules } from '../lib/schedule-rules.js';
import { wibDateKey, wibDateTime, wibTimeLabel } from '../lib/wib-time.js';
import {
  deleteBlockRow,
  findBlock,
  insertBlock,
  listBlockIntervals,
  listUpcomingBlocks,
} from '../repositories/block-repository.js';
import { listBlockingBookingIntervals } from '../repositories/booking-repository.js';
import { findUnit } from '../repositories/unit-repository.js';
import { withWorkspaceAccess, withWorkspaceReadAccess } from './workspace-access.js';

const ownerOnly = ['owner'];

function toOwnerBlock(row) {
  const startsAt = new Date(row.starts_at);
  return {
    id: row.id,
    unitId: row.unit_id,
    unitName: row.unit_name,
    date: wibDateKey(startsAt),
    startTime: wibTimeLabel(startsAt),
    endTime: wibTimeLabel(new Date(row.ends_at)),
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    note: row.note,
    isSample: row.source === 'seed',
  };
}

export function listOwnerBlocks(database, auth) {
  const now = new Date();
  const read = (current) => ({
    serverTime: now.toISOString(),
    serverDate: wibDateKey(now),
    bookableDates: bookableDateRange(now),
    blocks: listUpcomingBlocks(database, current.workspaceId, now.toISOString()).map(toOwnerBlock),
  });
  return withWorkspaceReadAccess(database, auth, read, ownerOnly);
}

const intervalErrors = {
  range: [400, 'DATE_OUT_OF_RANGE', 'Tanggal blok harus hari ini sampai 14 hari ke depan (WIB).'],
  hours: [400, 'OUTSIDE_OPERATING_HOURS', 'Blok harus di dalam jam buka 10.00–23.00 WIB.'],
  order: [400, 'INVALID_INTERVAL', 'Jam selesai harus setelah jam mulai.'],
  past: [400, 'START_IN_PAST', 'Awal blok sudah lewat. Pilih jam yang akan datang.'],
};

function intervalProblem(input, interval, now) {
  const { openTime, closeTime } = scheduleRules;
  if (!isBookableDate(input.date, now)) {
    return 'range';
  }
  if (input.startTime < openTime || input.endTime > closeTime) {
    return 'hours';
  }
  if (interval.endsAt <= interval.startsAt) {
    return 'order';
  }
  return interval.startsAt < now ? 'past' : null;
}

// Horizon, jam buka, grid (validasi bentuk) dan awal tidak lewat menurut waktu server.
function blockInterval(input, now) {
  const interval = {
    startsAt: wibDateTime(input.date, input.startTime),
    endsAt: wibDateTime(input.date, input.endTime),
  };
  const problem = intervalProblem(input, interval, now);
  if (problem) {
    const [status, code, message] = intervalErrors[problem];
    throw new HttpError(status, code, message);
  }
  return interval;
}

function assertNoConflict(database, range) {
  if (listBlockingBookingIntervals(database, range).length > 0) {
    throw new HttpError(409, 'BLOCK_CONFLICT_BOOKING', 'Blok menabrak booking yang masih aktif.');
  }
  if (listBlockIntervals(database, range).length > 0) {
    throw new HttpError(409, 'BLOCK_OVERLAP', 'Blok menumpuk dengan blok lain di unit ini.');
  }
}

// Dalam BEGIN IMMEDIATE: booking yang menunggu kunci melihat blok ini, dan sebaliknya.
export function createBlock(database, auth, input) {
  return withWorkspaceAccess(database, auth, ownerOnly, (current) => {
    const now = new Date();
    const interval = blockInterval(input, now);
    if (!findUnit(database, current.workspaceId, input.unitId)) {
      throw new HttpError(404, 'UNIT_NOT_FOUND', 'Unit tidak ditemukan.');
    }
    const range = { workspaceId: current.workspaceId, unitId: input.unitId };
    const iso = { from: interval.startsAt.toISOString(), to: interval.endsAt.toISOString() };
    assertNoConflict(database, { ...range, ...iso });
    const id = randomUUID();
    const block = { ...range, id, source: 'owner', startsAt: iso.from, endsAt: iso.to };
    insertBlock(database, { ...block, note: input.note, now: now.toISOString() });
    return { block: toOwnerBlock(findBlock(database, current.workspaceId, id)) };
  });
}

export function deleteBlock(database, auth, blockId) {
  return withWorkspaceAccess(database, auth, ownerOnly, (current) => {
    const row = findBlock(database, current.workspaceId, blockId);
    if (!row) {
      throw new HttpError(404, 'BLOCK_NOT_FOUND', 'Blok tidak ditemukan.');
    }
    deleteBlockRow(database, current.workspaceId, blockId);
    return { deleted: true, block: toOwnerBlock(row) };
  });
}
