import { Router } from 'express';
import { requireRole } from '../middleware/auth.js';
import { getOwnerAgenda } from '../services/agenda-service.js';
import { completeBooking } from '../services/booking-status-service.js';
import { parseAgendaQuery, parseStatusBody } from '../validation/agenda-validation.js';
import { parseBookingId } from '../validation/booking-query-validation.js';

// Peran hanya dari sesi server; header/query "role" palsu tidak mengubah apa pun.
const ownerOnly = requireRole('owner');

export function createOwnerRouter(database) {
  const router = Router();
  router.get('/owner/agenda', ownerOnly, (request, response) => {
    response.json(getOwnerAgenda(database, request.auth, parseAgendaQuery(request.query)));
  });
  router.patch('/owner/bookings/:id/status', ownerOnly, (request, response) => {
    const bookingId = parseBookingId(request.params.id);
    parseStatusBody(request.body);
    response.json(completeBooking(database, request.auth, bookingId));
  });
  return router;
}
