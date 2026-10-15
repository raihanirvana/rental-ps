import { useState } from 'react';
import { BlockForm } from '../components/units/BlockForm.jsx';
import { BlockList } from '../components/units/BlockList.jsx';
import { DeactivateDialog, DeleteBlockDialog } from '../components/units/UnitDialogs.jsx';
import { UnitForm } from '../components/units/UnitForm.jsx';
import { UnitList } from '../components/units/UnitList.jsx';
import { ErrorNotice, Notice, RefreshErrorNotice } from '../components/Notice.jsx';
import { useBlockDelete } from '../hooks/useBlockDelete.js';
import { useBlockForm } from '../hooks/useBlockForm.js';
import { useOwnerBlocks, useOwnerUnits } from '../hooks/useOwnerResources.js';
import { useUnitForm } from '../hooks/useUnitForm.js';
import { useUnitStatus } from '../hooks/useUnitStatus.js';

function ResourceState({ resource, label }) {
  if (resource.status === 'error') {
    return (
      <ErrorNotice
        error={{ message: `${label} belum bisa dimuat. ${resource.error.message}` }}
        onRetry={resource.retry}
      />
    );
  }
  return <p className="list-state">{`Memuat ${label.toLowerCase()}…`}</p>;
}

function UnitsSection({ units, onChanged }) {
  const form = useUnitForm((unit, edited) =>
    onChanged(`${unit.name} ${edited ? 'diperbarui' : 'ditambahkan'}.`),
  );
  const status = useUnitStatus((unit) =>
    onChanged(`${unit.name} kini ${unit.isActive ? 'aktif' : 'nonaktif'}.`),
  );
  const list = units.data.units;
  return (
    <section className="owner-section" aria-labelledby="units-title">
      <h2
        id="units-title"
        className="section-title"
      >{`Unit (${list.length} dari ${units.data.maxUnits})`}</h2>
      <div className="owner-grid">
        <UnitList units={list} form={form} status={status} />
        <UnitForm form={form} unitCount={list.length} maxUnits={units.data.maxUnits} />
      </div>
      <DeactivateDialog status={status} />
      {status.error && !status.target ? <ErrorNotice error={status.error} /> : null}
    </section>
  );
}

function BlocksSection({ blocks, units, onChanged }) {
  const form = useBlockForm({
    units,
    range: blocks.data.bookableDates,
    onSaved: () => onChanged('Blok jadwal ditambahkan.'),
  });
  const remover = useBlockDelete(() => onChanged('Blok jadwal dihapus. Jamnya bisa dipesan lagi.'));
  return (
    <section className="owner-section" aria-labelledby="blocks-title">
      <h2 id="blocks-title" className="section-title">
        Blok jadwal
      </h2>
      <div className="owner-grid">
        <BlockList blocks={blocks.data.blocks} onDelete={remover.ask} />
        <BlockForm form={form} units={units} range={blocks.data.bookableDates} />
      </div>
      <DeleteBlockDialog remover={remover} />
    </section>
  );
}

function UnitsIntro() {
  return (
    <div className="page-intro">
      <h1>Unit &amp; jadwal.</h1>
      <p>
        Atur unit, tarif per jam dan jam yang diblokir untuk maintenance atau pemakaian offline.
      </p>
    </div>
  );
}

function UnitsContent({ units, blocks, onChanged }) {
  return (
    <>
      <RefreshErrorNotice resource={units} />
      <RefreshErrorNotice resource={blocks} />
      {units.status === 'ready' ? (
        <UnitsSection units={units} onChanged={onChanged} />
      ) : (
        <ResourceState resource={units} label="Unit" />
      )}
      {blocks.status !== 'ready' ? (
        <ResourceState resource={blocks} label="Blok jadwal" />
      ) : units.status === 'ready' ? (
        <BlocksSection blocks={blocks} units={units.data.units} onChanged={onChanged} />
      ) : null}
    </>
  );
}

// Setelah mutasi, daftar unit dan blok dimuat ulang dari server (slot ikut dihitung ulang).
export function UnitsPage() {
  const units = useOwnerUnits();
  const blocks = useOwnerBlocks();
  const [notice, setNotice] = useState(null);
  const changed = (message) => {
    setNotice(message);
    units.refresh();
    blocks.refresh();
  };
  return (
    <>
      <UnitsIntro />
      {notice ? (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      ) : null}
      <UnitsContent units={units} blocks={blocks} onChanged={changed} />
    </>
  );
}
