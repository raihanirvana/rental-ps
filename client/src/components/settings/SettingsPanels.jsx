import { formatClock } from '../../lib/format.js';
import { ConfirmDialog } from '../ConfirmDialog.jsx';
import { ErrorNotice } from '../Notice.jsx';

// Pratinjau sebagai teks biasa: markup yang diketik tidak dijalankan.
export function SettingsPreview({ settings }) {
  return (
    <section className="panel" aria-labelledby="preview-settings-title">
      <h2 id="preview-settings-title">Pratinjau tersimpan</h2>
      <dl className="detail-list detail-list--wide">
        <dt>Nama</dt>
        <dd>{settings.businessName}</dd>
        <dt>Alamat</dt>
        <dd>{settings.address}</dd>
        <dt>Kontak</dt>
        <dd>{settings.contactNote || 'Tidak diisi'}</dd>
      </dl>
    </section>
  );
}

function rulesText(rules) {
  const hours = `${formatClock(rules.openTime)}–${formatClock(rules.closeTime)} WIB`;
  const durations = rules.durationsMinutes.map((minutes) => `${minutes / 60} jam`).join(', ');
  return (
    `Jam buka ${hours}. Durasi ${durations}. Mulai kelipatan ${rules.slotStepMinutes} menit, ` +
    `minimal ${rules.leadMinutes} menit dari sekarang, sampai ${rules.horizonDays} hari ke depan.`
  );
}

export function RulesPanel({ rules }) {
  return (
    <section className="panel" aria-labelledby="rules-title">
      <h2 id="rules-title">Aturan jadwal (tetap)</h2>
      <p>{rulesText(rules)}</p>
      <p>Aturan ini ditetapkan untuk demo dan tidak bisa diubah di sini.</p>
    </section>
  );
}

function ResetDialog({ reset }) {
  return (
    <ConfirmDialog
      open={reset.open}
      title="Kembalikan data contoh?"
      busy={reset.busy}
      onCancel={reset.close}
      onConfirm={reset.confirm}
      cancelLabel="Kembali"
      confirmLabel="Reset demo"
      busyLabel="Mereset…"
    >
      <p>Booking dan perubahan di ruang demo ini akan dihapus.</p>
      {reset.error ? <ErrorNotice error={reset.error} /> : null}
    </ConfirmDialog>
  );
}

export function ResetPanel({ reset }) {
  return (
    <section className="panel danger-panel" aria-labelledby="reset-title">
      <h2 id="reset-title">Reset data demo</h2>
      <p>
        Mengembalikan identitas usaha, empat unit, booking dan blok contoh. Booking dan perubahan di
        ruang demo ini dihapus. Sesi, peran dan masa berlaku tetap; pengunjung lain tidak
        terpengaruh.
      </p>
      <p>
        Data demo bersifat sementara (maksimal 12 jam, bisa hilang saat server dimulai ulang) dan
        tidak dicadangkan. Ini bukan login atau sistem produksi.
      </p>
      <button
        type="button"
        className="button button--danger"
        onClick={reset.ask}
        disabled={reset.busy}
      >
        Reset data demo
      </button>
      <ResetDialog reset={reset} />
    </section>
  );
}
