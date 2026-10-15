import { withWorkspaceReadAccess } from './workspace-access.js';
import { sampleSettings, sampleUnits } from '../database/seed/sample-catalog.js';
import { bookableDateRange } from '../lib/schedule.js';
import { scheduleRules } from '../lib/schedule-rules.js';
import { wibDateKey } from '../lib/wib-time.js';
import { findSettings } from '../repositories/settings-repository.js';
import { listUnits } from '../repositories/unit-repository.js';

export function toUnitView(row) {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    hourlyRate: row.hourly_rate,
    isActive: row.is_active === 1,
  };
}

// Contoh publik read-only: statis, tanpa membaca/membuat workspace atau cookie.
// `id: null` menandakan unit contoh belum bisa dipesan sebelum masuk demo.
// Tanggal server (WIB) agar client tidak menebak "hari ini" dari jam perangkat.
function scheduleCalendar(now = new Date()) {
  return { serverDate: wibDateKey(now), bookableDates: bookableDateRange(now) };
}

export function publicCatalog() {
  return {
    ...scheduleCalendar(),
    source: 'sample',
    business: { ...sampleSettings },
    units: sampleUnits.map(({ name, kind, hourlyRate }) => {
      return { id: null, name, kind, hourlyRate, isActive: true };
    }),
    rules: scheduleRules,
  };
}

export function workspaceCatalog(database, auth) {
  return withWorkspaceReadAccess(database, auth, (current) => {
    const settings = findSettings(database, current.workspaceId);
    return {
      ...scheduleCalendar(),
      source: 'workspace',
      business: {
        businessName: settings.business_name,
        address: settings.address,
        contactNote: settings.contact_note,
      },
      units: listUnits(database, current.workspaceId).map(toUnitView),
      rules: scheduleRules,
    };
  });
}
