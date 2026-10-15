import { ErrorNotice } from '../components/Notice.jsx';
import { Link } from '../components/Link.jsx';
import { StatusScreen } from '../components/StatusScreen.jsx';
import { useDemoStart } from '../hooks/useDemoStart.js';
import { roleHome, roleNames } from '../lib/routes.js';

function StartButton({ demo, role, destination, label }) {
  return (
    <button
      type="button"
      className="button"
      onClick={() => demo.start(role, destination)}
      disabled={demo.pendingRole !== null}
    >
      {demo.pendingRole ? 'Menyiapkan ruang demo…' : label}
    </button>
  );
}

// Tanpa sesi atau sesi habis: tidak redirect berulang, cukup tawarkan mulai demo lagi.
export function SignInRequired({ route, href, expired }) {
  const demo = useDemoStart();
  const label = expired ? 'Mulai demo lagi' : `Mulai demo sebagai ${roleNames[route.role]}`;
  const actions = (
    <>
      <StartButton demo={demo} role={route.role} destination={href} label={label} />
      <Link className="text-link" to="/">
        Ke halaman utama
      </Link>
    </>
  );
  const title = expired ? 'Ruang demo sudah berakhir.' : 'Masuk demo dulu.';
  return (
    <StatusScreen title={title} actions={actions}>
      <p>
        {expired
          ? 'Mulai demo baru untuk mencoba lagi. Data ruang demo lama tidak bisa dipulihkan.'
          : 'Halaman ini bagian dari demo. Ruang demo dibuat saat kamu menekan tombol di bawah. ' +
            'Jika sebelumnya sudah mencoba, ruang demo itu mungkin sudah berakhir (12 jam).'}
      </p>
      {demo.error ? <ErrorNotice error={demo.error} /> : null}
    </StatusScreen>
  );
}

// Peran tidak sesuai: jelaskan bahwa ganti peran adalah simulasi di workspace yang sama.
export function WrongRoleScreen({ route, href, session }) {
  const demo = useDemoStart();
  const actions = (
    <>
      <StartButton
        demo={demo}
        role={route.role}
        destination={href}
        label={`Coba sebagai ${roleNames[route.role]}`}
      />
      <Link className="text-link" to={roleHome[session.role]}>
        Kembali ke halaman {roleNames[session.role]}
      </Link>
    </>
  );
  return (
    <StatusScreen title={`Halaman ini untuk ${roleNames[route.role]}.`} actions={actions}>
      <p>
        Kamu sedang mencoba sisi {roleNames[session.role]}. Ganti peran untuk membukanya; kamu tetap
        di ruang demo yang sama. Ini simulasi peran, bukan login sungguhan.
      </p>
      {demo.error ? <ErrorNotice error={demo.error} /> : null}
    </StatusScreen>
  );
}
