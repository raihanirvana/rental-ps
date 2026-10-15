import { Router } from 'express';
import { requireRole } from '../middleware/auth.js';
import { cancelBooking } from '../services/booking-cancel-service.js';
import { getBookingDetail, listMyBookings } from '../services/booking-query-service.js';
import { createBooking } from '../services/booking-service.js';
import {
  parseBookingId,
  parseCancelBody,
  parseMineQuery,
} from '../validation/booking-query-validation.js';
import { invalidInput, parseCreateBooking } from '../validation/booking-validation.js';

const bookingAccess = requireRole('customer', 'owner');

// 201 saat booking baru dibuat; 200 saat key + payload sama diulang (replay).
function createHandler(database) {
  return (request, response) => {
    const input = parseCreateBooking(request.body);
    const result = createBooking(database, request.auth, input);
    response.status(result.replayed ? 200 : 201).json(result);
  };
}

function cancelHandler(database) {
  return (request, response) => {
    const hasBody = request.get('transfer-encoding') || Number(request.get('content-length')) > 0;
    if (hasBody && request.is('application/json') === false) {
      throw invalidInput('Kirim alasan pembatalan dalam JSON.');
    }
    const bookingId = parseBookingId(request.params.id);
    const input = parseCancelBody(request.body);
    response.json(cancelBooking(database, request.auth, bookingId, input));
  };
}

// /bookings/mine didaftarkan sebelum /bookings/:id.
export function createBookingRouter(database) {
  const router = Router();
  router.post('/bookings', bookingAccess, createHandler(database));
  router.get('/bookings/mine', bookingAccess, (request, response) => {
    response.json(listMyBookings(database, request.auth, parseMineQuery(request.query)));
  });
  router.get('/bookings/:id', bookingAccess, (request, response) => {
    const bookingId = parseBookingId(request.params.id);
    response.json(getBookingDetail(database, request.auth, bookingId));
  });
  router.post('/bookings/:id/cancel', bookingAccess, cancelHandler(database));
  return router;
}
