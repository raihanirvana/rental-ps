import { HttpError } from '../lib/http-error.js';
import { isBookableDate, slotStarts, unavailableReason } from '../lib/schedule.js';
import { addMinutes, wibDateTime } from '../lib/wib-time.js';
import { findUnit } from '../repositories/unit-repository.js';
import { loadDayIntervals } from './availability-service.js';

const slotErrors = {
  unit_inactive: [409, 'UNIT_INACTIVE', 'Unit sedang nonaktif dan tidak dapat dipesan.'],
  past: [400, 'START_TOO_SOON', 'Jam mulai sudah lewat. Pilih jam lain.'],
  lead_time: [400, 'START_TOO_SOON', 'Jam mulai minimal 15 menit dari sekarang.'],
  blocked: [409, 'SLOT_UNAVAILABLE', 'Jam ini diblokir pemilik. Pilih jam lain.'],
  booked: [409, 'SLOT_UNAVAILABLE', 'Jam ini baru saja terisi. Pilih jam lain.'],
};

function assertScheduleShape(input, now) {
  if (!isBookableDate(input.date, now)) {
    throw new HttpError(400, 'DATE_OUT_OF_RANGE', 'Tanggal di luar jadwal yang bisa dipesan.', {
      date: 'Pilih tanggal hari ini sampai 14 hari ke depan (WIB).',
    });
  }
  const startsAt = wibDateTime(input.date, input.startTime);
  const onGrid = slotStarts(input.date, input.durationMinutes).some(
    (start) => start.getTime() === startsAt.getTime(),
  );
  if (!onGrid) {
    throw new HttpError(400, 'OUTSIDE_OPERATING_HOURS', 'Jam di luar jadwal operasional.', {
      startTime: 'Mulai kelipatan 30 menit dan selesai paling lambat 23.00 WIB.',
    });
  }
  return { startsAt, endsAt: addMinutes(startsAt, input.durationMinutes) };
}

// Dipanggil di dalam transaksi tulis: keadaan unit, booking dan blok selalu yang terbaru.
export function assertBookableSlot(database, workspaceId, input, now) {
  const slot = assertScheduleShape(input, now);
  const unit = findUnit(database, workspaceId, input.unitId);
  if (!unit) {
    throw new HttpError(404, 'UNIT_NOT_FOUND', 'Unit tidak ditemukan.');
  }
  const intervals = loadDayIntervals(database, workspaceId, unit, input.date);
  const reason = unavailableReason(slot, { now, unitActive: unit.is_active === 1, ...intervals });
  if (reason) {
    const [status, code, message] = slotErrors[reason];
    throw new HttpError(status, code, message, status === 400 ? { startTime: message } : undefined);
  }
  return { unit, slot };
}
