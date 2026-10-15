// Pesan status ringkas. Error memakai role="alert"; lainnya diumumkan sopan (status).
export function Notice({ tone = 'info', children, onDismiss, action }) {
  const className = tone === 'info' ? 'notice' : `notice notice--${tone}`;
  return (
    <div className={className} role={tone === 'error' ? 'alert' : 'status'}>
      <span>{children}</span>
      {action}
      {onDismiss ? (
        <button type="button" className="text-link" onClick={onDismiss}>
          Tutup
        </button>
      ) : null}
    </div>
  );
}

export function ErrorNotice({ error, onRetry }) {
  const action = onRetry ? (
    <button type="button" className="text-link" onClick={onRetry}>
      Coba lagi
    </button>
  ) : null;
  return (
    <Notice tone="error" action={action}>
      {error?.message ?? 'Terjadi kesalahan. Coba lagi sebentar.'}
    </Notice>
  );
}
