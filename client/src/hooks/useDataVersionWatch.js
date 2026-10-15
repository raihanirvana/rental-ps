import { useEffect } from 'react';
import { onDataVersion } from '../lib/api.js';
import { getSession } from '../lib/session-api.js';
import { noticeForUnauthorized, roleSwitchNotice, sessionNotices } from '../lib/session-notices.js';
import {
  advanceSessionRevision,
  isCurrentSessionRevision,
  sessionRevision,
} from '../lib/session-revision.js';

function sameWorkspace(previous, next) {
  return (
    previous.workspace.createdAt === next.workspace.createdAt &&
    previous.workspace.expiresAt === next.workspace.expiresAt
  );
}

function changedIdentity(previous, next) {
  return (
    !sameWorkspace(previous, next) ||
    previous.role !== next.role ||
    previous.startedAt !== next.startedAt
  );
}

function refreshedState(current, previous, session) {
  if (current.session !== previous) {
    return current;
  }
  const reset =
    sameWorkspace(previous, session) &&
    session.workspace.dataVersion > previous.workspace.dataVersion;
  if (!changedIdentity(previous, session) && !reset) {
    return current;
  }
  const notice = reset ? sessionNotices.dataReset : roleSwitchNotice(session.role);
  return { status: 'ready', session, error: null, notice };
}

function isActive(runtime, revision) {
  return !runtime.controller.signal.aborted && isCurrentSessionRevision(revision);
}

function rejectRevalidation(runtime, revision, setState, error) {
  if (isActive(runtime, revision) && error.status === 401) {
    const notice = noticeForUnauthorized(error);
    setState((current) =>
      current.session === runtime.session
        ? { status: 'ready', session: null, error: null, notice }
        : current,
    );
  }
}

async function revalidate(runtime, setState) {
  if (runtime.pending || runtime.mutation.current.busy) {
    return;
  }
  runtime.pending = true;
  const revision = sessionRevision();
  try {
    const { session } = await getSession(runtime.controller.signal);
    if (isActive(runtime, revision)) {
      if (changedIdentity(runtime.session, session)) {
        advanceSessionRevision();
      }
      setState((current) => refreshedState(current, runtime.session, session));
    }
  } catch (error) {
    rejectRevalidation(runtime, revision, setState, error);
  } finally {
    runtime.pending = false;
  }
}

function watchVersion(session, setState, mutation) {
  if (!session) {
    return undefined;
  }
  const runtime = { session, mutation, pending: false, controller: new AbortController() };
  const refresh = () => revalidate(runtime, setState);
  const known = session.workspace.dataVersion;
  const stop = onDataVersion((version) => version > known && refresh());
  const onVisible = () => document.visibilityState === 'visible' && refresh();
  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener('focus', onVisible);
  return () => {
    runtime.controller.abort();
    stop();
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('focus', onVisible);
  };
}

export function useDataVersionWatch(session, setState, mutation) {
  useEffect(() => watchVersion(session, setState, mutation), [session, setState, mutation]);
}
