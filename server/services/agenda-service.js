import { HttpError } from '../lib/http-error.js';
import { scheduleRules } from '../lib/schedule-rules.js';
import { wibDateKey, wibDateTime } from '../lib/wib-time.js';
import { listAgendaBlocks, listAgendaBookings } from '../repositories/agenda-repository.js';
import { findUnit, listUnits } from '../repositories/unit-repository.js';
import { toAgendaBlock, toAgendaBooking, summarizeAgenda } from './agenda-view.js';
import { toUnitView } from './catalog-service.js';
import { withWorkspaceReadAccess } from './workspace-access.js';

const ownerOnly = ['owner'];

function dayRange(date) {
  return {
    from: wibDateTime(date, scheduleRules.openTime).toISOString(),
    to: wibDateTime(date, scheduleRules.closeTime).toISOString(),
  };
}

function assertOwnUnit(database, workspaceId, unitId) {
  if (unitId && !findUnit(database, workspaceId, unitId)) {
    throw new HttpError(404, 'UNIT_NOT_FOUND', 'Unit tidak ditemukan.');
  }
}

// Filter status berlaku untuk booking; blok hanya ditampilkan saat status tidak difilter.
function readAgenda(database, workspaceId, filters, now) {
  const filter = { workspaceId, ...dayRange(filters.date), unitId: filters.unitId };
  const bookings = listAgendaBookings(database, { ...filter, status: filters.status }).map((row) =>
    toAgendaBooking(row, now),
  );
  const blocks = filters.status ? [] : listAgendaBlocks(database, filter).map(toAgendaBlock);
  return { bookings, blocks, summary: summarizeAgenda(bookings) };
}

export function getOwnerAgenda(database, auth, query, now = new Date()) {
  const filters = { ...query, date: query.date ?? wibDateKey(now) };
  return withWorkspaceReadAccess(
    database,
    auth,
    (current) => {
      assertOwnUnit(database, current.workspaceId, filters.unitId);
      const units = listUnits(database, current.workspaceId).map(toUnitView);
      const agenda = readAgenda(database, current.workspaceId, filters, now);
      return {
        serverTime: now.toISOString(),
        serverDate: wibDateKey(now),
        ...filters,
        units,
        ...agenda,
      };
    },
    ownerOnly,
  );
}
