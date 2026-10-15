import { Router } from 'express';
import { requireSession } from '../middleware/auth.js';
import { getAvailability } from '../services/availability-service.js';
import { publicCatalog, workspaceCatalog } from '../services/catalog-service.js';
import { parseAvailabilityQuery } from '../validation/availability-validation.js';

// Katalog tidak pernah membuat workspace/cookie. Cookie tidak valid diperlakukan anonim.
function catalogHandler(database) {
  return (request, response) => {
    const catalog = request.auth ? workspaceCatalog(database, request.auth) : publicCatalog();
    response.json(catalog);
  };
}

// Workspace selalu dari sesi; unitId milik workspace lain menghasilkan 404.
function availabilityHandler(database) {
  return (request, response) => {
    const query = parseAvailabilityQuery(request.query);
    response.json(getAvailability(database, request.auth, query));
  };
}

export function createCatalogRouter(database) {
  const router = Router();
  router.get('/catalog', catalogHandler(database));
  router.get('/availability', requireSession, availabilityHandler(database));
  return router;
}
