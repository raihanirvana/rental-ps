import { roleHome } from '../../lib/routes.js';
import { ErrorNotice, Notice } from '../Notice.jsx';
import { SchedulePreview } from './SchedulePreview.jsx';

// Penjelasan demo terlihat sebelum pengunjung menekan tombol apa pun.
function DemoFacts() {
  return (
    <ul className="demo-facts" aria-label="Tentang demo ini">
      <li>Demo tanpa akun</li>
      <li>Data contoh sementara, ruang demo 12 jam</li>
      <li>Pembayaran di tempat, tidak lewat aplikasi</li>
    </ul>
  );
}

function HeroActions({ demo }) {
  const busy = demo.pendingRole === 'customer';
  return (
    <div className="hero-actions">
      <button
        type="button"
        className="button"
        onClick={() => demo.start('customer', roleHome.customer)}
        disabled={demo.pendingRole !== null}
      >
        {busy ? 'Menyiapkan ruang demo…' : 'Coba booking'}
      </button>
      <a className="text-link" href="#unit">
        Lihat unit &amp; tarif
      </a>
    </div>
  );
}

export function Hero({ demo, notice, onDismissNotice }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <span className="pill">Rental PS di tempat · contoh</span>
        <h1 id="hero-title">Jam mainmu, sudah ada tempatnya.</h1>
        <p className="hero-description">
          Pilih PS4 atau PS5, cek jam yang kosong, lalu booking. Tinggal datang dan main bareng.
        </p>
        <HeroActions demo={demo} />
        <DemoFacts />
        {demo.error ? <ErrorNotice error={demo.error} /> : null}
        {notice ? (
          <Notice tone={notice.tone} onDismiss={onDismissNotice}>
            {notice.message}
          </Notice>
        ) : null}
      </div>
      <SchedulePreview />
    </section>
  );
}
