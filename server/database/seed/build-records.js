import { randomUUID } from 'node:crypto';
import { createBookingReference } from '../../lib/booking-reference.js';
import { addMinutes, shiftDateKey, wibDateTime } from '../../lib/wib-time.js';

const hourInMinutes = 60;

function earliest(...dates) {
  return new Date(Math.min(...dates.map((date) => date.getTime())));
}

export function buildInterval(entry, today) {
  const startsAt = wibDateTime(shiftDateKey(today, entry.day), entry.start);
  return { startsAt, endsAt: addMinutes(startsAt, entry.minutes) };
}

// Status seed mengikuti waktu server: yang sudah berakhir menjadi completed.
function describeStatus(entry, interval, now, createdAt) {
  const none = { cancelledAt: null, cancelledBy: null, cancelReason: null, completedAt: null };
  if (entry.cancel) {
    const cancelledAt = earliest(addMinutes(interval.startsAt, -120), addMinutes(now, -60));
    const { by, reason } = entry.cancel;
    const fields = {
      cancelledAt: cancelledAt.toISOString(),
      cancelledBy: by,
      cancelReason: reason,
    };
    return { ...none, ...fields, status: 'cancelled', updatedAt: fields.cancelledAt };
  }
  if (interval.endsAt <= now) {
    const completedAt = interval.endsAt.toISOString();
    return { ...none, status: 'completed', completedAt, updatedAt: completedAt };
  }
  return { ...none, status: 'confirmed', updatedAt: createdAt };
}

function bookingCreatedAt(interval, now) {
  return earliest(addMinutes(interval.startsAt, -26 * hourInMinutes), addMinutes(now, -120));
}

// Snapshot unit/tarif disalin saat booking dibuat; perubahan unit kelak tidak memengaruhinya.
export function buildSeedBooking({ entry, unit, workspaceId, now, today }) {
  const interval = buildInterval(entry, today);
  const createdAt = bookingCreatedAt(interval, now).toISOString();
  return {
    id: randomUUID(),
    workspaceId,
    unitId: unit.id,
    reference: createBookingReference(),
    source: 'seed',
    createdByRole: null,
    startsAt: interval.startsAt.toISOString(),
    endsAt: interval.endsAt.toISOString(),
    durationMinutes: entry.minutes,
    unitName: unit.name,
    unitKind: unit.kind,
    hourlyRate: unit.hourlyRate,
    totalPrice: (unit.hourlyRate * entry.minutes) / hourInMinutes,
    customerName: entry.customer,
    phone: null,
    createdAt,
    ...describeStatus(entry, interval, now, createdAt),
  };
}

export function buildSeedBlock({ entry, unit, workspaceId, now, today }) {
  const interval = buildInterval(entry, today);
  return {
    id: randomUUID(),
    workspaceId,
    unitId: unit.id,
    source: 'seed',
    startsAt: interval.startsAt.toISOString(),
    endsAt: interval.endsAt.toISOString(),
    note: entry.note,
    now: now.toISOString(),
  };
}
