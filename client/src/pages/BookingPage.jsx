import { BookingSteps } from '../components/booking/BookingSteps.jsx';
import { BookingWorkspace } from '../components/booking/BookingWorkspace.jsx';
import { ErrorNotice } from '../components/Notice.jsx';
import { useBookingFlow } from '../hooks/useBookingFlow.js';
import { useWorkspaceCatalog } from '../hooks/useWorkspaceCatalog.js';

function BookingFlow({ catalog, preferredKind }) {
  const flow = useBookingFlow(catalog, preferredKind);
  const step = flow.submission.status === 'done' ? 'done' : flow.step;
  return (
    <>
      <div className="page-intro page-intro--split">
        <div>
          <h1>Tentukan jam main.</h1>
          <p>Satu unit, satu jadwal. Jam kosong dihitung server dalam WIB.</p>
        </div>
        <BookingSteps step={step} />
      </div>
      <BookingWorkspace flow={flow} />
    </>
  );
}

// Katalog workspace (unit, tarif, tanggal server) harus selesai dimuat sebelum memilih.
export function BookingPage({ searchParams }) {
  const catalog = useWorkspaceCatalog();
  if (catalog.status === 'error') {
    return <ErrorNotice error={catalog.error} onRetry={catalog.retry} />;
  }
  if (!catalog.catalog) {
    return <p aria-busy="true">Memuat unit dan jadwal…</p>;
  }
  if (!catalog.catalog.units.some((unit) => unit.isActive)) {
    return <p>Belum ada unit aktif yang bisa dipesan di ruang demo ini.</p>;
  }
  return <BookingFlow catalog={catalog.catalog} preferredKind={searchParams.get('jenis')} />;
}
