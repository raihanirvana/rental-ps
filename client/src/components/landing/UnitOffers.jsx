import { formatRupiah } from '../../lib/format.js';
import { groupUnitsByKind } from '../../lib/unit-groups.js';
import { ErrorNotice } from '../Notice.jsx';
import { ConsoleArt } from './ConsoleArt.jsx';

function OfferBottom({ group, demo }) {
  return (
    <div className="offer-bottom">
      <span className="price">
        {group.sameRate ? '' : 'mulai '}
        {formatRupiah(group.minRate)}
        <small> / jam</small>
      </span>
      <button
        type="button"
        className="offer-link"
        onClick={() => demo.start('customer', `/booking?jenis=${group.kind}`)}
        disabled={demo.pendingRole !== null}
      >
        Pilih {group.kind}
      </button>
    </div>
  );
}

function UnitOffer({ group, demo }) {
  const artClass = group.kind === 'PS5' ? 'unit-offer-art unit-offer-art--ps5' : 'unit-offer-art';
  return (
    <article className="unit-offer">
      <div className={artClass}>
        <ConsoleArt kind={group.kind} />
      </div>
      <div>
        <h3>{group.title}</h3>
        <p>{group.summary} TV dan dua kontroler di setiap setup.</p>
        <OfferBottom group={group} demo={demo} />
      </div>
    </article>
  );
}

function OfferList({ catalog, demo }) {
  const groups = groupUnitsByKind(catalog.catalog.units);
  if (groups.length === 0) {
    return <p className="catalog-state">Belum ada unit aktif untuk ditampilkan.</p>;
  }
  return (
    <div className="unit-comparison">
      {groups.map((group) => (
        <UnitOffer key={group.kind} group={group} demo={demo} />
      ))}
    </div>
  );
}

function CatalogBody({ catalog, demo }) {
  if (catalog.status === 'error') {
    return <ErrorNotice error={{ message: 'Tarif belum bisa dimuat.' }} onRetry={catalog.retry} />;
  }
  if (!catalog.catalog) {
    return (
      <p className="catalog-state" aria-busy="true">
        Memuat unit dan tarif…
      </p>
    );
  }
  return <OfferList catalog={catalog} demo={demo} />;
}

export function UnitOffers({ catalog, demo }) {
  return (
    <section id="unit" className="unit-section" aria-labelledby="unit-title">
      <div className="section-heading">
        <h2 id="unit-title">Pilih PS4 atau PS5.</h2>
        <p>Satu setup untuk kamu dan temanmu. Tarif per unit, bukan per orang.</p>
      </div>
      <CatalogBody catalog={catalog} demo={demo} />
    </section>
  );
}
