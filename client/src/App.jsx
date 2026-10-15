import { useHealth } from './useHealth.js';

const statusText = {
  loading: 'Memeriksa server…',
  ok: 'Server API terhubung.',
  error: 'Server API belum bisa dihubungi.',
};

function HealthStatus() {
  const health = useHealth();
  return (
    <p className={`status status--${health.status}`} role="status">
      {statusText[health.status]}
      {health.message ? ` ${health.message}` : ''}
    </p>
  );
}

export default function App() {
  return (
    <main className="shell">
      <h1>Sesi Play</h1>
      <p>Fondasi aplikasi demo booking rental PS. Landing dan alur booking dibangun bertahap.</p>
      <HealthStatus />
    </main>
  );
}
