import { ErrorNotice } from '../components/Notice.jsx';
import { Link } from '../components/Link.jsx';
import { StatusScreen } from '../components/StatusScreen.jsx';

export function LoadingScreen() {
  return (
    <StatusScreen title="Memuat ruang demo…" busy>
      <p role="status">Memeriksa sesi demo di server.</p>
    </StatusScreen>
  );
}

// Gagal memeriksa sesi (jaringan/server), bukan berarti sesi habis: tawarkan coba lagi.
export function SessionErrorScreen({ error, onRetry }) {
  const actions = (
    <>
      <button type="button" className="button" onClick={onRetry}>
        Coba lagi
      </button>
      <Link className="text-link" to="/">
        Ke halaman utama
      </Link>
    </>
  );
  return (
    <StatusScreen title="Sesi belum bisa diperiksa." actions={actions}>
      <ErrorNotice error={error} />
    </StatusScreen>
  );
}

export function NotFoundPage() {
  const actions = (
    <Link className="button" to="/">
      Ke halaman utama
    </Link>
  );
  return (
    <StatusScreen title="Halaman tidak ditemukan." actions={actions}>
      <p>Alamat ini tidak ada di demo Sesi Play.</p>
    </StatusScreen>
  );
}
