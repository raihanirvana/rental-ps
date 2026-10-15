import { useCallback, useEffect, useRef, useState } from 'react';
import { onUnauthorized } from '../lib/api.js';
import { endDemoSession, getSession, startDemoSession } from '../lib/session-api.js';
import { noticeForUnauthorized, roleSwitchNotice, sessionNotices } from '../lib/session-notices.js';
import { mutateSession } from '../lib/session-mutation.js';
import {
  advanceSessionRevision,
  isCurrentSessionRevision,
  sessionRevision,
} from '../lib/session-revision.js';
import { useSessionExpiry } from './useSessionExpiry.js';

const loadingState = { status: 'loading', session: null, error: null, notice: null };

function signedOut(notice = null) {
  return { status: 'ready', session: null, error: null, notice };
}

function signedIn(session, notice = null) {
  return { status: 'ready', session, error: null, notice };
}

async function fetchSession(signal, revision, setState) {
  try {
    const { session } = await getSession(signal);
    if (!signal.aborted && isCurrentSessionRevision(revision)) {
      setState(signedIn(session));
    }
  } catch (error) {
    if (signal.aborted || error.name === 'AbortError' || !isCurrentSessionRevision(revision)) {
      return;
    }
    if (error.status === 401) {
      const expired = error.code === 'SESSION_EXPIRED';
      setState(signedOut(expired ? sessionNotices.expired : null));
      return;
    }
    setState({ ...loadingState, status: 'error', error });
  }
}

// 401 dari endpoint mana pun mengosongkan sesi, tetapi hanya bila sebelumnya masuk.
function useUnauthorizedReset(setState) {
  useEffect(
    () =>
      onUnauthorized((error) => {
        const notice = noticeForUnauthorized(error);
        setState((previous) => (previous.session ? signedOut(notice) : previous));
      }),
    [setState],
  );
}

function reloadSession(runtime, setState) {
  if (runtime.busy) {
    return undefined;
  }
  runtime.controller?.abort();
  const controller = new AbortController();
  runtime.controller = controller;
  const revision = advanceSessionRevision();
  setState(loadingState);
  fetchSession(controller.signal, revision, setState);
  return () => controller.abort();
}

function startRoleSession(runtime, role, previousRole, setState) {
  return mutateSession(
    runtime,
    () => startDemoSession(role),
    ({ session }) => {
      const notice = previousRole && previousRole !== role ? roleSwitchNotice(role) : null;
      setState(signedIn(session, notice));
    },
  );
}

function refreshAfterFailure(runtime, setState) {
  runtime.controller?.abort();
  const controller = new AbortController();
  runtime.controller = controller;
  fetchSession(controller.signal, sessionRevision(), setState);
}

function recoverSessionError(runtime, state, setState, reload, error) {
  if (state.status === 'loading' || error.code === 'SESSION_CHANGED') {
    reload();
  } else if (error.status === 0) {
    refreshAfterFailure(runtime, setState);
  }
}

async function signOutSession(runtime, setState) {
  try {
    return await mutateSession(runtime, endDemoSession, () => {
      setState(signedOut(sessionNotices.signedOut));
    });
  } catch (error) {
    if (error.status === 0) {
      refreshAfterFailure(runtime, setState);
    }
    throw error;
  }
}

function useSessionActions(state, setState, reload, runtime) {
  const startSession = useCallback(
    async (role) => {
      try {
        const result = await startRoleSession(runtime.current, role, state.session?.role, setState);
        return result.session;
      } catch (error) {
        recoverSessionError(runtime.current, state, setState, reload, error);
        throw error;
      }
    },
    [state, setState, reload, runtime],
  );
  const signOut = useCallback(() => signOutSession(runtime.current, setState), [setState, runtime]);
  return { startSession, signOut };
}

export function useSessionState() {
  const [state, setState] = useState(loadingState);
  const runtime = useRef({ busy: false, controller: null });
  const reload = useCallback(() => reloadSession(runtime.current, setState), []);
  useEffect(() => reload(), [reload]);
  useUnauthorizedReset(setState);
  const markExpired = useCallback(() => setState(signedOut(sessionNotices.expired)), []);
  useSessionExpiry(state.session, markExpired);
  const actions = useSessionActions(state, setState, reload, runtime);
  const dismissNotice = useCallback(
    () => setState((current) => ({ ...current, notice: null })),
    [],
  );
  return { ...state, ...actions, reload, dismissNotice };
}
