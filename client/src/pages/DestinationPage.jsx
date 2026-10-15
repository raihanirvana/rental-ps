import { ErrorNotice } from '../components/Notice.jsx';
import { useWorkspaceCatalog } from '../hooks/useWorkspaceCatalog.js';
import { formatRupiah } from '../lib/format.js';
import { pageContent } from './page-content.js';

function WorkspaceUnits() {
  const catalog = useWorkspaceCatalog();
  if (catalog.status === 'error') {
    return <ErrorNotice error={catalog.error} onRetry={catalog.retry} />;
  }
  if (!catalog.catalog) {
    return <p aria-busy="true">Memuat unit ruang demo…</p>;
  }
  return (
    <ul className="unit-list" aria-label="Unit di ruang demo ini">
      {catalog.catalog.units.map((unit) => (
        <li key={unit.id}>
          <strong>{unit.name}</strong>
          <span className="price">
            {formatRupiah(unit.hourlyRate)}/jam{unit.isActive ? '' : ' · nonaktif'}
          </span>
        </li>
      ))}
    </ul>
  );
}

// Halaman tujuan setelah masuk demo. Data unit dibaca dari katalog workspace sendiri.
export function DestinationPage({ page, searchParams }) {
  const content = pageContent[page];
  const kind = searchParams.get('jenis');
  return (
    <>
      <div className="page-intro">
        <h1>{content.heading}</h1>
        <p>{content.intro}</p>
      </div>
      <section className="panel" aria-labelledby="pending-title">
        <h2 id="pending-title">{content.pending}</h2>
        {kind === 'PS4' || kind === 'PS5' ? <p>Pilihan awalmu: {kind}.</p> : null}
        {content.showUnits ? <WorkspaceUnits /> : null}
      </section>
    </>
  );
}
