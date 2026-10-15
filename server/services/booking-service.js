import { createHash, randomUUID } from 'node:crypto';
import { createBookingReference } from '../lib/booking-reference.js';
import { HttpError } from '../lib/http-error.js';
import { quoteTotal } from '../lib/money.js';
import {
  findBooking,
  findBookingRequest,
  insertBooking,
  insertBookingRequest,
  referenceExists,
} from '../repositories/booking-repository.js';
import { assertBookableSlot } from './booking-slot.js';
import { toBookingDetail } from './booking-view.js';
import { bookingRoles } from './booking-access.js';
import { withWorkspaceAccess } from './workspace-access.js';

// Hash payload ternormalisasi tanpa idempotencyKey; dipakai membedakan retry dan payload baru.
function hashRequest(input) {
  const { unitId, date, startTime, durationMinutes, customerName, phone } = input;
  const payload = JSON.stringify([unitId, date, startTime, durationMinutes, customerName, phone]);
  return createHash('sha256').update(payload).digest('hex');
}

// Replay mengembalikan booking asli dengan status terkini; booking batal tidak dihidupkan.
function findReplay(database, auth, input, requestHash, now) {
  const request = findBookingRequest(database, auth.workspaceId, input.idempotencyKey);
  if (!request) {
    return null;
  }
  if (request.request_hash !== requestHash) {
    const message = 'Kunci permintaan sudah dipakai untuk booking berbeda. Muat ulang halaman.';
    throw new HttpError(409, 'IDEMPOTENCY_CONFLICT', message);
  }
  const booking = findBooking(database, auth.workspaceId, request.booking_id);
  return toBookingDetail(booking, auth.role, now);
}

function uniqueReference(database, workspaceId) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const reference = createBookingReference();
    if (!referenceExists(database, workspaceId, reference)) {
      return reference;
    }
  }
  throw new HttpError(503, 'REFERENCE_EXHAUSTED', 'Nomor booking belum bisa dibuat. Coba lagi.');
}

// Status awal booking pengunjung; pembatalan/penyelesaian diisi oleh transisi berikutnya.
const initialStatus = Object.freeze({
  status: 'confirmed',
  cancelledAt: null,
  cancelledBy: null,
  cancelReason: null,
  completedAt: null,
});

// Snapshot unit dan harga saat booking dibuat; perubahan unit kelak tidak memengaruhinya.
function unitSnapshot(unit, durationMinutes) {
  return {
    unitId: unit.id,
    unitName: unit.name,
    unitKind: unit.kind,
    hourlyRate: unit.hourly_rate,
    totalPrice: quoteTotal(unit.hourly_rate, durationMinutes),
  };
}

function buildBooking({ auth, input, unit, slot, now, reference }) {
  return {
    ...initialStatus,
    ...unitSnapshot(unit, input.durationMinutes),
    id: randomUUID(),
    workspaceId: auth.workspaceId,
    reference,
    source: 'visitor',
    createdByRole: auth.role,
    startsAt: slot.startsAt.toISOString(),
    endsAt: slot.endsAt.toISOString(),
    durationMinutes: input.durationMinutes,
    customerName: input.customerName,
    phone: input.phone,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

function insertNewBooking(database, auth, input, requestHash, now) {
  const { unit, slot } = assertBookableSlot(database, auth.workspaceId, input, now);
  const reference = uniqueReference(database, auth.workspaceId);
  const booking = buildBooking({ auth, input, unit, slot, now, reference });
  insertBooking(database, booking);
  insertBookingRequest(database, {
    workspaceId: auth.workspaceId,
    idempotencyKey: input.idempotencyKey,
    requestHash,
    bookingId: booking.id,
    createdAt: booking.createdAt,
  });
  return toBookingDetail(findBooking(database, auth.workspaceId, booking.id), auth.role, now);
}

// Satu BEGIN IMMEDIATE: sesi diperiksa ulang, replay key, unit, waktu, konflik, harga,
// INSERT booking dan key. Error apa pun rollback seluruhnya.
export function createBooking(database, auth, input) {
  const requestHash = hashRequest(input);
  return withWorkspaceAccess(database, auth, bookingRoles, (current) => {
    const now = new Date();
    const replay = findReplay(database, current, input, requestHash, now);
    if (replay) {
      return { booking: replay, replayed: true };
    }
    return {
      booking: insertNewBooking(database, current, input, requestHash, now),
      replayed: false,
    };
  });
}
