import { Router } from 'express';
import { requireRole } from '../middleware/auth.js';
import { getOwnerAgenda } from '../services/agenda-service.js';
import { createBlock, deleteBlock, listOwnerBlocks } from '../services/block-service.js';
import { completeBooking } from '../services/booking-status-service.js';
import { createUnit, listOwnerUnits, updateUnit } from '../services/unit-service.js';
import { parseAgendaQuery, parseStatusBody } from '../validation/agenda-validation.js';
import { parseBlockId, parseCreateBlock } from '../validation/block-validation.js';
import { parseBookingId } from '../validation/booking-query-validation.js';
import { parseCreateUnit, parseUnitId, parseUpdateUnit } from '../validation/unit-validation.js';

// Peran hanya dari sesi server; header/query "role" palsu tidak mengubah apa pun.
const ownerOnly = requireRole('owner');

function mountAgendaRoutes(router, database) {
  router.get('/owner/agenda', ownerOnly, (request, response) => {
    response.json(getOwnerAgenda(database, request.auth, parseAgendaQuery(request.query)));
  });
  router.patch('/owner/bookings/:id/status', ownerOnly, (request, response) => {
    const bookingId = parseBookingId(request.params.id);
    parseStatusBody(request.body);
    response.json(completeBooking(database, request.auth, bookingId));
  });
}

function mountUnitRoutes(router, database) {
  router.get('/owner/units', ownerOnly, (request, response) => {
    response.json(listOwnerUnits(database, request.auth));
  });
  router.post('/owner/units', ownerOnly, (request, response) => {
    response.status(201).json(createUnit(database, request.auth, parseCreateUnit(request.body)));
  });
  router.patch('/owner/units/:id', ownerOnly, (request, response) => {
    const unitId = parseUnitId(request.params.id);
    response.json(updateUnit(database, request.auth, unitId, parseUpdateUnit(request.body)));
  });
}

function mountBlockRoutes(router, database) {
  router.get('/owner/blocks', ownerOnly, (request, response) => {
    response.json(listOwnerBlocks(database, request.auth));
  });
  router.post('/owner/blocks', ownerOnly, (request, response) => {
    response.status(201).json(createBlock(database, request.auth, parseCreateBlock(request.body)));
  });
  router.delete('/owner/blocks/:id', ownerOnly, (request, response) => {
    response.json(deleteBlock(database, request.auth, parseBlockId(request.params.id)));
  });
}

export function createOwnerRouter(database) {
  const router = Router();
  mountAgendaRoutes(router, database);
  mountUnitRoutes(router, database);
  mountBlockRoutes(router, database);
  return router;
}
