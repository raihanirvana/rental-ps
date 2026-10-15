import { useState } from 'react';
import { blockPayload, emptyBlockForm, validateBlockForm } from '../lib/block-form.js';
import { createBlock } from '../lib/owner-api.js';
import { useAsyncAction } from './useAsyncAction.js';

function firstFocus(errors) {
  const first = Object.keys(errors)[0];
  if (first) {
    document.getElementById(`block-${first}`)?.focus();
  }
}

// Tambah blok; isian dipertahankan saat ditolak (400/409) agar bisa diperbaiki.
export function useBlockForm({ units, range, onSaved }) {
  const [values, setValues] = useState(() => emptyBlockForm(units, range.from));
  const [errors, setErrors] = useState({});
  const action = useAsyncAction();
  const setValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };
  const submit = async (event) => {
    event.preventDefault();
    const found = validateBlockForm(values, range);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      return firstFocus(found);
    }
    const result = await action.run(() => createBlock(blockPayload(values)));
    if (result) {
      setValues((current) => ({ ...current, note: '' }));
      onSaved(result.block);
    }
  };
  const fieldErrors = { ...(action.error?.fields ?? {}), ...errors };
  return { values, fieldErrors, busy: action.busy, error: action.error, setValue, submit };
}
