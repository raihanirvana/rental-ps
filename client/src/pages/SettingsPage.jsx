import { useState } from 'react';
import { Notice, ErrorNotice } from '../components/Notice.jsx';
import { SettingsForm } from '../components/settings/SettingsForm.jsx';
import { ResetPanel, RulesPanel, SettingsPreview } from '../components/settings/SettingsPanels.jsx';
import { useDemoReset } from '../hooks/useDemoReset.js';
import { useRefreshableResource } from '../hooks/useRefreshableResource.js';
import { useSettingsForm } from '../hooks/useSettingsForm.js';
import { getSettings } from '../lib/settings-api.js';

const settingsRequest = (signal) => getSettings(signal);

function SettingsContent({ resource }) {
  const [saved, setSaved] = useState(false);
  const form = useSettingsForm(resource.data.settings, (result) => {
    resource.update(() => result);
    setSaved(true);
  });
  const reset = useDemoReset();
  return (
    <>
      {saved ? (
        <Notice tone="success" onDismiss={() => setSaved(false)}>
          Pengaturan disimpan.
        </Notice>
      ) : null}
      <div className="owner-grid settings-grid">
        <SettingsForm form={form} />
        <SettingsPreview settings={resource.data.settings} />
      </div>
      <div className="owner-grid settings-grid">
        <ResetPanel reset={reset} />
        <RulesPanel rules={resource.data.rules} />
      </div>
    </>
  );
}

export function SettingsPage() {
  const resource = useRefreshableResource('settings', settingsRequest);
  return (
    <>
      <div className="page-intro">
        <h1>Pengaturan.</h1>
        <p>Identitas usaha contoh dan reset data ruang demo.</p>
      </div>
      {resource.status === 'error' ? (
        <ErrorNotice error={resource.error} onRetry={resource.retry} />
      ) : null}
      {resource.status === 'loading' ? <p className="list-state">Memuat pengaturan…</p> : null}
      {resource.status === 'ready' ? <SettingsContent resource={resource} /> : null}
    </>
  );
}
