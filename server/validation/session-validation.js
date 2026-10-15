import { HttpError } from '../lib/http-error.js';
import { demoRoles } from '../services/session-resolver.js';
import { isPlainObject } from './common.js';

// Hanya peran yang diterima. Workspace, masa berlaku dan hak akses ditentukan server.
export function parseDemoSessionBody(body) {
  if (!isPlainObject(body)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Kirim JSON berisi peran demo.');
  }
  const unknown = Object.keys(body).filter((key) => key !== 'role');
  if (unknown.length > 0) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Hanya field role yang diterima.', {
      [unknown[0]]: 'Field tidak dikenal.',
    });
  }
  if (typeof body.role !== 'string' || !Object.hasOwn(demoRoles, body.role)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Peran harus customer atau owner.', {
      role: 'Pilih customer atau owner.',
    });
  }
  return { role: body.role };
}
