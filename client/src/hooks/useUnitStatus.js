import { useState } from 'react';
import { updateUnit } from '../lib/owner-api.js';
import { useAsyncAction } from './useAsyncAction.js';

// Nonaktif lewat dialog konfirmasi; penolakan server (409) tampil di dialog yang sama.
export function useUnitStatus(onChanged) {
  const [target, setTarget] = useState(null);
  const action = useAsyncAction();
  const change = async (unit, isActive) => {
    const result = await action.run(() => updateUnit(unit.id, { isActive }));
    if (result) {
      setTarget(null);
      onChanged(result.unit);
    }
  };
  return {
    target,
    busy: action.busy,
    error: action.error,
    askDeactivate: (unit) => {
      action.reset();
      setTarget(unit);
    },
    close: () => !action.busy && setTarget(null),
    confirm: () => change(target, false),
    activate: (unit) => change(unit, true),
  };
}
