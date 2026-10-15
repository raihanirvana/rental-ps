import { useState } from 'react';
import { updateSettings } from '../lib/settings-api.js';
import { settingsPayload, settingsToForm, validateSettings } from '../lib/settings-form.js';
import { useAsyncAction } from './useAsyncAction.js';

// Isian tetap ada saat invalid (browser/server); sukses mengganti data dari respons server.
export function useSettingsForm(settings, onSaved) {
  const [values, setValues] = useState(() => settingsToForm(settings));
  const [errors, setErrors] = useState({});
  const action = useAsyncAction();
  const setValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };
  const submit = async (event) => {
    event.preventDefault();
    const found = validateSettings(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.getElementById(`settings-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    const result = await action.run(() => updateSettings(settingsPayload(values)));
    if (result) {
      setValues(settingsToForm(result.settings));
      onSaved(result);
    }
  };
  const fieldErrors = { ...(action.error?.fields ?? {}), ...errors };
  return { values, fieldErrors, busy: action.busy, error: action.error, setValue, submit };
}
