import { ApiError } from './api.js';
import { advanceSessionRevision, isCurrentSessionRevision } from './session-revision.js';

// Satu mutasi sesi untuk semua CTA/header, termasuk beberapa klik dalam satu event loop.
export async function mutateSession(runtime, request, commit) {
  if (runtime.busy) {
    throw new ApiError({ code: 'SESSION_BUSY', message: 'Perubahan sesi sedang diproses.' });
  }
  runtime.busy = true;
  runtime.controller?.abort();
  const revision = advanceSessionRevision();
  try {
    const result = await request();
    if (!isCurrentSessionRevision(revision)) {
      throw new ApiError({ code: 'SESSION_CHANGED', message: 'Sesi berubah. Muat ulang sesi.' });
    }
    advanceSessionRevision();
    commit(result);
    return result;
  } finally {
    runtime.busy = false;
  }
}
