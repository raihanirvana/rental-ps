import { Brand } from './Brand.jsx';

// Layar penuh untuk memuat, error, belum masuk, salah peran, sesi habis dan 404.
export function StatusScreen({ title, children, actions, busy = false }) {
  return (
    <div className="wrap">
      <header className="site-header">
        <Brand />
      </header>
      <main id="main" tabIndex={-1} className="status-screen" aria-busy={busy}>
        <h1>{title}</h1>
        {children}
        {actions ? <div className="status-actions">{actions}</div> : null}
      </main>
    </div>
  );
}
