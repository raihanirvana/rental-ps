import { scheduleRules } from './schedule-rules.js';
import { addMinutes, shiftDateKey, wibDateKey, wibDateTime, wibTimeLabel } from './wib-time.js';

const { openTime, closeTime, slotStepMinutes, leadMinutes, horizonDays } = scheduleRules;

// Tanggal WIB yang boleh dipesan: hari ini sampai D+14, inklusif.
export function bookableDateRange(now) {
  const from = wibDateKey(now);
  return { from, to: shiftDateKey(from, horizonDays) };
}

export function isBookableDate(dateKey, now) {
  const { from, to } = bookableDateRange(now);
  return dateKey >= from && dateKey <= to;
}

// Semua jam mulai pada grid 30 menit yang selesai paling lambat pukul 23.00 WIB.
export function slotStarts(dateKey, durationMinutes) {
  const close = wibDateTime(dateKey, closeTime);
  const starts = [];
  let start = wibDateTime(dateKey, openTime);
  while (addMinutes(start, durationMinutes) <= close) {
    starts.push(start);
    start = addMinutes(start, slotStepMinutes);
  }
  return starts;
}

// Interval [mulai, selesai): bentrok bila a.mulai < b.selesai dan a.selesai > b.mulai.
export function overlaps(a, b) {
  return a.startsAt < b.endsAt && a.endsAt > b.startsAt;
}

function toInterval(row) {
  return { startsAt: new Date(row.starts_at), endsAt: new Date(row.ends_at) };
}

// Alasan slot tidak tersedia, atau null. Urutan: unit nonaktif, lewat, lead time, blok, booking.
export function unavailableReason(interval, context) {
  if (!context.unitActive) {
    return 'unit_inactive';
  }
  if (interval.startsAt <= context.now) {
    return 'past';
  }
  if (interval.startsAt < addMinutes(context.now, leadMinutes)) {
    return 'lead_time';
  }
  if (context.blocks.some((block) => overlaps(interval, toInterval(block)))) {
    return 'blocked';
  }
  const booked = context.bookings.some((booking) => overlaps(interval, toInterval(booking)));
  return booked ? 'booked' : null;
}

export function describeSlot(startsAt, durationMinutes, context) {
  const endsAt = addMinutes(startsAt, durationMinutes);
  const reason = unavailableReason({ startsAt, endsAt }, context);
  return {
    startTime: wibTimeLabel(startsAt),
    endTime: wibTimeLabel(endsAt),
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    available: reason === null,
    reason,
  };
}
