import { useState } from 'react';
import { createUnit, updateUnit } from '../lib/owner-api.js';
import { emptyUnitForm, unitPayload, unitToForm, validateUnitForm } from '../lib/unit-form.js';
import { useAsyncAction } from './useAsyncAction.js';

const blank = { editing: null, values: emptyUnitForm, errors: {} };

function useUnitFormState() {
  const [form, setForm] = useState(blank);
  const setValue = (name, value) =>
    setForm((current) => ({
      ...current,
      values: { ...current.values, [name]: value },
      errors: { ...current.errors, [name]: undefined },
    }));
  return { form, setForm, setValue };
}

// Validasi browser dulu; isian invalid (browser/server) tetap ada untuk diperbaiki.
async function submitUnit({ form, setForm, action, onSaved }) {
  const errors = validateUnitForm(form.values);
  setForm((current) => ({ ...current, errors }));
  if (Object.keys(errors).length > 0) {
    document.getElementById(`unit-${Object.keys(errors)[0]}`)?.focus();
    return;
  }
  const payload = unitPayload(form.values);
  const save = () => (form.editing ? updateUnit(form.editing.id, payload) : createUnit(payload));
  const result = await action.run(save);
  if (result) {
    onSaved(result.unit, Boolean(form.editing));
    setForm(blank);
  }
}

export function useUnitForm(onSaved) {
  const { form, setForm, setValue } = useUnitFormState();
  const action = useAsyncAction();
  const reset = (next) => {
    action.reset();
    setForm(next);
  };
  return {
    ...form,
    fieldErrors: { ...(action.error?.fields ?? {}), ...form.errors },
    busy: action.busy,
    error: action.error,
    setValue,
    startEdit: (unit) => reset({ editing: unit, values: unitToForm(unit), errors: {} }),
    cancelEdit: () => reset(blank),
    submit: (event) => {
      event.preventDefault();
      return submitUnit({ form, setForm, action, onSaved });
    },
  };
}
