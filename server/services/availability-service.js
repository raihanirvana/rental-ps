import { withWorkspaceReadAccess } from './workspace-access.js';
import { HttpError } from '../lib/http-error.js';
import { quoteTotal } from '../lib/money.js';
import { bookableDateRange, describeSlot, isBookableDate, slotStarts } from '../lib/schedule.js';
import { scheduleRules } from '../lib/schedule-rules.js';
import { wibDateKey, wibDateTime } from '../lib/wib-time.js';
import { listBlockIntervals } from '../repositories/block-repository.js';
import { listBlockingBookingIntervals } from '../repositories/booking-repository.js';
import { findUnit } from '../repositories/unit-repository.js';
import { toUnitView } from './catalog-service.js';

const notice =
  'Memilih jam tidak menahan slot. Ketersediaan diperiksa ulang saat konfirmasi booking.';

function assertBookableDate(date, now) {
  if (!isBookableDate(date, now)) {
    const { from, to } = bookableDateRange(now);
    throw new HttpError(400, 'DATE_OUT_OF_RANGE', 'Tanggal di luar jadwal yang bisa dipesan.', {
      date: `Pilih tanggal ${from} sampai ${to} (WIB).`,
    });
  }
}

function findUnitOrThrow(database, workspaceId, unitId) {
  const unit = findUnit(database, workspaceId, unitId);
  if (!unit) {
    throw new HttpError(404, 'UNIT_NOT_FOUND', 'Unit tidak ditemukan.');
  }
  return unit;
}

// Interval yang menutup slot pada satu hari operasional unit tersebut.
export function loadDayIntervals(database, workspaceId, unit, date) {
  const range = {
    workspaceId,
    unitId: unit.id,
    from: wibDateTime(date, scheduleRules.openTime).toISOString(),
    to: wibDateTime(date, scheduleRules.closeTime).toISOString(),
  };
  return {
    bookings: listBlockingBookingIntervals(database, range),
    blocks: listBlockIntervals(database, range),
  };
}

function buildResponse({ unit, query, now, intervals }) {
  const context = { now, unitActive: unit.is_active === 1, ...intervals };
  const slots = slotStarts(query.date, query.durationMinutes).map((start) =>
    describeSlot(start, query.durationMinutes, context),
  );
  return {
    serverTime: now.toISOString(),
    serverDate: wibDateKey(now),
    timeZone: scheduleRules.timeZone,
    bookableDates: bookableDateRange(now),
    date: query.date,
    durationMinutes: query.durationMinutes,
    unit: toUnitView(unit),
    quote: {
      hourlyRate: unit.hourly_rate,
      durationMinutes: query.durationMinutes,
      total: quoteTotal(unit.hourly_rate, query.durationMinutes),
    },
    slots,
    notice,
  };
}

export function getAvailability(database, auth, query, now = new Date()) {
  return withWorkspaceReadAccess(database, auth, (current) => {
    assertBookableDate(query.date, now);
    const workspaceId = current.workspaceId;
    const unit = findUnitOrThrow(database, workspaceId, query.unitId);
    const intervals = loadDayIntervals(database, workspaceId, unit, query.date);
    return buildResponse({ unit, query, now, intervals });
  });
}
